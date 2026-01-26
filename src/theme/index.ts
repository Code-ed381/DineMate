import { createTheme, Theme, PaletteMode } from "@mui/material/styles";
import typography from "./typography";
import shape from "./shape";
import shadows from "./shadow";
import components from "./components";
import { lightPalette, darkPalette } from "./palette";

export const getTheme = (mode: PaletteMode): Theme =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light" ? lightPalette : darkPalette),
    },
    typography,
    shape,
    shadows,
    components,
  });
