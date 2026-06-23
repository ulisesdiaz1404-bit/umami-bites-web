-- =====================================================================
-- Umami Bites — esquema inicial (menú + pedidos) con RLS.
-- Correr en el SQL Editor de Supabase. Luego correr supabase/seed.sql.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ----------------------------- MENÚ -----------------------------
create table if not exists public.menu_items (
  id            text primary key,
  slug          text not null unique,
  name          text not null,
  description   text not null default '',
  price_in_cents integer not null default 0,
  currency      text not null default 'ARS',
  images        jsonb not null default '[]'::jsonb,
  available     boolean not null default true,
  max_quantity  integer not null default 10,
  category      text not null default '',
  type          text not null default 'dish' check (type in ('dish','package')),
  servings      integer,
  includes      jsonb,
  metadata      jsonb,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------- PEDIDOS ---------------------------
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  customer_name     text not null,
  customer_phone    text not null,
  address           text not null,
  notes             text,
  delivery_date     date,
  payment_method    text not null check (payment_method in ('efectivo','tarjeta','mp')),
  items             jsonb not null default '[]'::jsonb,
  subtotal_in_cents integer not null default 0,
  shipping_in_cents integer not null default 0,
  total_in_cents    integer not null default 0,
  status            text not null default 'nuevo'
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ============================== RLS ==============================
-- "Todo oculto a quien no sea admin": los pedidos NO tienen política para
-- usuarios anónimos, así que el público no puede leerlos ni listarlos.
alter table public.menu_items enable row level security;
alter table public.orders     enable row level security;

-- Menú: lectura pública (el sitio lo muestra); escritura solo autenticados.
drop policy if exists "menu_public_read" on public.menu_items;
create policy "menu_public_read" on public.menu_items
  for select using (true);

drop policy if exists "menu_admin_write" on public.menu_items;
create policy "menu_admin_write" on public.menu_items
  for all to authenticated using (true) with check (true);

-- Pedidos: solo los dueños (autenticados) pueden leer y actualizar el estado.
-- El alta la hace el backend con service_role (bypassa RLS), no el público.
drop policy if exists "orders_admin_read" on public.orders;
create policy "orders_admin_read" on public.orders
  for select to authenticated using (true);

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update to authenticated using (true) with check (true);
