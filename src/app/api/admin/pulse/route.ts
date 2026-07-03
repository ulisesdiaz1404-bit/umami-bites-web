import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================================
// "Pulso" del panel: devuelve el pedido más reciente (id + datos mínimos).
// Lo consulta el notificador cada pocos segundos para detectar pedidos
// nuevos sin depender de Realtime. Protegido: solo admin logueado.
// Respeta RLS porque usa el cliente ligado a la sesión (no service role).
// =====================================================================

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ ok: false }, { status: 200 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, total_in_cents, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, latest: data?.[0] ?? null });
}
