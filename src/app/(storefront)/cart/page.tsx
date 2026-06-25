"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

function minDeliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0] ?? "";
}

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    isEmpty,
    hydrated,
    deliveryDate,
    setDeliveryDate,
    clear,
    meetsMinimum,
    amountToMinimumInCents,
    minOrderInCents,
  } = useCart();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-5 pb-28 pt-32 lg:px-8">
        <div className="skeleton h-10 w-48" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-surface-2">
          <ShoppingBag className="size-7 text-muted" />
        </div>
        <h1 className="mt-5 font-display text-3xl text-cream">Tu carrito está vacío</h1>
        <p className="mt-3 text-muted">Sumá picadas, menús o mesas dulces para tu próximo evento.</p>
        <Button asChild className="mt-7">
          <Link href="/menu">Explorar el menú</Link>
        </Button>
      </div>
    );
  }

  const canCheckout = Boolean(deliveryDate) && meetsMinimum;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-28 pt-32 lg:px-8">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-4xl text-cream lg:text-5xl">Tu pedido</h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-muted transition-colors hover:text-danger"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="divide-y divide-line rounded-xl border border-line bg-surface px-6">
          {items.map((item) => (
            <CartItem key={item.menuItemId} item={item} />
          ))}
        </div>

        <aside className="h-fit space-y-5 rounded-xl border border-line bg-surface p-6 lg:sticky lg:top-28">
          <div className="space-y-1.5">
            <Label htmlFor="cart-delivery-date">Fecha de entrega *</Label>
            <Input
              id="cart-delivery-date"
              type="date"
              min={minDeliveryDate()}
              value={deliveryDate ?? ""}
              onChange={(e) => setDeliveryDate(e.target.value)}
              aria-required
            />
            {!deliveryDate && (
              <p className="text-[0.7rem] text-muted">Con al menos 24 h de anticipación.</p>
            )}
          </div>

          <CartSummary />

          {!meetsMinimum && (
            <p className="rounded-base border border-accent/40 bg-accent/10 px-4 py-3 text-xs leading-relaxed text-primary/90">
              El pedido mínimo es {formatPrice(minOrderInCents, "ARS")}. Te faltan{" "}
              <span className="font-semibold text-cream">
                {formatPrice(amountToMinimumInCents, "ARS")}
              </span>{" "}
              para poder confirmar.
            </p>
          )}

          <Button
            onClick={() => router.push("/checkout")}
            disabled={!canCheckout}
            size="lg"
            className="w-full"
          >
            Continuar al checkout <ArrowRight className="size-4" />
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/menu">Seguir agregando</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
