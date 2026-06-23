# Seguridad — Umami Bites Web

Auditoría hecha sobre el sitio (Fase 1: **frontend estático con mocks**, sin login,
sin base de datos, sin API propia, sin cuentas de usuario). Por eso muchos vectores
clásicos de ataque **no existen todavía** acá; se documenta qué aplica hoy y qué
habrá que hacer en Fase 2 (cuando entren Stripe + DB).

## Qué se aplicó (Fase 1)

| Medida | Dónde | Para qué |
|---|---|---|
| CSP estricta | `next.config.ts` | Bloquea inyección de scripts/recursos de terceros (XSS) |
| HSTS | `next.config.ts` | Fuerza HTTPS, evita downgrade |
| `X-Frame-Options: DENY` + `frame-ancestors 'none'` | `next.config.ts` | Anti clickjacking (no se puede meter en un iframe) |
| `X-Content-Type-Options: nosniff` | `next.config.ts` | Evita MIME sniffing |
| `Referrer-Policy` | `next.config.ts` | No filtra URLs internas a terceros |
| `Permissions-Policy` | `next.config.ts` | Apaga cámara/mic/geo/FLoC que el sitio no usa |
| COOP + CORP `same-origin` | `next.config.ts` | Aísla el origen (anti fugas cross-origin) |
| `poweredByHeader: false` | `next.config.ts` | No revela que corre Next.js |
| `productionBrowserSourceMaps: false` | `next.config.ts` | No expone el código fuente original |
| SVG remoto en sandbox (`attachment` + CSP) | `next.config.ts` `images` | Neutraliza XSS vía SVG (`dangerouslyAllowSVG`) |
| Override de `postcss` a >=8.5.10 | `pnpm-workspace.yaml` | Cierra GHSA-qx2v-qp2m-jg93 (audit limpio) |
| `.verceldeploy.txt` ignorado | `.gitignore` | No subir logs de deploy al repo |

Verificado: `pnpm audit` sin vulnerabilidades, `type-check` OK, `build` OK,
cabeceras confirmadas con `curl -I`.

## Respuesta a cada prompt de la auditoría (las imágenes)

1. **Roles y permisos** — No aplica hoy: no hay usuarios ni rutas privadas. Todo el
   contenido es público (menú, precios). No hay forma de que un usuario vea datos de
   otro porque no hay datos de usuario.
2. **Fuerza bruta en login** — No hay login todavía. Cuando exista (Fase 2): rate
   limit por IP, lockout temporal, y captcha tras N intentos.
3. **Tokens y sesiones** — No hay sesiones. En Fase 2: cookies `httpOnly` + `secure`
   + `sameSite=lax`, expiración corta, rotación de refresh token.
4. **Bots / abuso** — Sitio estático: poca superficie. Recomendado en Vercel:
   activar **Vercel WAF / Attack Challenge Mode** y rate limit en el form de pedido
   cuando se conecte a backend.
5. **Dependencias peligrosas** — Auditadas. Única vuln (postcss, moderada) **ya
   parcheada** vía override. Correr `pnpm audit` antes de cada deploy.
6. **Monitoreo / actividad sospechosa** — Sin backend no hay logs de app. En Vercel:
   usar Analytics + Runtime Logs. En Fase 2: loguear intentos de login fallidos,
   pagos rechazados y errores 4xx/5xx.

## Pendiente para Fase 2 (cuando entren pagos + DB)

- **Stripe**: nunca claves en el cliente. Webhooks firmados y verificados server-side.
- **Variables de entorno**: solo en Vercel (ya ignoradas en `.gitignore`). Nada de
  secretos con prefijo `NEXT_PUBLIC_`.
- **Validación server-side** de todo input (precios, cantidades) — nunca confiar en
  el carrito del cliente para cobrar.
- **Rate limiting** en endpoints de pedido/pago (Upstash Redis o Vercel WAF).
- Re-ajustar la CSP a **nonce** vía middleware una vez haya partes dinámicas.
