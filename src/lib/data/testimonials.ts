// =====================================================================
// Testimonios / reseñas REALES de clientes.
//
// ⚠️ IMPORTANTE (política de Google): solo cargar reseñas GENUINAS. Nunca
// inventar nombres, textos ni estrellas. Las reseñas falsas violan las
// políticas de datos estructurados y pueden ganar una penalización manual.
//
// Cómo se usa: al agregar objetos a TESTIMONIALS, automáticamente:
//   1) se muestran en una sección visible del detalle de producto
//      (components/home/testimonials.tsx), y
//   2) se emiten en el JSON-LD (aggregateRating + review) → habilita las
//      estrellas en Google y resuelve los avisos de Search Console.
// Mientras el array esté vacío no se publica nada (ni sección ni schema).
// =====================================================================

export interface Testimonial {
  /** Nombre real del cliente (puede ir abreviado: "María G."). */
  author: string;
  /** Estrellas 1–5. Si el testimonio no tenía puntaje, estimar según el texto. */
  rating: number;
  /** Texto de la reseña, tal cual lo escribió el cliente. */
  body: string;
  /** Fecha ISO (yyyy-mm-dd), opcional. */
  date?: string;
}

// -------------------------------------------------------------------
// PEGAR ACÁ las reseñas reales. Ejemplo del formato (borrar y reemplazar):
//
// export const TESTIMONIALS: Testimonial[] = [
//   {
//     author: "María G.",
//     rating: 5,
//     body: "La picada Umami fue el centro de la mesa. Impecable presentación y todo riquísimo.",
//     date: "2026-05-12",
//   },
// ];
// -------------------------------------------------------------------
export const TESTIMONIALS: Testimonial[] = [];

/**
 * Calificación agregada a partir de las reseñas reales.
 * Devuelve null si no hay reseñas (así no se emite schema vacío/falso).
 */
export function aggregateRating(list: Testimonial[] = TESTIMONIALS) {
  if (list.length === 0) return null;
  const avg = list.reduce((sum, t) => sum + t.rating, 0) / list.length;
  return { ratingValue: avg.toFixed(1), reviewCount: list.length };
}
