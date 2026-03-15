import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  useTheme,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface ExpandableMetricSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  color?: "primary" | "secondary" | "error" | "warning" | "success" | "info";
}

const ExpandableMetricSection: React.FC<ExpandableMetricSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
  color = "primary",
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        border: `1px solid ${alpha((theme.palette as any)[color].main, 0.2)}`,
        overflow: "hidden",
      }}
    >
      <Accordion
        defaultExpanded={defaultExpanded}
        disableGutters
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
          "&::before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: alpha((theme.palette as any)[color].main, 0.05),
            "&:hover": {
              backgroundColor: alpha((theme.palette as any)[color].main, 0.1),
            },
            minHeight: 56,
            "& .MuiAccordionSummary-content": {
              margin: "12px 0",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 2,
                backgroundColor: alpha((theme.palette as any)[color].main, 0.1),
                color: `${color}.main`,
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" fontWeight={600} color={`${color}.main`}>
              {title}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <CardContent sx={{ pt: 0 }}>
            <Grid container spacing={2}>
              {children}
            </Grid>
          </CardContent>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default ExpandableMetricSection;
