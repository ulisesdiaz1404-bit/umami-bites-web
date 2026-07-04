import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Guía a los buscadores: rastreá todo menos las zonas privadas / sin valor SEO
// (panel admin, carrito, checkout y API). Referencia al sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/cart", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
