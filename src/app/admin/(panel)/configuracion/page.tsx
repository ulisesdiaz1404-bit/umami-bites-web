import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data/settings.server";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8">
        <h1 className="font-display text-2xl text-cream">Configuración</h1>
        <p className="mt-3 text-sm text-muted">Conectá Supabase para editar la configuración.</p>
      </div>
    );
  }

  // Probe para detectar si la tabla existe (migración 0002).
  const probe = await supabase.from("settings").select("id").limit(1);
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cream">Configuración del negocio</h1>
        <p className="mt-1 text-sm text-muted">
          Datos de contacto, WhatsApp, envío y pedido mínimo. Se reflejan en la web al guardar.
        </p>
      </div>

      {probe.error && (
        <div className="rounded-2xl border border-[#e8d3ac] bg-[#f7edda] p-6 text-sm text-[#8a5a1e]">
          <p className="font-semibold">Falta un paso de configuración (una sola vez).</p>
          <p className="mt-2">
            Para guardar cambios, corré la migración{" "}
            <code>supabase/migrations/0002_categories_settings.sql</code> en el SQL Editor de
            Supabase. Mientras tanto, la web usa los valores por defecto del código.
          </p>
          <p className="mt-2 text-xs opacity-80">Detalle técnico: {probe.error.message}</p>
        </div>
      )}

      <SettingsForm settings={settings} />
    </div>
  );
}
