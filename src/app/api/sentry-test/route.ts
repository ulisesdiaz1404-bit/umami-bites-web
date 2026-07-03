import * as Sentry from "@sentry/nextjs";

// RUTA TEMPORAL DE PRUEBA — se elimina en el commit siguiente.
// Sirve para verificar que Sentry recibe errores desde producción.
export const runtime = "nodejs";

export async function GET() {
  const err = new Error("Sentry PROD test — Umami Bites (ruta temporal, borrar)");
  const eventId = Sentry.captureException(err);
  await Sentry.flush(3000);
  return Response.json({ ok: true, eventId, env: process.env.VERCEL_ENV ?? "local" });
}
