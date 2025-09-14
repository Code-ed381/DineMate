// src/theme/index.js
import { createTheme } from "@mui/material/styles";
import typography from "./typography";
import shape from "./shape";
import shadows from "./shadow";
import components from "./components";
import { lightPalette, darkPalette } from "./palette";

export const getTheme = (mode) =>
createTheme({
  palette: {
    mode, // 👈 tell MUI whether it's light or dark
    ...(mode === "light" ? lightPalette : darkPalette),
  },
  typography,
  shape,
  shadows,
  components,
});
