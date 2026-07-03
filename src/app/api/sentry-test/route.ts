import * as Sentry from "@sentry/nextjs";

// RUTA TEMPORAL DE PRUEBA — se elimina en el commit siguiente.
export const runtime = "nodejs";

export async function GET() {
  const stamp = "20260703-alert2";
  const err = new Error(`Sentry ALERT test ${stamp} — Umami Bites (ruta temporal, borrar)`);
  const eventId = Sentry.captureException(err);
  await Sentry.flush(3000);
  return Response.json({ ok: true, eventId, env: process.env.VERCEL_ENV ?? "local" });
}
