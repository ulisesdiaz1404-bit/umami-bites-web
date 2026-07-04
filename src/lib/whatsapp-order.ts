import type { CartItem } from "@/lib/types/cart";
import { formatPrice, formatUnit } from "@/lib/utils";

// =====================================================================
// Construye el mensaje de WhatsApp con el pedido completo y el enlace wa.me.
// El pago real (efectivo/tarjeta/MP) se coordina con los dueños por WhatsApp;
// acá solo se informa el método elegido por el cliente.
// =====================================================================

export type PaymentMethod = "efectivo" | "tarjeta" | "mp";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta (débito / crédito)",
  mp: "Mercado Pago",
};

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface OrderDelivery {
  /** Nombre de la zona o "Retiro en el local". */
  label: string;
  /** true = retiro en el local (sin envío). */
  pickup: boolean;
  /** true = costo de envío a coordinar (localidad fuera de la lista). */
  consult: boolean;
}

export interface OrderPayload {
  items: CartItem[];
  customer: OrderCustomer;
  payment: PaymentMethod;
  deliveryDate?: string;
  delivery?: OrderDelivery;
  subtotalInCents: number;
  shippingInCents: number;
  totalInCents: number;
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// Separador de sección — carácter de línea (no emoji), se ve igual en todos
// los teléfonos sin depender de la fuente de emojis del sistema.
const SEP = "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬";

/** Arma el texto del pedido (formato WhatsApp con *negritas*). */
export function buildOrderMessage(o: OrderPayload): string {
  const lines: string[] = [
    "🍽️ *Nuevo pedido — Umami Bites*",
    SEP,
    `👤 *Cliente:* ${o.customer.name}`,
    `📞 *Teléfono:* ${o.customer.phone}`,
  ];

  // Entrega: retiro en el local o envío a domicilio con su zona.
  if (o.delivery?.pickup) {
    lines.push("🏬 *Entrega:* Retiro en el local");
  } else {
    lines.push(`📍 *Dirección:* ${o.customer.address}`);
    if (o.delivery?.label) lines.push(`🗺️ *Zona:* ${o.delivery.label}`);
  }

  const date = formatDate(o.deliveryDate);
  if (date) lines.push(`📅 *Fecha:* ${date}`);
  if (o.customer.notes?.trim()) lines.push(`📝 *Notas:* ${o.customer.notes.trim()}`);

  lines.push(SEP, "🛒 *Pedido:*");
  for (const item of o.items) {
    lines.push(
      `• ${item.quantity} ${formatUnit(item.quantity, item.unit)} — ${item.name} — ${formatPrice(
        item.priceInCents * item.quantity,
        "ARS"
      )}`
    );
  }

  // Renglón de envío: retiro (sin cargo), a coordinar, o precio calculado.
  const shippingLine = o.delivery?.pickup
    ? "🏬 Retiro: sin cargo"
    : o.delivery?.consult
      ? "🚚 Envío: a coordinar según zona"
      : `🚚 Envío: ${formatPrice(o.shippingInCents, "ARS")}`;

  lines.push(
    SEP,
    `🧾 Subtotal: ${formatPrice(o.subtotalInCents, "ARS")}`,
    shippingLine,
    `💵 *Total: ${formatPrice(o.totalInCents, "ARS")}${
      o.delivery?.consult ? " + envío" : ""
    }*`,
    SEP,
    `💳 *Pago:* ${PAYMENT_LABELS[o.payment]}`
  );

  return lines.join("\n");
}

/** Enlace wa.me listo para abrir el chat con el pedido precargado. */
export function buildOrderWhatsappHref(phone: string, o: OrderPayload): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildOrderMessage(o))}`;
}

// ---------------------------------------------------------------------
// Pedido de reseña post-entrega. El dueño abre WhatsApp con el mensaje
// pre-armado hacia el cliente (un clic, no es automático — no hay API
// paga de WhatsApp Business acá).
// ---------------------------------------------------------------------

const INSTAGRAM_URL = "https://www.instagram.com/umami.bites.catering/";

/** Mensaje amable pidiendo calificación al cliente tras la entrega. */
export function buildReviewMessage(customerName?: string): string {
  const hola = customerName?.trim() ? `¡Hola ${customerName.trim()}! ` : "¡Hola! ";
  return [
    `${hola}Somos *Umami Bites* 🍽️`,
    "",
    "¡Gracias por tu pedido! Esperamos que hayas disfrutado todo 😃",
    "",
    "¿Nos dejarías tu opinión? Nos ayuda un montón a seguir creciendo. Con una o dos líneas contándonos qué te pareció ya nos hacés felices 🙌",
    "",
    `Y si querés, seguinos y etiquetanos en Instagram 📸 ${INSTAGRAM_URL}`,
    "",
    "¡Gracias totales! 🧡",
  ].join("\n");
}

/** Enlace wa.me para pedirle la reseña a un cliente (teléfono en cualquier formato). */
export function buildReviewHref(phone: string, customerName?: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("54") ? digits : `54${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(buildReviewMessage(customerName))}`;
}
