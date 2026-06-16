# Umami Bites Catering — Web (Fase 1)

Frontend production-grade del sitio de catering a domicilio **Umami Bites**.
Construido con **Next.js 16 (App Router + React Server Components)**, **TypeScript strict**,
**Tailwind CSS v4**, **Zustand** (carrito persistido) y **Framer Motion** (animaciones).

> **Esta es la Fase 1 (frontend con mocks).** Para producción real ejecutar la **Fase 2**,
> que conecta **Stripe + base de datos (Neon/Supabase) + deploy en Vercel** sin reescribir componentes.

---

## 🚀 Instalación

```bash
pnpm install
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Descripción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build |
| `pnpm lint` | ESLint |
| `pnpm type-check` | `tsc --noEmit` (TypeScript strict) |

---

## 🧱 Arquitectura

```
src/
├── app/
│   ├── (storefront)/
│   │   ├── page.tsx            # Home: hero animado + cómo funciona + paquetes + platos
│   │   ├── menu/               # Listado con filtros + detalle [slug] + loading/error
│   │   ├── cart/page.tsx       # Carrito completo
│   │   └── checkout/page.tsx   # Checkout (UI placeholder, sin pago)
│   ├── layout.tsx              # Fuentes + Providers
│   ├── globals.css             # Sistema visual (@theme Tailwind v4)
│   ├── error.tsx · not-found.tsx
├── components/  (ui · layout · menu · cart · home)
├── lib/
│   ├── types/                  # menu-item.ts · cart.ts  (CONTRATO DE DATOS)
│   ├── data/mock-menu.ts       # Catálogo real (mock temporal — Fase 2: Postgres)
│   ├── stores/cart-store.ts    # Zustand + persist
│   ├── contact.ts · utils.ts
└── hooks/use-cart.ts
```

### Contrato de datos

Los types en `src/lib/types/` son la **fuente de verdad**. La Fase 2 reemplaza
`mock-menu.ts` por queries a Postgres **sin tocar componentes**. Precios siempre
en **centavos** (`priceInCents`), estándar Stripe.

---

## 🛒 Carrito

- Persistencia en `localStorage` (Zustand `persist`).
- Valida `maxQuantity` en cada mutación (la UI nunca supera el límite).
- Drawer lateral accesible (rol `dialog`, ESC, focus, scroll-lock) con badge de cantidad.
- Diferencia visual **Plato** vs **Paquete**.
- Subtotal + envío (placeholder `$500 ARS`, configurable en `SHIPPING_IN_CENTS`) + total.
- Fecha de entrega obligatoria para continuar al checkout.
- `/checkout` con formulario placeholder y botón **Pagar deshabilitado**
  (`// TODO Fase 2: reemplazar por Stripe Checkout Session vía Server Action`).

---

## 🖼️ Imágenes y 🎬 video del hero

**Fotos reales:** las fotos de Umami Bites viven en `public/photos/` (`p01…p45`). El
mapa slug → foto está en `src/lib/data/mock-menu.ts` (constante `REAL_PHOTOS`). Para
cambiar la foto de un ítem, editá ese mapa. Los ítems sin foto limpia (bebidas)
usan placeholders SVG de marca en `public/images/<slug>.svg`.

**Video del hero:** `public/hero.mp4` (con `public/hero-poster.jpg`). Es un montaje
cinematográfico (Ken Burns + crossfade) generado con `ffmpeg-static` a partir de las
tomas de mesa elegante. Para regenerarlo (cambiar fotos, duración o transición):

```bash
node scripts/genhero.cjs
```

Editá el array `imgs` dentro de `scripts/genhero.cjs` para elegir otras fotos.
Si tenés un video real de catering, simplemente reemplazá `public/hero.mp4`.

> Para servir imágenes desde un CDN, activá el host en `next.config.ts → images.remotePatterns`.

---

## 🎨 Marca

| Token | Color | Uso |
| --- | --- | --- |
| `--color-bg` | `#2C1A0E` | Fondo (madera oscura) |
| `--color-surface` | `#3D2512` | Cards / superficies |
| `--color-primary` | `#D4B896` | Texto principal (beige dorado) |
| `--color-accent` | `#C49A6C` | CTAs, badges, precios (champagne) |
| `--color-muted` | `#8C6D52` | Texto secundario |
| `--color-cream` | `#FAF3EB` | Contraste alto |

Tipografía: **Playfair Display** (display serif) + **DM Sans** (cuerpo).

---

## ➡️ Próximos pasos: Fase 2

1. **Base de datos** (Neon/Supabase): tabla `menu_items` con el shape de `MenuItem`.
   Reemplazar `mock-menu.ts` por queries — los componentes no cambian.
2. **Stripe**: Checkout Session vía Server Action (ver `// TODO Fase 2` en `checkout/page.tsx`).
3. **Pedidos**: persistir orden + fecha de entrega + datos de contacto; notificación por email/WhatsApp.
4. **Cálculo de envío real** por zona/distancia (reemplaza `SHIPPING_IN_CENTS`).
5. **Imágenes**: subir las fotos reales a Storage/CDN.
6. **Deploy en Vercel** + dominio.

---

🤖 Fase 1 generada con [Claude Code](https://claude.com/claude-code).
