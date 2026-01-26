import React from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  TextField,
} from "@mui/material";

const MenuSettingsPanel: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Menu Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure how your menu items are displayed, priced, and managed.
      </Typography>

      <Stack spacing={3}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Availability
            </Typography>
            <Stack>
                <FormControlLabel control={<Switch defaultChecked />} label="Allow online ordering" />
                <FormControlLabel control={<Switch />} label="Hide out-of-stock items automatically" />
                <FormControlLabel control={<Switch defaultChecked />} label="Enable scheduled availability (time-based menus)" />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Pricing & Discounts
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Default Tax Rate (%)
              </Typography>
              <TextField fullWidth size="small" defaultValue={7.5} type="number" sx={{ mt: 1 }} />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Global Discount Option
              </Typography>
              <Select fullWidth defaultValue="none" size="small" sx={{ mt: 1 }}>
                <MenuItem value="none">No Discounts</MenuItem>
                <MenuItem value="happyhour">Happy Hour (10% off)</MenuItem>
                <MenuItem value="lunch">Lunch Specials (15% off)</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default MenuSettingsPanel;
