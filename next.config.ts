import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 * - dev: Turbopack + React Refresh necesitan 'unsafe-eval' (solo en desarrollo).
 * - prod: política estricta. Sin eval. 'unsafe-inline' en script/style por los
 *   scripts de hidratación de Next y los estilos inline de Framer Motion/Tailwind.
 *   (Para CSP con nonce habría que mover todo a middleware dinámico; este sitio
 *   es marketing estático, así que se prioriza no romper el render estático.)
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Supabase: auth/REST (https) + realtime (wss) desde el navegador.
  // Sentry: envío de errores/trazas al ingest (solo si se activa con DSN).
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io" +
    (isDev ? " ws: http://localhost:*" : ""),
  "media-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Cabeceras de seguridad aplicadas a todas las rutas.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Fuerza HTTPS durante 2 años (incluye subdominios). Solo afecta navegadores en HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Impide que el sitio se cargue dentro de un <iframe> (anti clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // El navegador no "adivina" tipos MIME (anti drive-by / MIME sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No filtra la URL completa al navegar a otros sitios.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Apaga APIs sensibles del navegador que el sitio no usa.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Aísla el origen (Spectre / fugas cross-origin).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Las fotos del menú suben por Server Action; el límite default (1MB) es poco.
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
  // No anunciar el framework (menos huella para un atacante).
  poweredByHeader: false,
  // No exponer el código fuente original en producción.
  productionBrowserSourceMaps: false,
  images: {
    // Fase 1: placeholders SVG de marca en /public/images + Unsplash opcional.
    // Fase 2: reemplazar por Supabase Storage / CDN propio con las fotos reales de Umami Bites.
    // SVG remotos van como "attachment" + CSP sandbox para neutralizar XSS vía SVG.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Fotos del menú subidas por el dueño desde el panel (Supabase Storage).
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Sentry solo se "engancha" al build si hay DSN configurado. Sin DSN, se
// exporta la config tal cual (build idéntico al de siempre, riesgo cero).
const enableSentry = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

export default enableSentry
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      // Amplía la subida de source maps del cliente para mejores stack traces.
      widenClientFileUpload: true,
      // Saca logs del SDK del bundle del cliente.
      disableLogger: true,
      // Solo sube source maps si hay auth token (si no, buildea sin subirlos).
      sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
    })
  : nextConfig;
