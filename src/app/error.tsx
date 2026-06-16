"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <span className="eyebrow">Ups</span>
      <h1 className="mt-5 font-display text-4xl text-cream">Algo salió mal</h1>
      <p className="mt-3 max-w-md text-muted">
        Tuvimos un problema al procesar tu solicitud. Probá de nuevo en un momento.
      </p>
      <Button onClick={reset} className="mt-7">
        Reintentar
      </Button>
    </div>
  );
}
