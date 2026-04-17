-- Categories enum
create type public.product_category as enum ('luminarias', 'controladores', 'kits', 'osire', 'accesorios');

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category product_category not null,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  short_description text,
  description text,
  featured boolean not null default false,
  stock integer not null default 0,
  created_at timestamptz not null default now()
);

-- KITS
create table public.kits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2),
  image_url text,
  pool_size text,
  product_ids uuid[] default '{}',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_zip text not null,
  shipping_cost numeric(10,2) not null default 0,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_method text not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

-- DISTRIBUTOR LEADS
create table public.distributor_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company text not null,
  city text not null,
  phone text not null,
  email text not null,
  message text,
  status text not null default 'new',
  synced_to_crm boolean not null default false,
  created_at timestamptz not null default now()
);

-- WIZARD RECOMMENDATIONS
create table public.wizard_recommendations (
  id uuid primary key default gen_random_uuid(),
  pool_size text,
  pool_type text,
  usage_type text,
  control_type text,
  recommended_kit_id uuid references public.kits(id) on delete set null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.products enable row level security;
alter table public.kits enable row level security;
alter table public.orders enable row level security;
alter table public.distributor_leads enable row level security;
alter table public.wizard_recommendations enable row level security;

create policy "Public can read products" on public.products for select using (true);
create policy "Public can read kits" on public.kits for select using (true);
create policy "Anyone can create an order" on public.orders for insert with check (true);
create policy "Anyone can create a distributor lead" on public.distributor_leads for insert with check (true);
create policy "Anyone can log a wizard recommendation" on public.wizard_recommendations for insert with check (true);