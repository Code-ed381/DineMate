// src/theme/AppThemeProvider.js
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createContext, useContext, useMemo, useState } from "react";
import { getTheme } from "./index";

const ColorModeContext = createContext();

export function AppThemeProvider({ children }) {
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
  const [mode, setMode] = useState(prefersDarkMode ? "dark" : "light");

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
