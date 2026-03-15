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

const CashierSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { role } = useRestaurantStore();
  const isOwner = role === "owner";

  const cs = (settings as any).cashier_settings || {};

  const handleToggle = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    updateSetting("cashier_settings", { ...cs, [key]: e.target.checked });
  };

  const handleSelect = (e: SelectChangeEvent<any>, key: string) => {
    updateSetting("cashier_settings", { ...cs, [key]: e.target.value });
  };

  const handleNumber = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const val = parseInt(e.target.value, 10);
    updateSetting("cashier_settings", { ...cs, [key]: isNaN(val) ? 0 : val });
  };

  const handleText = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("cashier_settings", { ...cs, [key]: e.target.value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Cashier Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Control payment methods, discounts, receipts, and display options for
        the cashier system.
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Payment Methods */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              color="primary.main"
            >
              Payment Methods
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which payment methods are available to the cashier.
            </Typography>
            <Stack>
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.enable_cash ?? true}
                    onChange={(e) => handleToggle(e, "enable_cash")}
                  />
                }
                label="Enable Cash Payments"
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.enable_card ?? true}
                    onChange={(e) => handleToggle(e, "enable_card")}
                  />
                }
                label="Enable Card Payments"
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.enable_momo ?? true}
                    onChange={(e) => handleToggle(e, "enable_momo")}
                  />
                }
                label="Enable MoMo Payments"
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.enable_card_cash ?? true}
                    onChange={(e) => handleToggle(e, "enable_card_cash")}
                  />
                }
                label="Enable Card + Cash Split"
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.enable_online ?? true}
                    onChange={(e) => handleToggle(e, "enable_online")}
                  />
                }
                label="Enable Online Payments"
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Default Payment Method
              </Typography>
              <Select
                disabled={!isOwner}
                fullWidth
                value={cs.default_payment_method || "cash"}
                size="small"
                onChange={(e) => handleSelect(e, "default_payment_method")}
              >
                {(cs.enable_cash ?? true) && (
                  <MenuItem value="cash">Cash</MenuItem>
                )}
                {(cs.enable_card ?? true) && (
                  <MenuItem value="card">Card</MenuItem>
                )}
                {(cs.enable_momo ?? true) && (
                  <MenuItem value="momo">MoMo</MenuItem>
                )}
                {(cs.enable_card_cash ?? true) && (
                  <MenuItem value="card+cash">Card + Cash</MenuItem>
                )}
                {(cs.enable_online ?? true) && (
                  <MenuItem value="online">Online</MenuItem>
                )}
              </Select>
            </Box>
          </CardContent>
        </Card>

        {/* Section 2: Discounts & Checkout */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              color="primary.main"
            >
              Discounts & Checkout
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.allow_manual_discount ?? true}
                    onChange={(e) => handleToggle(e, "allow_manual_discount")}
                  />
                }
                label="Allow Manual Discounts"
              />
              <TextField
                disabled={!isOwner || cs.allow_manual_discount === false}
                label="Max Discount Allowed (%)"
                type="number"
                size="small"
                fullWidth
                value={cs.max_discount_percent ?? 100}
                onChange={(e: any) => handleNumber(e, "max_discount_percent")}
                helperText="Cap the maximum discount a cashier can apply (0 = unlimited)"
                inputProps={{ min: 0, max: 100 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.require_payment_confirmation ?? true}
                    onChange={(e) =>
                      handleToggle(e, "require_payment_confirmation")
                    }
                  />
                }
                label="Require Payment Confirmation Dialog"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 3: Receipts & Printing */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              color="primary.main"
            >
              Receipts & Printing
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.auto_print_receipt ?? false}
                    onChange={(e) => handleToggle(e, "auto_print_receipt")}
                  />
                }
                label="Auto-Print Receipt After Payment"
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.show_proforma_bill ?? true}
                    onChange={(e) => handleToggle(e, "show_proforma_bill")}
                  />
                }
                label='Show "Print Bill" Button (Proforma)'
              />
              <TextField
                disabled={!isOwner}
                label="Custom Receipt Footer Message"
                size="small"
                fullWidth
                value={
                  cs.receipt_footer_message ?? "THANK YOU FOR DINING WITH US!"
                }
                onChange={(e: any) => handleText(e, "receipt_footer_message")}
                helperText="Appears at the bottom of all printed receipts"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 4: Display & Audit */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              color="primary.main"
            >
              Display & Audit
            </Typography>
            <Stack>
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.show_revenue_stats ?? true}
                    onChange={(e) => handleToggle(e, "show_revenue_stats")}
                  />
                }
                label="Show Revenue KPI Strip on POS Panel"
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.show_audit_stats ?? true}
                    onChange={(e) => handleToggle(e, "show_audit_stats")}
                  />
                }
                label="Show Stats Cards on Audit Logs Page"
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.enable_csv_export ?? true}
                    onChange={(e) => handleToggle(e, "enable_csv_export")}
                  />
                }
                label="Enable CSV Export on Audit Logs"
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Audit Logs Metric Categories
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.show_staff_metrics ?? true}
                    onChange={(e) => handleToggle(e, "show_staff_metrics")}
                  />
                }
                label="Show Staff Performance Metrics"
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.show_menu_metrics ?? true}
                    onChange={(e) => handleToggle(e, "show_menu_metrics")}
                  />
                }
                label="Show Menu Analytics Metrics"
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.show_operational_metrics ?? true}
                    onChange={(e) =>
                      handleToggle(e, "show_operational_metrics")
                    }
                  />
                }
                label="Show Operational Metrics"
              />
              <FormControlLabel
                control={
                  <Switch
                    disabled={!isOwner}
                    checked={cs.show_financial_metrics ?? false}
                    onChange={(e) => handleToggle(e, "show_financial_metrics")}
                  />
                }
                label="Show Financial Metrics"
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default CashierSettingsPanel;
