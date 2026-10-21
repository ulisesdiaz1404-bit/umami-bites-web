import { loadAdminData } from "@/lib/admin/data";
import { AdminDataError } from "@/components/admin/data-error";
import { PageHeader, Stagger, StatCard } from "@/components/admin/kit";
import type { OrderRecord } from "@/lib/types/order";
import { formatPrice } from "@/lib/utils";
import { isActive, waHref } from "@/lib/admin/orders";
import { Phone, Crown, Users, Repeat, Wallet, UserX, MessageCircleHeart } from "lucide-react";

export const dynamic = "force-dynamic";

interface Customer {
  name: string;
  phone: string;
  orders: number;
  total: number;
  last: string;
  first: string;
}

const INACTIVE_DAYS = 60;

function reactivationHref(c: Customer): string {
  const firstName = c.name.split(" ")[0] ?? c.name;
  const text = `¡Hola ${firstName}! ¿Cómo estás? Te escribimos de Umami Bites. Hace un tiempo que no te vemos por acá: si tenés algún evento en mente, te armamos una propuesta a medida.`;
  return `${waHref(c.phone)}?text=${encodeURIComponent(text)}`;
}

export default async function ClientesPage() {
  const result = await loadAdminData();
  if (!result.ok) return <AdminDataError title="Clientes" result={result} />;
  const orders: OrderRecord[] = result.orders; // ya vienen del más nuevo al más viejo

  // Agrupar por teléfono (misma persona aunque cambie de nombre).
  const map = new Map<string, Customer>();
  for (const o of orders) {
    const key = o.customer_phone.replace(/\D/g, "") || o.customer_name;
    const existing = map.get(key);
    const counts = isActive(o);
    if (existing) {
      existing.first = o.created_at; // vienen del más nuevo al más viejo
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
        first: o.created_at,
      });
    }
  }
  const customers = [...map.values()].sort((a, b) => b.total - a.total);
  const totalRevenue = customers.reduce((s, c) => s + c.total, 0);

  // Segmentos: lo que un dueño mira para vender más sin gastar en publicidad.
  const now = Date.now();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const buyers = customers.filter((c) => c.orders > 0);
  const repeat = buyers.filter((c) => c.orders >= 2);
  const newThisMonth = buyers.filter((c) => Date.parse(c.first) >= monthStart);
  const inactive = buyers
    .filter((c) => now - Date.parse(c.last) > INACTIVE_DAYS * 86_400_000)
    .sort((a, b) => b.total - a.total);
  const avgPerCustomer = buyers.length ? Math.round(totalRevenue / buyers.length) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={`${customers.length} clientes · ${formatPrice(totalRevenue, "ARS")} facturados. Ordenados por cuánto gastaron.`}
      />

      {buyers.length > 0 && (
        <Stagger className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard icon={<Users className="size-[18px]" />} label="Clientes que compraron" value={buyers.length} format="number" hint={`${newThisMonth.length} nuevos este mes`} />
          <StatCard icon={<Repeat className="size-[18px]" />} label="Recurrentes" value={repeat.length} format="number" hint={`${Math.round((repeat.length / buyers.length) * 100)} % compró 2 veces o más`} />
          <StatCard icon={<Wallet className="size-[18px]" />} label="Valor promedio por cliente" value={avgPerCustomer} format="money" hint="Total gastado en promedio" />
          <StatCard icon={<UserX className="size-[18px]" />} label="Para reactivar" value={inactive.length} format="number" hint={`Sin comprar hace +${INACTIVE_DAYS} días`} />
        </Stagger>
      )}

      {inactive.length > 0 && (
        <section className="rounded-2xl border border-accent/30 bg-accent/[0.06] p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-lg text-cream">
            <MessageCircleHeart className="size-5 text-accent" /> Clientes para reactivar
          </h2>
          <p className="mt-1 text-xs text-muted">
            Ya te compraron y hace más de {INACTIVE_DAYS} días que no vuelven. Un mensaje personal suele
            ser la venta más barata que existe. El botón abre WhatsApp con el mensaje ya escrito.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {inactive.slice(0, 8).map((c) => (
              <li key={c.phone} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-cream">{c.name}</p>
                  <p className="text-xs text-muted">
                    {c.orders} {c.orders === 1 ? "pedido" : "pedidos"} · {formatPrice(c.total, "ARS")} · último hace{" "}
                    {Math.round((now - Date.parse(c.last)) / 86_400_000)} días
                  </p>
                </div>
                <a
                  href={reactivationHref(c)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#2f8f4e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#277a43]"
                >
                  <Phone className="size-3.5" /> Escribir
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

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
