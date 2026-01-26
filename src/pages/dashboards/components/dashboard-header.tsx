import React from "react";
import { Box, Typography } from "@mui/material";

interface DashboardHeaderProps {
  title: string;
  description: string;
  background?: string;
  color?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, description, background, color }) => {
    return (
        <Box sx={{ p: 3, borderRadius: 3, mb: 4, background, color }}>
            <Typography variant="h5" fontWeight="bold">{title}</Typography>
            <Typography variant="body2">{description}</Typography>
        </Box>
    );
};

export default DashboardHeader;
