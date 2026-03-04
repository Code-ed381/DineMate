import React from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
  Grid
} from "@mui/material";
import { 
  Restaurant as RestaurantIcon, 
  Timer as TimerIcon, 
  NotificationsActive as NotificationsIcon, 
  FlashOn as FlashIcon,
  AutoAwesome as AutoIcon
} from "@mui/icons-material";
import { useSettings } from "../../providers/settingsProvider";
import useRestaurantStore from "../../lib/restaurantStore";

const KitchenSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { role } = useRestaurantStore();
  const isOwner = role === "owner";

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const current = settings?.kitchen_settings || {};
    const updated = { ...current, [key]: e.target.checked };
    updateSetting("kitchen_settings", updated);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const current = settings?.kitchen_settings || {};
    const val = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    const updated = { ...current, [key]: val };
    updateSetting("kitchen_settings", updated);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Kitchen & Chef Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure how orders are displayed, managed, and communicated to your kitchen staff.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <RestaurantIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                   Order Display
                </Typography>
              </Stack>
              <Stack spacing={1}>
                  <FormControlLabel 
                    control={<Switch disabled={!isOwner} checked={!!settings?.kitchen_settings?.enable_kds} onChange={(e) => handleToggle(e, 'enable_kds')} />} 
                    label="Enable Kitchen Display System (KDS)" 
                  />
                  <FormControlLabel 
                    control={<Switch disabled={!isOwner} checked={!!settings?.kitchen_settings?.show_timers} onChange={(e) => handleToggle(e, 'show_timers')} />} 
                    label="Show order timers on screen" 
                  />
                  <FormControlLabel 
                    control={<Switch disabled={!isOwner} checked={!!settings?.kitchen_settings?.enable_border_flash} onChange={(e) => handleToggle(e, 'enable_border_flash')} />} 
                    label="Enable border flash urgency alerts" 
                  />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <AutoIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                   Kitchen Behavior
                </Typography>
              </Stack>
              <Stack spacing={2}>
                 <TextField
                    label="Default Prep Time"
                    fullWidth
                    type="number"
                    size="small"
                    disabled={!isOwner}
                    value={settings?.kitchen_settings?.default_prep_time || 15}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, 'default_prep_time')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                    }}
                  />
                  <FormControlLabel 
                    control={<Switch disabled={!isOwner} checked={!!settings?.kitchen_settings?.enable_sound_alerts} onChange={(e) => handleToggle(e, 'enable_sound_alerts')} />} 
                    label="Enable sound alerts for new orders" 
                  />
                  <FormControlLabel 
                    control={<Switch disabled={!isOwner} checked={!!settings?.kitchen_settings?.auto_accept_orders} onChange={(e) => handleToggle(e, 'auto_accept_orders')} />} 
                    label="Auto-accept incoming orders" 
                  />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KitchenSettingsPanel;
