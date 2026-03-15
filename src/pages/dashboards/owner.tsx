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
  Skeleton,
  Stack,
  Alert,
  useTheme,
  alpha,
  ListItemAvatar,
  ListItemText,
  List,
  ListItem,
  useMediaQuery,
  IconButton,
  Tooltip,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
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
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

import { useNavigate } from "react-router-dom";
import { useAnalyticsStore } from "../../lib/analyticsStore";
import EmptyState from "../../components/empty-state";
import useRestaurantStore from "../../lib/restaurantStore";
import { formatCurrency, getCurrencySymbol } from "../../utils/currency";
import MetricCard from "../../components/MetricCard";
import { useSettings } from "../../providers/settingsProvider";


const EnhancedOwnerDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { settings } = useSettings();
  const dashSettings = settings?.dashboard_settings;

  const isCompact = dashSettings?.compact_layout;
  const showRevenue = dashSettings?.show_revenue_card !== false;
  const showStats = dashSettings?.show_order_stats !== false;
  const showActions = dashSettings?.show_quick_actions !== false;

  const [timeRange, setTimeRange] = useState("today");
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "orders">("revenue");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { selectedRestaurant } = useRestaurantStore();
  const {
    kpis,
    revenueData,
    topItems,
    categoryData,
    staffPerformance,
    fetchDashboardData,
    loading,
    hasFetched
  } = useAnalyticsStore();

  const [showPulse, setShowPulse] = useState(false);

  const refreshData = async (manual = false) => {
    if (!selectedRestaurant?.id) return;
    setIsRefreshing(true);
    // Trigger pulse animation
    setShowPulse(true);
    try {
      await fetchDashboardData(selectedRestaurant.id, timeRange);
      setLastUpdate(new Date());
    } finally {
      // Keep animation for at least 1s
      setTimeout(() => {
        setIsRefreshing(false);
        // Fade out pulse slightly after refresh finishes
        setTimeout(() => setShowPulse(false), 800);
      }, 1000);
    }
  };

  useEffect(() => {
    if (selectedRestaurant?.id) {
      refreshData(false); // Initial load without toast unless user wants it
    }
  }, [selectedRestaurant?.id, timeRange, fetchDashboardData]);

  useEffect(() => {
    if (!autoRefresh || !selectedRestaurant?.id) return;
    // Immediate refresh when live is turned on
    refreshData(true);
    const interval = setInterval(() => {
      refreshData(false);
    }, 30000); // 30 seconds for real data refresh
    return () => clearInterval(interval);
  }, [autoRefresh, selectedRestaurant?.id]);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
  ];

  // Removed the skeleton block to avoid jarring UI shifts as per user request

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          mb={isCompact ? 1 : 2}
        >
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
              Owner Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time insights and performance analytics for {selectedRestaurant?.name}
            </Typography>
          </Box>
          {showActions && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              sx={{ width: '100%', mt: { xs: 1, md: 0 } }}
            >
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    fontWeight: 600,
                    borderRadius: 2,
                    '& .MuiSelect-select': {
                      py: 1,
                      px: { xs: 1.5, sm: 2 }
                    }
                  }}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                  <MenuItem value="year">Full Year</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="column" alignItems={{ xs: "flex-end", md: "flex-end" }} spacing={0.5}>
                <Stack direction="row" spacing={1}>
                  {isMobile ? (
                    <>
                      <Tooltip title={autoRefresh ? "Live - Click to Pause" : "Paused - Click to Resume"}>
                        <IconButton
                          onClick={() => {
                            const newState = !autoRefresh;
                            setAutoRefresh(newState);
                            if (newState) refreshData(true);
                          }}
                          size="small"
                          sx={{ 
                          border: '1px solid', 
                          borderColor: autoRefresh ? 'primary.main' : 'divider',
                          bgcolor: autoRefresh ? 'primary.main' : 'background.paper',
                          color: autoRefresh ? 'primary.contrastText' : 'text.secondary',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: -4,
                            left: -4,
                            right: -4,
                            bottom: -4,
                            borderRadius: '50%',
                            border: `2px solid ${theme.palette.primary.main}`,
                            opacity: 0,
                            animation: showPulse ? 'pulseFade 1.5s ease-out' : 'none',
                          },
                          '@keyframes pulseFade': {
                            '0%': { transform: 'scale(0.8)', opacity: 0 },
                            '40%': { transform: 'scale(1.1)', opacity: 0.6 },
                            '100%': { transform: 'scale(1.4)', opacity: 0 },
                          },
                          '&:hover': {
                            bgcolor: autoRefresh ? 'primary.dark' : alpha(theme.palette.primary.main, 0.04),
                            borderColor: autoRefresh ? 'primary.dark' : 'divider',
                          },
                          width: 36,
                          height: 36,
                          transition: 'all 0.2s ease-in-out'
                        }}
                        >
                          <Refresh 
                            sx={{ 
                              fontSize: 20,
                              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                              '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' },
                              }
                            }} 
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export Report">
                        <IconButton 
                          size="small"
                          sx={{ 
                            border: '1px solid', 
                            borderColor: 'divider',
                            bgcolor: 'background.paper'
                          }}
                        >
                          <GetApp sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Button
                        variant={autoRefresh ? "contained" : "outlined"}
                        startIcon={<Refresh sx={{ 
                          animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                          }
                        }} />}
                        onClick={() => {
                          const newState = !autoRefresh;
                          setAutoRefresh(newState);
                          if (newState) refreshData(true);
                        }}
                        size="small"
                        sx={{
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: -5,
                            left: -5,
                            right: -5,
                            bottom: -5,
                            borderRadius: 'inherit',
                            border: `2px solid ${theme.palette.primary.main}`,
                            opacity: 0,
                            animation: showPulse ? 'pulseFadeRect 1.5s ease-out' : 'none',
                          },
                          '@keyframes pulseFadeRect': {
                            '0%': { transform: 'scaleX(0.95) scaleY(0.85)', opacity: 0 },
                            '40%': { transform: 'scaleX(1.05) scaleY(1.1)', opacity: 0.5 },
                            '100%': { transform: 'scaleX(1.15) scaleY(1.3)', opacity: 0 },
                          }
                        }}
                      >
                        {autoRefresh ? "Live" : "Paused"}
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<GetApp />} 
                        size="small"
                      >
                        Export
                      </Button>
                    </>
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', opacity: 0.8, display: { xs: 'none', md: 'block' } }}>
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </Typography>
              </Stack>
            </Stack>
          )}
        </Stack>
        {/* Mobile-only Last Updated */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end', mt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} mb={isCompact ? 2 : 3}>
        {showRevenue && (
          <Grid item xs={6} sm={6} md={3}>
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(kpis.revenue.current)}
              change={kpis.revenue.change}
              icon={<AttachMoney />}
              color="primary"
            />
          </Grid>
        )}
        {showStats && (
          <>
            <Grid item xs={6} sm={6} md={3}>
              <MetricCard
                title="Orders Completed"
                value={kpis.orders.current}
                change={kpis.orders.change}
                icon={<ShoppingBag />}
                color="success"
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <MetricCard
                title="Avg Order Value"
                value={formatCurrency(kpis.avgOrderValue.current)}
                change={kpis.avgOrderValue.change}
                icon={<TrendingUp />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <MetricCard
                title="Active Staff"
                value={staffPerformance.length}
                subtitle="Handling current orders"
                icon={<People />}
                color="warning"
              />
            </Grid>
          </>
        )}
      </Grid>

      {showStats && (
        <>
          {/* Charts Row */}
          <Grid container spacing={2} mb={isCompact ? 2 : 3}>
            {/* Revenue Chart */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ height: { xs: 400, md: 450 }, display: "flex", flexDirection: "column" }}>
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    p: { xs: 2, sm: 3 }
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={{ xs: 1.5, sm: 0 }}
                    mb={2}
                    flexShrink={0}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Order Trends
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Performance over the selected period
                      </Typography>
                    </Box>
                    <ToggleButtonGroup
                      value={selectedMetric}
                      exclusive
                      onChange={(_e, v) => v && setSelectedMetric(v)}
                      size="small"
                      sx={{ 
                        alignSelf: { xs: 'stretch', sm: 'auto' },
                        '& .MuiToggleButton-root': { flex: { xs: 1, sm: 'initial' } }
                      }}
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
                            fontSize={12}
                            tick={{ fontSize: isMobile ? 10 : 12 }}
                          />
                          <YAxis 
                            stroke={theme.palette.text.secondary} 
                            fontSize={12}
                            tick={{ fontSize: isMobile ? 10 : 12 }}
                            width={isMobile ? 35 : 60}
                          />
                          <RechartsTooltip />
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
                      <EmptyState
                        title="No Trends"
                        description="No order data for this period"
                        emoji="📈"
                        height={300}
                      />)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Category Pie */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: { xs: 400, md: 450 }, display: "flex", flexDirection: "column" }}>
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    p: { xs: 2, sm: 3 }
                  }}
                >
                  <Box flexShrink={0} mb={2}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      Category Mix
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Items distribution
                    </Typography>
                  </Box>
                  <Box sx={{ height: { xs: 200, sm: 240 }, flexShrink: 0 }}>
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
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyState
                        title="No Data"
                        description="No category data available yet"
                        emoji="🍕"
                        height={300}
                      />)}
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
          <Grid container spacing={2} mb={isCompact ? 2 : 3}>
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
                    <Button size="small" endIcon={<ChevronRight />} onClick={() => navigate('/app/menu-items-management')}>
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
        </>
      )}
    </Box>
  );
};

export default EnhancedOwnerDashboard;
