import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import {
  TrendingUp,
  ShoppingCart,
  Group,
  RestaurantMenu,
  Settings,
  Assignment,
  Notifications as NotificationsIcon,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Refresh,
  Download,
  Print,
  FileDownload,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import DashboardHeader from "./components/dashboard-header";
import { useAnalyticsStore } from "../../lib/analyticsStore";
import useRestaurantStore from "../../lib/restaurantStore";
import useNotificationStore from "../../lib/notificationStore";
import { formatCurrency } from "../../utils/currency";
import { exportToCSV, exportToPDF } from "../../utils/exportUtils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const COLORS = ["#1976d2", "#ff9800", "#4caf50", "#f44336", "#9c27b0", "#00bcd4"];

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState("today");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const { selectedRestaurant } = useRestaurantStore();
  
  const { 
    kpis, 
    revenueData, 
    topItems, 
    staffPerformance, 
    fetchDashboardData,
    loading 
  } = useAnalyticsStore();

  const { 
    notifications, 
    fetchNotifications, 
    subscribeToNotifications, 
    unsubscribe 
  } = useNotificationStore();

  useEffect(() => {
    if (selectedRestaurant?.id) {
      fetchDashboardData(selectedRestaurant.id, timeRange);
      fetchNotifications();
      subscribeToNotifications();
    }
    return () => unsubscribe();
  }, [selectedRestaurant?.id, timeRange]);

  useEffect(() => {
    if (!autoRefresh || !selectedRestaurant?.id) return;
    const interval = setInterval(() => {
      fetchDashboardData(selectedRestaurant.id, timeRange);
    }, 60000); // 1 minute refresh
    return () => clearInterval(interval);
  }, [autoRefresh, selectedRestaurant?.id, timeRange]);

  const handleRefresh = () => {
    if (selectedRestaurant?.id) {
        fetchDashboardData(selectedRestaurant.id, timeRange);
        fetchNotifications();
    }
  };

  const getNotificationIcon = (priority: string, type: string) => {
    if (priority === 'urgent') return <ErrorIcon color="error" />;
    if (priority === 'high') return <Warning color="warning" />;
    if (type === 'success') return <CheckCircle color="success" />;
    return <Info color="info" />;
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExportCSV = () => {
    exportToCSV(revenueData, `revenue_data_${timeRange}`);
    handleExportClose();
  };

  const handleExportPDF = () => {
    exportToPDF();
    handleExportClose();
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <DashboardHeader
            title="Admin Dashboard"
            description={`Performance overview for ${selectedRestaurant?.name}`}
            background="linear-gradient(135deg, rgba(25,118,210,1) 0%, rgba(0,200,150,1) 100%)"
            color="#fff"
            action={
                <Box>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        startIcon={<Download />}
                        onClick={handleExportClick}
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }, backdropFilter: 'blur(10px)' }}
                    >
                        Export
                    </Button>
                    <Menu
                        anchorEl={exportAnchorEl}
                        open={Boolean(exportAnchorEl)}
                        onClose={handleExportClose}
                    >
                        <MenuItem onClick={handleExportCSV}>
                            <ListItemIcon><FileDownload fontSize="small" /></ListItemIcon>
                            Export Data (CSV)
                        </MenuItem>
                        <MenuItem onClick={handleExportPDF}>
                            <ListItemIcon><Print fontSize="small" /></ListItemIcon>
                            Print Dashboard (PDF)
                        </MenuItem>
                    </Menu>
                </Box>
            }
        />
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(_e, v) => v && setTimeRange(v)}
              size="small"
              sx={{ bgcolor: 'background.paper' }}
            >
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
             <Button
                variant={autoRefresh ? "contained" : "outlined"}
                startIcon={<Refresh />}
                onClick={handleRefresh}
                size="small"
                sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.default' } }}
              >
                Refresh
              </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3}>
        {[
          {
            title: "Total Revenue",
            value: formatCurrency(kpis.revenue.current),
            icon: <TrendingUp />,
            color: "#1976d2",
            subtitle: `${kpis.revenue.change >= 0 ? '+' : ''}${kpis.revenue.change.toFixed(1)}% vs previous`
          },
          {
            title: "Orders",
            value: kpis.orders.current,
            icon: <ShoppingCart />,
            color: "#ff9800",
             subtitle: `${kpis.orders.change >= 0 ? '+' : ''}${kpis.orders.change.toFixed(1)}% vs previous`
          },
          {
            title: "Active Staff",
            value: staffPerformance.length,
            icon: <Group />,
            color: "#4caf50",
            subtitle: "On duty"
          },
          {
            title: "Top Item",
            value: topItems?.[0]?.name || "N/A",
            icon: <RestaurantMenu />,
            color: "#f44336",
            subtitle: "Best seller"
          },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                background: item.color,
                color: "#fff",
                boxShadow: "none",
                height: '100%'
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,0.3)" }}>
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>{item.title}</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {item.value}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {item.subtitle}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts & Insights */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Sales Trends */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📈 Revenue Trends
              </Typography>
              <Box sx={{ flex: 1, minHeight: 300 }}>
                {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#1976d2" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography color="text.secondary">No revenue data available</Typography>
                    </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Selling Items (Pie) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🍕 Top Items by Revenue
              </Typography>
              <Box sx={{ flex: 1, minHeight: 300 }}>
                {topItems.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={topItems}
                            dataKey="revenue"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                        >
                            {topItems.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                 ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography color="text.secondary">No sales data available</Typography>
                    </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Staff Performance + Notifications */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Staff Performance */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                👩‍🍳 Staff Performance (Sales)
              </Typography>
              <Box sx={{ flex: 1, minHeight: 300 }}>
                 {staffPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={staffPerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="revenue" fill="#4caf50" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                 ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography color="text.secondary">No staff performance data</Typography>
                    </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications / Tasks */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🔔 Recent Notifications
              </Typography>
              <List sx={{ flex: 1, overflowY: 'auto', maxHeight: 300 }}>
                {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((n) => (
                        <React.Fragment key={n.id}>
                            <ListItem alignItems="flex-start">
                            <Box sx={{ mr: 2, mt: 0.5 }}>
                                {getNotificationIcon(n.notification?.priority || 'normal', n.notification?.type || 'info')}
                            </Box>
                            <ListItemText
                                primary={n.notification?.title}
                                secondary={
                                    <React.Fragment>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            {n.notification?.message}
                                        </Typography>
                                        <br />
                                        <Typography variant="caption" color="text.secondary">
                                            {dayjs(n.created_at).fromNow()}
                                        </Typography>
                                    </React.Fragment>
                                }
                            />
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))
                ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">No new notifications</Typography>
                    </Box>
                )}
              </List>
              <Button fullWidth size="small" sx={{ mt: 1 }}>View All Notifications</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {[
          { label: "Manage Staff", icon: <Group /> },
          { label: "Manage Menu", icon: <RestaurantMenu /> },
          { label: "Reports", icon: <Assignment /> },
          { label: "Settings", icon: <Settings /> },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                textAlign: "center",
                "&:hover": { background: alpha(theme.palette.primary.main, 0.05), cursor: "pointer" },
                transition: 'all 0.2s'
              }}
            >
              <CardContent>
                <Box sx={{ fontSize: 40, color: "#1976d2", mb: 1 }}>
                  {item.icon}
                </Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {item.label}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Button size="small" variant="outlined">
                  Open
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
