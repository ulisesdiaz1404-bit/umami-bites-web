"use client";

import { useEffect, useState } from "react";
import { useCartStore, ADDON_CATEGORIES } from "@/lib/stores/cart-store";
import { useSettings } from "@/components/settings-context";
import { getDeliveryOption, ADDRESS_ZONE_ID, type DeliveryZone } from "@/lib/data/delivery-zones";

/**
 * Hook de conveniencia sobre el store del carrito.
 * Expone totales derivados y un flag `hydrated` para evitar mismatch de
 * SSR/CSR al leer datos persistidos en localStorage.
 */
export function useCart() {
  const store = useCartStore();
  const { minOrderInCents: minOrder } = useSettings();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const totalItems = store.items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotalInCents = store.items.reduce((acc, i) => acc + i.priceInCents * i.quantity, 0);

  // Envío: se calcula según la opción elegida (delivery-zones.ts).
  //  - sin opción, o domicilio sin dirección calculada → "none" ("A calcular")
  //  - "coordinar por WhatsApp"                       → "consult" ("A coordinar")
  //  - retiro o domicilio ya cotizado                 → "resolved" (retiro = $0)
  const quote = store.deliveryZoneId === ADDRESS_ZONE_ID ? store.addressQuote : undefined;
  const zone: DeliveryZone | undefined = quote
    ? {
        id: ADDRESS_ZONE_ID,
        label: quote.label,
        kind: "delivery",
        km: quote.km,
        priceInCents: quote.priceInCents,
      }
    : getDeliveryOption(store.deliveryZoneId);
  const shippingStatus: "none" | "resolved" | "consult" =
    !zone || (zone.id === ADDRESS_ZONE_ID && !quote)
      ? "none"
      : zone.kind === "consult"
        ? "consult"
        : "resolved";
  const shippingInCents =
    store.items.length > 0 && shippingStatus === "resolved" ? zone!.priceInCents : 0;
  const totalInCents = subtotalInCents + shippingInCents;

  // Mínimo de compra: se evalúa sobre el subtotal de productos.
  const meetsMinimum = subtotalInCents >= minOrder;
  const amountToMinimumInCents = Math.max(0, minOrder - subtotalInCents);

  // Complementos y bebidas se suman a un menú o picada: no se piden solos.
  const onlyAddons =
    store.items.length > 0 &&
    store.items.every((i) => (ADDON_CATEGORIES as readonly string[]).includes(i.category ?? ""));

  return {
    ...store,
    hydrated,
    totalItems: hydrated ? totalItems : 0,
    subtotalInCents,
    shippingInCents,
    shippingStatus,
    deliveryZone: zone,
    totalInCents,
    isEmpty: store.items.length === 0,
    minOrderInCents: minOrder,
    meetsMinimum,
    amountToMinimumInCents,
    onlyAddons,
  };
}
