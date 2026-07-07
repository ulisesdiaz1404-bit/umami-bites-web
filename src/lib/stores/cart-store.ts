import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types/cart";
import { ADDRESS_ZONE_ID } from "@/lib/data/delivery-zones";

/** Envío cotizado a partir de la dirección exacta (Nominatim). */
export interface AddressQuote {
  label: string;
  priceInCents: number;
  km: number;
}

// =====================================================================
// Zustand — Carrito. Persistencia en localStorage vía persist middleware.
// Maneja platos y paquetes con el mismo modelo. Valida maxQuantity en cada
// mutación para que la UI nunca supere el límite por pedido.
// Costo de envío placeholder configurable (Fase 2: cálculo real por zona).
// =====================================================================

/** Envío fijo placeholder en centavos (ARS). Fase 2: cálculo por zona/distancia. */
export const SHIPPING_IN_CENTS = 50_000; // $500 ARS

/** Mínimo de compra (subtotal de productos) en centavos (ARS). */
export const MIN_ORDER_IN_CENTS = 8_000_000; // $80.000 ARS

/**
 * Categorías "agregado": complementos (finger food) y bebidas. Se suman a un
 * menú o picada: NO se pueden pedir solos (ver `onlyAddons` en use-cart).
 */
export const ADDON_CATEGORIES = ["Complementos", "Bebidas"] as const;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  deliveryDate?: string; // ISO date; obligatorio para continuar al checkout
  deliveryZoneId?: string; // zona de entrega o retiro (ver delivery-zones.ts)
  addressQuote?: AddressQuote; // envío calculado por dirección exacta

  // acciones
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  increment: (menuItemId: string) => void;
  decrement: (menuItemId: string) => void;
  clear: () => void;
  setDeliveryDate: (date: string) => void;
  setDeliveryZone: (zoneId: string) => void;
  setAddressQuote: (quote: AddressQuote) => void;

  // drawer
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

/** Limita un valor entre min (default 1) y max. */
const clampQty = (qty: number, max: number, min = 1) => Math.max(min, Math.min(qty, max));

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      deliveryDate: undefined,
      deliveryZoneId: undefined,
      addressQuote: undefined,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: clampQty(i.quantity + quantity, i.maxQuantity, i.minQuantity) }
                  : i
              ),
            };
          }
          // Primer alta: respeta el mínimo del ítem (ej. menús arrancan en 20).
          const min = item.minQuantity ?? 1;
          return {
            isOpen: true,
            items: [
              ...state.items,
              { ...item, quantity: clampQty(Math.max(quantity, min), item.maxQuantity, min) },
            ],
          };
        }),

      removeItem: (menuItemId) =>
        set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) })),

      setQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId
              ? { ...i, quantity: clampQty(quantity, i.maxQuantity, i.minQuantity) }
              : i
          ),
        })),

      increment: (menuItemId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId
              ? { ...i, quantity: clampQty(i.quantity + 1, i.maxQuantity, i.minQuantity) }
              : i
          ),
        })),

      decrement: (menuItemId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId
              ? { ...i, quantity: clampQty(i.quantity - 1, i.maxQuantity, i.minQuantity) }
              : i
          ),
        })),

      clear: () => set({ items: [] }),
      setDeliveryDate: (date) => set({ deliveryDate: date }),
      // Elegir una localidad de la lista descarta la cotización por dirección.
      setDeliveryZone: (zoneId) => set({ deliveryZoneId: zoneId, addressQuote: undefined }),
      // Cotización por dirección exacta: pasa a ser la zona activa.
      setAddressQuote: (quote) =>
        set({ addressQuote: quote, deliveryZoneId: ADDRESS_ZONE_ID }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "umami-bites-cart",
      // No persistir el estado del drawer ni la fecha (se elige por sesión)
      partialize: (state) => ({ items: state.items }),
    }
  )
);
