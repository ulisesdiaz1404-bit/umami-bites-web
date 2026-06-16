import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ItemNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <span className="eyebrow">Error 404</span>
      <h1 className="mt-5 font-display text-4xl text-cream">Ese plato no está en la carta</h1>
      <p className="mt-3 text-muted">
        Quizás se agotó o cambió de nombre. Volvé al menú para ver todo lo que ofrecemos.
      </p>
      <Button asChild className="mt-7">
        <Link href="/menu">Ver el menú</Link>
      </Button>
    </div>
  );
}
