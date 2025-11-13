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

export default function EmployeeSettingsPanel() {

  const { settings, updateSetting } = useSettings();

  const handleToggle = (e, key) => {
    const current = settings.employee_permissions || {};
    const updated = { ...current, [key]: e.target.checked };

    updateSetting("employee_permissions", updated);
  };

  const handleDefaultRoleChange = (e) => {
    const current = settings.employee_defaults || {};
    const updated = { ...current, default_role: e.target.value };

    updateSetting("employee_defaults", updated);
  };

  const handleMaxShiftHoursChange = (e) => {
    const current = settings.employee_defaults || {};
    const updated = { ...current, max_shift_hours: e.target.value };

    updateSetting("employee_defaults", updated);
  };

  const handleMaxShiftDaysChange = (e) => {
    const current = settings.employee_defaults || {};
    const updated = { ...current, max_shift_days: e.target.value };

    updateSetting("employee_defaults", updated);
  }; 

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Employee Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage default permissions and rules for your employees.
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Permissions */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Permissions
            </Typography>

            {/* ALLOW EMPLOYEE TO UPDATE THEIR OWN PROFILE */}
            <FormControlLabel
              control={<Switch />}
              checked={settings.employee_permissions.employees_update_profile}
              onChange={(e) => handleToggle(e, "employees_update_profile")}
              label="Allow employees to update their own profiles"
            />

            {/* ALLOW ADMIN TO VIEW REPORTS */}
            <FormControlLabel
              control={<Switch />}
              checked={settings.employee_permissions.admins_view_report}
              onChange={(e) => handleToggle(e, "admins_view_report")}
              label="Allow admins to view reports"
            />

            {/* ALLOW ADMIN TO INVITE NEW EMPLOYEES */}
            <FormControlLabel
              control={<Switch />}
              checked={settings.employee_permissions.admin_invite_employee}
              onChange={(e) => handleToggle(e, "admin_invite_employee")}
              label="Allow admins to invite new employees"
            />

            {/* ALLOW ADMIN TO DELETE/EDIT EMPLOYEES */}
            <FormControlLabel
              control={<Switch />}
              checked={settings.employee_permissions.admin_delete_edit_employee}
              onChange={(e) => handleToggle(e, "admin_delete_edit_employee")}
              label="Allow admins to delete/edit employees"
            />
          </CardContent>
        </Card>

        {/* Section 2: Defaults */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Defaults
            </Typography>

            {/* Default Role for New Employees */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Default Role for New Employees
              </Typography>
              <Select
                fullWidth
                value={settings?.employee_defaults?.default_role}
                size="small"
                sx={{ mt: 1 }}
                onChange={(e) => handleDefaultRoleChange(e)}
              >
                <MenuItem value="waiter">Waiter</MenuItem>
                <MenuItem value="chef">Chef</MenuItem>
                <MenuItem value="cashier">Cashier</MenuItem>
                <MenuItem value="bartender">Bartender</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
              </Select>
            </Box>

            {/* Max Shift Days Per Week */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Max Shift Days Per Week
              </Typography>
              <Select
                fullWidth
                value={settings?.employee_defaults?.max_shift_days}
                size="small"
                sx={{ mt: 1 }}
                onChange={(e) => handleMaxShiftDaysChange(e)}
              >
                <MenuItem value={6}>6 Days</MenuItem>
                <MenuItem value={8}>8 Days</MenuItem>
                <MenuItem value={10}>10 Days</MenuItem>
                <MenuItem value={12}>12 Days</MenuItem>
              </Select>
            </Box>

            {/* Max Shift Hours Per Day */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Max Shift Hours Per Day
              </Typography>
              <Select
                fullWidth
                value={settings?.employee_defaults?.max_shift_hours}
                size="small"
                sx={{ mt: 1 }}
                onChange={(e) => handleMaxShiftHoursChange(e)}
              >
                <MenuItem value={6}>6 Hours</MenuItem>
                <MenuItem value={8}>8 Hours</MenuItem>
                <MenuItem value={10}>10 Hours</MenuItem>
                <MenuItem value={12}>12 Hours</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>

      </Stack>
    </Box>
  );
}
