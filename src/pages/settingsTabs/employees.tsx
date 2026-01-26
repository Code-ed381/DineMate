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

const EmployeeSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const current = (settings as any).employee_permissions || {};
    const updated = { ...current, [key]: e.target.checked };
    updateSetting("employee_permissions", updated);
  };

  const handleSelectChange = (e: SelectChangeEvent<any>, category: string, key: string) => {
    const current = (settings as any)[category] || {};
    const updated = { ...current, [key]: e.target.value };
    updateSetting(category, updated);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Employee Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage default permissions and rules for your employees.
      </Typography>

      <Stack spacing={3}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Permissions
            </Typography>
            <Stack>
                <FormControlLabel
                  control={<Switch checked={!!(settings as any).employee_permissions?.employees_update_profile} onChange={(e) => handleToggle(e, "employees_update_profile")} />}
                  label="Allow employees to update their own profiles"
                />
                <FormControlLabel
                  control={<Switch checked={!!(settings as any).employee_permissions?.admins_view_report} onChange={(e) => handleToggle(e, "admins_view_report")} />}
                  label="Allow admins to view reports"
                />
                <FormControlLabel
                  control={<Switch checked={!!(settings as any).employee_permissions?.admin_invite_employee} onChange={(e) => handleToggle(e, "admin_invite_employee")} />}
                  label="Allow admins to invite new employees"
                />
                <FormControlLabel
                  control={<Switch checked={!!(settings as any).employee_permissions?.admin_delete_edit_employee} onChange={(e) => handleToggle(e, "admin_delete_edit_employee")} />}
                  label="Allow admins to delete/edit employees"
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
                Default Role for New Employees
              </Typography>
              <Select
                fullWidth
                value={(settings as any)?.employee_defaults?.default_role || "waiter"}
                size="small"
                sx={{ mt: 1 }}
                onChange={(e) => handleSelectChange(e, "employee_defaults", "default_role")}
              >
                <MenuItem value="waiter">Waiter</MenuItem>
                <MenuItem value="chef">Chef</MenuItem>
                <MenuItem value="cashier">Cashier</MenuItem>
                <MenuItem value="bartender">Bartender</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
              </Select>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Max Shift Days Per Week
              </Typography>
              <Select
                fullWidth
                value={(settings as any)?.employee_defaults?.max_shift_days || 5}
                size="small"
                sx={{ mt: 1 }}
                onChange={(e) => handleSelectChange(e, "employee_defaults", "max_shift_days")}
              >
                <MenuItem value={5}>5 Days</MenuItem>
                <MenuItem value={6}>6 Days</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default EmployeeSettingsPanel;
