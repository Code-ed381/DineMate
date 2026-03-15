import React from "react";
import { Box, Typography } from "@mui/material";

interface DashboardHeaderProps {
  title: string;
  description: string;
  background?: string;
  color?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, description, background, color, action, compact }) => {
    return (
        <Box sx={{ 
            p: compact ? { xs: 1.5, md: 2 } : { xs: 3, md: 4 }, 
            borderRadius: compact ? 2 : 4, 
            mb: compact ? 2 : 4, 
            background, 
            color,
            boxShadow: compact ? '0 4px 16px rgba(0,0,0,0.08)' : '0 8px 32px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: compact ? 1 : 2
        }}>
            <Box>
                <Typography variant={compact ? "h5" : "h4"} fontWeight="900" sx={{ letterSpacing: '-0.02em', fontSize: compact ? { xs: '1.25rem', md: '1.5rem' } : undefined }}>{title}</Typography>
                {!compact && <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>{description}</Typography>}
                {compact && <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500, display: { xs: 'none', md: 'block' } }}>{description}</Typography>}
            </Box>
            {action && <Box sx={{ mt: compact ? { xs: 1, md: 0 } : 0 }}>{action}</Box>}
        </Box>
    );
};

export default DashboardHeader;
