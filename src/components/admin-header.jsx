import { Box, Typography, ToggleButtonGroup, ToggleButton, Divider } from "@mui/material";
import { useSettingsStore } from "../lib/settingsStore";
import { useSubscription } from "../providers/subscriptionProvider";
import UpgradeModal from "../components/UpgradeModal";
import { useState, useEffect } from "react";


export default function AdminHeader({ title, description }) { 
    const { viewMode, setViewMode } = useSettingsStore();
    const { subscriptionPlan } = useSubscription();
    const [openUpgradeModal, setOpenUpgradeModal] = useState(false);

    const handleToggleViewMode = (e) => {

        if (subscriptionPlan === "free") {
            setOpenUpgradeModal(true);
            return;
        }

        setViewMode(e.target.value);
    };  
    
    return (
        <>
            <Box
                sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                }}
            >
                {/* Left side (text) */}
                <Box>
                <Typography
                    variant="h4"
                    component="h1"
                    fontWeight="bold"
                    gutterBottom
                >
                    {title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {description}
                </Typography>
                </Box>

                {/* Right side (toggle) */}
                <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleToggleViewMode}
                size="small"
                >
                <ToggleButton value="list">List View</ToggleButton>
                <ToggleButton value="grid">Grid View</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Divider sx={{ mt: 2, mb: 2 }} />
            <UpgradeModal open={openUpgradeModal} onClose={() => setOpenUpgradeModal(false)} />
        </>
    );
}
