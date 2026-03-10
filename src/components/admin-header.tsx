import React from "react";
import { Box, Typography, Divider } from "@mui/material";

interface AdminHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, description, children }) => {
    return (
        <Box mb={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>{title}</Typography>
                    <Typography variant="body1" color="text.secondary">{description}</Typography>
                </Box>
                {children && <Box>{children}</Box>}
            </Box>
            <Divider sx={{ mt: 2 }} />
        </Box>
    );
};

export default AdminHeader;
