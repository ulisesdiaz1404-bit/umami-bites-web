// =====================================================================
// CONTRATO DE DATOS — fuente de verdad del frontend.
// La Fase 2 reemplaza mock-menu.ts por queries a Postgres SIN tocar
// componentes: estos types no cambian.
// =====================================================================

export type ItemType = "dish" | "package";

export type Currency = "USD" | "PEN" | "ARS";

export interface MenuImage {
  url: string;
  alt: string;
}

export interface MenuItem {
  id: string; // UUID en fase 2
  slug: string;
  name: string;
  description: string;
  priceInCents: number; // SIEMPRE en centavos (estándar Stripe)
  currency: Currency;
  images: MenuImage[];
  available: boolean; // Equivalente a stock; false = "No disponible"
  maxQuantity: number; // Límite por pedido (ej. 10 porciones, 2 paquetes)
  category: string; // "Picadas" | "Empanadas" | "Menús" | etc.
  type: ItemType; // "dish" | "package"
  servings?: number; // Solo paquetes: cantidad de personas
  includes?: string[]; // Solo paquetes: lista de ítems incluidos
  metadata?: Record<string, string>;
}
