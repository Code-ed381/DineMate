// src/theme/AppThemeProvider.js
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { getTheme } from "./index";
import { useSettingsStore } from "../lib/settingsStore";

const ColorModeContext = createContext();

export function AppThemeProvider({ children }) {
  const { settings } = useSettingsStore();

  const prefersDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const [mode, setMode] = useState(prefersDarkMode ? "dark" : "light");

  // 🧩 When DB settings change, update mode accordingly
  useEffect(() => {
    const dbMode = settings?.general?.default_theme_mode;

    if (dbMode === "system") {
      // Detect system mode dynamically
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystemMode = () =>
        setMode(mediaQuery.matches ? "dark" : "light");

      applySystemMode(); // Initial check
      mediaQuery.addEventListener("change", applySystemMode);

      return () => mediaQuery.removeEventListener("change", applySystemMode);
    }

    // For "light" or "dark", set directly
    if (dbMode === "light" || dbMode === "dark") {
      setMode(dbMode);
    }
  }, [settings]);

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

export const useColorMode = () => useContext(ColorModeContext);
