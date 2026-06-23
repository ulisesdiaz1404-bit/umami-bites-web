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

export interface OrderPayload {
  items: CartItem[];
  customer: OrderCustomer;
  payment: PaymentMethod;
  deliveryDate?: string;
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

/** Arma el texto del pedido (formato WhatsApp con *negritas*). */
export function buildOrderMessage(o: OrderPayload): string {
  const lines: string[] = [
    "🍽️ *Nuevo pedido — Umami Bites*",
    "",
    `👤 *Cliente:* ${o.customer.name}`,
    `📞 *Teléfono:* ${o.customer.phone}`,
    `📍 *Dirección:* ${o.customer.address}`,
  ];

  const date = formatDate(o.deliveryDate);
  if (date) lines.push(`📅 *Entrega:* ${date}`);
  if (o.customer.notes?.trim()) lines.push(`📝 *Notas:* ${o.customer.notes.trim()}`);

  lines.push("", "🛒 *Pedido:*");
  for (const item of o.items) {
    lines.push(
      `• ${item.quantity} ${formatUnit(item.quantity, item.unit)} — ${item.name} — ${formatPrice(
        item.priceInCents * item.quantity,
        "ARS"
      )}`
    );
  }

  lines.push(
    "",
    `Subtotal: ${formatPrice(o.subtotalInCents, "ARS")}`,
    `Envío: ${formatPrice(o.shippingInCents, "ARS")}`,
    `*Total: ${formatPrice(o.totalInCents, "ARS")}*`,
    "",
    `💳 *Pago:* ${PAYMENT_LABELS[o.payment]}`
  );

  return lines.join("\n");
}

/** Enlace wa.me listo para abrir el chat con el pedido precargado. */
export function buildOrderWhatsappHref(phone: string, o: OrderPayload): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildOrderMessage(o))}`;
}
