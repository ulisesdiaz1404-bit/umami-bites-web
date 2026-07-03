"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { formatPrice } from "@/lib/utils";

// =====================================================================
// Aviso EN VIVO de pedido nuevo dentro del panel (Supabase Realtime).
// Se suscribe a los INSERT de la tabla `orders`; cuando entra uno:
//   1. suena un beep corto (WebAudio, sin archivo de audio),
//   2. muestra un cartelito arriba a la derecha,
//   3. refresca la data del panel (router.refresh).
// Solo funciona con la pestaña del panel abierta; para avisos con el
// panel cerrado está el email (ver src/lib/notify/order-email.ts).
// Requiere haber corrido la migración 0003 (Realtime en orders).
// =====================================================================

interface Toast {
  id: string;
  name: string;
  total: number;
}

function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
    osc.onended = () => ctx.close();
  } catch {
    // navegador sin WebAudio o política de autoplay: ignorar
  }
}

export function NewOrderNotifier() {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Evita reproducir el beep en el primer render/reconexión inicial.
  const readyRef = useRef(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function start() {
      // La tabla `orders` tiene RLS (solo autenticados leen). Realtime aplica
      // esa RLS sobre el socket, así que hay que pasarle el token del dueño
      // logueado; sin esto el canal se suscribe pero nunca recibe filas.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);
      }
      if (cancelled) return;

      channel = supabase
        .channel("orders-nuevos")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          (payload) => {
            const row = payload.new as {
              id: string;
              customer_name?: string;
              total_in_cents?: number;
            };
            beep();
            setToasts((prev) => [
              {
                id: row.id,
                name: row.customer_name ?? "Cliente",
                total: row.total_in_cents ?? 0,
              },
              ...prev,
            ]);
            router.refresh();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") readyRef.current = true;
        });
    }

    void start();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [router]);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#2f8f4e]/40 bg-white p-4 shadow-lg"
          style={{ animation: "umami-toast-in .28s ease-out" }}
        >
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e6f1e8] text-[#2f8f4e]">
            <BellRing className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#2a2013]">¡Nuevo pedido!</p>
            <p className="truncate text-xs text-[#5c4a30]">
              {t.name} · {formatPrice(t.total, "ARS")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Cerrar aviso"
            className="text-[#a2906f] transition-colors hover:text-[#2a2013]"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <style>{`@keyframes umami-toast-in{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
