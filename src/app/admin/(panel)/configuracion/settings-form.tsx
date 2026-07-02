"use client";

import { useActionState, type ReactNode } from "react";
import { MessageCircle, Phone, MapPin, Clock, Truck, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BusinessSettings } from "@/lib/data/settings";
import { saveSettings, type SettingsFormState } from "./actions";

const initial: SettingsFormState = { ok: false };

export function SettingsForm({ settings }: { settings: BusinessSettings }) {
  const [state, formAction, pending] = useActionState(saveSettings, initial);

  return (
    <form action={formAction} className="space-y-8">
      {/* Contacto */}
      <section className="space-y-4 rounded-2xl border border-line bg-surface p-6">
        <SectionTitle color="#2f8f4e">Contacto y WhatsApp</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            icon={MessageCircle}
            id="whatsapp"
            label="WhatsApp cotizaciones"
            defaultValue={settings.whatsapp}
            hint="Solo números con código de país. Ej: 5491159887136"
          />
          <Field
            icon={MessageCircle}
            id="ordersWhatsapp"
            label="WhatsApp pedidos"
            defaultValue={settings.ordersWhatsapp}
            hint="A donde llegan los pedidos confirmados"
          />
          <Field icon={Phone} id="phonePrimary" label="Teléfono 1" defaultValue={settings.phonePrimary} />
          <Field icon={Phone} id="phoneSecondary" label="Teléfono 2" defaultValue={settings.phoneSecondary} />
          <Field icon={MapPin} id="address" label="Dirección" defaultValue={settings.address} />
          <Field
            icon={Clock}
            id="hours"
            label="Horarios"
            defaultValue={settings.hours}
            hint="Ej: Lun a Sáb de 9 a 20 h"
          />
        </div>
      </section>

      {/* Checkout */}
      <section className="space-y-4 rounded-2xl border border-line bg-surface p-6">
        <SectionTitle color="#2563eb">Checkout (afecta los totales)</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            icon={Truck}
            id="shipping"
            label="Costo de envío (ARS)"
            type="number"
            defaultValue={String(settings.shippingInCents / 100)}
            hint="Se suma al total cuando hay ítems en el carrito"
          />
          <Field
            icon={ShoppingCart}
            id="minOrder"
            label="Pedido mínimo (ARS)"
            type="number"
            defaultValue={String(settings.minOrderInCents / 100)}
            hint="Subtotal mínimo para poder finalizar la compra"
          />
        </div>
      </section>

      {state.error && (
        <p className="rounded-base border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-base border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          Guardado ✓ — los cambios ya se ven en la web.
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Guardando…" : "Guardar configuración"}
      </Button>
    </form>
  );
}

function Field({
  icon: Icon,
  id,
  label,
  defaultValue,
  hint,
  type = "text",
}: {
  icon: typeof Phone;
  id: string;
  label: string;
  defaultValue: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-accent" /> {label}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        defaultValue={defaultValue}
      />
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children, color }: { children: ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2 rounded-full" style={{ background: color }} />
      <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color }}>
        {children}
      </span>
    </div>
  );
}
