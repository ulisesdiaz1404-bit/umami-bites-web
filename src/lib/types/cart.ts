import type { ItemType } from "@/lib/types/menu-item";

export interface CartItem {
  menuItemId: string;
  slug: string;
  name: string;
  priceInCents: number;
  quantity: number;
  imageUrl: string;
  maxQuantity: number; // Para validar en UI antes de checkout
  minQuantity?: number; // Mínimo por pedido (ej. menús por persona: 20)
  category?: string; // Categoría del ítem (ej. "Complementos"): valida "no solo complementos"
  type: ItemType;
  unit?: string; // ej. "porción" | "persona" | "docena" | "tabla"
  deliveryDate?: string; // ISO date string; requerido en checkout (Fase 2)
}
