import React, { useState } from "react";
import { Box, Typography, ToggleButtonGroup, ToggleButton, Divider } from "@mui/material";
import { useSettingsStore } from "../lib/settingsStore";
import { useSubscription } from "../providers/subscriptionProvider";
import UpgradeModal from "./UpgradeModal";

interface AdminHeaderProps {
  title: string;
  description: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, description }) => {
    const { viewMode, setViewMode } = useSettingsStore();
    const { subscriptionPlan } = useSubscription();
    const [openUpgradeModal, setOpenUpgradeModal] = useState(false);

    const handleToggleViewMode = (e: any, newValue: 'list' | 'grid') => {
        if (!newValue) return;
        if (subscriptionPlan === "free") {
            setOpenUpgradeModal(true);
            return;
        }
        setViewMode(newValue);
    };  
    
    return (
        <Box mb={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>{title}</Typography>
                    <Typography variant="body1" color="text.secondary">{description}</Typography>
                </Box>
                <ToggleButtonGroup value={viewMode} exclusive onChange={handleToggleViewMode} size="small">
                    <ToggleButton value="list">List View</ToggleButton>
                    <ToggleButton value="grid">Grid View</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Divider sx={{ mt: 2 }} />
            <UpgradeModal open={openUpgradeModal} onClose={() => setOpenUpgradeModal(false)} onUpgrade={() => {}} />
        </Box>
    );
};

export default AdminHeader;
