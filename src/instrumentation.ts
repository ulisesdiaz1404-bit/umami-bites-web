import * as Sentry from "@sentry/nextjs";

// =====================================================================
// Sentry — inicialización del lado servidor (Node.js runtime + Edge).
// APAGADO por defecto: si no está NEXT_PUBLIC_SENTRY_DSN, register() sale
// sin hacer nada, así el sitio funciona igual sin cuenta de Sentry.
// Para activarlo: crear proyecto en https://sentry.io y cargar el DSN en
// las env vars de Vercel (NEXT_PUBLIC_SENTRY_DSN). Ver SENTRY.md.
// =====================================================================

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export async function register() {
  if (!dsn) return; // sin DSN → Sentry desactivado (no-op)

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn,
      // Muestreo de performance (trazas). Sitio de bajo tráfico → 100%.
      // Bajalo (p.ej. 0.2) si algún día consumís mucha cuota.
      tracesSampleRate: 1,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      tracesSampleRate: 1,
    });
  }
}

// Captura errores de renderizado en el servidor (App Router).
export const onRequestError = Sentry.captureRequestError;
