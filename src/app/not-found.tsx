import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <span className="eyebrow">Error 404</span>
      <h1 className="mt-5 font-display text-5xl text-cream">Página no encontrada</h1>
      <p className="mt-3 max-w-md text-muted">
        La página que buscás no existe o se movió. Volvé al inicio para seguir explorando el menú.
      </p>
      <Button asChild className="mt-7">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
