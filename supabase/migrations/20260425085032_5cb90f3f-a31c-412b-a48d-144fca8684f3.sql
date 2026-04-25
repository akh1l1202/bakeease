-- Enums
create type public.product_category as enum ('cakes','cupcakes','pastries','bread','custom');
create type public.product_flavour as enum ('chocolate','vanilla','redVelvet','mango','butterscotch');
create type public.order_status as enum ('pending','baking','out_for_delivery','delivered','cancelled');
create type public.payment_method as enum ('upi','cod');
create type public.delivery_type as enum ('delivery','pickup');

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  image text not null default '',
  category public.product_category not null,
  occasions text[] not null default '{}',
  flavour public.product_flavour not null,
  rating numeric(2,1) not null default 4.5 check (rating >= 0 and rating <= 5),
  is_veg boolean not null default true,
  is_available boolean not null default true,
  best_seller boolean not null default false,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;

create policy "Anyone can view products"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.has_role(auth.uid(),'admin'));

create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.has_role(auth.uid(),'admin'));

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text not null unique default ('BE' || lpad(floor(random()*9000+1000)::text, 4, '0')),
  total numeric(10,2) not null check (total >= 0),
  status public.order_status not null default 'pending',
  payment_method public.payment_method not null,
  delivery_type public.delivery_type not null,
  address text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;

create policy "Customers view own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins view all orders"
  on public.orders for select
  to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy "Customers create own orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Admins update any order"
  on public.orders for update
  to authenticated
  using (public.has_role(auth.uid(),'admin'));

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Order items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);
alter table public.order_items enable row level security;

create policy "Customers view items of own orders"
  on public.order_items for select
  to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "Admins view all order items"
  on public.order_items for select
  to authenticated
  using (public.has_role(auth.uid(),'admin'));

create policy "Customers add items to own orders"
  on public.order_items for insert
  to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- Indexes
create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index order_items_order_id_idx on public.order_items(order_id);
create index products_category_idx on public.products(category);

-- Seed Mumbai bakery products
insert into public.products (name, description, price, image, category, occasions, flavour, rating, best_seller, stock) values
('Belgian Chocolate Truffle','Rich dark chocolate ganache layered cake with truffle shavings.',899,'/assets/product-chocolate-cake.jpg','cakes','{birthday,anniversary,casual}','chocolate',4.9,true,12),
('Classic Red Velvet','Velvety red sponge with smooth cream cheese frosting.',749,'/assets/product-red-velvet.jpg','cakes','{birthday,anniversary}','redVelvet',4.8,true,8),
('Vanilla Sprinkle Cupcakes','Pack of 6 fluffy vanilla cupcakes with rainbow sprinkles.',360,'/assets/product-cupcakes.jpg','cupcakes','{birthday,babyShower,casual}','vanilla',4.7,false,24),
('Butter Croissant','Flaky French butter croissant baked fresh every morning.',95,'/assets/product-croissant.jpg','pastries','{casual}','vanilla',4.6,true,40),
('Artisan Sourdough','Slow-fermented crusty sourdough loaf with open crumb.',280,'/assets/product-sourdough.jpg','bread','{casual}','vanilla',4.5,false,18),
('Alphonso Mango Cheesecake','Creamy no-bake cheesecake topped with fresh Alphonso mango.',650,'/assets/product-mango-cheesecake.jpg','cakes','{birthday,casual}','mango',4.9,true,6),
('Strawberry Cream Tart','Buttery shortcrust tart filled with vanilla cream and berries.',320,'/assets/product-strawberry-tart.jpg','pastries','{casual,anniversary}','vanilla',4.7,false,15),
('Butterscotch Caramel Cake','Soft sponge soaked in butterscotch caramel with crunchy bits.',720,'/assets/product-butterscotch.jpg','cakes','{birthday,casual}','butterscotch',4.6,false,9),
('Two-Tier Wedding Cake','Custom two-tier fondant cake with sugar flowers (made to order).',4500,'/assets/product-wedding-cake.jpg','custom','{wedding,anniversary}','vanilla',5.0,false,3),
('Chocolate Danish','Buttery flaky pastry with melted chocolate filling.',120,'/assets/product-danish.jpg','pastries','{casual}','chocolate',4.5,false,30),
('Rustic Baguette','Traditional French baguette with golden crust and airy crumb.',180,'/assets/product-baguette.jpg','bread','{casual}','vanilla',4.4,false,22),
('Choco-Chip Cupcakes','Pack of 6 chocolate cupcakes loaded with choco chips.',420,'/assets/product-cupcakes.jpg','cupcakes','{birthday,casual}','chocolate',4.7,false,18);