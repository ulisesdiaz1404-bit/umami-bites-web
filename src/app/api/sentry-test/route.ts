import * as Sentry from "@sentry/nextjs";

// RUTA TEMPORAL DE PRUEBA — se elimina en el commit siguiente.
export const runtime = "nodejs";

export async function GET() {
  // Mensaje único → issue NUEVO (grupo aparte, gatilla alerta si hay regla).
  const err = new Error("Sentry NEW test 20260703-172029 — Umami Bites (ruta temporal, borrar)");
  const eventId = Sentry.captureException(err);
  const flushed = await Sentry.flush(3000);
  return Response.json({ ok: true, eventId, flushed, env: process.env.VERCEL_ENV ?? "local" });
}
