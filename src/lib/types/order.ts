import type { PaymentMethod } from "@/lib/whatsapp-order";

/** Ítem congelado dentro del pedido (precio al momento de la compra). */
export interface OrderItemSnapshot {
  menuItemId: string;
  name: string;
  quantity: number;
  unit?: string;
  priceInCents: number;
}

/** Fila de la tabla `orders` tal como vuelve de Supabase. */
export interface OrderRecord {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  notes: string | null;
  delivery_date: string | null;
  payment_method: PaymentMethod;
  items: OrderItemSnapshot[];
  subtotal_in_cents: number;
  shipping_in_cents: number;
  total_in_cents: number;
  status: string;
}
