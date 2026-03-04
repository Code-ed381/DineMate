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

const ReportsSettingsPanel: React.FC = () => {
  const { settings, updateSetting } = useSettings();
  const { role } = useRestaurantStore();
  const isOwner = role === "owner";
  const rs = settings?.report_settings || {};

  const toggle = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    updateSetting("report_settings", { ...rs, [key]: e.target.checked });
  };

  const select = (e: SelectChangeEvent<any>, key: string) => {
    updateSetting("report_settings", { ...rs, [key]: e.target.value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Reports Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Control which reports are available, how data is exported, and what's visible on the report pages.
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Report Types & Visibility */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Report Types & Visibility
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Toggle entire report modules on or off. Disabled reports are hidden from navigation.
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.enable_sales_reports ?? true} onChange={(e) => toggle(e, "enable_sales_reports")} />}
                label="Enable Sales Reports"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.enable_audit_logs ?? true} onChange={(e) => toggle(e, "enable_audit_logs")} />}
                label="Enable Audit Logs (Cashier Detailed Reports)"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.enable_employee_performance ?? true} onChange={(e) => toggle(e, "enable_employee_performance")} />}
                label="Enable Employee Performance Reports"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={!!rs.enable_inventory_reports} onChange={(e) => toggle(e, "enable_inventory_reports")} />}
                label="Enable Inventory Reports (future)"
              />
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.enable_xz_reports ?? true} onChange={(e) => toggle(e, "enable_xz_reports")} />}
                label="Show X Report & Z Report buttons"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.show_report_kpi_cards ?? true} onChange={(e) => toggle(e, "show_report_kpi_cards")} />}
                label="Show KPI summary cards (Cash / Card / Orders / Total)"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 2: Export & Download */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Export & Download
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Default Export Format
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={rs.default_export_format || "csv"}
                  size="small"
                  onChange={(e) => select(e, "default_export_format")}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="pdf">PDF (Print)</MenuItem>
                  <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
                </Select>
              </Box>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.allow_csv_export ?? true} onChange={(e) => toggle(e, "allow_csv_export")} />}
                label="Allow CSV / data export"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.allow_pdf_export ?? true} onChange={(e) => toggle(e, "allow_pdf_export")} />}
                label="Allow PDF export (print)"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.export_include_logo ?? true} onChange={(e) => toggle(e, "export_include_logo")} />}
                label="Include restaurant logo in exported documents"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 3: Filters & Display */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Filters & Display
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Default Date Range (pre-selected when opening reports)
                </Typography>
                <Select
                  disabled={!isOwner}
                  fullWidth
                  value={rs.default_date_range || "today"}
                  size="small"
                  onChange={(e) => select(e, "default_date_range")}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </Box>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.show_waiter_filter ?? true} onChange={(e) => toggle(e, "show_waiter_filter")} />}
                label="Show waiter / attendant filter"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.show_advanced_filters ?? true} onChange={(e) => toggle(e, "show_advanced_filters")} />}
                label="Show advanced filters panel"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.show_transaction_table ?? true} onChange={(e) => toggle(e, "show_transaction_table")} />}
                label="Show transaction history table"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 4: Table & Column Controls */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Table & Column Controls
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Choose which columns appear in the Sales Report transaction table.
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.show_cash_column ?? true} onChange={(e) => toggle(e, "show_cash_column")} />}
                label="Show 'Cash' column"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.show_card_column ?? true} onChange={(e) => toggle(e, "show_card_column")} />}
                label="Show 'Card' column"
              />
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.show_balance_column ?? true} onChange={(e) => toggle(e, "show_balance_column")} />}
                label="Show 'Balance' column"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Section 5: Access Control */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
              Access Control
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch disabled={!isOwner} checked={rs.cashiers_view_audit ?? true} onChange={(e) => toggle(e, "cashiers_view_audit")} />}
                label="Cashiers can view audit logs"
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default ReportsSettingsPanel;
