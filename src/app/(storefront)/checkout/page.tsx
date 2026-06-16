"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, formatUnit } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, isEmpty, hydrated, deliveryDate } = useCart();

  if (hydrated && isEmpty) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-3xl text-cream">No hay nada para pagar</h1>
        <p className="mt-3 text-muted">Tu carrito está vacío.</p>
        <Button asChild className="mt-7">
          <Link href="/menu">Ir al menú</Link>
        </Button>
      </div>
    );
  }

  const formattedDate = deliveryDate
    ? new Date(`${deliveryDate}T00:00:00`).toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-28 pt-32 lg:px-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-cream"
      >
        <ArrowLeft className="size-4" /> Volver al carrito
      </Link>

      <h1 className="mt-6 font-display text-4xl text-cream lg:text-5xl">Checkout</h1>
      <p className="mt-3 text-muted">Revisá tus datos y confirmá el pedido.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* Formulario placeholder — Fase 2: integrar pago real */}
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="space-y-5 rounded-xl border border-line bg-surface p-6">
            <legend className="px-2 font-display text-xl text-cream">Datos de contacto</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre y apellido</Label>
                <Input id="name" name="name" placeholder="Ej. María Pérez" autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" placeholder="11 5988-7136" autoComplete="tel" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección de entrega</Label>
              <Input id="address" name="address" placeholder="Calle, número, localidad" autoComplete="street-address" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notas del evento (opcional)</Label>
              <Input id="notes" name="notes" placeholder="Horario, cantidad de invitados, restricciones…" />
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-xl border border-line bg-surface p-6">
            <legend className="px-2 font-display text-xl text-cream">Pago</legend>
            <div className="rounded-base border border-dashed border-line bg-bg-deep p-6 text-center">
              <Lock className="mx-auto size-6 text-muted" />
              <p className="mt-3 text-sm text-muted">
                El pago online estará disponible próximamente.
              </p>
            </div>

            {/* TODO Fase 2: reemplazar por Stripe Checkout Session vía Server Action */}
            <Button type="submit" size="lg" className="w-full" disabled>
              <Lock className="size-4" /> Pagar (próximamente)
            </Button>
            <p className="text-center text-xs text-muted">
              Por ahora coordinamos el pago por WhatsApp al confirmar tu pedido.
            </p>
          </fieldset>
        </form>

        {/* Resumen */}
        <aside className="h-fit space-y-5 rounded-xl border border-line bg-surface p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-xl text-cream">Resumen</h2>

          {formattedDate && (
            <p className="rounded-base bg-bg-deep px-4 py-3 text-sm text-primary/85">
              Entrega: <span className="text-cream capitalize">{formattedDate}</span>
            </p>
          )}

          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.menuItemId} className="flex items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-base border border-line bg-bg-deep">
                  <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-cream">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.quantity} {formatUnit(item.quantity, item.unit)}
                  </p>
                </div>
                <span className="text-sm text-accent tabular-nums">
                  {formatPrice(item.priceInCents * item.quantity, "ARS")}
                </span>
              </li>
            ))}
          </ul>

          <CartSummary className="border-t border-line pt-5" />
        </aside>
      </div>
    </div>
  );
}
