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
  SelectChangeEvent,
} from "@mui/material";
import { useSettings } from "../../providers/settingsProvider";

const TableSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const current = (settings as any).table_settings || {};
    const updated = { ...current, [key]: e.target.checked };
    updateSetting("table_settings", updated);
  };

  const handleSelectChange = (e: SelectChangeEvent<any>, key: string) => {
    const current = (settings as any).table_settings || {};
    const updated = { ...current, [key]: e.target.value };
    updateSetting("table_settings", updated);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Table Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage defaults and permissions for table management.
      </Typography>

      <Stack spacing={3}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Permissions
            </Typography>
            <Stack>
                <FormControlLabel
                  control={<Switch checked={!!(settings as any).table_settings?.allow_admin_assign} onChange={(e) => handleToggle(e, "allow_admin_assign")} />}
                  label="Allow admin to assign table"
                />
                <FormControlLabel
                  control={<Switch checked={!!(settings as any).table_settings?.require_deposit} onChange={(e) => handleToggle(e, "require_deposit")} />}
                  label="Require deposit for reservations"
                />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Defaults
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Default Table Capacity
              </Typography>
              <Select
                fullWidth
                value={(settings as any).table_settings?.default_capacity || 4}
                size="small"
                sx={{ mt: 1 }}
                onChange={(e) => handleSelectChange(e, "default_capacity")}
              >
                <MenuItem value={2}>2 Guests</MenuItem>
                <MenuItem value={4}>4 Guests</MenuItem>
                <MenuItem value={6}>6 Guests</MenuItem>
                <MenuItem value={8}>8 Guests</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default TableSettingsPanel;
