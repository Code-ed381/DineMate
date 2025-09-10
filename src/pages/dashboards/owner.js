import React, { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  TextField,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  ShoppingBag,
  LocalDining,
  TableRestaurant,
  People,
  StarRate,
  Inventory2,
  Print,
  Refresh,
  Visibility,
  ArrowForward,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import useAuthStore from "../../lib/authStore";

// ————————————————————————————————————————————
// Owner's Dashboard (single-tenant, Material UI + Recharts)
// ————————————————————————————————————————————
export default function OwnerDashboard() {
  const { user } = useAuthStore();

  console.log(user);
  const [range, setRange] = useState("week"); // today | week | month

  // ==== Mock Data (replace with API/Zustand) ====
  const kpis = useMemo(
    () => ({
      todayRevenue: 1240.75,
      orders: 87,
      avgOrder: 14.25,
      activeTables: 12,
      totalTables: 20,
      staffOnShift: 8,
      rating: 4.6,
    }),
    []
  );

  const salesTrend = useMemo(
    () =>
      range === "today"
        ? [
            { name: "9a", value: 120 },
            { name: "11a", value: 240 },
            { name: "1p", value: 410 },
            { name: "3p", value: 380 },
            { name: "5p", value: 560 },
            { name: "7p", value: 720 },
          ]
        : range === "week"
        ? [
            { name: "Mon", value: 1020 },
            { name: "Tue", value: 1240 },
            { name: "Wed", value: 990 },
            { name: "Thu", value: 1530 },
            { name: "Fri", value: 1840 },
            { name: "Sat", value: 2210 },
            { name: "Sun", value: 1670 },
          ]
        : [
            { name: "W1", value: 8120 },
            { name: "W2", value: 9760 },
            { name: "W3", value: 10540 },
            { name: "W4", value: 9340 },
          ],
    [range]
  );

  const categoryMix = [
    { name: "Pizza", value: 38 },
    { name: "Burgers", value: 22 },
    { name: "Pasta", value: 18 },
    { name: "Salads", value: 12 },
    { name: "Drinks", value: 10 },
  ];

  const topItems = [
    { name: "Margherita Pizza", sold: 132 },
    { name: "Cheeseburger", sold: 118 },
    { name: "Spaghetti Bolognese", sold: 94 },
    { name: "Caesar Salad", sold: 80 },
    { name: "Lemonade", sold: 76 },
  ];

  const liveOrders = [
    { id: 1248, table: "T7", total: 42.3, status: "In Kitchen" },
    { id: 1247, table: "T3", total: 18.5, status: "Pending" },
    { id: 1246, table: "T10", total: 67.0, status: "Ready" },
    { id: 1245, table: "T2", total: 25.9, status: "Served" },
  ];

  const tableSnapshot = [
    { number: "T1", status: "Free" },
    { number: "T2", status: "Occupied" },
    { number: "T3", status: "Occupied" },
    { number: "T4", status: "Reserved" },
    { number: "T5", status: "Free" },
    { number: "T6", status: "Occupied" },
    { number: "T7", status: "Occupied" },
    { number: "T8", status: "Free" },
  ];

  const employees = [
    { name: "Alice", orders: 36 },
    { name: "John", orders: 31 },
    { name: "Mei", orders: 28 },
    { name: "Kwame", orders: 24 },
  ];

  const inventoryAlerts = [
    { item: "Beef Patties", level: 12, threshold: 15 },
    { item: "Mozzarella", level: 6, threshold: 10 },
    { item: "Tomato Sauce", level: 18, threshold: 20 },
  ];

  const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EC4899", "#06B6D4"]; // indigo, green, amber, pink, cyan

  const progressPct = Math.round((kpis.activeTables / kpis.totalTables) * 100);

  return (
    <Box className="owner-dashboard" sx={{ p: 3, display: "grid", gap: 3 }}>
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          mb: 3,
          background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
          color: "#fff",
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          Welcome {user?.user?.user_metadata?.firstName}
        </Typography>
        <Typography variant="body2">
          Quick overview on your restaurant. Snapshots of your restaurant's
          performance, orders, and more.
        </Typography>
      </Box>
      {/* Header / Filters */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField size="small" placeholder="Search…" />
          <ToggleButtonGroup
            value={range}
            exclusive
            onChange={(e, v) => v && setRange(v)}
            size="small"
          >
            <ToggleButton value="today">Today</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Refresh">
            <IconButton>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={<TrendingUp />}
            label="Revenue"
            value={`$${kpis.todayRevenue.toLocaleString()}`}
            sub="Today"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={<ShoppingBag />}
            label="Orders"
            value={kpis.orders}
            sub="Completed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            icon={<LocalDining />}
            label="Avg. Order"
            value={`$${kpis.avgOrder}`}
            sub="per ticket"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Active Tables
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="h5" fontWeight={800}>
                {kpis.activeTables}/{kpis.totalTables}
              </Typography>
              <TableRestaurant />
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPct}
              sx={{ borderRadius: 999 }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: 3, height: 340 }}>
            <SectionHeader
              title="Revenue Trend"
              action={
                <Button size="small" endIcon={<ArrowForward />}>
                  View report
                </Button>
              }
            />
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesTrend}
                  margin={{ left: 8, right: 8, top: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RTooltip formatter={(v) => [`$${v}`, "Revenue"]} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366F1"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: 3, height: 340 }}>
            <SectionHeader title="Category Mix" />
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryMix}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    innerRadius={55}
                    paddingAngle={3}
                  >
                    {categoryMix.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Middle Row: Top Items + Live Orders + Rating/Staff */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, height: 360 }}>
            <SectionHeader title="Top Items" />
            <List dense>
              {topItems.map((it, idx) => (
                <ListItem
                  key={idx}
                  secondaryAction={
                    <Chip label={`${it.sold} sold`} size="small" />
                  }
                >
                  <ListItemAvatar>
                    <Avatar variant="rounded">🍽️</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={it.name} />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1.5 }} />
            <Button fullWidth variant="outlined">
              Manage Menu
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, height: 360 }}>
            <SectionHeader
              title="Live Orders"
              action={
                <IconButton size="small">
                  <Visibility />
                </IconButton>
              }
            />
            <List dense>
              {liveOrders.map((o) => (
                <ListItem key={o.id}>
                  <ListItemAvatar>
                    <Avatar variant="circular">
                      <ShoppingBag fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`#${o.id} · ${o.table}`}
                    secondary={`${o.status} · $${o.total.toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" fullWidth>
                View All
              </Button>
              <Button variant="outlined" fullWidth startIcon={<Print />}>
                Print Last
              </Button>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, height: 360 }}>
            <SectionHeader title="Team on Shift" />
            <List dense>
              {employees.map((e, i) => (
                <ListItem
                  key={i}
                  secondaryAction={
                    <Chip size="small" label={`${e.orders} orders`} />
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={`https://i.pravatar.cc/150?img=${i + 10}`} />
                  </ListItemAvatar>
                  <ListItemText primary={e.name} secondary="Waiter" />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={1}>
              <Chip icon={<People />} label={`${kpis.staffOnShift} on shift`} />
              <Chip
                icon={<StarRate />}
                label={`${kpis.rating}★ rating`}
                color="warning"
              />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row: Inventory + Tables Snapshot */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, height: 300 }}>
            <SectionHeader title="Inventory Alerts" icon={<Inventory2 />} />
            <List dense>
              {inventoryAlerts.map((it, idx) => {
                const pct = Math.min(
                  100,
                  Math.round((it.level / it.threshold) * 100)
                );
                return (
                  <ListItem key={idx} sx={{ alignItems: "center" }}>
                    <ListItemAvatar>
                      <Avatar variant="rounded">📦</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={it.item}
                      secondary={`Level: ${it.level} / ${it.threshold}`}
                    />
                    <Box sx={{ minWidth: 120 }}>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{ borderRadius: 999 }}
                      />
                    </Box>
                  </ListItem>
                );
              })}
            </List>
            <Divider sx={{ my: 1.5 }} />
            <Button size="small" variant="outlined">
              Open Inventory
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, height: 300 }}>
            <SectionHeader title="Tables Snapshot" icon={<TableRestaurant />} />
            <Grid container spacing={1.5}>
              {tableSnapshot.map((t, i) => (
                <Grid key={i} item xs={3} sm={2.4} md={2.4} lg={1.7}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      textAlign: "center",
                      bgcolor:
                        t.status === "Occupied"
                          ? "#fdecea"
                          : t.status === "Reserved"
                          ? "#fff7e6"
                          : "#f0fdf4",
                      border: "1px solid",
                      borderColor:
                        t.status === "Occupied"
                          ? "error.light"
                          : t.status === "Reserved"
                          ? "warning.light"
                          : "success.light",
                    }}
                  >
                    <Typography fontWeight={700}>{t.number}</Typography>
                    <Chip
                      size="small"
                      label={t.status}
                      sx={{ mt: 0.5 }}
                      color={
                        t.status === "Occupied"
                          ? "error"
                          : t.status === "Reserved"
                          ? "warning"
                          : "success"
                      }
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ————————————————————————————————————————————
// Helper Components
// ————————————————————————————————————————————
function KpiCard({ icon, label, value, sub }) {
  return (
    <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, height: "100%" }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <Avatar
          variant="rounded"
          sx={{ bgcolor: "primary.main", color: "white" }}
        >
          {icon}
        </Avatar>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="h5" fontWeight={800}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Card>
  );
}

function SectionHeader({ title, action, icon }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 1.5,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {icon && (
          <Avatar variant="rounded" sx={{ width: 28, height: 28 }}>
            {icon}
          </Avatar>
        )}
        <Typography variant="subtitle1" fontWeight={800}>
          {title}
        </Typography>
      </Stack>
      {action || null}
    </Box>
  );
}
