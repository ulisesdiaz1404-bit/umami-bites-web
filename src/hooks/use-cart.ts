"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useSettings } from "@/components/settings-context";

/**
 * Hook de conveniencia sobre el store del carrito.
 * Expone totales derivados y un flag `hydrated` para evitar mismatch de
 * SSR/CSR al leer datos persistidos en localStorage.
 */
export function useCart() {
  const store = useCartStore();
  const { shippingInCents: shipping, minOrderInCents: minOrder } = useSettings();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const totalItems = store.items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotalInCents = store.items.reduce((acc, i) => acc + i.priceInCents * i.quantity, 0);
  const shippingInCents = store.items.length > 0 ? shipping : 0;
  const totalInCents = subtotalInCents + shippingInCents;

  // Mínimo de compra: se evalúa sobre el subtotal de productos.
  const meetsMinimum = subtotalInCents >= minOrder;
  const amountToMinimumInCents = Math.max(0, minOrder - subtotalInCents);

  return {
    ...store,
    hydrated,
    totalItems: hydrated ? totalItems : 0,
    subtotalInCents,
    shippingInCents,
    totalInCents,
    isEmpty: store.items.length === 0,
    minOrderInCents: minOrder,
    meetsMinimum,
    amountToMinimumInCents,
  };
}
