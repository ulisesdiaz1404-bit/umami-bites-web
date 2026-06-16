import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Currency } from "@/lib/types/menu-item";

/** Combina clases de Tailwind resolviendo conflictos (patrón shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un precio almacenado en centavos (estándar Stripe) a string legible.
 * Ej: formatPrice(8900000, "ARS") -> "$ 89.000"
 */
export function formatPrice(priceInCents: number, currency: Currency = "ARS"): string {
  const amount = priceInCents / 100;
  const localeMap: Record<Currency, string> = {
    USD: "en-US",
    PEN: "es-PE",
    ARS: "es-AR",
  };
  return new Intl.NumberFormat(localeMap[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Pluraliza la unidad de un ítem para mostrarla junto a la cantidad. */
export function formatUnit(qty: number, unit?: string): string {
  if (!unit) return qty === 1 ? "unidad" : "unidades";
  const plurals: Record<string, string> = {
    porción: "porciones",
    persona: "personas",
    docena: "docenas",
    tabla: "tablas",
    botella: "botellas",
    pack: "packs",
  };
  return qty === 1 ? unit : (plurals[unit] ?? `${unit}s`);
}
