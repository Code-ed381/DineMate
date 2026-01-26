import React from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Stack,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

const DashboardSettingsPanel: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Dashboard Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Personalize your dashboard by choosing which widgets and reports to display.
      </Typography>

      <Stack spacing={3}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Layout & Appearance
            </Typography>
            <Stack>
                <FormControlLabel control={<Switch defaultChecked />} label="Enable Dark Mode" />
                <FormControlLabel control={<Switch />} label="Compact Layout" />
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Default Landing Tab
              </Typography>
              <Select fullWidth defaultValue="overview" size="small" sx={{ mt: 1 }}>
                <MenuItem value="overview">Overview</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default DashboardSettingsPanel;
