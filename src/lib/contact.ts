// Datos de contacto de Umami Bites Catering (Fase 2: mover a CMS/env si cambian).

export const CONTACT = {
  instagram: "@umamibites",
  instagramUrl: "https://instagram.com/umamibites",
  phonePrimary: "(11) 5988-7136",
  phoneSecondary: "(11) 3668-5271",
  /** Número en formato internacional para enlaces wa.me (sin signos). */
  whatsapp: "5491159887136",
  /**
   * Número al que llegan los PEDIDOS confirmados (los dueños del local).
   * TODO: reemplazar por el WhatsApp real del negocio. Hoy es el número de
   * prueba que pasó el cliente para testear el flujo de checkout.
   */
  ordersWhatsapp: "5491163623650",
} as const;

const WHATSAPP_MESSAGE = encodeURIComponent(
  "¡Hola Umami Bites! Quiero cotizar un catering para mi evento 🍽️"
);

export const WHATSAPP_HREF = `https://wa.me/${CONTACT.whatsapp}?text=${WHATSAPP_MESSAGE}`;
