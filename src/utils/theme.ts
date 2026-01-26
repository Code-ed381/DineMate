// theme.ts
import { createTheme, Theme } from "@mui/material/styles";

export const lightTheme: Theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    background: {
      default: "#f5f6fa",
      paper: "#ffffff",
    },
  },
});

export const darkTheme: Theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976d2" },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});
