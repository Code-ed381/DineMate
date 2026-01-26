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

const GeneralSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const current = (settings as any)?.general || {};
    const updated = { ...current, [key]: e.target.checked };
    updateSetting("general", updated);
  };

  const handleSelectChange = (e: SelectChangeEvent<any>, key: string) => {
    const current = (settings as any)?.general || {};
    const updated = { ...current, [key]: e.target.value };
    updateSetting("general", updated);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        General Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        General settings for your restaurant.
      </Typography>

      <Stack spacing={3}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Interface
            </Typography>
            <Stack>
                <FormControlLabel
                  control={<Switch checked={!!(settings as any)?.general?.show_date_and_time_on_navbar} onChange={(e) => handleToggle(e, "show_date_and_time_on_navbar")} />}
                  label="Show date and time on navbar"
                />
                <FormControlLabel
                  control={<Switch checked={!!(settings as any)?.general?.allow_notifications} onChange={(e) => handleToggle(e, "allow_notifications")} />}
                  label="Allow notifications"
                />
                <FormControlLabel
                  control={<Switch checked={!!(settings as any)?.general?.show_breadcrumb} onChange={(e) => handleToggle(e, "show_breadcrumb")} />}
                  label="Show breadcrumbs"
                />
                <FormControlLabel
                  control={<Switch checked={!!(settings as any)?.general?.show_light_night_toggle} onChange={(e) => handleToggle(e, "show_light_night_toggle")} />}
                  label="Show light/night mode toggle"
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
                Default View
              </Typography>
              <Select
                fullWidth
                value={(settings as any)?.general?.default_view || "grid"}
                size="small"
                sx={{ mt: 1 }}
                onChange={(e) => handleSelectChange(e, "default_view")}
              >
                <MenuItem value="grid">Grid View</MenuItem>
                <MenuItem value="list">List View</MenuItem>
              </Select>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Default Theme Mode
              </Typography>
              <Select
                fullWidth
                value={(settings as any)?.general?.default_theme_mode || "light"}
                size="small"
                sx={{ mt: 1 }}
                onChange={(e) => handleSelectChange(e, "default_theme_mode")}
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
};

export default GeneralSettingsPanel;
