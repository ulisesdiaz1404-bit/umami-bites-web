import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/admin/sign-out-button";

export const metadata: Metadata = {
  title: "Panel · Umami Bites",
  robots: { index: false, follow: false },
};

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <nav className="flex items-center gap-2">
            <span className="mr-3 font-display text-lg text-cream">Umami Admin</span>
            <Link
              href="/admin"
              className="rounded-full px-3 py-1.5 text-sm text-primary/80 transition-colors hover:bg-surface-2 hover:text-cream"
            >
              Pedidos
            </Link>
            <Link
              href="/admin/menu"
              className="rounded-full px-3 py-1.5 text-sm text-primary/80 transition-colors hover:bg-surface-2 hover:text-cream"
            >
              Menú
            </Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
