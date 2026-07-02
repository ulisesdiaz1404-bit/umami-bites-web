"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import type { MenuItem } from "@/lib/types/menu-item";
import { saveMenuItem, type MenuFormState } from "./actions";

const initial: MenuFormState = { ok: false };

interface FormValues {
  name: string;
  slug: string;
  description: string;
  price: string;
  maxQuantity: string;
  category: string;
  type: "dish" | "package";
  servings: string;
  imageUrl: string;
  includes: string;
  available: boolean;
}

function fromItem(item?: MenuItem): FormValues {
  return {
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    description: item?.description ?? "",
    price: item ? String(item.priceInCents / 100) : "",
    maxQuantity: String(item?.maxQuantity ?? 10),
    category: item?.category ?? "",
    type: item?.type ?? "dish",
    servings: item?.servings ? String(item.servings) : "",
    imageUrl: item?.images?.[0]?.url ?? "",
    includes: item?.includes?.join("\n") ?? "",
    available: item?.available ?? true,
  };
}

const inputBase =
  "w-full rounded-base border border-line bg-bg-deep px-3 py-2 text-sm text-cream outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

export function MenuForm({
  item,
  categories,
}: {
  item?: MenuItem;
  categories: string[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveMenuItem, initial);
  const [v, setV] = useState<FormValues>(() => fromItem(item));

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* --------------------------- FORMULARIO --------------------------- */}
      <form action={formAction} className="space-y-6 rounded-2xl border border-line bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">
            {item ? "Editar ítem" : "Nuevo ítem"}
          </h2>
          {item && (
            <button
              type="button"
              onClick={() => router.push("/admin/menu")}
              className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20"
            >
              <Plus className="size-3.5" /> Nuevo
            </button>
          )}
        </div>

        {item && <input type="hidden" name="id" value={item.id} />}

        {/* Sección: básico */}
        <div className="space-y-4">
          <SectionTitle color="#2563eb">Lo esencial</SectionTitle>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              name="description"
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className={inputBase}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Foto (URL)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={v.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="/photos/p01.jpg"
            />
          </div>
        </div>

        {/* Sección: precio y stock */}
        <div className="space-y-4">
          <SectionTitle color="#2f8f4e">Precio y stock</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Precio (ARS)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={v.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxQuantity">Máx. por pedido</Label>
              <Input
                id="maxQuantity"
                name="maxQuantity"
                type="number"
                min="1"
                value={v.maxQuantity}
                onChange={(e) => set("maxQuantity", e.target.value)}
              />
            </div>
          </div>

          <label
            className="flex items-center justify-between gap-3 rounded-base border px-4 py-3"
            style={{
              background: v.available ? "#e6f1e8" : "#f8e7e3",
              borderColor: v.available ? "#cfe4d3" : "#efc7bd",
            }}
          >
            <span className="text-sm font-medium" style={{ color: v.available ? "#2f6b3f" : "#a83422" }}>
              {v.available ? "Disponible en la web" : "Oculto / no disponible"}
            </span>
            <input
              type="checkbox"
              name="available"
              checked={v.available}
              onChange={(e) => set("available", e.target.checked)}
              className="size-5 accent-[#2f8f4e]"
            />
          </label>
        </div>

        {/* Sección: clasificación */}
        <div className="space-y-4">
          <SectionTitle color="#7c3aed">Clasificación</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                name="category"
                value={v.category || categories[0]}
                onChange={(e) => set("category", e.target.value)}
                className={inputBase}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                name="type"
                value={v.type}
                onChange={(e) => set("type", e.target.value as FormValues["type"])}
                className={inputBase}
              >
                <option value="dish">Plato</option>
                <option value="package">Paquete</option>
              </select>
            </div>
          </div>

          {/* Campos solo para paquetes */}
          {v.type === "package" && (
            <div className="space-y-4 rounded-base border border-line bg-bg-deep/60 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="servings">Porciones / personas</Label>
                <Input
                  id="servings"
                  name="servings"
                  type="number"
                  min="0"
                  value={v.servings}
                  onChange={(e) => set("servings", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="includes">Incluye (una línea por ítem)</Label>
                <textarea
                  id="includes"
                  name="includes"
                  value={v.includes}
                  onChange={(e) => set("includes", e.target.value)}
                  rows={3}
                  className={inputBase}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug (URL) — opcional</Label>
            <Input
              id="slug"
              name="slug"
              value={v.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="se genera solo si lo dejás vacío"
            />
          </div>
        </div>

        {state.error && (
          <p className="rounded-base border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="rounded-base border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
            Guardado ✓
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Guardando…" : item ? "Guardar cambios" : "Crear ítem"}
        </Button>
      </form>

      {/* ----------------------------- PREVIEW ---------------------------- */}
      <div className="lg:sticky lg:top-6">
        <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          <Eye className="size-4 text-accent" /> Vista previa
        </p>
        <PreviewCard v={v} />
        <p className="mt-3 text-xs text-muted">
          Así se ve la tarjeta en la web mientras editás.
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ children, color }: { children: ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2 rounded-full" style={{ background: color }} />
      <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color }}>
        {children}
      </span>
    </div>
  );
}

/** Réplica de la card pública del menú, alimentada por el estado del form. */
function PreviewCard({ v }: { v: FormValues }) {
  const priceCents = Math.round((Number(v.price) || 0) * 100);
  return (
    <article
      className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card"
      style={{ opacity: v.available ? 1 : 0.85 }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-deep">
        {v.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.imageUrl}
            alt={v.name}
            className="size-full object-cover"
            style={{ filter: v.available ? "none" : "grayscale(1)" }}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted">
            Sin foto
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        {v.category && (
          <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-medium text-primary">
            {v.category}
          </span>
        )}
        {!v.available && (
          <span className="absolute right-3 top-3 rounded-full bg-[#c0563f] px-2.5 py-1 text-[11px] font-semibold text-white">
            No disponible
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-snug text-cream">
          {v.name || "Nombre del ítem"}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-primary/90">
          {v.description || "Descripción del ítem…"}
        </p>

        {v.type === "package" && v.servings && (
          <p className="mt-2 text-xs text-muted">Para {v.servings} personas</p>
        )}

        <div className="mt-4 flex items-end justify-between gap-3 pt-2">
          <span className="price text-xl">{formatPrice(priceCents, "ARS")}</span>
          <span
            className="rounded-full px-4 py-2 text-xs font-semibold"
            style={{
              background: v.available ? "#b07a3c" : "#e5ddd0",
              color: v.available ? "#fff" : "#8a7a63",
            }}
          >
            {v.available ? "Agregar" : "No disponible"}
          </span>
        </div>
      </div>
    </article>
  );
}
