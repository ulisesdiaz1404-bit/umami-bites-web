"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/admin/orders";

export type { OrderStatus };

export interface OrderActionResult {
  ok: boolean;
  error?: string;
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
