// =====================================================================
// Constructores de datos estructurados (JSON-LD / schema.org).
// Google los lee para entender que somos un servicio de catering, en qué
// zonas trabajamos y a qué precio. Habilita Local Pack y rich results.
// Nada de esto se ve en la web: va en un <script> del <head>.
// =====================================================================

import { SITE_URL, absoluteUrl } from "@/lib/site";
import { CONTACT } from "@/lib/contact";
import type { MenuItem } from "@/lib/types/menu-item";
import { TESTIMONIALS, aggregateRating } from "@/lib/data/testimonials";

/**
 * Zonas de reparto (negocio de área de servicio, sin dirección visible).
 * AFINAR con el dueño: agregar/quitar partidos según hasta dónde llega el envío.
 */
export const AREA_SERVED = [
  "Ciudad Autónoma de Buenos Aires",
  "San Miguel",
  "Bella Vista",
  "José C. Paz",
  "San Isidro",
  "Vicente López",
  "Tigre",
  "Pilar",
  "San Fernando",
  "Morón",
  "Ituzaingó",
  "Hurlingham",
  "Ramos Mejía",
  "Lomas de Zamora",
  "Lanús",
  "Avellaneda",
  "Quilmes",
];

/** Ficha de negocio: servicio de catering para eventos en Buenos Aires. */
export function catererSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Caterer",
    "@id": `${SITE_URL}/#business`,
    name: "Umami Bites Catering",
    description:
      "Catering premium a domicilio para eventos en Buenos Aires y GBA: casamientos, " +
      "cumpleaños y eventos corporativos. Picadas de autor, menús completos (asado, " +
      "comida criolla, pizza party), brunch, finger food, mesa dulce y barra de tragos. " +
      "Vajilla, mantelería y servicio incluidos.",
    url: SITE_URL,
    image: absoluteUrl("/photos/picada-umami-1.jpg"),
    logo: absoluteUrl("/logo.png"),
    telephone: `+${CONTACT.whatsapp}`,
    priceRange: "$$",
    currenciesAccepted: "ARS",
    paymentAccepted: "Efectivo, Tarjeta, Mercado Pago",
    servesCuisine: [
      "Catering",
      "Argentina",
      "Picadas",
      "Asado",
      "Comida criolla",
      "Mesa dulce",
    ],
    areaServed: AREA_SERVED.map((name) => ({ "@type": "City", name })),
    sameAs: [CONTACT.instagramUrl],
  };
}

/** Producto + oferta (precio) para la página de detalle de un plato/menú. */
export function productSchema(item: MenuItem) {
  const url = `${SITE_URL}/menu/${item.slug}`;

  // aggregateRating + review: SOLO si hay reseñas reales cargadas (ver
  // lib/data/testimonials.ts). Estas mismas reseñas se muestran en la página
  // (requisito de Google: el markup debe reflejar contenido visible).
  const agg = aggregateRating();
  const reviews = agg
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: agg.ratingValue,
          reviewCount: String(agg.reviewCount),
          bestRating: "5",
        },
        review: TESTIMONIALS.map((t) => ({
          "@type": "Review",
          author: { "@type": "Person", name: t.author },
          reviewRating: {
            "@type": "Rating",
            ratingValue: String(t.rating),
            bestRating: "5",
          },
          reviewBody: t.body,
          ...(t.date ? { datePublished: t.date } : {}),
        })),
      }
    : {};

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    description: item.description,
    image: item.images.map((i) => absoluteUrl(i.url)),
    category: item.category,
    brand: { "@type": "Brand", name: "Umami Bites Catering" },
    ...reviews,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: item.currency,
      // schema.org espera el precio en unidades (no centavos).
      price: (item.priceInCents / 100).toFixed(2),
      availability: item.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Umami Bites Catering" },
    },
  };
}
