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
  Pagination,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  IconButton,
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
  Article,
  GridOn,
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const { selectedRestaurant, role } = useRestaurantStore();
  const { settings } = useSettings();
  const { canAccess } = useFeatureGate();
  
  const { 
    kpis, 
    revenueData, 
    topItems, 
    categoryData,
    staffPerformance, 
    paymentAnalysis,
    peakHours,
    fetchDashboardData,
    loading 
  } = useAnalyticsStore();

  const { 
    notifications, 
    fetchNotifications, 
    subscribeToNotifications, 
    unsubscribe 
  } = useNotificationStore();
  
  const refreshData = async (manual = false) => {
    if (!selectedRestaurant?.id) return;
    setIsRefreshing(true);
    setShowPulse(true);
    try {
      await Promise.all([
        fetchDashboardData(selectedRestaurant.id, timeRange),
        fetchNotifications()
      ]);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setTimeout(() => setShowPulse(false), 800);
      }, 1000);
    }
  };

  useEffect(() => {
    if (selectedRestaurant?.id) {
      refreshData();
      subscribeToNotifications();
    }
    return () => unsubscribe();
  }, [selectedRestaurant?.id, timeRange]);

  useEffect(() => {
    if (!autoRefresh || !selectedRestaurant?.id) return;
    const interval = setInterval(() => {
      refreshData();
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

  const getReportTitle = () => `Admin Dashboard Report (${timeRange.toUpperCase()})`;

  const getFullExportData = () => {
    const summary = [
      { Metric: "Total Revenue", Value: formatCurrency(kpis.revenue.current) },
      { Metric: "Total Orders", Value: kpis.orders.current },
      { Metric: "Avg Order Value", Value: formatCurrency(kpis.avgOrderValue.current) },
      { Metric: "Period", Value: timeRange },
      { Metric: "Export Date", Value: new Date().toLocaleString() }
    ];

    const trends = revenueData.map(item => ({
      Time: item.time,
      Revenue: item.revenue,
      Orders: item.orders
    }));

    const items = topItems.map((item, i) => ({
      Rank: i + 1,
      Name: item.name,
      Sold: item.sold,
      Revenue: item.revenue
    }));

    const staff = staffPerformance.map(staff => ({
      Name: staff.name,
      Orders: staff.orders,
      Revenue: staff.revenue
    }));

    return { summary, trends, items, staff };
  };

  const handleExportCSV = () => {
    const { summary, trends } = getFullExportData();
    // Combined summary and trends for CSV
    const combined = [...summary.map(s => ({ Type: "SUMMARY", Name: s.Metric, Value: s.Value })), ...trends.map(t => ({ Type: "TREND", Name: t.Time, Value: t.Revenue }))];
    exportToCSV(combined, `admin_dashboard_${timeRange}`);
    handleExportClose();
  };

  const handleExportExcel = () => {
    const { summary, trends, items, staff } = getFullExportData();
    exportToExcel({
      Summary: summary,
      Trends: trends,
      "Top Items": items,
      Staff: staff
    }, `admin_dashboard_${timeRange}`);
    handleExportClose();
  };

  const handleExportTXT = () => {
    const { summary } = getFullExportData();
    exportToTXT(summary, `admin_dashboard_summary_${timeRange}`);
    handleExportClose();
  };

  const handleExportPDF = () => {
    const { summary, trends, items, staff } = getFullExportData();
    exportToPDF([
      { title: "Summary KPIs", data: summary },
      { title: "Revenue Trends", data: trends },
      { title: "Top Selling Items", data: items },
      { title: "Staff Performance", data: staff }
    ], `admin_dashboard_${timeRange}`, getReportTitle());
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
              >
                  Export
              </Button>
          </Box>
        )}
        <Stack direction="row" spacing={0} sx={{ 
          flex: 1,
          bgcolor: 'background.paper',
          p: 0.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(_e, v) => v && setTimeRange(v)}
              size="small"
              sx={{ border: 'none', '& .MuiToggleButton-root': { border: 'none', borderRadius: 1.5, px: 2 } }}
            >
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
            </ToggleButtonGroup>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 20, my: 'auto' }} />
            
            {isMobile ? (
              <Box sx={{ position: 'relative' }}>
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
                      },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <Refresh 
                      sx={{ 
                        fontSize: 18,
                        animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                      }} 
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Button
                  variant={autoRefresh ? "contained" : "outlined"}
                  color="primary"
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
                    borderRadius: 1.5,
                    minWidth: 90,
                    position: 'relative',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      right: -4,
                      bottom: -4,
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
            )}
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

        {/* Peak Operating Hours */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                ⏰ Peak Operating Hours
              </Typography>
              <Box sx={{ flex: 1, minHeight: 300 }}>
                {peakHours.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={peakHours}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hour" fontSize={10} />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="orders" fill="#ff9800" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyState 
                    title="No Traffic Data" 
                    description="Traffic patterns will appear here" 
                    emoji="⏰"
                    height={260}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Financial Insights */}
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            💰 Financial Insights
        </Typography>
        <Grid container spacing={3}>
            {/* Payment Methods */}
            <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, height: '100%', minHeight: 350 }}>
                    <CardContent>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Payment Method Breakdown
                        </Typography>
                        <Box sx={{ height: 280 }}>
                            {paymentAnalysis.total > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Cash', value: paymentAnalysis.cash },
                                                { name: 'Card', value: paymentAnalysis.card },
                                                { name: 'Momo', value: paymentAnalysis.momo },
                                                { name: 'Online', value: paymentAnalysis.online },
                                            ].filter(p => p.value > 0)}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                        >
                                            <Cell fill="#4caf50" />
                                            <Cell fill="#1976d2" />
                                            <Cell fill="#ff9800" />
                                            <Cell fill="#9c27b0" />
                                        </Pie>
                                        <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState title="No Payment Data" description="Payment splits will show here" emoji="💳" height={240} />
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Category Performance */}
            <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, height: '100%', minHeight: 350 }}>
                    <CardContent>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Revenue by Category
                        </Typography>
                        <Box sx={{ height: 280 }}>
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                        <RechartsTooltip formatter={(value) => `${value}%`} />
                                        <Bar dataKey="value" fill="#9c27b0" radius={[0, 4, 4, 0]} barSize={25}>
                                            {categoryData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState title="No Category Data" description="Most popular categories will show here" emoji="🍽️" height={240} />
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
      </Box>
      {/* Export Menu (for Desktop Button) */}
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
              <ListItemIcon><GridOn fontSize="small" /></ListItemIcon>
              Export Excel (XLSX)
          </MenuItem>
          <MenuItem onClick={handleExportTXT}>
              <ListItemIcon><Article fontSize="small" /></ListItemIcon>
              Export Plain Text (TXT)
          </MenuItem>
          <MenuItem onClick={handleExportPDF}>
              <ListItemIcon><Print fontSize="small" /></ListItemIcon>
              Export PDF (Table)
          </MenuItem>
      </Menu>

      {/* Mobile Export SpeedDial */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Export Options"
          sx={{ position: "fixed", bottom: 24, left: 24 }}
          icon={<SpeedDialIcon icon={<Download />} />}
          direction="up"
        >
          <SpeedDialAction
            icon={<FileDownload />}
            tooltipTitle="CSV"
            onClick={handleExportCSV}
          />
          <SpeedDialAction
            icon={<GridOn />}
            tooltipTitle="Excel"
            onClick={handleExportExcel}
          />
          <SpeedDialAction
            icon={<Article />}
            tooltipTitle="TXT"
            onClick={handleExportTXT}
          />
          <SpeedDialAction
            icon={<Print />}
            tooltipTitle="PDF"
            onClick={handleExportPDF}
          />
        </SpeedDial>
      )}
    </Box>
  );
};

export default AdminDashboard;
