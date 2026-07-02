"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertCategory, deleteCategory } from "./actions";

export interface CatRow {
  name: string;
  group: string;
  sort: number;
}

const GROUP_COLORS: Record<string, string> = {
  "Picadas y complementos": "#b07a3c",
  Menús: "#7c3aed",
  Bebidas: "#2563eb",
};

export function CategoriesManager({
  initial,
  groups,
}: {
  initial: CatRow[];
  groups: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState(groups[0] ?? "Picadas y complementos");

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Error");
      else router.refresh();
    });
  }

  function add() {
    if (!newName.trim()) return;
    const sort = initial.length ? Math.max(...initial.map((c) => c.sort)) + 1 : 0;
    run(() => upsertCategory(newName, newGroup, sort));
    setNewName("");
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-danger">{error}</p>}

      {/* Agregar */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="mb-3 text-sm font-semibold text-cream">Agregar categoría</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Nombre (ej. Bebidas sin alcohol)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="flex-1"
          />
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            className="h-12 rounded-base border border-line bg-bg-deep px-3 text-sm text-cream outline-none focus:border-accent"
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <Button type="button" onClick={add} disabled={pending || !newName.trim()}>
            <Plus className="size-4" /> Agregar
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">
          El grupo define en cuál de las 3 pestañas grandes del menú aparece.
        </p>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {initial.map((c) => (
          <div
            key={c.name}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3"
          >
            <GripVertical className="size-4 shrink-0 text-muted" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-cream">
              {c.name}
            </span>
            <select
              value={c.group}
              onChange={(e) => run(() => upsertCategory(c.name, e.target.value, c.sort))}
              disabled={pending}
              className="h-9 rounded-full border px-3 text-xs font-medium outline-none"
              style={{
                borderColor: (GROUP_COLORS[c.group] ?? "#b07a3c") + "66",
                color: GROUP_COLORS[c.group] ?? "#b07a3c",
              }}
            >
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (confirm(`¿Borrar la categoría "${c.name}"?`)) run(() => deleteCategory(c.name));
              }}
              disabled={pending}
              className="rounded-full p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
              aria-label="Borrar categoría"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
