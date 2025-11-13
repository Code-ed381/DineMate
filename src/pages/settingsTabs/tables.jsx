import {
  Box,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { useSettings } from "../../providers/settingsProvider";

export default function TableSettingsPanel() {
  const { settings, updateSetting } = useSettings();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Table Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage defaults and permissions for table management.
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Permissions */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Permissions
            </Typography>
            <FormControlLabel
              control={<Switch />}

              label="Allow admin to assign table"
            />
            <FormControlLabel
              control={<Switch />}
              label="Require deposit for reservations"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-cancel unconfirmed reservations after 15 minutes"
            />
          </CardContent>
        </Card>

        {/* Section 2: Defaults */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Defaults
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Default Table Capacity
              </Typography>
              <Select fullWidth defaultValue={4} size="small" sx={{ mt: 1 }}>
                <MenuItem value={2}>2 Guests</MenuItem>
                <MenuItem value={4}>4 Guests</MenuItem>
                <MenuItem value={6}>6 Guests</MenuItem>
                <MenuItem value={8}>8 Guests</MenuItem>
              </Select>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Max Reservation Duration
              </Typography>
              <Select fullWidth defaultValue={2} size="small" sx={{ mt: 1 }}>
                <MenuItem value={1}>1 Hour</MenuItem>
                <MenuItem value={2}>2 Hours</MenuItem>
                <MenuItem value={3}>3 Hours</MenuItem>
                <MenuItem value={4}>4 Hours</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>

        {/* Section 3: Automation */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Automation
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-mark tables as dirty after checkout"
            />
            <FormControlLabel
              control={<Switch />}
              label="Notify staff when a table is free"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable smart table assignment (auto seat guests)"
            />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}