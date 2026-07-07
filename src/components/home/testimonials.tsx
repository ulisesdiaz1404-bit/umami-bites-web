import { Star } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { TESTIMONIALS, aggregateRating } from "@/lib/data/testimonials";

/** Fila de estrellas llenas/vacías según el puntaje (1–5). */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating ? "size-4 fill-accent text-accent" : "size-4 text-line-strong"
          }
        />
      ))}
    </div>
  );
}

/**
 * Sección de testimonios reales de clientes. Se renderiza solo si hay reseñas
 * cargadas en lib/data/testimonials.ts. El JSON-LD (productSchema) marca estas
 * mismas reseñas, así el markup refleja contenido visible (política de Google).
 */
export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  const agg = aggregateRating();

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <Reveal>
        <span className="eyebrow">Testimonios</span>
        <h2 className="mt-5 max-w-2xl font-display text-3xl text-cream sm:text-4xl">
          Lo que dicen <span className="accent-serif">nuestros clientes</span>
        </h2>
        {agg && (
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-primary/85">
            <Stars rating={Math.round(Number(agg.ratingValue))} />
            <span className="font-semibold text-cream">{agg.ratingValue}</span>
            <span className="text-muted">· {agg.reviewCount} reseñas</span>
          </p>
        )}
      </Reveal>

      <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <RevealItem key={`${t.author}-${i}`}>
            <figure className="flex h-full flex-col gap-4 rounded-xl border border-line bg-surface p-6">
              <Stars rating={t.rating} />
              <blockquote className="flex-1 text-sm leading-relaxed text-primary/90">
                “{t.body}”
              </blockquote>
              <figcaption className="text-sm font-medium text-cream">— {t.author}</figcaption>
            </figure>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
