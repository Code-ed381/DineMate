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

const ReportsSettingsPanel: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Reports Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage how reports are generated, delivered, and displayed for your restaurant.
      </Typography>

      <Stack spacing={3}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Report Types
            </Typography>
            <Stack>
                <FormControlLabel control={<Switch defaultChecked />} label="Enable Sales Reports" />
                <FormControlLabel control={<Switch defaultChecked />} label="Enable Inventory Reports" />
                <FormControlLabel control={<Switch />} label="Enable Employee Performance Reports" />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Export Options
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Default Export Format
              </Typography>
              <Select fullWidth defaultValue="pdf" size="small" sx={{ mt: 1 }}>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default ReportsSettingsPanel;
