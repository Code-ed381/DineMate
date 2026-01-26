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

const KitchenSettingsPanel: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Kitchen & Chef Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure how orders are displayed, managed, and communicated to your kitchen staff.
      </Typography>

      <Stack spacing={3}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Order Display
            </Typography>
            <Stack>
                <FormControlLabel control={<Switch defaultChecked />} label="Enable Kitchen Display System (KDS)" />
                <FormControlLabel control={<Switch />} label="Show order timers on screen" />
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Display Mode
              </Typography>
              <Select fullWidth defaultValue="grid" size="small" sx={{ mt: 1 }}>
                <MenuItem value="grid">Grid View</MenuItem>
                <MenuItem value="list">List View</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default KitchenSettingsPanel;
