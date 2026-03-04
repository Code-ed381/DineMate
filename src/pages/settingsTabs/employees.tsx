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
  Divider,
  Chip,
} from "@mui/material";
import { useSettings } from "../../providers/settingsProvider";
import useRestaurantStore from "../../lib/restaurantStore";

const EmployeeSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { role } = useRestaurantStore();
  const isOwner = role === "owner";

  const perms = (settings as any)?.employee_permissions || {};
  const defaults = (settings as any)?.employee_defaults || {};

  const togglePerm = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("employee_permissions", { ...perms, [key]: e.target.checked });
  };

  const toggleDefault = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("employee_defaults", { ...defaults, [key]: e.target.checked });
  };

  const selectDefault = (e: SelectChangeEvent<any>, key: string) => {
    updateSetting("employee_defaults", { ...defaults, [key]: e.target.value });
  };

  const numberDefault = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("employee_defaults", { ...defaults, [key]: Number(e.target.value) });
  };

  const textDefault = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("employee_defaults", { ...defaults, [key]: e.target.value });
  };

  const numberPerm = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("employee_permissions", { ...perms, [key]: Number(e.target.value) });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Employee Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure role-based access controls, invitation behavior, display preferences, and scheduling defaults.
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Role-Based Access Permissions */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Role-Based Access Permissions
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              Controls what admins and staff are allowed to do. Only the owner can change these.
            </Typography>
            <Stack>
              <Typography variant="overline" color="text.disabled" sx={{ mt: 1 }}>Admin Controls</Typography>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={perms.admin_invite_employee ?? true} onChange={(e) => togglePerm(e, "admin_invite_employee")} />}
                label="Admins can invite new employees"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={perms.admin_delete_edit_employee ?? true} onChange={(e) => togglePerm(e, "admin_delete_edit_employee")} />}
                label="Admins can edit and delete employees"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={perms.admins_view_report ?? true} onChange={(e) => togglePerm(e, "admins_view_report")} />}
                label="Admins can view sales reports"
              />
              <Divider sx={{ my: 1 }} />
              <Typography variant="overline" color="text.disabled">Employee Self-Service</Typography>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={perms.employees_update_profile ?? true} onChange={(e) => togglePerm(e, "employees_update_profile")} />}
                label="Employees can update their own profile"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={perms.employees_change_password ?? true} onChange={(e) => togglePerm(e, "employees_change_password")} />}
                label="Employees can change their own password"
              />
              <Divider sx={{ my: 1 }} />
              <Typography variant="overline" color="text.disabled">Waiter Access</Typography>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={perms.waiter_view_order_history ?? true} onChange={(e) => togglePerm(e, "waiter_view_order_history")} />}
                label="Waiters can view their order history"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={perms.waiter_view_performance ?? true} onChange={(e) => togglePerm(e, "waiter_view_performance")} />}
                label="Waiters can view their performance dashboard"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 2: Invitation & Onboarding */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Invitation & Onboarding
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Default Role for New Employees
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={defaults.default_role || "waiter"}
                  size="small"
                  onChange={(e) => selectDefault(e, "default_role")}
                >
                  <MenuItem value="waiter">Waiter</MenuItem>
                  <MenuItem value="chef">Chef</MenuItem>
                  <MenuItem value="cashier">Cashier</MenuItem>
                  <MenuItem value="bartender">Bartender</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </Box>
              <Stack>
                <FormControlLabel
                  control={<Switch disabled={!isOwner} checked={defaults.require_avatar_on_invite ?? true} onChange={(e) => toggleDefault(e, "require_avatar_on_invite")} />}
                  label="Require avatar photo when inviting"
                />
                <FormControlLabel
                  control={<Switch disabled={!isOwner} checked={!!defaults.require_phone_on_invite} onChange={(e) => toggleDefault(e, "require_phone_on_invite")} />}
                  label="Require phone number when inviting"
                />
              </Stack>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Custom Invite Welcome Message
                </Typography>
                <TextField
                  disabled={!isOwner}
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  value={defaults.invite_welcome_message || ""}
                  placeholder="e.g. Welcome to our team! Please complete your onboarding."
                  onChange={(e: any) => textDefault(e, "invite_welcome_message")}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Section 3: Display & UI Controls */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Display & UI Controls
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              Control which UI elements appear on the Employee Management page.
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={defaults.show_employee_search ?? true} onChange={(e) => toggleDefault(e, "show_employee_search")} />}
                label="Show search bar"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={defaults.show_role_filter ?? true} onChange={(e) => toggleDefault(e, "show_role_filter")} />}
                label="Show role filter tabs"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={defaults.show_joined_date ?? true} onChange={(e) => toggleDefault(e, "show_joined_date")} />}
                label="Show 'Joined Date' column"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={defaults.show_phone_column ?? true} onChange={(e) => toggleDefault(e, "show_phone_column")} />}
                label="Show 'Phone' column"
              />
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Cards per page (mobile view)
              </Typography>
              <TextField
                disabled={!isOwner}
                fullWidth
                size="small"
                type="number"
                value={defaults.cards_per_page ?? 8}
                onChange={(e: any) => numberDefault(e, "cards_per_page")}
                InputProps={{ inputProps: { min: 4, max: 24 } }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Section 4: Shift & Scheduling */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Shift & Scheduling
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Max Shift Days Per Week
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={defaults.max_shift_days || 5}
                  size="small"
                  onChange={(e) => selectDefault(e, "max_shift_days")}
                >
                  <MenuItem value={5}>5 Days</MenuItem>
                  <MenuItem value={6}>6 Days</MenuItem>
                  <MenuItem value={7}>7 Days</MenuItem>
                </Select>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Default Shift Hours Per Day
                </Typography>
                <TextField
                  disabled={!isOwner}
                  fullWidth
                  size="small"
                  type="number"
                  value={defaults.default_shift_hours ?? 8}
                  onChange={(e: any) => numberDefault(e, "default_shift_hours")}
                  InputProps={{ inputProps: { min: 1, max: 16 } }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Section 5: Status & Lifecycle */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Status & Lifecycle
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={perms.allow_suspend_employee ?? true} onChange={(e) => togglePerm(e, "allow_suspend_employee")} />}
                label="Allow suspending employee accounts"
              />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Auto-suspend after inactivity (days) — set to 0 to disable
                </Typography>
                <TextField
                  disabled={!isOwner}
                  fullWidth
                  size="small"
                  type="number"
                  value={perms.auto_suspend_after_days ?? 0}
                  onChange={(e: any) => numberPerm(e, "auto_suspend_after_days")}
                  InputProps={{ inputProps: { min: 0, max: 365 } }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default EmployeeSettingsPanel;
