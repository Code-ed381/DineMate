import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  Divider,
  useTheme,
  Paper,
} from "@mui/material";
import {
  TrendingUp,
  TableBar,
  AccessTime,
  MonetizationOn,
  ArrowBack,
  NotificationsActive,
  CalendarToday,
  Settings,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useMetricsStore from "../../lib/metricsStore";
import useAuthStore from "../../lib/authStore";
import DashboardHeader from "../dashboards/components/dashboard-header";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { formatCurrency } from "../../utils/currency";

const StatBox = ({ icon, label, value, color, secondary }: any) => (
  <Card sx={{ height: '100%', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
       {React.cloneElement(icon, { sx: { fontSize: 80 } })}
    </Box>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 48, height: 48 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight="900">
            {value}
          </Typography>
          {secondary && (
            <Typography variant="caption" color="text.secondary">
              {secondary}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const WaiterPerformance: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { metrics, loading, fetchWaiterMetrics } = useMetricsStore();
  const [timeRange, setTimeRange] = useState('7d');
  const [commissionRate, setCommissionRate] = useState(10);

  useEffect(() => {
    let start = dayjs().subtract(7, 'days').toISOString();
    if (timeRange === '30d') start = dayjs().subtract(30, 'days').toISOString();
    if (timeRange === 'today') start = dayjs().startOf('day').toISOString();
    
    fetchWaiterMetrics(start);
  }, [timeRange, fetchWaiterMetrics]);

  if (loading && !metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'background.paper' }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="900">
            Performance Insights
          </Typography>
          <Typography color="text.secondary">
            Analyze your efficiency and service metrics
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* --- Key Metrics --- */}
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            icon={<TableBar />} 
            label="Tables Served" 
            value={metrics?.totalTables || 0} 
            color="#2196f3"
            secondary="Total sessions handled"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            icon={<MonetizationOn />} 
            label="Total Revenue" 
            value={formatCurrency(metrics?.totalRevenue || 0)} 
            color="#4caf50"
            secondary="Sales contribution"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            icon={<AccessTime />} 
            label="Avg Session" 
            value={`${metrics?.avgSessionDuration.toFixed(1) || 0}m`} 
            color="#ff9800"
            secondary="Table turnaround time"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            icon={<NotificationsActive />} 
            label="Alert Response" 
            value={`${metrics?.avgGuestCallResponse.toFixed(1) || 0}m`} 
            color="#f44336"
            secondary="Guest call resolution"
          />
        </Grid>

        {/* --- Payout Section --- */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 4, 
            bgcolor: 'primary.main', 
            color: 'white',
            p: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
                    <AccountBalanceWallet sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Estimated Payout</Typography>
                    <Typography sx={{ opacity: 0.8 }}>Based on {commissionRate}% commission rate</Typography>
                  </Box>
                </Stack>
                
                <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                   <Typography variant="h3" fontWeight="900">
                     {formatCurrency((metrics?.totalRevenue || 0) * (commissionRate / 100))}
                   </Typography>
                   <Button 
                     startIcon={<Settings />} 
                     size="small" 
                     onClick={async () => {
                       const { value: rate } = await Swal.fire({
                         title: 'Adjust Commission',
                         input: 'number',
                         inputValue: commissionRate,
                         inputLabel: 'Percentage (%)',
                         showCancelButton: true
                       });
                       if (rate) setCommissionRate(Number(rate));
                     }}
                     sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', mt: 1 }} 
                     variant="outlined"
                   >
                     Change Rate
                   </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* --- Charts --- */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 400 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">Revenue Trend</Typography>
              <Stack direction="row" spacing={1}>
                {['today', '7d', '30d'].map((range) => (
                  <Button 
                    key={range}
                    size="small" 
                    variant={timeRange === range ? "contained" : "outlined"}
                    onClick={() => setTimeRange(range)}
                    sx={{ borderRadius: 2, textTransform: 'capitalize' }}
                  >
                    {range}
                  </Button>
                ))}
              </Stack>
            </Stack>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={metrics?.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  tickFormatter={(val) => dayjs(val).format('MMM DD')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                />
                <ChartTooltip 
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: theme.palette.primary.main, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Activity by Day</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                  tickFormatter={(val) => dayjs(val).format('DD')}
                />
                <YAxis hide />
                <ChartTooltip />
                <Bar dataKey="tables" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <Stack spacing={2} sx={{ mt: 2 }}>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Peak Day</Typography>
                    <Typography variant="body2" fontWeight="bold">
                        {metrics?.dailyStats && metrics.dailyStats.length > 0
                          ? dayjs(metrics.dailyStats.reduce((prev: any, current: any) => (prev.tables > current.tables) ? prev : current).date).format('MMM DD, YYYY')
                          : 'N/A'}
                    </Typography>
                </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WaiterPerformance;
