import React, { useState, useEffect, useMemo } from "react";
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
  Stack,
  Paper,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  AttachMoney,
  People,
  Schedule,
  Warning,
  EmojiEvents,
  Refresh,
  GetApp,
  ChevronRight,
  Speed,
  Restaurant,
  Inventory,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function EnhancedOwnerDashboard() {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState("week");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Enhanced KPIs with comparisons
  const kpis = useMemo(
    () => ({
      revenue: {
        current: 12847.5,
        previous: 11240.3,
        change: 14.3,
        target: 15000,
      },
      orders: {
        current: 187,
        previous: 165,
        change: 13.3,
        avgValue: 68.7,
      },
      customers: {
        current: 342,
        previous: 298,
        change: 14.8,
        returning: 62,
      },
      efficiency: {
        avgPrepTime: 14.2,
        previous: 16.8,
        change: -15.5,
        tableUtilization: 78,
      },
    }),
    []
  );

  // Revenue data
  const revenueData = useMemo(() => {
    const data =
      timeRange === "today"
        ? [
            { time: "9AM", revenue: 420, orders: 12, customers: 18 },
            { time: "11AM", revenue: 1240, orders: 28, customers: 42 },
            { time: "1PM", revenue: 2540, orders: 52, customers: 78 },
            { time: "3PM", revenue: 1120, orders: 24, customers: 32 },
            { time: "5PM", revenue: 1380, orders: 32, customers: 48 },
            { time: "7PM", revenue: 3240, orders: 64, customers: 96 },
          ]
        : timeRange === "week"
        ? [
            { time: "Mon", revenue: 8420, orders: 142, customers: 218 },
            { time: "Tue", revenue: 9240, orders: 156, customers: 245 },
            { time: "Wed", revenue: 7890, orders: 128, customers: 198 },
            { time: "Thu", revenue: 10530, orders: 178, customers: 276 },
            { time: "Fri", revenue: 14840, orders: 234, customers: 362 },
            { time: "Sat", revenue: 16210, orders: 268, customers: 412 },
            { time: "Sun", revenue: 13670, orders: 218, customers: 334 },
          ]
        : [
            { time: "Week 1", revenue: 58420, orders: 982, customers: 1542 },
            { time: "Week 2", revenue: 62760, orders: 1056, customers: 1678 },
            { time: "Week 3", revenue: 59540, orders: 1018, customers: 1598 },
            { time: "Week 4", revenue: 64340, orders: 1092, customers: 1724 },
          ];
    return data;
  }, [timeRange]);

  // Category performance
  const categoryData = [
    { name: "Pizza", value: 38, revenue: 4880 },
    { name: "Burgers", value: 22, revenue: 2826 },
    { name: "Pasta", value: 18, revenue: 2312 },
    { name: "Salads", value: 12, revenue: 1542 },
    { name: "Beverages", value: 10, revenue: 1285 },
  ];

  // Staff performance
  const staffPerformance = [
    { name: "Alice", orders: 42, revenue: 2890, rating: 4.8 },
    { name: "John", orders: 38, revenue: 2610, rating: 4.6 },
    { name: "Mei", orders: 35, revenue: 2405, rating: 4.9 },
    { name: "Kwame", orders: 32, revenue: 2198, rating: 4.7 },
    { name: "Sarah", orders: 29, revenue: 1995, rating: 4.5 },
  ];

  // Top items
  const topItems = [
    { name: "Margherita Pizza", sold: 132, revenue: 1716 },
    { name: "Classic Burger", sold: 118, revenue: 1534 },
    { name: "Spaghetti", sold: 94, revenue: 1222 },
    { name: "Caesar Salad", sold: 80, revenue: 1040 },
    { name: "Lemonade", sold: 156, revenue: 624 },
  ];

  // Peak hours
  const peakHoursData = [
    { hour: "Breakfast", orders: 45, capacity: 80 },
    { hour: "Lunch", orders: 156, capacity: 180 },
    { hour: "Afternoon", orders: 42, capacity: 100 },
    { hour: "Dinner", orders: 178, capacity: 200 },
  ];

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Owner Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time insights and performance analytics
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant={autoRefresh ? "contained" : "outlined"}
              startIcon={<Refresh />}
              onClick={() => setAutoRefresh(!autoRefresh)}
              size="small"
            >
              {autoRefresh ? "Live" : "Paused"}
            </Button>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(e, v) => v && setTimeRange(v)}
              size="small"
            >
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="outlined" startIcon={<GetApp />} size="small">
              Export
            </Button>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Typography>
      </Box>

      {/* Alerts */}
      <Stack spacing={1} mb={3}>
        <Alert severity="warning" icon={<Warning />}>
          Low stock: Mozzarella (6 units remaining)
        </Alert>
      </Stack>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={`$${kpis.revenue.current.toLocaleString()}`}
            change={kpis.revenue.change}
            target={kpis.revenue.target}
            icon={<AttachMoney />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Orders Completed"
            value={kpis.orders.current}
            change={kpis.orders.change}
            subtitle={`Avg. $${kpis.orders.avgValue}`}
            icon={<ShoppingBag />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Customers"
            value={kpis.customers.current}
            change={kpis.customers.change}
            subtitle={`${kpis.customers.returning}% returning`}
            icon={<People />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Prep Time"
            value={`${kpis.efficiency.avgPrepTime}m`}
            change={kpis.efficiency.change}
            subtitle={`${kpis.efficiency.tableUtilization}% table util.`}
            icon={<Schedule />}
            color="warning"
            inverseGood
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={3}>
        {/* Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: 450, display: "flex", flexDirection: "column" }}>
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                flexShrink={0}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Revenue & Performance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track performance over time
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  value={selectedMetric}
                  exclusive
                  onChange={(e, v) => v && setSelectedMetric(v)}
                  size="small"
                >
                  <ToggleButton value="revenue">Revenue</ToggleButton>
                  <ToggleButton value="orders">Orders</ToggleButton>
                  <ToggleButton value="customers">Customers</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient
                        id="colorMetric"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={theme.palette.primary.main}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={theme.palette.primary.main}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.divider}
                    />
                    <XAxis
                      dataKey="time"
                      stroke={theme.palette.text.secondary}
                    />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      fill="url(#colorMetric)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Pie */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 450, display: "flex", flexDirection: "column" }}>
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box flexShrink={0} mb={2}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Category Mix
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sales distribution
                </Typography>
              </Box>
              <Box sx={{ height: 240, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", mt: 2 }}>
                <Stack spacing={1}>
                  {categoryData.map((cat, idx) => (
                    <Stack
                      key={idx}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: COLORS[idx],
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2">{cat.name}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={700}>
                        {cat.value}%
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Grid */}
      <Grid container spacing={3} mb={3}>
        {/* Top Items */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 450, display: "flex", flexDirection: "column" }}>
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                flexShrink={0}
              >
                <Typography variant="h6" fontWeight={700}>
                  Top Performers
                </Typography>
                <Button size="small" endIcon={<ChevronRight />}>
                  View All
                </Button>
              </Stack>
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <List>
                  {topItems.map((item, idx) => (
                    <ListItem key={idx} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                          }}
                        >
                          #{idx + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.sold} sold`}
                      />
                      <Typography variant="body2" fontWeight={700}>
                        ${item.revenue}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Staff Performance */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 450, display: "flex", flexDirection: "column" }}>
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Typography variant="h6" fontWeight={700} mb={2} flexShrink={0}>
                Team Performance
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <List>
                  {staffPerformance.map((staff, idx) => (
                    <ListItem
                      key={idx}
                      sx={{
                        px: 2,
                        py: 1.5,
                        mb: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={staff.name}
                        secondary={
                          <Stack direction="row" spacing={1} component="span">
                            <Typography variant="caption" component="span">
                              {staff.orders} orders
                            </Typography>
                            <Typography variant="caption" component="span">
                              •
                            </Typography>
                            <Typography variant="caption" component="span">
                              ⭐ {staff.rating}
                            </Typography>
                          </Stack>
                        }
                      />
                      <Typography variant="body2" fontWeight={700}>
                        ${staff.revenue}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Peak Hours */}
      <Card sx={{ height: 350, display: "flex", flexDirection: "column" }}>
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2} flexShrink={0}>
            Peak Hours Analysis
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                />
                <XAxis dataKey="hour" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                  }}
                />
                <Bar
                  dataKey="orders"
                  fill={theme.palette.primary.main}
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="capacity"
                  fill={alpha(theme.palette.primary.main, 0.2)}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

function MetricCard({
  title,
  value,
  change,
  target,
  subtitle,
  icon,
  color,
  inverseGood,
}) {
  const theme = useTheme();
  const isPositive = inverseGood ? change < 0 : change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const targetProgress = target
    ? (parseFloat(value.replace(/[$,]/g, "")) / target) * 100
    : 0;

  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: `${color}.main`,
            }}
          >
            {icon}
          </Avatar>
          {change && (
            <Chip
              icon={<TrendIcon />}
              label={`${Math.abs(change).toFixed(1)}%`}
              size="small"
              color={isPositive ? "success" : "error"}
              sx={{ fontWeight: 700 }}
            />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        {target && (
          <Box mt={2}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Target Progress
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {targetProgress.toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, targetProgress)}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
