import { Reveal } from "@/components/ui/reveal";
import { Gallery } from "@/components/home/gallery";
import { CONTACT } from "@/lib/contact";
import { getGalleryPhotos } from "@/lib/data/gallery";

export async function GallerySection() {
  const photos = await getGalleryPhotos();

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Galería</span>
            <h2 className="mt-3 max-w-xl font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
              Así se ven <span className="accent-serif">nuestras mesas</span>
            </h2>
          </div>
          <a
            href={CONTACT.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Más fotos en {CONTACT.instagram}
          </a>
        </div>
      </Reveal>

      <div className="mt-12">
        <Gallery photos={photos} />
      </div>
    </section>
  );
}
