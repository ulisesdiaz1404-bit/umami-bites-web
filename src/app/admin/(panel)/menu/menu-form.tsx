"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MenuItem } from "@/lib/types/menu-item";
import { saveMenuItem, type MenuFormState } from "./actions";

const initial: MenuFormState = { ok: false };

export function MenuForm({
  item,
  categories,
}: {
  item?: MenuItem;
  categories: string[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(saveMenuItem, initial);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-line bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-cream">
          {item ? "Editar ítem" : "Nuevo ítem"}
        </h2>
        {item && (
          <button
            type="button"
            onClick={() => router.push("/admin/menu")}
            className="text-xs text-muted hover:text-cream"
          >
            + Nuevo
          </button>
        )}
      </div>

      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" defaultValue={item?.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" name="slug" defaultValue={item?.slug} placeholder="auto si vacío" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={item?.description}
          rows={3}
          className="w-full rounded-base border border-line bg-bg-deep px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="price">Precio (ARS, en pesos)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={item ? item.priceInCents / 100 : ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxQuantity">Máx. por pedido</Label>
          <Input
            id="maxQuantity"
            name="maxQuantity"
            type="number"
            min="1"
            defaultValue={item?.maxQuantity ?? 10}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            name="category"
            defaultValue={item?.category ?? categories[0]}
            className="w-full rounded-base border border-line bg-bg-deep px-3 py-2 text-sm text-primary outline-none focus:border-accent"
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
            defaultValue={item?.type ?? "dish"}
            className="w-full rounded-base border border-line bg-bg-deep px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          >
            <option value="dish">Plato</option>
            <option value="package">Paquete</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="servings">Porciones (paquetes)</Label>
          <Input
            id="servings"
            name="servings"
            type="number"
            min="0"
            defaultValue={item?.servings ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="imageUrl">URL de imagen</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            defaultValue={item?.images?.[0]?.url ?? ""}
            placeholder="/photos/p01.jpg"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="includes">Incluye (una línea por ítem)</Label>
        <textarea
          id="includes"
          name="includes"
          defaultValue={item?.includes?.join("\n") ?? ""}
          rows={3}
          className="w-full rounded-base border border-line bg-bg-deep px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-primary">
        <input
          type="checkbox"
          name="available"
          defaultChecked={item?.available ?? true}
          className="size-4 accent-[#b07a3c]"
        />
        Disponible
      </label>

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
  );
}
