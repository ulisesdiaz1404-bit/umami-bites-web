// =====================================================================
// URL canónica del sitio — fuente única para metadata, sitemap, robots y
// datos estructurados (JSON-LD). Así el dominio se cambia en UN solo lugar.
//
// Prioridad:
//   1) NEXT_PUBLIC_SITE_URL  → definila cuando compres el dominio final
//      (ej. https://umamibites.com.ar). Es la que manda.
//   2) URL de producción de Vercel → funciona sola en los deploys mientras
//      no haya dominio propio.
//   3) Fallback local.
// =====================================================================

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "https://umamibites.com.ar";
}

export const SITE_URL = resolveSiteUrl();

/** Convierte una ruta relativa (o URL de imagen local) en absoluta. */
export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
