import type { OrderRecord } from "@/lib/types/order";

// =====================================================================
// Helpers compartidos del admin de pedidos (estado, colores, formato).
// Los usan el dashboard, la agenda, las estadísticas y clientes.
// =====================================================================

export type OrderStatus = "nuevo" | "confirmado" | "entregado" | "cancelado";

export const ORDER_STATUSES: OrderStatus[] = [
  "nuevo",
  "confirmado",
  "entregado",
  "cancelado",
];

export const STATUS_META: Record<
  OrderStatus,
  { label: string; fg: string; bg: string; border: string; dot: string }
> = {
  nuevo: { label: "Nuevo", fg: "#1f4fb0", bg: "#e9effc", border: "#c9dbf8", dot: "#2563eb" },
  confirmado: { label: "Confirmado", fg: "#8a5a1e", bg: "#f7edda", border: "#e8d3ac", dot: "#c9871f" },
  entregado: { label: "Entregado", fg: "#2f6b3f", bg: "#e6f1e8", border: "#cfe4d3", dot: "#2f8f4e" },
  cancelado: { label: "Cancelado", fg: "#a83422", bg: "#f8e7e3", border: "#efc7bd", dot: "#c0563f" },
};

export function statusOf(status: string): OrderStatus {
  return (ORDER_STATUSES as string[]).includes(status)
    ? (status as OrderStatus)
    : "nuevo";
}

/** Enlace wa.me a partir de un teléfono con cualquier formato. */
export function waHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("54") ? digits : `54${digits}`;
  return `https://wa.me/${full}`;
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Pedidos que cuentan para facturación (todo menos cancelados). */
export function isActive(o: OrderRecord): boolean {
  return statusOf(o.status) !== "cancelado";
}

/**
 * Los ítems con variantes (sabor/tamaño) guardan el pedido con
 * `${itemId}__${variantIdx}` (ver purchase-panel.tsx). El costo vive en
 * metadata.cost del ítem BASE, así que hay que pelar el sufijo antes de
 * buscarlo en el mapa de costos.
 */
export function baseMenuItemId(menuItemId: string): string {
  return menuItemId.split("__")[0] ?? menuItemId;
}
