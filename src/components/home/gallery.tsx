"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface GalleryPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** Mosaico de fotos + visor a pantalla completa (<dialog> nativo: Esc, foco y scroll-lock gratis). */
export function Gallery({ photos }: { photos: readonly GalleryPhoto[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState<number | null>(null);

  const open = (i: number) => {
    setCurrent(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (dir: 1 | -1) => setCurrent((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (current === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, step]);

  const photo = current === null ? null : photos[current];

  return (
    <>
      <div className="columns-2 gap-3 sm:gap-4 lg:columns-3">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => open(i)}
            aria-label={`Ampliar foto: ${p.alt}`}
            className="group mb-3 block w-full cursor-zoom-in overflow-hidden rounded-lg bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:mb-4"
          >
            <Image
              src={p.src}
              alt={p.alt}
              width={p.width}
              height={p.height}
              sizes="(max-width:1024px) 50vw, 400px"
              className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setCurrent(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        aria-label="Galería de fotos"
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/90"
      >
        {photo && (
          <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-14" onClick={close}>
            <Image
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="100vw"
              className="max-h-full w-auto rounded-md object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="absolute inset-x-0 bottom-3 text-center text-sm text-white/75">
              {(current ?? 0) + 1} / {photos.length}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); step(1); }}
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
