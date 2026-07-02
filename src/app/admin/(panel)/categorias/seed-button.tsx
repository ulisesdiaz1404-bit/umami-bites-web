"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedCategories } from "./actions";

export function SeedButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const res = await seedCategories();
            if (!res.ok) setError(res.error ?? "Error");
            else router.refresh();
          });
        }}
        disabled={pending}
      >
        <Download className="size-4" /> {pending ? "Cargando…" : "Cargar categorías actuales"}
      </Button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
