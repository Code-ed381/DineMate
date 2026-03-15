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
  useMediaQuery,
  Fab,
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
import EmptyState from "../../components/empty-state";
import { useAnalyticsStore } from "../../lib/analyticsStore";
import useRestaurantStore from "../../lib/restaurantStore";
import useNotificationStore from "../../lib/notificationStore";
import { formatCurrency } from "../../utils/currency";
import { exportToCSV, exportToPDF, exportToExcel, exportToTXT } from "../../utils/exportUtils";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Swal from "sweetalert2";
import { useSettings } from "../../providers/settingsProvider";
import { useFeatureGate } from "../../hooks/useFeatureGate";

dayjs.extend(relativeTime);

const COLORS = ["#1976d2", "#ff9800", "#4caf50", "#f44336", "#9c27b0", "#00bcd4"];

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [timeRange, setTimeRange] = useState("today");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const { selectedRestaurant, role } = useRestaurantStore();
  const { settings } = useSettings();
  const { canAccess } = useFeatureGate();
  
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
      fetchNotifications();
    }, 30000); // 30 seconds refresh to match owner dashboard
    return () => clearInterval(interval);
  }, [autoRefresh, selectedRestaurant?.id, timeRange, fetchDashboardData, fetchNotifications]);

  const getNotificationIcon = (priority: string, type: string) => {
    if (priority === 'urgent') return <ErrorIcon color="error" />;
    if (priority === 'high') return <Warning color="warning" />;
    if (type === 'success') return <CheckCircle color="success" />;
    return <Info color="info" />;
  };

  const handleExportClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canAccess("canUseCsvExport")) {
      import("sweetalert2").then(m => m.default.fire("Upgrade Required", "Please upgrade your plan to export data.", "info"));
      return;
    }
    setExportAnchorEl(e.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const getExportData = () => {
    return revenueData.map(item => ({
        Time: item.time,
        Revenue: item.revenue
    }));
  };

  const handleExportCSV = () => {
    exportToCSV(getExportData(), `revenue_data_${timeRange}`);
    handleExportClose();
  };

  const handleExportExcel = () => {
    exportToExcel(getExportData(), `revenue_data_${timeRange}`);
    handleExportClose();
  };

  const handleExportTXT = () => {
    exportToTXT(getExportData(), `revenue_data_${timeRange}`);
    handleExportClose();
  };

  const handleExportPDF = () => {
    exportToPDF(getExportData(), `revenue_data_${timeRange}`, "Revenue Trends Overview");
    handleExportClose();
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, minHeight: "100vh" }}>
      {/* KPI Cards - Now First Row */}
      <Grid container spacing={2} sx={{ mb: { xs: 1.5, md: 3 } }}>
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
          <Grid item xs={6} sm={6} md={3} key={i}>
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

      {/* Controls - Now Second Row */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: { xs: 1.5, md: 3 } }}>
        {!isMobile && (
          <Box>
              <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Download />}
                  onClick={handleExportClick}
                  fullWidth={isMobile}
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
                  <MenuItem onClick={handleExportExcel}>
                      <ListItemIcon><FileDownload fontSize="small" /></ListItemIcon>
                      Export Excel (XLSX)
                  </MenuItem>
                  <MenuItem onClick={handleExportTXT}>
                      <ListItemIcon><FileDownload fontSize="small" /></ListItemIcon>
                      Export Plain Text (TXT)
                  </MenuItem>
                  <MenuItem onClick={handleExportPDF}>
                      <ListItemIcon><Print fontSize="small" /></ListItemIcon>
                      Export PDF (Table)
                  </MenuItem>
              </Menu>
          </Box>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(_e, v) => v && setTimeRange(v)}
              size="small"
              sx={{ bgcolor: 'background.paper', display: 'flex', width: '100%' }}
            >
              <ToggleButton value="today" sx={{ flex: 1 }}>Today</ToggleButton>
              <ToggleButton value="week" sx={{ flex: 1 }}>Week</ToggleButton>
              <ToggleButton value="month" sx={{ flex: 1 }}>Month</ToggleButton>
            </ToggleButtonGroup>
             <Button
                variant={autoRefresh ? "contained" : "outlined"}
                color="primary"
                startIcon={<Refresh />}
                onClick={() => setAutoRefresh(!autoRefresh)}
                size="small"
                fullWidth={isMobile}
                sx={{ 
                  bgcolor: autoRefresh ? 'primary.main' : 'background.paper', 
                  color: autoRefresh ? 'white' : 'primary.main',
                  '&:hover': { bgcolor: autoRefresh ? 'primary.dark' : 'background.default' } 
                }}
              >
                {autoRefresh ? "Live" : "Paused"}
              </Button>
        </Stack>
      </Box>

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
                    <EmptyState 
                    title="No Revenue" 
                    description="No revenue data available" 
                    emoji="📊"
                    height={260}
                  />)}
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
                    <EmptyState 
                    title="No Sales" 
                    description="No sales data available" 
                    emoji="🍳"
                    height={260}
                  />)}
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
                    <EmptyState 
                    title="No Activity" 
                    description="No staff performance data" 
                    emoji="👥"
                    height={260}
                  />)}
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
                            <Box sx={{ mb: { xs: 1.5, md: 2 }, mt: 0.5 }}>
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
                    <EmptyState 
                    title="All Caught Up" 
                    description="No new notifications" 
                    emoji="🔔"
                    height={200}
                  />
                )}
              </List>
              <Button fullWidth size="small" sx={{ mt: 1 }}>View All Notifications</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Quick Actions
        </Typography>
        <Grid container spacing={2}>
            {[
            { label: "Manage Staff", icon: <Group />, desc: "Add or edit staff members", link: "/app/employees" },
            { label: "Manage Menu", icon: <RestaurantMenu />, desc: "Update menu items and categories", link: "/app/menu-items-management" },
            { label: "Sales Reports", icon: <Assignment />, desc: "View detailed financial reports", link: "/app/report" },
            { label: "System Settings", icon: <Settings />, desc: "Configure restaurant details", link: "/app/settings" },
            ].map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
                <Card
                onClick={() => {
                    if (item.link === "/app/report" && role === "admin" && !settings?.employee_permissions?.admins_view_report) {
                        Swal.fire({
                            title: "Access Denied",
                            text: "You do not have permission to view sales reports. Please contact your restaurant owner.",
                            icon: "warning",
                            confirmButtonColor: theme.palette.primary.main
                        });
                        return;
                    }
                    navigate(item.link);
                }}
                sx={{
                    mb: { xs: 1.5, md: 2 }, 
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: "pointer",
                    border: '1px solid transparent',
                    "&:hover": { 
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        border: `1px solid ${theme.palette.primary.main}`,
                        transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                }}
                >
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                        {item.icon}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {item.desc}
                        </Typography>
                    </Box>
                </Card>
            </Grid>
            ))}
        </Grid>
      </Box>
      {/* Mobile Export FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="export"
          onClick={handleExportClick}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1100,
          }}
        >
          <Download />
        </Fab>
      )}
    </Box>
  );
};

export default AdminDashboard;
