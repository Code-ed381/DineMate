import { ThemeProvider, CssBaseline, PaletteMode } from "@mui/material";
import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from "react";
import { getTheme } from "./index";
import { useSettingsStore } from "../lib/settingsStore";
import { useSubscriptionStore } from "../lib/subscriptionStore";

interface ColorModeContextType {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettingsStore();
  const { subscriptionPlan } = useSubscriptionStore();

  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [mode, setMode] = useState<PaletteMode>(prefersDarkMode ? "dark" : "light");

  useEffect(() => {
    if (subscriptionPlan === "free") {
      setMode("light");
      return;
    }
    
    const dbMode = settings?.general?.default_theme_mode;

    if (dbMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystemMode = () => setMode(mediaQuery.matches ? "dark" : "light");
      applySystemMode();
      mediaQuery.addEventListener("change", applySystemMode);
      return () => mediaQuery.removeEventListener("change", applySystemMode);
    }

    if (dbMode === "light" || dbMode === "dark") {
      setMode(dbMode as PaletteMode);
    }
  }, [settings, subscriptionPlan]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) throw new Error("useColorMode must be used within AppThemeProvider");
  return context;
};
