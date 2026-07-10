import * as Sentry from "@sentry/nextjs";

// =====================================================================
// Sentry — inicialización del lado cliente (navegador).
// APAGADO por defecto: sin NEXT_PUBLIC_SENTRY_DSN no se inicializa nada,
// así que no reporta ni pesa en tiempo de ejecución.
// =====================================================================

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1,
    // Sin Session Replay: evita workers/blob que chocarían con la CSP estricta.
    // Ruido de scripts que inyectan los navegadores internos (Instagram/Facebook):
    // no es código nuestro, se ignora para no ensuciar los issues.
    ignoreErrors: ["window.webkit.messageHandlers"],
    denyUrls: [/^app:\/\//],
  });
}

// Instrumenta las transiciones de ruta del App Router (para trazas de navegación).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
