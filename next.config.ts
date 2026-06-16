import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Fase 1: placeholders SVG de marca en /public/images + Unsplash opcional.
    // Fase 2: reemplazar por Supabase Storage / CDN propio con las fotos reales de Umami Bites.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    qualities: [75, 90],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
