"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2, Upload, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GalleryPhoto, GalleryRow } from "@/lib/data/gallery";
import {
  addGalleryPhoto,
  deleteGalleryPhoto,
  moveGalleryPhoto,
  seedGallery,
  updateGalleryAlt,
} from "./actions";

/** Lee ancho/alto de la imagen en el navegador (la galería los necesita para el mosaico). */
async function imageSize(file: File): Promise<{ width: number; height: number }> {
  try {
    const bmp = await createImageBitmap(file);
    const size = { width: bmp.width, height: bmp.height };
    bmp.close();
    return size;
  } catch {
    return { width: 1200, height: 1200 };
  }
}

export function GalleryManager({
  rows,
  defaults,
}: {
  rows: GalleryRow[];
  /** Fotos por defecto que se ven en la web mientras la tabla está vacía. */
  defaults: GalleryPhoto[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Error");
      else router.refresh();
    });
  }

  // Sube de a una foto por request (cada una puede pesar varios MB).
  function upload(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setError(null);
    startTransition(async () => {
      for (const [i, file] of list.entries()) {
        setProgress(`Subiendo ${i + 1} de ${list.length}…`);
        const { width, height } = await imageSize(file);
        const fd = new FormData();
        fd.set("file", file);
        fd.set("width", String(width));
        fd.set("height", String(height));
        const res = await addGalleryPhoto(fd);
        if (!res.ok) {
          setError(res.error ?? "No se pudo subir la foto.");
          break;
        }
      }
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    });
  }

  const busy = pending || progress !== null;

  return (
    <div className="space-y-6">
      {/* Subir */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm font-semibold text-cream">Agregar fotos</p>
        <p className="mt-1 text-xs text-muted">
          Podés elegir varias a la vez. Se agregan al final; después las ordenás con las flechas.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
          <Button type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Upload className="size-4" /> Elegir fotos
          </Button>
          {progress && <span className="text-sm text-muted">{progress}</span>}
        </div>
      </div>

      {error && (
        <p className="rounded-base border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Fotos por defecto (tabla vacía) */}
      {defaults.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">
            Hoy la web muestra estas {defaults.length} fotos. Para borrarlas, describirlas o
            cambiarles el orden, primero pasalas al editor (al subir una foto nueva también se pasan
            solas).
          </p>
          <Button type="button" variant="outline" onClick={() => run(seedGallery)} disabled={busy}>
            <Pencil className="size-4" /> Editar estas fotos
          </Button>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {defaults.map((p) => (
              <div key={p.src} className="relative aspect-square overflow-hidden rounded-lg bg-surface-2">
                <Image src={p.src} alt={p.alt} fill sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista editable */}
      {rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <PhotoRow
              key={r.id}
              row={r}
              index={i}
              total={rows.length}
              disabled={busy}
              onMove={(dir) => run(() => moveGalleryPhoto(r.id, dir))}
              onAlt={(alt) => run(() => updateGalleryAlt(r.id, alt))}
              onDelete={() => {
                if (confirm("¿Borrar esta foto de la galería?")) run(() => deleteGalleryPhoto(r.id));
              }}
            />
          ))}
          <p className="pt-2 text-xs text-muted">
            Si borrás todas, la web vuelve a mostrar las fotos por defecto.
          </p>
        </div>
      )}
    </div>
  );
}

function PhotoRow({
  row,
  index,
  total,
  disabled,
  onMove,
  onAlt,
  onDelete,
}: {
  row: GalleryRow;
  index: number;
  total: number;
  disabled: boolean;
  onMove: (dir: 1 | -1) => void;
  onAlt: (alt: string) => void;
  onDelete: () => void;
}) {
  const [alt, setAlt] = useState(row.alt);
  const iconBtn =
    "rounded-full p-2 text-muted transition-colors hover:bg-surface-2 hover:text-cream disabled:opacity-30";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
      <span className="w-6 shrink-0 text-center text-xs tabular-nums text-muted">{index + 1}</span>
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
        <Image src={row.url} alt={row.alt} fill sizes="64px" className="object-cover" />
      </div>
      <Input
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={() => alt.trim() !== row.alt && onAlt(alt)}
        placeholder="Descripción (ej. Picada para 20 personas)"
        aria-label="Descripción de la foto"
        className="h-10 min-w-0 flex-1"
      />
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={disabled || index === 0}
          className={iconBtn}
          aria-label="Subir"
        >
          <ArrowUp className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={disabled || index === total - 1}
          className={iconBtn}
          aria-label="Bajar"
        >
          <ArrowDown className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="rounded-full p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
          aria-label="Borrar foto"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
