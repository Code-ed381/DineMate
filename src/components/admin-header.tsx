import React from "react";
import { Box, Typography, Divider } from "@mui/material";

interface AdminHeaderProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, description, children }) => {
    const hasContent = !!(title || description || children);
    
    if (!hasContent) return null;

    return (
        <Box mb={{ xs: (title || description) ? 2 : 0, md: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                {(title || description) && (
                    <Box>
                        {title && <Typography variant="h4" fontWeight="bold" gutterBottom>{title}</Typography>}
                        {description && <Typography variant="body1" color="text.secondary">{description}</Typography>}
                    </Box>
                )}
                {children && <Box>{children}</Box>}
            </Box>
            <Divider sx={{ mt: 2, display: { xs: 'none', md: 'block' } }} />
        </Box>
    );
};

export default AdminHeader;
