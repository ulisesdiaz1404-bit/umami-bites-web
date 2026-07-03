-- =====================================================================
-- Umami Bites — Realtime en pedidos.
-- Correr UNA vez en el SQL Editor de Supabase (después de 0001_init.sql).
-- Hace que el panel de admin se entere al instante cuando entra un pedido
-- nuevo (sin refrescar). La lectura sigue protegida por RLS: solo los
-- dueños autenticados reciben las filas (política orders_admin_read de 0001).
-- El sitio funciona igual sin esto; el aviso en vivo simplemente no aparece.
-- =====================================================================

-- Agrega la tabla `orders` a la publicación que alimenta Realtime.
-- Idempotente: si ya está agregada, no hace nada (se ignora el error).
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;  -- ya estaba en la publicación
  when undefined_object then null;  -- la publicación no existe (proyecto sin Realtime)
end $$;
