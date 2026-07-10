import type { MenuItem } from "@/lib/types/menu-item";

export interface Variant {
  label: string;
  priceInCents: number;
}

/**
 * Lee las variantes (opciones) de metadata.variants (JSON).
 * Única fuente compartida por cards, panel de compra y botón de carrito:
 * si el ítem tiene variantes, el precio visible/agregado es SIEMPRE el de
 * la primera variante, nunca price_in_cents base (puede quedar desactualizado
 * si el admin edita uno solo de los dos).
 */
export function parseVariants(item: MenuItem): Variant[] | null {
  const raw = item.metadata?.variants;
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) && v.length > 0 ? (v as Variant[]) : null;
  } catch {
    return null;
  }
}

/** Precio a mostrar en cards/listados: primera variante o precio base. */
export function displayPriceInCents(item: MenuItem): number {
  return parseVariants(item)?.[0]?.priceInCents ?? item.priceInCents;
}
