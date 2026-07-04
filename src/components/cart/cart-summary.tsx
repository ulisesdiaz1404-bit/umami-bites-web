"use client";

import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

/** Resumen de subtotal + envío (según zona/retiro) + total. */
export function CartSummary({ className }: { className?: string }) {
  const { subtotalInCents, shippingInCents, totalInCents, isEmpty, shippingStatus, deliveryZone } =
    useCart();

  // Texto del renglón de envío según el estado del cálculo.
  const shippingLabel = isEmpty
    ? "—"
    : shippingStatus === "none"
      ? "A calcular"
      : shippingStatus === "consult"
        ? "A coordinar"
        : deliveryZone?.kind === "pickup"
          ? "Sin cargo"
          : formatPrice(shippingInCents, "ARS");

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm text-primary/85">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatPrice(subtotalInCents, "ARS")}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-primary/85">
        <span className="flex items-center gap-1.5">
          {deliveryZone?.kind === "pickup" ? "Retiro" : "Envío"}
          {shippingStatus === "resolved" && deliveryZone?.km ? (
            <span className="text-[0.7rem] text-muted">({deliveryZone.label})</span>
          ) : shippingStatus === "none" ? (
            <span className="text-[0.7rem] text-muted">(elegí la zona)</span>
          ) : null}
        </span>
        <span className="tabular-nums">{shippingLabel}</span>
      </div>
      <Separator className="my-3" />
      <div className="flex items-center justify-between">
        <span className="font-display text-lg text-cream">Total</span>
        <span className="font-display text-xl text-accent tabular-nums">
          {formatPrice(totalInCents, "ARS")}
        </span>
      </div>
    </div>
  );
}
