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

// Tintes semitransparentes del color de cada estado: se leen bien tanto
// sobre el fondo claro como en modo oscuro.
export const STATUS_META: Record<
  OrderStatus,
  { label: string; fg: string; bg: string; border: string; dot: string }
> = {
  nuevo: { label: "Nuevo", fg: "#3b6fe0", bg: "rgba(59,111,224,0.13)", border: "rgba(59,111,224,0.32)", dot: "#3b6fe0" },
  confirmado: { label: "Confirmado", fg: "#c08427", bg: "rgba(201,135,31,0.15)", border: "rgba(201,135,31,0.34)", dot: "#c9871f" },
  entregado: { label: "Entregado", fg: "#3f9a5c", bg: "rgba(47,143,78,0.14)", border: "rgba(47,143,78,0.32)", dot: "#2f8f4e" },
  cancelado: { label: "Cancelado", fg: "#cf5f47", bg: "rgba(192,86,63,0.14)", border: "rgba(192,86,63,0.32)", dot: "#c0563f" },
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
