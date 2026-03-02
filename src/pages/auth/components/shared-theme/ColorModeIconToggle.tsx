import * as React from "react";
import DarkModeIcon from "@mui/icons-material/DarkModeRounded";
import LightModeIcon from "@mui/icons-material/LightModeRounded";
import Box from "@mui/material/Box";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import { useColorScheme } from "@mui/material/styles";

export default function ColorModeIconToggle(props: IconButtonProps) {
  const { mode, setMode } = useColorScheme();
  
  const toggleMode = () => {
    if (mode === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  };

  if (!mode) {
    return (
      <Box
        data-screenshot="toggle-mode"
        sx={(theme) => ({
          verticalAlign: "bottom",
          display: "inline-flex",
          width: "2.25rem",
          height: "2.25rem",
          borderRadius: (theme.vars || theme).shape.borderRadius,
          border: "1px solid",
          borderColor: (theme.vars || theme).palette.divider,
        })}
      />
    );
  }

  return (
    <IconButton
      data-screenshot="toggle-mode"
      onClick={toggleMode}
      disableRipple
      size="small"
      {...props}
    >
      {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
}
