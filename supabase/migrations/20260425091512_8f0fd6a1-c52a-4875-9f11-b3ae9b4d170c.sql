
-- 1. Lock down user_roles to prevent privilege escalation
CREATE POLICY "Users view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Enforce server-side prices on order_items via trigger
CREATE OR REPLACE FUNCTION public.enforce_order_item_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _price numeric;
  _name text;
BEGIN
  IF NEW.product_id IS NULL THEN
    RAISE EXCEPTION 'order_items.product_id is required';
  END IF;

  SELECT price, name INTO _price, _name
  FROM public.products
  WHERE id = NEW.product_id AND is_available = true;

  IF _price IS NULL THEN
    RAISE EXCEPTION 'Product % is not available', NEW.product_id;
  END IF;

  IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;

  NEW.unit_price := _price;
  NEW.product_name := _name;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_order_item_price_trg ON public.order_items;
CREATE TRIGGER enforce_order_item_price_trg
BEFORE INSERT OR UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_order_item_price();

-- 3. Recompute order.total from items after they're inserted
CREATE OR REPLACE FUNCTION public.recompute_order_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order_id uuid;
  _total numeric;
BEGIN
  _order_id := COALESCE(NEW.order_id, OLD.order_id);
  SELECT COALESCE(SUM(unit_price * quantity), 0) INTO _total
  FROM public.order_items
  WHERE order_id = _order_id;

  UPDATE public.orders SET total = _total WHERE id = _order_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS recompute_order_total_trg ON public.order_items;
CREATE TRIGGER recompute_order_total_trg
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.recompute_order_total();
