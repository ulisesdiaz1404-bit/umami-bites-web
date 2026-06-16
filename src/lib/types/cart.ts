import type { ItemType } from "@/lib/types/menu-item";

export interface CartItem {
  menuItemId: string;
  slug: string;
  name: string;
  priceInCents: number;
  quantity: number;
  imageUrl: string;
  maxQuantity: number; // Para validar en UI antes de checkout
  type: ItemType;
  unit?: string; // ej. "porción" | "persona" | "docena" | "tabla"
  deliveryDate?: string; // ISO date string; requerido en checkout (Fase 2)
}
