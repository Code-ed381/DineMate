import React, { useEffect, useMemo, useState } from "react";
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
  Divider,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import {
  TableBar,
  ListAlt,
  LocalDining,
  MonetizationOn,
  Search,
  GridView as GridViewIcon,
  Map as MapIcon,
} from "@mui/icons-material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BarChartTwoToneIcon from "@mui/icons-material/BarChartTwoTone";
import useMenuStore from "../../lib/menuStore";
import useTablesStore from "../../lib/tablesStore";
import FloorPlan from "../../components/FloorPlan";
import DashboardHeader from "./components/dashboard-header";
import WaiterDashboardSkeleton from "./components/skeletons/waiter-dashboard-skeleton";
import { formatDateTimeWithSuffix } from "../../utils/format-datetime";
import SalesBarChart from "./components/sales-data-chart";
import RevenueLineChartCard from "./components/revenue-line-chart-card";

// ----- Helper Components -----
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  subtitle: string;
  accent?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, subtitle, accent }) => (
  <Card
    sx={{
      p: { xs: 1.5, md: 2 },
      display: "flex",
      alignItems: "center",
      gap: { xs: 1, md: 2 },
      borderRadius: 2,
      height: "100%",
    }}
  >
    <Avatar sx={{ bgcolor: accent ?? "primary.main", width: { xs: 40, md: 56 }, height: { xs: 40, md: 56 } }}>
      {React.cloneElement(icon as React.ReactElement)}
    </Avatar>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1rem", md: "1.25rem" } }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.2 }}>
        {subtitle}
      </Typography>
    </Box>
  </Card>
);

interface StatusChipProps {
  status: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const map: Record<string, { label: string; color: any; variant?: "filled" | "outlined" }> = {
    billed: { label: "Bill Printed", color: "primary", variant: "filled" },
    open: { label: "In Session", color: "success", variant: "filled" },
    closed: { label: "Session Closed", color: "error", variant: "outlined" },
    pending: { label: "Pending", color: "warning", variant: "outlined" },
    ready: { label: "Ready", color: "success", variant: "outlined" },
    cooking: { label: "Cooking", color: "secondary", variant: "outlined" },
  };
  const meta = map[status?.toLowerCase()] || {
    label: status,
    color: "default" as any,
  };
  return (
    <Chip
      size="small"
      variant={meta.variant}
      label={meta.label}
      color={meta.color}
    />
  );
};

