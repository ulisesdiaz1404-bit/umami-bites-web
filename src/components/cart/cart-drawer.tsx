"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

/** Fecha mínima de entrega: mañana (ISO yyyy-mm-dd). */
function minDeliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0] ?? "";
}

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isOpen,
    closeCart,
    isEmpty,
    deliveryDate,
    setDeliveryDate,
    meetsMinimum,
    amountToMinimumInCents,
    minOrderInCents,
    onlyAddons,
  } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Cerrar con ESC + bloquear scroll del body mientras está abierto
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  const canCheckout = !isEmpty && Boolean(deliveryDate) && meetsMinimum && !onlyAddons;

  const handleConfirm = () => {
    if (!canCheckout) return;
    closeCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Carrito de compras">
          <motion.div
            className="absolute inset-0 bg-bg-deep/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          <motion.div
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-soft"
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="size-5 text-accent" />
                <h2 className="font-display text-xl text-cream">Tu pedido</h2>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="rounded-full p-2 text-primary transition-colors hover:bg-surface-2 hover:text-cream"
              >
                <X className="size-5" />
              </button>
            </header>

            {isEmpty ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-surface-2">
                  <ShoppingBag className="size-7 text-muted" />
                </div>
                <p className="font-display text-lg text-cream">Tu carrito está vacío</p>
                <p className="max-w-xs text-sm text-muted">
                  Sumá picadas, menús o mesas dulces y armá tu evento.
                </p>
                <Button variant="outline" onClick={closeCart} className="mt-2">
                  Explorar el menú
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  {items.map((item) => (
                    <CartItem key={item.menuItemId} item={item} />
                  ))}
                </div>

                <footer className="space-y-4 border-t border-line px-6 py-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="delivery-date">Fecha de entrega *</Label>
                    <Input
                      id="delivery-date"
                      type="date"
                      min={minDeliveryDate()}
                      value={deliveryDate ?? ""}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      aria-required
                    />
                    {!deliveryDate && (
                      <p className="text-[0.7rem] text-muted">
                        Elegí una fecha para continuar (con 24 h de anticipación).
                      </p>
                    )}
                  </div>

                  <CartSummary />

                  {onlyAddons ? (
                    <p className="rounded-base border border-accent/40 bg-accent/10 px-4 py-3 text-xs leading-relaxed text-primary/90">
                      Los complementos y bebidas se suman a un menú o picada. Agregá al menos un
                      plato principal para confirmar el pedido.
                    </p>
                  ) : (
                    !meetsMinimum && (
                      <p className="rounded-base border border-accent/40 bg-accent/10 px-4 py-3 text-xs leading-relaxed text-primary/90">
                        Pedido mínimo {formatPrice(minOrderInCents, "ARS")}. Te faltan{" "}
                        <span className="font-semibold text-cream">
                          {formatPrice(amountToMinimumInCents, "ARS")}
                        </span>
                        .
                      </p>
                    )
                  )}

                  <Button onClick={handleConfirm} disabled={!canCheckout} size="lg" className="w-full">
                    Confirmar pedido
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button variant="ghost" onClick={closeCart} className="w-full">
                    Seguir comprando
                  </Button>
                </footer>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
