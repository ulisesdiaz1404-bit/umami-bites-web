"use client";

import { useEffect, useState } from "react";
import { useCartStore, SHIPPING_IN_CENTS } from "@/lib/stores/cart-store";

/**
 * Hook de conveniencia sobre el store del carrito.
 * Expone totales derivados y un flag `hydrated` para evitar mismatch de
 * SSR/CSR al leer datos persistidos en localStorage.
 */
export function useCart() {
  const store = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const totalItems = store.items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotalInCents = store.items.reduce((acc, i) => acc + i.priceInCents * i.quantity, 0);
  const shippingInCents = store.items.length > 0 ? SHIPPING_IN_CENTS : 0;
  const totalInCents = subtotalInCents + shippingInCents;

  return {
    ...store,
    hydrated,
    totalItems: hydrated ? totalItems : 0,
    subtotalInCents,
    shippingInCents,
    totalInCents,
    isEmpty: store.items.length === 0,
  };
}
