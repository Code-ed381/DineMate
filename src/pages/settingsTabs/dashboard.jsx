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
  TextField,
} from "@mui/material";

export default function DashboardSettingsPanel() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Dashboard Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Personalize your dashboard by choosing which widgets and reports to
        display.
      </Typography>

      <Stack spacing={3}>
        {/* Section 1: Layout */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Layout & Appearance
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable Dark Mode"
            />
            <FormControlLabel control={<Switch />} label="Compact Layout" />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Default Landing Tab
              </Typography>
              <Select
                fullWidth
                defaultValue="overview"
                size="small"
                sx={{ mt: 1 }}
              >
                <MenuItem value="overview">Overview</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="orders">Orders</MenuItem>
                <MenuItem value="inventory">Inventory</MenuItem>
              </Select>
            </Box>
          </CardContent>
        </Card>

        {/* Section 2: Metrics & Widgets */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Metrics & Widgets
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Show Daily Sales"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Show Active Orders"
            />
            <FormControlLabel
              control={<Switch />}
              label="Show Inventory Alerts"
            />
            <FormControlLabel
              control={<Switch />}
              label="Show Employee Performance"
            />
            <FormControlLabel
              control={<Switch />}
              label="Show Customer Feedback"
            />
          </CardContent>
        </Card>

        {/* Section 3: Reports */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Reports
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Include Weekly Sales Summary"
            />
            <FormControlLabel
              control={<Switch />}
              label="Include Monthly Profit/Loss"
            />
            <FormControlLabel
              control={<Switch />}
              label="Include Inventory Usage Report"
            />
            <FormControlLabel
              control={<Switch />}
              label="Include Top-Selling Items Report"
            />
          </CardContent>
        </Card>

        {/* Section 4: Real-Time Updates */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Real-Time Updates
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-refresh dashboard data"
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Refresh Interval (seconds)
              </Typography>
              <TextField
                type="number"
                size="small"
                fullWidth
                defaultValue={30}
                sx={{ mt: 1 }}
              />
            </Box>
            <FormControlLabel
              control={<Switch />}
              label="Show live order notifications"
            />
          </CardContent>
        </Card>

        {/* Section 5: Custom Widgets */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Custom Widgets
            </Typography>
            <FormControlLabel
              control={<Switch />}
              label="Enable Weather Widget"
            />
            <FormControlLabel
              control={<Switch />}
              label="Enable Staff Availability Widget"
            />
            <FormControlLabel
              control={<Switch />}
              label="Enable Reservation Trends"
            />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
