"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS, type BusinessSettings } from "@/lib/data/settings";

const SettingsContext = createContext<BusinessSettings>(DEFAULT_SETTINGS);

export function SettingsProvider({
  value,
  children,
}: {
  value: BusinessSettings;
  children: ReactNode;
}) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** Config del negocio (envío, mínimo, contacto). Fallback: DEFAULT_SETTINGS. */
export function useSettings(): BusinessSettings {
  return useContext(SettingsContext);
}
