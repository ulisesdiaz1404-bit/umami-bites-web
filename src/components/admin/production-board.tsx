"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChefHat, Printer, Users } from "lucide-react";
import type { ProductionDay } from "@/lib/admin/analytics";
import { addDays } from "@/lib/admin/analytics";
import { cn, formatPrice, formatUnit } from "@/lib/utils";
import { EmptyState, PageHeader, Stagger, rise } from "@/components/admin/kit";

export type RangeKey = "hoy" | "manana" | "semana" | "quincena";

const RANGE_LABELS: Record<RangeKey, string> = {
  hoy: "Hoy",
  manana: "Mañana",
  semana: "Próximos 7 días",
  quincena: "Próximos 14 días",
};

const STORAGE_KEY = "umami-produccion-hecho";

function dayTitle(day: string, today: string) {
  const pretty = new Date(`${day}T12:00:00Z`).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  if (day === today) return { title: "Hoy", sub: pretty };
  if (day === addDays(today, 1)) return { title: "Mañana", sub: pretty };
  return { title: pretty, sub: "" };
}

export function ProductionBoard({ days, range, today }: { days: ProductionDay[]; range: RangeKey; today: string }) {
  // Lo tildado se guarda en este navegador (es una ayuda mientras se cocina).
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"));
    } catch {}
  }, []);
  const toggle = (key: string) =>
    setDone((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

  const totalOrders = days.reduce((s, d) => s + d.orders, 0);
  const totalRevenue = days.reduce((s, d) => s + d.revenue, 0);

  return (
    <>
      <PageHeader
        title="Producción"
        description="Cuánto preparar de cada producto, por día de entrega. Suma los pedidos activos; lo que todavía no está confirmado se marca aparte para que no compres de más."
        actions={
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-medium text-primary transition-colors hover:bg-surface-2 print:hidden"
          >
            <Printer className="size-4" /> Imprimir hoja
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2 print:hidden">
        {(Object.keys(RANGE_LABELS) as RangeKey[]).map((k) => (
          <Link
            key={k}
            href={`/admin/produccion?rango=${k}`}
            scroll={false}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              k === range ? "text-on-accent" : "text-muted hover:text-cream"
            )}
          >
            {k === range && (
              <motion.span layoutId="range-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
            )}
            <span className="relative">{RANGE_LABELS[k]}</span>
          </Link>
        ))}
        {totalOrders > 0 && (
          <span className="ml-auto text-sm text-muted">
            {totalOrders} {totalOrders === 1 ? "pedido" : "pedidos"} · {formatPrice(totalRevenue, "ARS")}
          </span>
        )}
      </div>

      {days.length === 0 ? (
        <EmptyState icon={ChefHat} title={`Nada para producir: ${RANGE_LABELS[range].toLowerCase()}`}>
          Acá aparecen los pedidos nuevos y confirmados que tienen fecha de entrega en el rango elegido.
        </EmptyState>
      ) : (
        <Stagger className="space-y-6">
          {days.map((day) => {
            const { title, sub } = dayTitle(day.day, today);
            const doneCount = day.lines.filter((l) => done[`${day.day}|${l.name}`]).length;
            const progress = day.lines.length ? doneCount / day.lines.length : 0;
            return (
              <motion.section
                key={day.day}
                variants={rise}
                className="break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
              >
                <header className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4 sm:px-6">
                  <div className={cn("grid size-12 place-items-center rounded-xl", day.day === today ? "bg-accent text-on-accent" : "bg-accent/12 text-accent")}>
                    <ChefHat className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-xl text-cream first-letter:uppercase">{title}</h2>
                    <p className="text-xs text-muted first-letter:uppercase">
                      {sub && `${sub} · `}
                      {day.orders} {day.orders === 1 ? "pedido" : "pedidos"} · {formatPrice(day.revenue, "ARS")}
                    </p>
                  </div>
                  <div className="w-full sm:w-48 print:hidden">
                    <div className="mb-1 flex justify-between text-xs text-muted">
                      <span>Preparado</span>
                      <span className="tabular-nums">
                        {doneCount}/{day.lines.length}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-deep">
                      <motion.div
                        className="h-full rounded-full bg-success"
                        initial={false}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 30 }}
                      />
                    </div>
                  </div>
                </header>

                <ul className="divide-y divide-line">
                  {day.lines.map((line) => {
                    const key = `${day.day}|${line.name}`;
                    const isDone = Boolean(done[key]);
                    const total = line.confirmed + line.pending;
                    return (
                      <li key={line.name} className="px-5 py-3.5 sm:px-6">
                        <div className="flex items-start gap-4">
                          <button
                            type="button"
                            onClick={() => toggle(key)}
                            aria-pressed={isDone}
                            aria-label={isDone ? `Desmarcar ${line.name}` : `Marcar ${line.name} como preparado`}
                            className={cn(
                              "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border transition-colors",
                              isDone ? "border-success bg-success text-white" : "border-line-strong hover:border-accent"
                            )}
                          >
                            <AnimatePresence>
                              {isDone && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 600, damping: 25 }}>
                                  <Check className="size-4" strokeWidth={3} />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>

                          <div className="min-w-0 flex-1">
                            <p className={cn("text-[0.95rem] font-medium transition-colors", isDone ? "text-muted line-through" : "text-cream")}>
                              <span className="mr-1.5 font-display text-xl tabular-nums text-accent">{total}</span>
                              <span className="text-sm text-muted">{formatUnit(total, line.unit)}</span> · {line.name}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                              {line.confirmed > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="size-1.5 rounded-full bg-[#c9871f]" /> {line.confirmed} confirmado{line.confirmed === 1 ? "" : "s"}
                                </span>
                              )}
                              {line.pending > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="size-1.5 rounded-full bg-[#3b6fe0]" /> {line.pending} sin confirmar
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1">
                                <Users className="size-3" />
                                {line.orders.map((o) => `${o.customer.split(" ")[0]} (${o.qty})`).join(", ")}
                              </span>
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </motion.section>
            );
          })}
        </Stagger>
      )}
    </>
  );
}
