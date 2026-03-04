import React, { useEffect, useRef } from "react";
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
  InputAdornment,
} from "@mui/material";
import { useSettings } from "../../providers/settingsProvider";
import useRestaurantStore from "../../lib/restaurantStore";

const GeneralSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { role } = useRestaurantStore();
  const isOwner = role === "owner";
  const gs = (settings as any)?.general || {};

  const toggle = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("general", { ...gs, [key]: e.target.checked });
  };

  const select = (e: SelectChangeEvent<any>, key: string) => {
    updateSetting("general", { ...gs, [key]: e.target.value });
  };

  const text = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("general", { ...gs, [key]: e.target.value });
  };

  const number = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("general", { ...gs, [key]: Number(e.target.value) });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        General Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure global interface behavior, localization, session security, and receipt defaults.
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Interface */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Interface
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={!!gs.show_date_and_time_on_navbar} onChange={(e) => toggle(e, "show_date_and_time_on_navbar")} />}
                label="Show date and time on navbar"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={!!gs.allow_notifications} onChange={(e) => toggle(e, "allow_notifications")} />}
                label="Allow notifications"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={gs.allow_complaints !== false} onChange={(e) => toggle(e, "allow_complaints")} />}
                label="Allow staff to submit complaints"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={!!gs.show_breadcrumb} onChange={(e) => toggle(e, "show_breadcrumb")} />}
                label="Show breadcrumbs"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={!!gs.show_light_night_toggle} onChange={(e) => toggle(e, "show_light_night_toggle")} />}
                label="Show light / dark mode toggle on navbar"
              />
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={gs.show_online_status ?? true} onChange={(e) => toggle(e, "show_online_status")} />}
                label="Show online / offline status indicator"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={gs.enable_command_palette ?? true} onChange={(e) => toggle(e, "enable_command_palette")} />}
                label="Enable command palette (⌘K / Ctrl+K)"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={gs.enable_page_transitions ?? true} onChange={(e) => toggle(e, "enable_page_transitions")} />}
                label="Enable page transition animations"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={gs.enable_keyboard_shortcuts ?? true} onChange={(e) => toggle(e, "enable_keyboard_shortcuts")} />}
                label="Enable keyboard shortcuts (N = Notifications, T = Tables, M = Menu)"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 2: Localization */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Localization
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Currency Symbol
                </Typography>
                <TextField
                  disabled={!isOwner}
                  fullWidth
                  value={gs.currency_symbol || "₵"}
                  size="small"
                  onChange={(e: any) => text(e, "currency_symbol")}
                  placeholder="e.g. ₵, $, £"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Currency Code (ISO)
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={gs.currency_code || "GHS"}
                  size="small"
                  onChange={(e) => select(e, "currency_code")}
                >
                  <MenuItem value="GHS">GHS (₵)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="NGN">NGN (₦)</MenuItem>
                  <MenuItem value="KES">KES (KSh)</MenuItem>
                  <MenuItem value="ZAR">ZAR (R)</MenuItem>
                </Select>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Timezone
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={gs.timezone || "UTC"}
                  size="small"
                  onChange={(e) => select(e, "timezone")}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="Africa/Accra">Africa/Accra (GMT+0)</MenuItem>
                  <MenuItem value="Africa/Lagos">Africa/Lagos (GMT+1)</MenuItem>
                  <MenuItem value="Africa/Nairobi">Africa/Nairobi (GMT+3)</MenuItem>
                  <MenuItem value="Africa/Johannesburg">Africa/Johannesburg (GMT+2)</MenuItem>
                  <MenuItem value="Europe/London">Europe/London (GMT+0/+1)</MenuItem>
                  <MenuItem value="Europe/Paris">Europe/Paris (GMT+1/+2)</MenuItem>
                  <MenuItem value="America/New_York">America/New_York (GMT-5/-4)</MenuItem>
                  <MenuItem value="America/Los_Angeles">America/Los_Angeles (GMT-8/-7)</MenuItem>
                  <MenuItem value="Asia/Dubai">Asia/Dubai (GMT+4)</MenuItem>
                </Select>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Date Format
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={gs.date_format || "DD/MM/YYYY"}
                  size="small"
                  onChange={(e) => select(e, "date_format")}
                >
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (e.g. 04/03/2026)</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (e.g. 03/04/2026)</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-03-04)</MenuItem>
                  <MenuItem value="ddd, DD MMM YYYY">Short (e.g. Wed, 04 Mar 2026)</MenuItem>
                </Select>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Section 3: Defaults */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Defaults
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Default View
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={gs.default_view || "grid"}
                  size="small"
                  onChange={(e) => select(e, "default_view")}
                >
                  <MenuItem value="grid">Grid View</MenuItem>
                  <MenuItem value="list">List View</MenuItem>
                </Select>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Default Theme Mode
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={gs.default_theme_mode || "light"}
                  size="small"
                  onChange={(e) => select(e, "default_theme_mode")}
                >
                  <MenuItem value="light">Light Mode</MenuItem>
                  <MenuItem value="dark">Dark Mode</MenuItem>
                  <MenuItem value="system">Follow System</MenuItem>
                </Select>
              </Box>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={!!gs.sidebar_default_open} onChange={(e) => toggle(e, "sidebar_default_open")} />}
                label="Sidebar expanded by default (desktop)"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 4: Session & Security */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Session & Security
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Session Idle Timeout (minutes) — set to 0 to disable
                </Typography>
                <TextField
                  disabled={!isOwner}
                  fullWidth
                  value={gs.session_idle_timeout ?? 0}
                  size="small"
                  type="number"
                  onChange={(e: any) => number(e, "session_idle_timeout")}
                  InputProps={{ inputProps: { min: 0, max: 480 } }}
                />
              </Box>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={!!gs.require_logout_confirmation} onChange={(e) => toggle(e, "require_logout_confirmation")} />}
                label="Require confirmation before logging out"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 5: Receipts */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Receipts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This message appears at the bottom of all printed receipts as the default fallback. Individual sections (Cashier, Bar) can override this.
            </Typography>
            <TextField
              disabled={!isOwner}
              fullWidth
              multiline
              rows={2}
              value={gs.receipt_footer_message || ""}
              placeholder="e.g. THANK YOU FOR DINING WITH US!"
              size="small"
              onChange={(e: any) => text(e, "receipt_footer_message")}
            />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default GeneralSettingsPanel;
