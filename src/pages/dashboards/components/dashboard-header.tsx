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
        <Box sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: 4, 
            mb: 4, 
            background, 
            color,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
        }}>
            <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-0.02em' }}>{title}</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>{description}</Typography>
        </Box>
    );
};

export default DashboardHeader;
