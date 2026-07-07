"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Banknote, CreditCard, Smartphone, MessageCircle } from "lucide-react";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCart } from "@/hooks/use-cart";
import { useSettings } from "@/components/settings-context";
import { formatPrice, formatUnit, cn } from "@/lib/utils";
import { ALL_DELIVERY_OPTIONS, ADDRESS_ZONE_ID } from "@/lib/data/delivery-zones";
import {
  buildOrderWhatsappHref,
  type PaymentMethod,
} from "@/lib/whatsapp-order";

function minDeliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0] ?? "";
}

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  hint: string;
  icon: typeof Banknote;
}[] = [
  { value: "efectivo", label: "Efectivo", hint: "Pagás al recibir", icon: Banknote },
  { value: "tarjeta", label: "Tarjeta", hint: "Débito o crédito", icon: CreditCard },
  { value: "mp", label: "Mercado Pago", hint: "Transferencia / QR", icon: Smartphone },
];

export default function CheckoutPage() {
  const {
    items,
    isEmpty,
    hydrated,
    deliveryDate,
    setDeliveryDate,
    deliveryZoneId,
    setDeliveryZone,
    setAddressQuote,
    deliveryZone,
    shippingStatus,
    subtotalInCents,
    shippingInCents,
    totalInCents,
    meetsMinimum,
    amountToMinimumInCents,
    minOrderInCents,
    onlyAddons,
  } = useCart();
  const settings = useSettings();
  const isPickup = deliveryZone?.kind === "pickup";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteMsg, setQuoteMsg] = useState<string | null>(null);

  // Calcula el envío a partir de la dirección exacta (Nominatim, vía /api).
  async function calcByAddress() {
    if (!address.trim()) {
      setQuoteMsg("Escribí tu dirección primero.");
      return;
    }
    setQuoting(true);
    setQuoteMsg(null);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setAddressQuote({
          label: `Envío a ${data.label}`,
          priceInCents: data.priceInCents,
          km: data.km,
        });
      } else if (data.reason === "far") {
        setQuoteMsg("Esa dirección queda lejos de nuestra zona. Escribinos por WhatsApp para coordinar.");
      } else if (data.reason === "notfound") {
        setQuoteMsg("No pudimos ubicar esa dirección. Revisala o elegí tu localidad en la lista.");
      } else {
        setQuoteMsg("No pudimos calcular ahora. Elegí tu localidad en la lista de arriba.");
      }
    } catch {
      setQuoteMsg("No pudimos calcular ahora. Elegí tu localidad en la lista de arriba.");
    } finally {
      setQuoting(false);
    }
  }

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

  function handleConfirm() {
    if (!name.trim() || !phone.trim()) {
      setError("Completá nombre y teléfono para confirmar.");
      return;
    }
    if (shippingStatus === "none") {
      setError("Elegí la zona de entrega o la opción de retiro.");
      return;
    }
    if (!isPickup && !address.trim()) {
      setError("Completá la dirección de entrega (o elegí retiro en el local).");
      return;
    }
    if (!deliveryDate) {
      setError("Elegí la fecha de entrega.");
      return;
    }
    if (!payment) {
      setError("Elegí un método de pago.");
      return;
    }
    if (onlyAddons) {
      setError(
        "Los complementos y bebidas se suman a un menú o picada. Agregá al menos un plato principal para confirmar."
      );
      return;
    }
    if (!meetsMinimum) {
      setError(
        `El pedido mínimo es ${formatPrice(minOrderInCents, "ARS")}. Te faltan ${formatPrice(
          amountToMinimumInCents,
          "ARS"
        )}.`
      );
      return;
    }
    setError(null);

    const customer = {
      name: name.trim(),
      phone: phone.trim(),
      address: isPickup ? "Retiro en el local" : address.trim(),
      notes,
    };
    const delivery = {
      label: deliveryZone?.label ?? "",
      pickup: isPickup,
      consult: shippingStatus === "consult",
    };
    const payload = {
      items,
      customer,
      payment,
      deliveryDate,
      delivery,
      subtotalInCents,
      shippingInCents,
      totalInCents,
    };

    // Evento de conversión: pedido confirmado que se envía por WhatsApp.
    track("order_confirm", {
      payment,
      items: items.length,
      totalArs: Math.round(totalInCents / 100),
    });

    const href = buildOrderWhatsappHref(settings.ordersWhatsapp, payload);

    // Guarda el pedido en la DB en segundo plano (no bloquea el redirect; si no
    // hay Supabase configurado, el endpoint responde ok sin guardar).
    void fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        payment,
        deliveryDate,
        subtotalInCents,
        shippingInCents,
        totalInCents,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          priceInCents: i.priceInCents,
        })),
      }),
    }).catch(() => {});

    // Abre WhatsApp con el pedido precargado. NO vaciamos el carrito: el cliente
    // puede volver, seguir agregando ítems y reenviar. (Se vacía manualmente
    // desde el carrito con "Vaciar carrito".)
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-28 pt-32 lg:px-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-cream"
      >
        <ArrowLeft className="size-4" /> Volver al carrito
      </Link>

      <h1 className="mt-6 font-display text-4xl text-cream lg:text-5xl">Checkout</h1>
      <p className="mt-3 text-muted">
        Completá tus datos y confirmá: te abrimos WhatsApp con el pedido listo para enviar.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="space-y-5 rounded-xl border border-line bg-surface p-6">
            <legend className="px-2 font-display text-xl text-cream">Datos de contacto</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre y apellido *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej. María Pérez"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="11 5988-7136"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="delivery-zone">Zona de entrega *</Label>
              <select
                id="delivery-zone"
                value={deliveryZoneId ?? ""}
                onChange={(e) => setDeliveryZone(e.target.value)}
                className="flex h-12 w-full rounded-base border border-line bg-bg-deep px-4 py-2 text-sm text-cream transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 [color-scheme:dark]"
              >
                <option value="" disabled>
                  Elegí tu zona o retiro…
                </option>
                {ALL_DELIVERY_OPTIONS.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.kind === "delivery"
                      ? `${z.label} — ${formatPrice(z.priceInCents, "ARS")}`
                      : z.label}
                  </option>
                ))}
              </select>
              <p className="text-[0.7rem] text-muted">
                El envío se calcula por distancia desde Bella Vista. El retiro no tiene cargo.
              </p>
            </div>

            {!isPickup && (
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label htmlFor="address">Dirección de entrega *</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Calle, número, localidad"
                    autoComplete="street-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={calcByAddress}
                    disabled={quoting}
                  >
                    {quoting ? "Calculando…" : "Calcular envío por mi dirección"}
                  </Button>
                  {deliveryZoneId === ADDRESS_ZONE_ID && deliveryZone && (
                    <span className="text-xs text-accent">
                      ✓ {deliveryZone.label} · ≈{deliveryZone.km} km ·{" "}
                      {formatPrice(deliveryZone.priceInCents, "ARS")}
                    </span>
                  )}
                </div>
                {quoteMsg && <p className="text-xs text-danger">{quoteMsg}</p>}
                <p className="text-[0.7rem] text-muted">
                  Calculamos por tu dirección, o si preferís elegí tu localidad en la lista de arriba.
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="delivery-date">Fecha de entrega *</Label>
              <Input
                id="delivery-date"
                type="date"
                min={minDeliveryDate()}
                value={deliveryDate ?? ""}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notas del evento (opcional)</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Horario, cantidad de invitados, restricciones…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-xl border border-line bg-surface p-6">
            <legend className="px-2 font-display text-xl text-cream">Método de pago</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = payment === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPayment(opt.value)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-base border p-4 text-left transition-all",
                      selected
                        ? "border-accent bg-accent/10 shadow-glow"
                        : "border-line bg-bg-deep hover:border-line-strong"
                    )}
                  >
                    <Icon className={cn("size-5", selected ? "text-accent" : "text-muted")} />
                    <span className="text-sm font-medium text-cream">{opt.label}</span>
                    <span className="text-xs text-muted">{opt.hint}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted">
              El pago se coordina con los dueños por WhatsApp al confirmar el pedido.
            </p>
          </fieldset>

          {error && (
            <p className="rounded-base border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="button" size="lg" className="w-full" onClick={handleConfirm}>
            <MessageCircle className="size-4" /> Confirmar pedido por WhatsApp
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full">
            <Link href="/menu">Seguir comprando</Link>
          </Button>
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
