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

export default function GeneralSettingsPanel() {
  const { settings, updateSetting } = useSettings();

  const handleToggle = (e, key) => {
    const current = settings?.general || {};
    const updated = { ...current, [key]: e.target.checked };

    updateSetting("general", updated);
  };

  const handleDefaultViewChange = (e) => {
    const current = settings?.general || {};
    const updated = { ...current, default_view: e.target.value };

    updateSetting("general", updated);
  };

  const handleDefaultThemeModeChange = (e) => {
    const current = settings?.general || {};
    const updated = { ...current, default_theme_mode: e.target.value };

    updateSetting("general", updated);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        General Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        General settings for your restaurant.
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Defaults */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Interface
            </Typography>
            <FormControlLabel
              control={<Switch />}
              checked={settings?.general?.show_date_and_time_on_navbar}
              onChange={(e) => handleToggle(e, "show_date_and_time_on_navbar")}
              label="Show date and time on navbar"
            />
            <FormControlLabel
              control={<Switch />}
              checked={settings?.general?.allow_notifications}
              onChange={(e) => handleToggle(e, "allow_notifications")}
              label="Allow notifications"
            />
            <FormControlLabel
              control={<Switch />}
              checked={settings?.general?.show_breadcrumb}
              onChange={(e) => handleToggle(e, "show_breadcrumb")}
              label="Show breadcrumbs"
            />
            <FormControlLabel
              control={<Switch />}
              checked={settings?.general?.show_light_night_toggle}
              onChange={(e) => handleToggle(e, "show_light_night_toggle")}
              label="Show light/night mode toggle"
            />
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Defaults
            </Typography>

            {/* Default View */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Default View
              </Typography>
              <Select
                fullWidth
                value={settings?.general?.default_view}
                size="small"
                sx={{ mt: 1 }}
                onChange={(e) => handleDefaultViewChange(e)}
              >
                <MenuItem value="grid">Grid View</MenuItem>
                <MenuItem value="list">List View</MenuItem>
              </Select>
            </Box>

            {/* Default theme mode */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Default Theme Mode
              </Typography>
              <Select
                fullWidth
                value={settings?.general?.default_theme_mode}
                size="small"
                sx={{ mt: 1 }}
                onChange={(e) => handleDefaultThemeModeChange(e)}
              >
                <MenuItem value="light">Light Mode</MenuItem>
                <MenuItem value="dark">Dark Mode</MenuItem>
                <MenuItem value="system">System Mode</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>

      </Stack>
    </Box>
  );
}
