# Sentry — detección de errores en producción

Sentry está **montado pero apagado**. No reporta nada ni afecta el build hasta
que cargues el **DSN**. Activarlo es solo poner unas env vars.

## Qué es el DSN

El DSN es la "dirección" única de tu proyecto en Sentry (una URL tipo
`https://abc123@o456.ingest.us.sentry.io/789`). Es la clave que le dice a la
web a dónde mandar los errores. **No es secreto** (va en el navegador), por eso
lleva el prefijo `NEXT_PUBLIC_`.

## Cómo activarlo (5 min)

1. Creá cuenta gratis en **https://sentry.io** y un proyecto tipo **Next.js**.
2. Sentry te muestra el **DSN** al crear el proyecto (o en
   *Settings → Projects → [tu proyecto] → Client Keys (DSN)*).
3. Cargá la env var en Vercel:
   - Vercel → proyecto `umami-bites-web` → **Settings → Environment Variables**
   - Name: `NEXT_PUBLIC_SENTRY_DSN`
   - Value: el DSN que copiaste
   - Environments: **Production** (y Preview si querés)
   - Redeploy (o push a `master`) → Sentry queda activo.

Para probar en local: agregá la misma línea a `.env.local`:

```
NEXT_PUBLIC_SENTRY_DSN=https://...tu-dsn...
```

## Opcional — subir source maps (stack traces legibles)

Sin esto Sentry funciona igual, pero los errores muestran código minificado.
Para ver el código original en cada error, agregá también en Vercel:

- `SENTRY_ORG` — el slug de tu organización en Sentry
- `SENTRY_PROJECT` — el slug del proyecto
- `SENTRY_AUTH_TOKEN` — token de *Settings → Auth Tokens* (este SÍ es secreto,
  no lleva `NEXT_PUBLIC_`)

> Nota pnpm: `@sentry/cli` (que sube los source maps) tiene su build script
> ignorado. Si vas a subir source maps, corré una vez `pnpm approve-builds`
> y elegí `@sentry/cli`.

## Cómo se probó que anda

Con el DSN cargado, provocá un error a propósito (por ejemplo una página que
lance una excepción) y fijate que aparezca en el dashboard de Sentry en
*Issues*. Sentry trae una guía de "test error" al crear el proyecto.

## Cómo está armado en el código

- `src/instrumentation.ts` — init de servidor + `onRequestError`. Sale sin hacer
  nada si no hay DSN.
- `src/instrumentation-client.ts` — init de navegador + navegación. Idem.
- `next.config.ts` — `withSentryConfig` se aplica **solo si hay DSN**; si no, el
  build es idéntico al de siempre.
- CSP (`next.config.ts`) — `connect-src` permite `https://*.sentry.io` para que
  el navegador pueda enviar los reportes.
