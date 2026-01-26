import React, { ReactNode } from "react";
import {
  Snackbar,
  Box,
  Typography,
  Slide,
  IconButton,
} from "@mui/material";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import useTablesStore from "../lib/tablesStore";

export default function EnhancedSnackbar() {
  const { snackbar, setSnackbar } = useTablesStore();

  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getIcon = (severity: string): ReactNode => {
    const iconProps = { size: 20, strokeWidth: 2.5 };
    switch (severity) {
      case "success": return <CheckCircle2 {...iconProps} />;
      case "error": return <AlertCircle {...iconProps} />;
      case "warning": return <AlertTriangle {...iconProps} />;
      case "info": return <Info {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };

  const getColors = (severity: string) => {
    switch (severity) {
      case "success": return { bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)", shadow: "0 8px 24px rgba(16, 185, 129, 0.35)" };
      case "error": return { bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", shadow: "0 8px 24px rgba(239, 68, 68, 0.35)" };
      case "warning": return { bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", shadow: "0 8px 24px rgba(245, 158, 11, 0.35)" };
      case "info": return { bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", shadow: "0 8px 24px rgba(59, 130, 246, 0.35)" };
      default: return { bg: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", shadow: "0 8px 24px rgba(99, 102, 241, 0.35)" };
    }
  };

  const colors = getColors(snackbar.severity);

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={handleClose}
      TransitionComponent={Slide}
      key={snackbar.id}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{
        "& .MuiSnackbarContent-root": {
          padding: 0,
          minWidth: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
        },
      }}
    >
      <Box
        sx={{
          background: colors.bg,
          boxShadow: colors.shadow,
          borderRadius: "12px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          minWidth: "320px",
          maxWidth: "420px",
          overflow: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, padding: "16px 20px" }}>
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "40px", height: "40px", borderRadius: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.2)", color: "white", flexShrink: 0
          }}>
            {getIcon(snackbar.severity)}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>{snackbar.message}</Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)" }}>
            <X size={16} />
          </IconButton>
        </Box>
      </Box>
    </Snackbar>
  );
}
