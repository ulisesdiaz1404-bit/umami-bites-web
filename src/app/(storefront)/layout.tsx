import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { WhatsappButton } from "@/components/layout/whatsapp-button";
import { SettingsProvider } from "@/components/settings-context";
import { getSettings } from "@/lib/data/settings.server";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();
  return (
    <SettingsProvider value={settings}>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
      <WhatsappButton />
    </SettingsProvider>
  );
}
