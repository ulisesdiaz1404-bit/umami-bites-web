import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllItems } from "@/lib/data/menu";

// Regenera junto con el ISR del menú (nuevos platos aparecen solos).
export const revalidate = 60;

// Mapa del sitio: páginas fijas + una entrada por cada plato/menú.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/menu`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${SITE_URL}/quienes-somos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  let itemPages: MetadataRoute.Sitemap = [];
  try {
    const items = await getAllItems();
    itemPages = items.map((item) => ({
      url: `${SITE_URL}/menu/${item.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    // Si la fuente de datos falla, el sitemap igual sirve las páginas fijas.
  }

  return [...staticPages, ...itemPages];
}
