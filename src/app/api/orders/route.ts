import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin-client";

export const runtime = "nodejs";

/**
 * Persiste un pedido confirmado. Usa service role (server-only) para escribir
 * en `orders` sin abrir la tabla al público. Si Supabase no está configurado,
 * responde ok sin guardar para no romper el checkout por WhatsApp.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    // Sin DB: el pedido igual viaja por WhatsApp.
    return NextResponse.json({ ok: true, persisted: false });
  }

  const {
    customer,
    payment,
    items,
    deliveryDate,
    subtotalInCents,
    shippingInCents,
    totalInCents,
  } = (body ?? {}) as Record<string, any>;

  if (
    !customer?.name ||
    !customer?.phone ||
    !customer?.address ||
    !payment ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return NextResponse.json({ ok: false, error: "Faltan datos del pedido" }, { status: 400 });
  }

  const { error } = await supabase.from("orders").insert({
    customer_name: String(customer.name).slice(0, 200),
    customer_phone: String(customer.phone).slice(0, 60),
    address: String(customer.address).slice(0, 400),
    notes: customer.notes ? String(customer.notes).slice(0, 1000) : null,
    delivery_date: deliveryDate || null,
    payment_method: payment,
    items,
    subtotal_in_cents: Number(subtotalInCents) || 0,
    shipping_in_cents: Number(shippingInCents) || 0,
    total_in_cents: Number(totalInCents) || 0,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, persisted: true });
}
