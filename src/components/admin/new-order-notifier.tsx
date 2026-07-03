"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// =====================================================================
// Aviso de pedido nuevo dentro del panel, por SONDEO (polling).
// Cada POLL_MS consulta /api/admin/pulse (el pedido más reciente). Si
// aparece uno más nuevo que el último visto:
//   1. suena un beep corto (WebAudio, sin archivo de audio),
//   2. muestra un cartelito arriba a la derecha,
//   3. refresca la data del panel (router.refresh).
// Se eligió sondeo en vez de Realtime por ser 100% confiable con RLS +
// las API keys nuevas de Supabase (Realtime quedaba mudo). Para avisos
// con el panel cerrado está el email (src/lib/notify/order-email.ts).
// =====================================================================

const POLL_MS = 15_000;

interface Toast {
  id: string;
  name: string;
  total: number;
}

interface Latest {
  id: string;
  customer_name: string | null;
  total_in_cents: number | null;
  created_at: string;
}

// AudioContext compartido: los navegadores lo crean "suspendido" y solo suena
// tras un gesto del usuario (clic/tecla). Por eso se reusa uno solo y se
// "despierta" (resume) en la primera interacción y antes de cada beep.
let sharedCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    try {
      sharedCtx = new Ctx();
    } catch {
      return null;
    }
  }
  return sharedCtx;
}

/** Desbloquea el audio (llamar desde un gesto del usuario). */
function unlockAudio() {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

function beep() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const now = ctx.currentTime;
  // Doble campana (880 Hz → 1174 Hz), bien audible.
  [
    { freq: 880, at: 0 },
    { freq: 1174, at: 0.18 },
  ].forEach(({ freq, at }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + at;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  });
}

export function NewOrderNotifier() {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);
  // created_at del último pedido ya visto (baseline). Null hasta la 1ª lectura.
  const lastSeenRef = useRef<string | null>(null);

  // Desbloquea el sonido con la primera interacción del dueño en el panel.
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    let stopped = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/pulse", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { ok: boolean; latest: Latest | null };
        const latest = json.latest;
        if (!latest) return;

        // Primera lectura: fijar baseline sin avisar (no reproducir beep de
        // pedidos que ya estaban antes de abrir el panel).
        if (lastSeenRef.current === null) {
          lastSeenRef.current = latest.created_at;
          return;
        }

        // Llegó uno más nuevo que el baseline → avisar.
        if (latest.created_at > lastSeenRef.current) {
          lastSeenRef.current = latest.created_at;
          beep();
          setToasts((prev) => [
            {
              id: latest.id,
              name: latest.customer_name ?? "Cliente",
              total: latest.total_in_cents ?? 0,
            },
            ...prev,
          ]);
          router.refresh();
        }
      } catch {
        // sin red / error puntual: se reintenta en el próximo ciclo
      }
    }

    void poll(); // baseline inmediato
    const timer = setInterval(() => {
      if (!stopped) void poll();
    }, POLL_MS);

    return () => {
      stopped = true;
      clearInterval(timer);
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
