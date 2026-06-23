"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Supabase no está configurado todavía. Ver SETUP-SUPABASE.md.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <div className="rounded-xl border border-line bg-surface p-8">
        <div className="grid size-12 place-items-center rounded-full bg-accent/10">
          <Lock className="size-5 text-accent" />
        </div>
        <h1 className="mt-5 font-display text-2xl text-cream">Panel de Umami Bites</h1>
        <p className="mt-2 text-sm text-muted">Acceso solo para los dueños del local.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-base border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
