import React, { useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  Chip,
  IconButton,
  Stack,
  LinearProgress,
  Divider,
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
} from "recharts";
import DashboardHeader from "./components/dashboard-header";

const COLORS = ["#4caf50", "#2196f3", "#ff9800", "#9c27b0", "#f44336"];

interface DrinkOrder {
  id: string;
  drink: string;
  item?: string;
  table: string | number;
  status: string;
}

interface InventoryAlert {
  item: string;
  detail?: string;
  level?: number;
}

interface BarNotification {
  id: string;
  message: string;
  time?: string;
}

interface BartenderDashboardProps {
  activeDrinks?: DrinkOrder[];
  readyDrinks?: DrinkOrder[];
  specialRequests?: DrinkOrder[];
  inventoryAlerts?: InventoryAlert[];
  notifications?: BarNotification[];
  tipsToday?: number;
  completedCount?: number;
  throughputSeries?: { time: string; served: number }[] | null;
}

const BartenderDashboard: React.FC<BartenderDashboardProps> = ({
  activeDrinks = [],
  readyDrinks = [],
  specialRequests = [],
  inventoryAlerts = [],
  notifications = [],
  tipsToday = 0,
  completedCount = 0,
  throughputSeries = null,
}) => {
  // default data
  const defaultSeries = [
    { time: "10:00", served: 2 },
    { time: "11:00", served: 6 },
    { time: "12:00", served: 14 },
    { time: "13:00", served: 10 },
    { time: "14:00", served: 8 },
    { time: "15:00", served: 12 },
  ];
  const series = throughputSeries || defaultSeries;

  const totals = useMemo(() => {
    return {
      pending: activeDrinks.length,
      ready: readyDrinks.length,
      special: specialRequests.length,
      alerts: inventoryAlerts.length,
      served: completedCount,
      tips: tipsToday,
    };
  }, [
    activeDrinks,
    readyDrinks,
    specialRequests,
    inventoryAlerts,
    completedCount,
    tipsToday,
  ]);

  const breakdown = useMemo(() => {
    const map: Record<string, number> = {};
    [...activeDrinks, ...readyDrinks, ...specialRequests].forEach((d) => {
      const name = d.drink || d.item || "Unknown";
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [activeDrinks, readyDrinks, specialRequests]);

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
    <Box
      sx={{
        p: { xs: 2, md: 3 },
      }}
    >
      <DashboardHeader
        title="🍹 Bartender Dashboard"
        description="Monitor drink orders, sales, and performance in real time."
        background="linear-gradient(135deg,#1976d2,#43cea2)"
        color="#fff"
      />

      {/* KPI strip */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          {
            label: "Pending",
            value: totals.pending,
            icon: <LocalBar />,
            color: "#ff9800",
          },
          {
            label: "Completed",
            value: totals.served,
            icon: <DoneAll />,
            color: "#4caf50",
          },
          {
            label: "Special Requests",
            value: totals.special,
            icon: <Star />,
            color: "#9c27b0",
          },
          {
            label: "Inventory Alerts",
            value: totals.alerts,
            icon: <Warning />,
            color: "#f44336",
          },
          {
            label: "Tips Today",
            value: `$${totals.tips}`,
            icon: <MonetizationOn />,
            color: "#2196f3",
          },
        ].map((kpi, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                transition: "all .3s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: kpi.color, color: "#fff" }}>
                  {kpi.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {kpi.label}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">
                  📈 Throughput (drinks served)
                </Typography>
                <IconButton>
                  <BarIcon />
                </IconButton>
              </Stack>
              <Box sx={{ height: 250 }}>
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
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6">🥂 Drink Mix Breakdown</Typography>
                <IconButton>
                  <PieIcon />
                </IconButton>
              </Stack>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      innerRadius={40}
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

      {/* Lists */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🕒 Active Drink Orders
              </Typography>
              <List>
                {activeDrinks.length === 0 && (
                  <Typography color="text.secondary" align="center">
                    No active orders
                  </Typography>
                )}
                {activeDrinks.map((drink) => (
                  <ListItem
                    key={drink.id}
                    sx={{
                      bgcolor: "rgba(33,150,243,0.08)",
                      mb: 1,
                      borderRadius: 2,
                      p: 2,
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
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
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                ⭐ Top Sellers (today)
              </Typography>
              <List>
                {topSellers.map((s) => (
                  <ListItem
                    key={s.name}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      bgcolor: "rgba(76,175,80,0.08)",
                      mb: 1,
                      borderRadius: 2,
                      p: 2,
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

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                ⚠️ Inventory Alerts
              </Typography>
              <List>
                {inventoryAlerts.length === 0 && (
                  <Typography color="text.secondary" align="center">
                    No inventory alerts
                  </Typography>
                )}
                {inventoryAlerts.map((a, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      bgcolor: "rgba(244,67,54,0.08)",
                      mb: 1,
                      borderRadius: 2,
                      p: 2,
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
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
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🔔 Bar Notifications
              </Typography>
              <List>
                {notifications.length === 0 && (
                  <Typography color="text.secondary" align="center">
                    No notifications
                  </Typography>
                )}
                {notifications.map((n) => (
                  <ListItem
                    key={n.id}
                    sx={{
                      bgcolor: "rgba(33,150,243,0.08)",
                      mb: 1,
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#2196f3", mr: 2, color: "#fff" }}>
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

      <Divider sx={{ my: 4 }} />
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          💡 Tip: connect this dashboard to POS & inventory for live updates.
        </Typography>
      </Box>
    </Box>
  );
};

export default BartenderDashboard;
