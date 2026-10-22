-- =====================================================================
-- Umami Bites — Galería editable + envío por km desde la dirección del local.
-- Correr UNA vez en el SQL Editor de Supabase (después de 0003).
-- Sin esto el sitio funciona igual: galería con las fotos por defecto y
-- envío con los valores del código.
-- =====================================================================

-- ---------------------------- GALERÍA -----------------------------
create table if not exists public.gallery_photos (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  alt         text not null default '',
  width       integer not null default 1200,
  height      integer not null default 1200,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.gallery_photos enable row level security;

drop policy if exists "gallery_public_read" on public.gallery_photos;
create policy "gallery_public_read" on public.gallery_photos
  for select using (true);

drop policy if exists "gallery_admin_write" on public.gallery_photos;
create policy "gallery_admin_write" on public.gallery_photos
  for all to authenticated using (true) with check (true);

-- --------------------- ENVÍO POR KILÓMETRO ------------------------
-- Precio por km + coordenadas del local (se calculan al guardar la dirección
-- en el panel de configuración).
alter table public.settings add column if not exists shipping_per_km_in_cents integer;
alter table public.settings add column if not exists origin_lat double precision;
alter table public.settings add column if not exists origin_lng double precision;
