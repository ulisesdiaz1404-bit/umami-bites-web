"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteMenuItem } from "./actions";

export function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("¿Borrar este ítem del menú?")) {
          startTransition(() => deleteMenuItem(id));
        }
      }}
      className="rounded-full p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
      aria-label="Borrar ítem"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
