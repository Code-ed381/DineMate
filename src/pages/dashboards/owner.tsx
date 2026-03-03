import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Stack,
  Alert,
  useTheme,
  alpha,
  ListItemAvatar,
  ListItemText,
  List,
  ListItem,
  useMediaQuery,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  AttachMoney,
  People,
  Schedule,
  Warning,
  Refresh,
  GetApp,
  ChevronRight,
} from "@mui/icons-material";
import {
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
  BarChart,
  Bar,
} from "recharts";

import { useNavigate } from "react-router-dom";
import { useAnalyticsStore } from "../../lib/analyticsStore";
import useRestaurantStore from "../../lib/restaurantStore";
import { formatCurrency } from "../../utils/currency";
import MetricCard from "../../components/MetricCard";


const EnhancedOwnerDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [timeRange, setTimeRange] = useState("week");
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "orders">("revenue");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { selectedRestaurant } = useRestaurantStore();
  const { 
    kpis, 
    revenueData, 
    topItems, 
    categoryData, 
    staffPerformance, 
    fetchDashboardData,
    loading 
  } = useAnalyticsStore();

  useEffect(() => {
    if (selectedRestaurant?.id) {
      fetchDashboardData(selectedRestaurant.id, timeRange);
      setLastUpdate(new Date());
    }
  }, [selectedRestaurant?.id, timeRange, fetchDashboardData]);

  useEffect(() => {
    if (!autoRefresh || !selectedRestaurant?.id) return;
    const interval = setInterval(() => {
      fetchDashboardData(selectedRestaurant.id, timeRange);
      setLastUpdate(new Date());
    }, 30000); // 30 seconds for real data refresh
    return () => clearInterval(interval);
  }, [autoRefresh, selectedRestaurant?.id, timeRange, fetchDashboardData]);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
  ];

  if (loading) {
    return (
       <Box sx={{ width: '100%', p: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
            Aggregating restaurant performance data...
          </Typography>
       </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          mb={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
              Owner Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time insights and performance analytics for {selectedRestaurant?.name}
            </Typography>
          </Box>
          <Stack 
            direction={{ xs: "column", sm: "row" }} 
            spacing={1} 
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant={autoRefresh ? "contained" : "outlined"}
                startIcon={<Refresh />}
                onClick={() => setAutoRefresh(!autoRefresh)}
                size="small"
                fullWidth={isMobile}
              >
                {autoRefresh ? "Live" : "Paused"}
              </Button>
              <Button variant="outlined" startIcon={<GetApp />} size="small" fullWidth={isMobile}>
                Export
              </Button>
            </Stack>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(_e, v) => v && setTimeRange(v)}
              size="small"
              fullWidth
            >
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(kpis.revenue.current)}
            change={kpis.revenue.change}
            icon={<AttachMoney />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Orders Completed"
            value={kpis.orders.current}
            change={kpis.orders.change}
            icon={<ShoppingBag />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(kpis.avgOrderValue.current)}
            change={kpis.avgOrderValue.change}
            icon={<TrendingUp />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Staff"
            value={staffPerformance.length}
            subtitle="Handling current orders"
            icon={<People />}
            color="warning"
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
                    Order Trends
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Performance over the selected period
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  value={selectedMetric}
                  exclusive
                  onChange={(_e, v) => v && setSelectedMetric(v)}
                  size="small"
                >
                  <ToggleButton value="revenue">Revenue</ToggleButton>
                  <ToggleButton value="orders">Orders</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                {revenueData.length > 0 ? (
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
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        fill="url(#colorMetric)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography color="text.secondary">No order data for this period</Typography>
                  </Box>
                )}
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
                  Items distribution
                </Typography>
              </Box>
              <Box sx={{ height: 240, flexShrink: 0 }}>
                {categoryData.length > 0 ? (
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
                        {categoryData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                     <Typography color="text.secondary">No data</Typography>
                  </Box>
                )}
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
                            bgcolor: COLORS[idx % COLORS.length],
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
                  Top Items
                </Typography>
                <Button size="small" endIcon={<ChevronRight />} onClick={() => navigate('/app/menu')}>
                  Menu
                </Button>
              </Stack>
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                {topItems.length > 0 ? (
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
                          secondary={`${item.sold} items sold`}
                        />
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(item.revenue)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                     <Typography color="text.secondary">No item data yet</Typography>
                  </Box>
                )}
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
                Staff Performance
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                {staffPerformance.length > 0 ? (
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
                          {formatCurrency(staff.revenue)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                   <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">No staff activity recorded</Typography>
                   </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedOwnerDashboard;
