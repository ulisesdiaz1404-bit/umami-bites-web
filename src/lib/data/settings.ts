// =====================================================================
// Configuración del negocio — tipos + valores por defecto (client-safe).
// NO importa Supabase ni next/cache para poder usarse desde el cliente.
// La lectura desde DB vive en settings.server.ts (solo servidor).
// =====================================================================

export interface BusinessSettings {
  whatsapp: string; // número para cotizaciones (wa.me, solo dígitos)
  ordersWhatsapp: string; // número al que llegan los pedidos
  phonePrimary: string;
  phoneSecondary: string;
  address: string;
  hours: string;
  shippingInCents: number;
  minOrderInCents: number;
}

/** Valores actuales del código — se usan si no hay fila en `settings`. */
export const DEFAULT_SETTINGS: BusinessSettings = {
  whatsapp: "5491159887136",
  ordersWhatsapp: "5491163623650",
  phonePrimary: "(11) 5988-7136",
  phoneSecondary: "(11) 3668-5271",
  address: "",
  hours: "",
  // Envío base (flat). El costo real sube según la distancia a Bella Vista;
  // este es el mínimo de referencia. Ajustable desde el panel de configuración.
  shippingInCents: 150_000,
  minOrderInCents: 8_000_000,
};

const WHATSAPP_MESSAGE = "¡Hola Umami Bites! Quiero cotizar un catering para mi evento 🍽️";

/** Enlace wa.me con el mensaje de cotización precargado. */
export function whatsappHref(number: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}
