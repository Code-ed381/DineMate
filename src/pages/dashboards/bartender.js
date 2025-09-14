import React, { useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  List,
  ListItem,
  Chip,
  IconButton,
  Stack,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  LocalBar,
  DoneAll,
  Star,
  Warning,
  MonetizationOn,
  Notifications,
  BarChart as BarIcon,
  PieChart as PieIcon,
  InsertChart,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import DashboardHeader from "../../components/dashboard-header";

// BartenderDashboardPro (JSX) — flat cards, consistent with other dashboards
const COLORS = ["#4caf50", "#2196f3", "#ff9800", "#9c27b0", "#f44336"];

export default function BartenderDashboardPro({
  activeDrinks = [],
  readyDrinks = [],
  specialRequests = [],
  inventoryAlerts = [],
  notifications = [],
  tipsToday = 0,
  completedCount = 0,
  throughputSeries = null, // [{time: '10:00', served: 5}, ...]
}) {
  // sensible defaults for charts
  const defaultSeries = [
    { time: "10:00", served: 2 },
    { time: "11:00", served: 6 },
    { time: "12:00", served: 14 },
    { time: "13:00", served: 10 },
    { time: "14:00", served: 8 },
    { time: "15:00", served: 12 },
  ];

  const series = throughputSeries || defaultSeries;

  // small aggregations
  const totals = useMemo(() => {
    const pending = activeDrinks.length;
    const ready = readyDrinks.length;
    const special = specialRequests.length;
    const alerts = inventoryAlerts.length;
    const served = completedCount;
    const tips = tipsToday;
    return { pending, ready, special, alerts, served, tips };
  }, [
    activeDrinks,
    readyDrinks,
    specialRequests,
    inventoryAlerts,
    completedCount,
    tipsToday,
  ]);

  // top drinks breakdown
  const breakdown = useMemo(() => {
    const map = {};
    [...activeDrinks, ...readyDrinks, ...specialRequests].forEach((d) => {
      const name = d.drink || d.item || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [activeDrinks, readyDrinks, specialRequests]);

  // mock top sellers if none
  const topSellers = useMemo(() => {
    if (breakdown.length)
      return breakdown.slice(0, 5).sort((a, b) => b.value - a.value);
    return [
      { name: "Mojito", value: 24 },
      { name: "Old Fashioned", value: 18 },
      { name: "Margarita", value: 12 },
    ];
  }, [breakdown]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <DashboardHeader
        title="Bartender Dashboard"
        description="Here’s a quick summary of your restaurant’s performance today."
        background="linear-gradient(135deg, rgba(25,118,210,1) 0%, rgba(0,200,150,1) 100%)"
        color="#fff"
      />
      {/* KPI strip — flat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "transparent", color: "text.primary" }}>
                <LocalBar />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {totals.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Drinks
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "transparent", color: "text.primary" }}>
                <DoneAll />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {totals.served}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Drinks
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "transparent", color: "text.primary" }}>
                <Star />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {totals.special}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Special Requests
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "transparent", color: "text.primary" }}>
                <Warning />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {totals.alerts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inventory Alerts
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "transparent", color: "text.primary" }}>
                <MonetizationOn />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  ${totals.tips}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tips Today
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Summary + Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardHeader
              title="Throughput (drinks served)"
              action={
                <IconButton>
                  <BarIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Hourly throughput helps spot service peaks and staffing needs.
              </Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={series}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RTooltip />
                    <Line
                      type="monotone"
                      dataKey="served"
                      stroke="#1976d2"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardHeader
              title="Drink Mix Breakdown"
              action={
                <IconButton>
                  <PieIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={36}
                      label
                    >
                      {breakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lists + Top sellers */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardHeader title="Active Drink Orders" />
            <CardContent>
              <List>
                {activeDrinks.length === 0 && (
                  <Typography color="text.secondary" align="center">
                    No active orders
                  </Typography>
                )}
                {activeDrinks.map((drink) => (
                  <ListItem
                    key={drink.id}
                    sx={{ bgcolor: "grey.50", mb: 1, borderRadius: 1 }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700}>{drink.drink}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Table {drink.table} • {drink.status}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label="Mark Ready"
                        color="success"
                        size="small"
                        clickable
                      />
                      <Chip label="Delay" size="small" />
                    </Stack>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardHeader title="Top Sellers (today)" />
            <CardContent>
              <List>
                {topSellers.map((s, i) => (
                  <ListItem
                    key={s.name}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      bgcolor: "grey.50",
                      mb: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography fontWeight={700}>{s.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.value} sold
                      </Typography>
                    </Box>
                    <Typography fontWeight={700}>
                      {Math.round(
                        (s.value /
                          (topSellers.reduce((a, b) => a + b.value, 0) || 1)) *
                          100
                      )}
                      %
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Alerts + Notifications */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardHeader title="Inventory Alerts" />
            <CardContent>
              <List>
                {inventoryAlerts.length === 0 && (
                  <Typography color="text.secondary" align="center">
                    No inventory alerts
                  </Typography>
                )}
                {inventoryAlerts.map((a, idx) => (
                  <ListItem
                    key={idx}
                    sx={{ bgcolor: "grey.50", mb: 1, borderRadius: 1 }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700}>{a.item}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {a.detail || "Low stock"}
                      </Typography>
                    </Box>
                    {typeof a.level === "number" && (
                      <Box sx={{ width: 120 }}>
                        <LinearProgress variant="determinate" value={a.level} />
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardHeader title="Bar Notifications" />
            <CardContent>
              <List>
                {notifications.length === 0 && (
                  <Typography color="text.secondary" align="center">
                    No notifications
                  </Typography>
                )}
                {notifications.map((n) => (
                  <ListItem
                    key={n.id}
                    sx={{ bgcolor: "grey.50", mb: 1, borderRadius: 1 }}
                  >
                    <Avatar sx={{ bgcolor: "transparent", mr: 2 }}>
                      <Notifications />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700}>{n.message}</Typography>
                      {n.time && (
                        <Typography variant="caption" color="text.secondary">
                          {n.time}
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Tip: connect this dashboard to your POS and inventory system to
          populate charts in real-time.
        </Typography>
      </Box>
    </Box>
  );
}
