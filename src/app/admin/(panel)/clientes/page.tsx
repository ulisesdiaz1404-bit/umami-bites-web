import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderRecord } from "@/lib/types/order";
import { formatPrice } from "@/lib/utils";
import { isActive, waHref } from "@/lib/admin/orders";
import { Phone, Crown } from "lucide-react";

export const dynamic = "force-dynamic";

interface Customer {
  name: string;
  phone: string;
  orders: number;
  total: number;
  last: string;
}

export default async function ClientesPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8">
        <h1 className="font-display text-2xl text-cream">Clientes</h1>
        <p className="mt-3 text-sm text-muted">Conectá Supabase para ver los clientes.</p>
      </div>
    );
  }

  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as OrderRecord[];

  // Agrupar por teléfono (misma persona aunque cambie de nombre).
  const map = new Map<string, Customer>();
  for (const o of orders) {
    const key = o.customer_phone.replace(/\D/g, "") || o.customer_name;
    const existing = map.get(key);
    const counts = isActive(o);
    if (existing) {
      if (counts) {
        existing.orders += 1;
        existing.total += o.total_in_cents;
      }
    } else {
      map.set(key, {
        name: o.customer_name,
        phone: o.customer_phone,
        orders: counts ? 1 : 0,
        total: counts ? o.total_in_cents : 0,
        last: o.created_at,
      });
    }
  }
  const customers = [...map.values()].sort((a, b) => b.total - a.total);
  const totalRevenue = customers.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cream">Clientes</h1>
        <p className="mt-1 text-sm text-muted">
          {customers.length} clientes · {formatPrice(totalRevenue, "ARS")} facturados. Ordenados por
          cuánto gastaron — ideales para fidelizar.
        </p>
      </div>

      {customers.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-muted">
          Todavía no hay clientes. Aparecen solos cuando entra el primer pedido.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-bg-deep/60 text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 text-center font-medium">Pedidos</th>
                  <th className="px-5 py-3 text-right font-medium">Total gastado</th>
                  <th className="px-5 py-3 text-right font-medium">Último</th>
                  <th className="px-5 py-3 text-right font-medium">Contacto</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, idx) => (
                  <tr key={c.phone + idx} className="border-b border-line/60 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {idx < 3 && c.total > 0 && (
                          <Crown
                            className="size-4"
                            style={{ color: ["#c9871f", "#9ca3af", "#b0764a"][idx] }}
                          />
                        )}
                        <div>
                          <p className="font-medium text-cream">{c.name}</p>
                          <p className="text-xs text-muted">{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center tabular-nums text-primary/90">{c.orders}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-accent">
                      {formatPrice(c.total, "ARS")}
                    </td>
                    <td className="px-5 py-3 text-right text-xs tabular-nums text-muted">
                      {new Date(c.last).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <a
                        href={waHref(c.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#2f8f4e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#277a43]"
                      >
                        <Phone className="size-3.5" /> WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
