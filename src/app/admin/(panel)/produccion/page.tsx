import { loadAdminData } from "@/lib/admin/data";
import { addDays, computeProduction, dayKey } from "@/lib/admin/analytics";
import { AdminDataError } from "@/components/admin/data-error";
import { ProductionBoard, type RangeKey } from "@/components/admin/production-board";

export const dynamic = "force-dynamic";

const RANGES: Record<RangeKey, { from: number; to: number }> = {
  hoy: { from: 0, to: 0 },
  manana: { from: 1, to: 1 },
  semana: { from: 0, to: 6 },
  quincena: { from: 0, to: 13 },
};

export default async function ProduccionPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string }>;
}) {
  const [data, { rango }] = await Promise.all([loadAdminData(), searchParams]);
  if (!data.ok) return <AdminDataError title="Producción" result={data} />;

  const range: RangeKey = rango && rango in RANGES ? (rango as RangeKey) : "semana";
  const today = dayKey(new Date());
  const { from, to } = RANGES[range];
  const days = computeProduction(data.orders, addDays(today, from), addDays(today, to));

  return <ProductionBoard days={days} range={range} today={today} />;
}
