# Conectar la base de datos (Supabase)

El sitio ya funciona sin DB (menú mock + checkout por WhatsApp). Estos pasos
activan: **historial de pedidos** + **administración del menú** en `/admin`,
todo privado para los dueños.

## 1. Crear el proyecto

1. Entrá a https://supabase.com → **New project**.
2. Anotá la contraseña de la base.
3. Cuando esté listo: **Project Settings → API** y copiá:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (¡secreta!)

## 2. Crear las tablas

En **SQL Editor** de Supabase:

1. Pegá y ejecutá todo `supabase/migrations/0001_init.sql` (crea tablas + RLS).
2. Pegá y ejecutá todo `supabase/seed.sql` (carga los 25 ítems del menú).
   - Para regenerar el seed desde el código: `node --experimental-strip-types scripts/gen-seed.ts`

## 3. Crear el usuario admin (los dueños)

**Authentication → Users → Add user** → email + contraseña. Ese es el login del
panel. Solo quien tenga usuario puede entrar a `/admin` y ver los pedidos.
(Tip: **Authentication → Providers → Email** y desactivá "Confirm email" para que
entre directo.)

## 4. Variables de entorno

- **Local:** copiá `.env.example` a `.env.local` y completá los 3 valores.
- **Vercel:** Project → Settings → Environment Variables, agregá las 3 mismas.
  `SUPABASE_SERVICE_ROLE_KEY` debe quedar **sin** el prefijo `NEXT_PUBLIC`.

Reiniciá `pnpm dev` (o redeploy en Vercel) y listo.

## Cómo queda

- **`/menu` y home**: leen de Supabase; si la DB está vacía/caída, vuelven al mock.
- **`/checkout`**: abre WhatsApp con el pedido **y** lo guarda en `orders`.
- **`/admin`**: login → lista de pedidos.
- **`/admin/menu`**: alta / edición / baja de platos y precios (se reflejan en el
  sitio por ISR, ~60 s).

## Seguridad (RLS)

- `orders`: el público **no** puede leerla. Solo usuarios autenticados (dueños).
  El alta de pedidos la hace el servidor con la `service_role` key.
- `menu_items`: lectura pública (el sitio lo necesita), escritura solo autenticados.
- La `service_role` key vive solo en el servidor; nunca llega al navegador.

## Número de WhatsApp de pedidos

Hoy los pedidos van a **+54 9 11 6362-3650** (número de prueba). Para cambiarlo:
`src/lib/contact.ts` → `ordersWhatsapp`.
