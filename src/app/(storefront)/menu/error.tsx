"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function MenuError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <h1 className="font-display text-3xl text-cream">No pudimos cargar el menú</h1>
      <p className="mt-3 text-muted">Ocurrió un error inesperado. Intentá de nuevo.</p>
      <Button onClick={reset} className="mt-6">
        Reintentar
      </Button>
    </div>
  );
}
