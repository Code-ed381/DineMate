import { Shadows } from "@mui/material/styles";

const shadows: Shadows = [
  "none",
  "0px 2px 8px rgba(0,0,0,0.1)",
  "0px 4px 16px rgba(0,0,0,0.15)",
  ...Array(22).fill("none") as string[],
] as unknown as Shadows;

export default shadows;
