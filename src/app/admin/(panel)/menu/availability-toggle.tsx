"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAvailability } from "./actions";

/** Interruptor de disponibilidad con actualización optimista visual. */
export function AvailabilityToggle({
  id,
  available,
}: {
  id: string;
  available: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await setAvailability(id, !available);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={available}
      aria-label={available ? "Marcar no disponible" : "Marcar disponible"}
      onClick={toggle}
      disabled={pending}
      title={available ? "Disponible — click para ocultar" : "No disponible — click para activar"}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50"
      style={{ background: available ? "#2f8f4e" : "#c9c0b2" }}
    >
      <span
        className="inline-block size-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: available ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}
