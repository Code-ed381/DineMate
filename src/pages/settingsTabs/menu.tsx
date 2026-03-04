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
  TextField,
  SelectChangeEvent,
  Divider,
} from "@mui/material";
import { useSettings } from "../../providers/settingsProvider";
import useRestaurantStore from "../../lib/restaurantStore";

const MenuSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { role } = useRestaurantStore();
  const isOwner = role === "owner";
  const ms = settings?.menu_settings || {};

  const toggle = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("menu_settings", { ...ms, [key]: e.target.checked });
  };

  const select = (e: SelectChangeEvent<any>, key: string) => {
    updateSetting("menu_settings", { ...ms, [key]: e.target.value });
  };

  const text = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("menu_settings", { ...ms, [key]: e.target.value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Menu Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure how your menu is displayed, ordered, and checked out. Controls apply to all waiters.
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Availability & Display */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Availability & Display
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={!!ms.allow_online_ordering} onChange={(e) => toggle(e, "allow_online_ordering")} />}
                label="Allow online ordering"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={!!ms.hide_out_of_stock} onChange={(e) => toggle(e, "hide_out_of_stock")} />}
                label="Hide out-of-stock items automatically"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={!!ms.scheduled_availability} onChange={(e) => toggle(e, "scheduled_availability")} />}
                label="Enable scheduled availability (time-based menus)"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.show_item_images ?? true} onChange={(e) => toggle(e, "show_item_images")} />}
                label="Show menu item images"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.show_search_bar ?? true} onChange={(e) => toggle(e, "show_search_bar")} />}
                label="Show search bar on menu page"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 2: Pricing & Tax */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Pricing & Tax
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Default Tax Rate (%)
                </Typography>
                <TextField
                  disabled={!isOwner}
                  fullWidth
                  size="small"
                  value={ms.default_tax_rate || ""}
                  onChange={(e: any) => text(e, "default_tax_rate")}
                  type="number"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Global Discount Option
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={ms.global_discount || "none"}
                  onChange={(e) => select(e, "global_discount")}
                  size="small"
                >
                  <MenuItem value="none">No Discounts</MenuItem>
                  <MenuItem value="happyhour">Happy Hour (10% off)</MenuItem>
                  <MenuItem value="lunch">Lunch Specials (15% off)</MenuItem>
                </Select>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Section 3: Ordering Controls */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Ordering Controls
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.enable_course_selector ?? true} onChange={(e) => toggle(e, "enable_course_selector")} />}
                label="Enable course selector (Starter / Main / Dessert / Drinks)"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.enable_favorites ?? true} onChange={(e) => toggle(e, "enable_favorites")} />}
                label="Enable favorites (heart icon + Favorites category)"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.allow_order_notes ?? true} onChange={(e) => toggle(e, "allow_order_notes")} />}
                label="Allow order notes per item"
              />
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.allow_void_items ?? true} onChange={(e) => toggle(e, "allow_void_items")} />}
                label='Allow "Void Item" action on order items'
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.allow_comp_items ?? true} onChange={(e) => toggle(e, "allow_comp_items")} />}
                label='Allow "Comp Item (Free)" action on order items'
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.show_kitchen_status ?? true} onChange={(e) => toggle(e, "show_kitchen_status")} />}
                label="Show kitchen status breakdown on ordered items (Pending / Prep / Ready / Served)"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 4: Checkout & Payment */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Checkout & Payment
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.enable_tips ?? true} onChange={(e) => toggle(e, "enable_tips")} />}
                label="Enable tip selection on checkout"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.allow_split_bill ?? true} onChange={(e) => toggle(e, "allow_split_bill")} />}
                label='Allow "Split Bill / Multiple Payments"'
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.show_print_bill ?? true} onChange={(e) => toggle(e, "show_print_bill")} />}
                label='Show "Print Bill" button on order panel'
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 5: Waiter Features */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Waiter Features
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.show_order_history ?? true} onChange={(e) => toggle(e, "show_order_history")} />}
                label="Show Order History tab to waiters"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.allow_reprint ?? true} onChange={(e) => toggle(e, "allow_reprint")} />}
                label="Allow waiters to reprint receipts from order history"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={ms.show_waiter_performance ?? true} onChange={(e) => toggle(e, "show_waiter_performance")} />}
                label="Show Performance dashboard to waiters"
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default MenuSettingsPanel;