// ----- Main Dashboard -----
const WaiterDashboard: React.FC = () => {
  const {
    getActiveSessionByRestaurant,
    assignedTables,
    loadingActiveSessionByRestaurant,
    loadingChart,
    fetchSalesData,
    subscribeToSessions,
    unsubscribeFromSessions,
    subscribeToOrderItems,
    unsubscribeFromOrderItems,
    dashboardKitchenTasks,
  } = useMenuStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "floor">("grid");
  const { tables, getTables, updateTablePosition } = useTablesStore();

  
  const getItemStatusBreakdown = (itemId: string) => {
    // If no kitchen tasks loaded yet, return null
    if (!dashboardKitchenTasks || dashboardKitchenTasks.length === 0) return null;
    
    const tasks = dashboardKitchenTasks.filter((t: any) => t.order_item_id === itemId);
    if (!tasks || tasks.length === 0) return null;
    
    const counts: Record<string, number> = {};
    tasks.forEach((t: any) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  };
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getActiveSessionByRestaurant();
    fetchSalesData();
    getTables();
    subscribeToSessions();
    subscribeToOrderItems();

    return () => {
      unsubscribeFromSessions();
      unsubscribeFromOrderItems();
    };
  }, [getActiveSessionByRestaurant, fetchSalesData, getTables, subscribeToSessions, unsubscribeFromSessions, subscribeToOrderItems, unsubscribeFromOrderItems]);

  // ---- Derived Insights ----
  const totalRevenue = useMemo(
    () =>
      assignedTables
        .reduce((acc: number, t: any) => acc + (t?.order_total ?? 0), 0)
        .toFixed(2),
    [assignedTables]
  );

  const totalActiveOrders = useMemo(
    () =>
      assignedTables.reduce((acc: number, t: any) => acc + (t?.order_items ?? []).length, 0),
    [assignedTables]
  );

  // ---- Filtering ----
  const filteredTables = useMemo(() => {
    let result = assignedTables;

    if (statusFilter !== "all") {
      result = result.filter(
        (t: any) => t.session_status?.toLowerCase() === statusFilter
      );
    }

    if (searchTerm) {
      result = result.filter((t: any) =>
        t.table_number.toString().includes(searchTerm.trim())
      );
    }

    return result;
  }, [assignedTables, searchTerm, statusFilter]);

  return (
    <Box sx={{ p: 2 }}>
      {loadingActiveSessionByRestaurant ? (
        <WaiterDashboardSkeleton />
      ) : (
        <>
          <DashboardHeader
            title="Waiter Dashboard"
            description="Track tables, monitor active orders, and manage sessions in real-time."
            background="linear-gradient(135deg,rgb(5, 146, 165) 0%, rgb(224, 21, 140) 100%)"
            color="#fff"
          />

          {/* ---- Top Stats ---- */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <StatCard
                icon={<TableBar />}
                value={assignedTables.length}
                subtitle="Tables"
                accent="#6a1b9a"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                icon={<ListAlt />}
                value={totalActiveOrders}
                subtitle="Active Items"
                accent="#0d47a1"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                icon={<LocalDining />}
                value={
                  assignedTables.filter((t: any) => t.session_status === "billed")
                    .length
                }
                subtitle="Billed"
                accent="#f57c00"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                icon={<MonetizationOn />}
                value={`$${totalRevenue}`}
                subtitle="Revenue"
                accent="#2e7d32"
              />
            </Grid>
          </Grid>

          {/* ---- Performance Charts ---- */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CardHeader
                  title={
                    <Typography variant="subtitle1">
                      Sales Performance
                    </Typography>
                  }
                  subheader="Last 7 Days"
                  avatar={<BarChartTwoToneIcon color="primary" />}
                  sx={{ pb: 0 }}
                />
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                    }}
                  >
                    {loadingChart ? (
                      <CircularProgress />
                    ) : (
                      <SalesBarChart orders={assignedTables} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <RevenueLineChartCard orders={assignedTables} />
            </Grid>
          </Grid>

          {/* ---- Filters ---- */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={statusFilter}
              onChange={(_e, value) => value && setStatusFilter(value)}
              sx={{
                flex: { md: "0 1 auto" },
                "& .MuiToggleButton-root": {
                  px: { xs: 1.5, sm: 3 },
                  py: 1,
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "capitalize",
                  fontSize: { xs: '0.8rem', md: '0.875rem' }
                },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="open">Open</ToggleButton>
              <ToggleButton value="billed">Billed</ToggleButton>
              <ToggleButton value="closed">Closed</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              exclusive
              value={viewMode}
              onChange={(_e, value) => value && setViewMode(value)}
              sx={{
                "& .MuiToggleButton-root": {
                  px: 2,
                  py: 1,
                  fontWeight: 600,
                  borderRadius: 2,
                },
              }}
            >
              <ToggleButton value="grid">
                <GridViewIcon sx={{ mr: 1 }} /> Grid
              </ToggleButton>
              <ToggleButton value="floor">
                <MapIcon sx={{ mr: 1 }} /> Floor Plan
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField
              placeholder="Search table..."
              fullWidth
              sx={{ maxWidth: { md: 300 } }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          {/* ---- Table Sessions ---- */}
          {viewMode === "grid" ? (
            <Grid container spacing={2}>
              {filteredTables.length === 0 ? (
                // ... existing empty state
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 200,
                    }}
                  >
                    <InfoOutlinedIcon sx={{ mb: 1, opacity: 0.5 }} fontSize="large" />
                    <Typography variant="body1" fontWeight={600} color="text.secondary">
                      No tables found
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                filteredTables.map((session: any) => (
                  <Grid item xs={12} sm={6} md={6} lg={3} key={session.session_id}>
                    {/* ... existing card ... */}
                    <Card
                      sx={{
                        borderRadius: 2,
                        minHeight: 300,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: 6,
                          transform: "translateY(-4px)"
                        }
                      }}
                    >
                      <CardHeader
                        title={`Table ${session.table_number}`}
                        titleTypographyProps={{ variant: 'h6', fontWeight: 800 }}
                        action={<StatusChip status={session.session_status} />}
                        sx={{ pb: 1 }}
                      />
                      <Divider />
                      <CardContent sx={{ flex: 1, p: 1.5 }}>
                        {(session.order_items ?? []).length === 0 ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ mt: 4 }}
                          >
                            No orders yet 🍽️
                          </Typography>
                        ) : (
                          <List dense>
                            {session.order_items.map((order: any) => (
                              <ListItem
                                key={order.id}
                                sx={{
                                  mb: 1,
                                  py: 1,
                                  px: 2,
                                  borderRadius: 2,
                                  bgcolor: "background.default",
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box>
                                  <Typography sx={{ fontWeight: 600 }}>
                                    {order.menu_item.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    x{order.quantity} • ${order.menu_item.price}
                                  </Typography>
                                </Box>

                                {(() => {
                                   const breakdown = getItemStatusBreakdown(order.id);
                                   
                                   if (breakdown) {
                                     return (
                                       <Stack direction="row" gap={0.5} flexWrap="wrap" justifyContent="flex-end" sx={{ maxWidth: '40%' }}>
                                         {breakdown['pending'] > 0 && <Chip label={`${breakdown['pending']} PENDING`} size="small" color="default" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                                         {breakdown['preparing'] > 0 && <Chip label={`${breakdown['preparing']} PREP`} size="small" color="warning" variant="filled" sx={{ height: 20, fontSize: '0.65rem' }} />}
                                         {breakdown['ready'] > 0 && <Chip label={`${breakdown['ready']} READY`} size="small" color="success" variant="filled" sx={{ height: 20, fontSize: '0.65rem' }} />}
                                         {breakdown['served'] > 0 && <Chip label={`${breakdown['served']} SERVED`} size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />}
                                       </Stack>
                                     );
                                   }

                                   return (
                                      <>
                                        {order.item_status !== "preparing" && (
                                          <StatusChip status={order.item_status} />
                                        )}

                                        {order.item_status === "preparing" && (
                                          <CircularProgress size={20} color="warning" />
                                        )}
                                      </>
                                   );
                                 })()}
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </CardContent>
                      <Divider />
                      <Box
                        sx={{
                          p: 1.5,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          Total: ${session.order_total?.toFixed(2) ?? "0.00"}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {formatDateTimeWithSuffix(session.opened_at)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          ) : (
            <FloorPlan 
              tables={tables} 
              onTableClick={(table) => {
                // If the table has an active session, we could focus it or open it.
              }}
              onUpdatePosition={updateTablePosition}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default WaiterDashboard;
