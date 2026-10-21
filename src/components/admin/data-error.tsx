import { DatabaseZap } from "lucide-react";
import type { AdminData } from "@/lib/admin/data";

/** Estado cuando no se pueden leer los datos (sin Supabase o con error). */
export function AdminDataError({
  title,
  result,
}: {
  title: string;
  result: Extract<AdminData, { ok: false }>;
}) {
  const notConfigured = result.reason === "not-configured";
  return (
    <div className="rounded-2xl border border-line bg-surface p-8">
      <span className="grid size-11 place-items-center rounded-2xl bg-accent/12 text-accent">
        <DatabaseZap className="size-5" />
      </span>
      <h1 className="mt-4 font-display text-2xl text-cream">{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        {notConfigured ? (
          <>
            Supabase no está configurado. Seguí los pasos de <code>SETUP-SUPABASE.md</code> para
            conectar la base de datos. Para ver el panel con datos de ejemplo en local, arrancá el
            servidor con <code>ADMIN_DEMO=1</code>.
          </>
        ) : (
          <>No se pudieron leer los datos: {result.message}</>
        )}
      </p>
    </div>
  );
}
