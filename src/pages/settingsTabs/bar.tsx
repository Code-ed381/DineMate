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
} from "@mui/material";
import { useSettings } from "../../providers/settingsProvider";
import useRestaurantStore from "../../lib/restaurantStore";

const BarSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { role } = useRestaurantStore();
  const isOwner = role === "owner";

  const bs = (settings as any).bar_settings || {};

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("bar_settings", { ...bs, [key]: e.target.checked });
  };

  const handleSelect = (e: SelectChangeEvent<any>, key: string) => {
    updateSetting("bar_settings", { ...bs, [key]: e.target.value });
  };

  const handleText = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("bar_settings", { ...bs, [key]: e.target.value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Bar Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Control service modes, OTC checkout behavior, dine-in queue display, receipts, and the bartender dashboard.
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Service Modes */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Service Modes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which service modes are available to bartenders.
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.enable_dine_in ?? true} onChange={(e) => handleToggle(e, "enable_dine_in")} />}
                label="Enable Dine-In Mode"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.enable_takeaway ?? true} onChange={(e) => handleToggle(e, "enable_takeaway")} />}
                label="Enable Takeaway (OTC) Mode"
              />
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Default Mode on Page Load
              </Typography>
              <Select
                disabled={!isOwner}
                fullWidth
                size="small"
                value={bs.default_mode || "dine_in"}
                onChange={(e) => handleSelect(e, "default_mode")}
              >
                {(bs.enable_dine_in ?? true) && <MenuItem value="dine_in">Dine In</MenuItem>}
                {(bs.enable_takeaway ?? true) && <MenuItem value="takeaway">Takeaway</MenuItem>}
              </Select>
            </Box>
          </CardContent>
        </Card>

        {/* Section 2: Takeaway / OTC Controls */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Takeaway / OTC Controls
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.allow_tips ?? true} onChange={(e) => handleToggle(e, "allow_tips")} />}
                label="Allow Tips on OTC Orders"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.allow_void_orders ?? true} onChange={(e) => handleToggle(e, "allow_void_orders")} />}
                label="Allow Voiding Recent Orders"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.show_recent_orders ?? true} onChange={(e) => handleToggle(e, "show_recent_orders")} />}
                label="Show Recent Orders Section"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.show_otc_proforma ?? true} onChange={(e) => handleToggle(e, "show_otc_proforma")} />}
                label='Show "Print Proforma" Button'
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 3: Dine-In Queue Behavior */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Dine-In Queue Behavior
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.show_recipes ?? true} onChange={(e) => handleToggle(e, "show_recipes")} />}
                label="Show Drink Recipes on Task Cards"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.show_order_notes ?? true} onChange={(e) => handleToggle(e, "show_order_notes")} />}
                label="Show Order Notes on Task Cards"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.show_sla_progress ?? true} onChange={(e) => handleToggle(e, "show_sla_progress")} />}
                label="Show SLA Progress Bar"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.enable_overdue_pulse ?? true} onChange={(e) => handleToggle(e, "enable_overdue_pulse")} />}
                label="Enable Overdue Pulse Animation"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.show_served_column ?? true} onChange={(e) => handleToggle(e, "show_served_column")} />}
                label='Show "Recently Served" Column'
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 4: Receipts */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Receipts & Printing
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.auto_print_otc ?? false} onChange={(e) => handleToggle(e, "auto_print_otc")} />}
                label="Auto-Print Receipt After OTC Payment"
              />
              <TextField
                disabled={!isOwner}
                label="Custom Bar Receipt Footer"
                size="small"
                fullWidth
                value={bs.otc_receipt_footer ?? "THANK YOU FOR DINING WITH US!"}
                onChange={(e: any) => handleText(e, "otc_receipt_footer")}
                helperText="Appears at the bottom of all printed bar receipts"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 5: Dashboard Display */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Dashboard Display
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.show_dashboard_kpis ?? true} onChange={(e) => handleToggle(e, "show_dashboard_kpis")} />}
                label="Show KPI Cards"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.show_hourly_chart ?? true} onChange={(e) => handleToggle(e, "show_hourly_chart")} />}
                label="Show Hourly Volume Chart"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.show_popular_drinks ?? true} onChange={(e) => handleToggle(e, "show_popular_drinks")} />}
                label="Show Popular Drinks Ranking"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={bs.show_prep_time_chart ?? true} onChange={(e) => handleToggle(e, "show_prep_time_chart")} />}
                label="Show Avg Prep Time Chart"
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default BarSettingsPanel;
