-- =====================================================================
-- Umami Bites — Categorías editables + Configuración del negocio.
-- Correr UNA vez en el SQL Editor de Supabase (después de 0001_init.sql).
-- El sitio funciona sin esto (usa valores por defecto); al correrlo, el
-- dueño puede editar categorías y config desde el panel.
-- =====================================================================

-- --------------------------- CATEGORÍAS ---------------------------
create table if not exists public.categories (
  name          text primary key,
  service_group text not null default 'Picadas y complementos',
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all to authenticated using (true) with check (true);

-- ------------------------- CONFIGURACIÓN --------------------------
-- Una sola fila (id = 1). Datos públicos del negocio (no sensibles).
create table if not exists public.settings (
  id                 integer primary key default 1,
  whatsapp           text,
  orders_whatsapp    text,
  phone_primary      text,
  phone_secondary    text,
  address            text,
  hours              text,
  shipping_in_cents  integer,
  min_order_in_cents integer,
  updated_at         timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

alter table public.settings enable row level security;

drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings
  for select using (true);

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings
  for all to authenticated using (true) with check (true);
