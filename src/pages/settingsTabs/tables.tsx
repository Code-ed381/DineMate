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
  TextField,
} from "@mui/material";
import { useSettings } from "../../providers/settingsProvider";
import useRestaurantStore from "../../lib/restaurantStore";

const TableSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { role } = useRestaurantStore();
  const isOwner = role === "owner";

  const tableSettings = (settings as any).table_settings || {};

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const updated = { ...tableSettings, [key]: e.target.checked };
    updateSetting("table_settings", updated);
  };

  const handleSelectChange = (e: SelectChangeEvent<any>, key: string) => {
    const updated = { ...tableSettings, [key]: e.target.value };
    updateSetting("table_settings", updated);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const val = parseInt(e.target.value, 10);
    const updated = { ...tableSettings, [key]: isNaN(val) ? 0 : val };
    updateSetting("table_settings", updated);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Table Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage defaults, permissions, and behavior for the table management system.
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Display & Layout */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Display & Layout
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Control what UI elements are visible on the table management screens.
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Default View Mode (Waiters)
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={tableSettings.default_view_mode || "grid"}
                  size="small"
                  sx={{ mt: 1 }}
                  onChange={(e) => handleSelectChange(e, "default_view_mode")}
                >
                  <MenuItem value="grid">Grid View</MenuItem>
                  <MenuItem value="floor">Floor Plan</MenuItem>
                </Select>
              </Box>

              <FormControlLabel
                control={
                  <Switch 
                    disabled={!isOwner} 
                    checked={tableSettings.show_table_stats ?? true} 
                    onChange={(e) => handleToggle(e, "show_table_stats")} 
                  />
                }
                label="Show KPI Stats Strip (Top of pages)"
              />
              <FormControlLabel
                control={
                  <Switch 
                    disabled={!isOwner} 
                    checked={tableSettings.show_floor_plan ?? true} 
                    onChange={(e) => handleToggle(e, "show_floor_plan")} 
                  />
                }
                label="Enable Floor Plan View Option"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 2: Table Behavior */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Table Behavior
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Default Table Capacity
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={tableSettings.default_capacity || 4}
                  size="small"
                  sx={{ mt: 1 }}
                  onChange={(e) => handleSelectChange(e, "default_capacity")}
                >
                  <MenuItem value={2}>2 Guests</MenuItem>
                  <MenuItem value={4}>4 Guests</MenuItem>
                  <MenuItem value={6}>6 Guests</MenuItem>
                  <MenuItem value={8}>8 Guests</MenuItem>
                  <MenuItem value={10}>10 Guests</MenuItem>
                  <MenuItem value={12}>12 Guests</MenuItem>
                </Select>
              </Box>

              <FormControlLabel
                control={
                  <Switch 
                    disabled={!isOwner} 
                    checked={tableSettings.enable_table_transfer ?? true} 
                    onChange={(e) => handleToggle(e, "enable_table_transfer")} 
                  />
                }
                label="Enable Table Transfers (Waiters can move sessions)"
              />
              <FormControlLabel
                control={
                  <Switch 
                    disabled={!isOwner} 
                    checked={tableSettings.enable_reservations ?? true} 
                    onChange={(e) => handleToggle(e, "enable_reservations")} 
                  />
                }
                label="Enable Reservations"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 3: Timers & Notifications */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Timers & Notifications
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch 
                    disabled={!isOwner} 
                    checked={tableSettings.show_session_timer ?? true} 
                    onChange={(e) => handleToggle(e, "show_session_timer")} 
                  />
                }
                label="Show Active Session Timers"
              />
              <FormControlLabel
                control={
                  <Switch 
                    disabled={!isOwner} 
                    checked={tableSettings.show_service_alerts ?? true} 
                    onChange={(e) => handleToggle(e, "show_service_alerts")} 
                  />
                }
                label="Show Service Request Alerts (Guest Call)"
              />

              <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                <TextField
                  disabled={!isOwner || tableSettings.show_session_timer === false}
                  label="Timer Warning (Minutes)"
                  type="number"
                  size="small"
                  fullWidth
                  value={tableSettings.timer_warning_minutes ?? 60}
                  onChange={(e: any) => handleNumberChange(e, "timer_warning_minutes")}
                  helperText="Timer turns yellow"
                />
                <TextField
                  disabled={!isOwner || tableSettings.show_session_timer === false}
                  label="Timer Danger (Minutes)"
                  type="number"
                  size="small"
                  fullWidth
                  value={tableSettings.timer_danger_minutes ?? 120}
                  onChange={(e: any) => handleNumberChange(e, "timer_danger_minutes")}
                  helperText="Timer turns red"
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Section 4: Permissions */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Permissions
            </Typography>
            <Stack sx={{ mt: 1 }}>
                <FormControlLabel
                  control={<Switch disabled={!isOwner} checked={!!tableSettings.allow_admin_assign} onChange={(e) => handleToggle(e, "allow_admin_assign")} />}
                  label="Allow Admin to Assign Tables"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      disabled={!isOwner} 
                      checked={tableSettings.allow_waiter_cancel ?? true} 
                      onChange={(e) => handleToggle(e, "allow_waiter_cancel")} 
                    />
                  }
                  label="Allow Waiters to Cancel Reservations"
                />
                <FormControlLabel
                  control={<Switch disabled={!isOwner} checked={!!tableSettings.require_deposit} onChange={(e) => handleToggle(e, "require_deposit")} />}
                  label="Require Deposit for Reservations"
                />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default TableSettingsPanel;
