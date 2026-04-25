-- 1. Replace handle_new_user to remove hardcoded admin email assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );

  -- All new users default to customer. Admin must be granted manually
  -- by an existing admin via the user_roles table.
  insert into public.user_roles (user_id, role) values (new.id, 'customer');

  return new;
end;
$function$;

-- 2. Add a RESTRICTIVE policy on user_roles to block any insert by a non-admin,
-- regardless of other permissive policies. Defense in depth.
DROP POLICY IF EXISTS "Block non-admin role inserts" ON public.user_roles;
CREATE POLICY "Block non-admin role inserts"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Same restrictive guard for UPDATE/DELETE on user_roles
DROP POLICY IF EXISTS "Block non-admin role updates" ON public.user_roles;
CREATE POLICY "Block non-admin role updates"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Block non-admin role deletes" ON public.user_roles;
CREATE POLICY "Block non-admin role deletes"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));