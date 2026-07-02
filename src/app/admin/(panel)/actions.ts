"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin-client";
import type { OrderStatus } from "@/lib/admin/orders";

export interface OrderActionResult {
  ok: boolean;
  error?: string;
}

/** Verifica que haya sesión de admin (antes de operaciones con service role). */
async function isAdmin(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  return Boolean(data.user);
}

/** Cambia el estado de un pedido (confirmar / entregar / cancelar / reactivar). */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderActionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase no está configurado." };

  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

/** Borra un pedido de forma permanente (sale de pedidos, stats, clientes, agenda). */
export async function deleteOrder(id: string): Promise<OrderActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "No autorizado." };
  const admin = createServiceRoleClient();
  if (!admin) return { ok: false, error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY." };

  const { error } = await admin.from("orders").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

/** Borra todos los pedidos entregados de una (útil para limpiar pruebas). */
export async function deleteDeliveredOrders(): Promise<OrderActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "No autorizado." };
  const admin = createServiceRoleClient();
  if (!admin) return { ok: false, error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY." };

  const { error } = await admin.from("orders").delete().eq("status", "entregado");
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}
