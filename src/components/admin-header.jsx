import { Box, Typography, ToggleButtonGroup, ToggleButton, Divider } from "@mui/material";
import {useSettingsStore} from "../lib/settingsStore";

export default function AdminHeader({ title, description }) { 
    const { viewMode, setViewMode } = useSettingsStore();
    
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
                onChange={(e) => setViewMode(e.target.value)}
                size="small"
                >
                <ToggleButton value="grid">Grid View</ToggleButton>
                <ToggleButton value="list">List View</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Divider sx={{ mt: 2, mb: 2 }} />
        </>
    );
}
