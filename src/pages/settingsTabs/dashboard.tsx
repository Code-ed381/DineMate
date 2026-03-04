import React from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Stack,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid
} from "@mui/material";
import { 
  Dashboard as DashboardIcon, 
  Visibility as VisibilityIcon, 
  ViewQuilt as LayoutIcon,
  AttachMoney as MoneyIcon,
  BarChart as ChartIcon,
  TouchApp as ActionIcon
} from "@mui/icons-material";
import { useSettings } from "../../providers/settingsProvider";
import useRestaurantStore from "../../lib/restaurantStore";

const DashboardSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { role } = useRestaurantStore();
  const isOwner = role === "owner";

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const current = settings?.dashboard_settings || {};
    const updated = { ...current, [key]: e.target.checked };
    updateSetting("dashboard_settings", updated);
  };

  const handleSelectChange = (e: SelectChangeEvent<any>, key: string) => {
    const current = settings?.dashboard_settings || {};
    const updated = { ...current, [key]: e.target.value };
    updateSetting("dashboard_settings", updated);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Dashboard Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Personalize your workspace by choosing which widgets and reports to display.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <LayoutIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                   Layout & Behavior
                </Typography>
              </Stack>
              <Stack spacing={1}>
                  <FormControlLabel 
                    control={<Switch disabled={!isOwner} checked={!!settings?.dashboard_settings?.compact_layout} onChange={(e) => handleToggle(e, 'compact_layout')} />} 
                    label="Use Compact Layout" 
                  />
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Default Landing Tab
                    </Typography>
                    <Select 
                      disabled={!isOwner} 
                      fullWidth 
                      value={settings?.dashboard_settings?.default_landing_tab || 'overview'} 
                      onChange={(e) => handleSelectChange(e, 'default_landing_tab')} 
                      size="small"
                    >
                      <MenuItem value="overview">Overview</MenuItem>
                      <MenuItem value="sales">Sales & Revenue</MenuItem>
                    </Select>
                  </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <VisibilityIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                   Widget Visibility
                </Typography>
              </Stack>
              <Stack spacing={1}>
                  <FormControlLabel 
                    control={<Switch disabled={!isOwner} checked={settings?.dashboard_settings?.show_revenue_card !== false} onChange={(e) => handleToggle(e, 'show_revenue_card')} />} 
                    label="Show Revenue Summary" 
                  />
                  <FormControlLabel 
                    control={<Switch disabled={!isOwner} checked={settings?.dashboard_settings?.show_order_stats !== false} onChange={(e) => handleToggle(e, 'show_order_stats')} />} 
                    label="Show Order Statistics" 
                  />
                  <FormControlLabel 
                    control={<Switch disabled={!isOwner} checked={settings?.dashboard_settings?.show_quick_actions !== false} onChange={(e) => handleToggle(e, 'show_quick_actions')} />} 
                    label="Show Quick Actions" 
                  />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardSettingsPanel;
