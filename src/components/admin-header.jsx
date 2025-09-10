import { Box, Typography, ToggleButtonGroup, ToggleButton, Divider } from "@mui/material";
import useAppStore from "../lib/appstore";

export default function AdminHeader({ title, description }) { 
    const { viewMode, setViewMode } = useAppStore();
    
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
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
                >
                <ToggleButton value="card">Card View</ToggleButton>
                <ToggleButton value="table">Table View</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Divider sx={{ mt: 2, mb: 2 }} />
        </>
    );
}
