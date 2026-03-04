import React from "react";
import { Box, Typography, Button } from "@mui/material";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  emoji?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  height?: string | number;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Data Found",
  description = "There are no records available at the moment.",
  icon, // No default icon here, handled by defaultIcon variable
  emoji = "🌫️", // Default emoji
  action,
  height = "100%",
}) => {
  const defaultIcon = icon || <Typography variant="h2" sx={{ mb: 2 }}>{emoji}</Typography>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: height,
        textAlign: "center",
        p: 4,
        width: "100%",
      }}
    >
      {defaultIcon}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
        {description}
      </Typography>
      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
