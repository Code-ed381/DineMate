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
  Button,
  IconButton,
} from "@mui/material";
import {
  TableBar,
  ListAlt,
  LocalDining,
  MonetizationOn,
  Search,
  GridView as GridViewIcon,
  Map as MapIcon,
  TrendingUp,
  Replay,
  AddCircleOutline,
  Person,
  Star,
  Edit,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
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
import { formatCurrency } from "../../utils/currency";

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
  const navigate = useNavigate();
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
    reorderItem,
    repeatRound,
    setCurrentOrder,
    setCurrentOrderItems,
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
  const [customerNames, setCustomerNames] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("DineMate_Customers") || "{}");
    } catch { return {}; }
  });
  const [feedbacks, setFeedbacks] = useState<Record<string, { rating: number, comment: string }>>(() => {
    try {
      return JSON.parse(localStorage.getItem("DineMate_Feedback") || "{}");
    } catch { return {}; }
  });

  const handleSetCustomer = async (sessionId: string) => {
    const { value: name } = await Swal.fire({
      title: 'Customer Name',
      input: 'text',
      inputLabel: 'Enter name or phone for this guest',
      inputValue: customerNames[sessionId] || '',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'You need to write something!'
        return null;
      }
    });

    if (name) {
      const newNames = { ...customerNames, [sessionId]: name };
      setCustomerNames(newNames);
      localStorage.setItem("DineMate_Customers", JSON.stringify(newNames));
    }
  };

  const handleCaptureFeedback = async (sessionId: string) => {
    const { value: formValues } = await Swal.fire({
      title: 'Guest Feedback',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Rating (1-5)" type="number" min="1" max="5">' +
        '<textarea id="swal-input2" class="swal2-textarea" placeholder="Optional comments..."></textarea>',
      focusConfirm: false,
      preConfirm: () => {
        return {
          rating: (document.getElementById('swal-input1') as HTMLInputElement).value,
          comment: (document.getElementById('swal-input2') as HTMLTextAreaElement).value
        }
      }
    });

    if (formValues) {
      const newFeedbacks = { ...feedbacks, [sessionId]: formValues };
      setFeedbacks(newFeedbacks);
      localStorage.setItem("DineMate_Feedback", JSON.stringify(newFeedbacks));
      Swal.fire('Saved!', 'Feedback recorded.', 'success');
    }
  };

  const handleRepeatItem = async (item: any, session: any) => {
    // 1. Prepare store state for current session/order if not active
    setCurrentOrder({ id: item.order_id, session_id: session.id, restaurant_id: session.restaurant_id, status: session.status } as any);
    setCurrentOrderItems(session.order_items);
    
    // 2. Call reorderItem
    await reorderItem(item);
    
    // 3. Refresh sessions to show updated quantity
    getActiveSessionByRestaurant();
  };

  const handleRepeatRound = async (session: any) => {
     // 1. Prepare store state
     const orderId = session.order_items?.[0]?.order_id;
     if (!orderId) return;

     setCurrentOrder({ id: orderId, session_id: session.id, restaurant_id: session.restaurant_id, status: session.status } as any);
     setCurrentOrderItems(session.order_items);

     // 2. Call repeatRound
     await repeatRound();

     // 3. Refresh
     getActiveSessionByRestaurant();
  };

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
            action={
              <Button
                variant="contained"
                startIcon={<TrendingUp />}
                onClick={() => navigate("/app/performance")}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  backdropFilter: 'blur(10px)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                Performance Insights
              </Button>
            }
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
                value={formatCurrency(totalRevenue)}
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
                        title={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" fontWeight={800}>Table {session.table_number}</Typography>
                            <IconButton size="small" onClick={() => handleSetCustomer(session.session_id)}>
                              <Person sx={{ fontSize: 18, color: customerNames[session.session_id] ? 'primary.main' : 'action.disabled' }} />
                            </IconButton>
                          </Box>
                        }
                        subheader={customerNames[session.session_id] || "Guest Session"}
                        titleTypographyProps={{ variant: 'h6', fontWeight: 800 }}
                        action={
                          <Stack direction="row" spacing={1} alignItems="center">
                            {(session.order_items ?? []).length > 0 && (
                              <Chip 
                                icon={<Replay sx={{ fontSize: '1rem !important' }} />}
                                label="ROUND" 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRepeatRound(session);
                                }}
                                sx={{ height: 24, fontSize: '0.7rem', fontWeight: 700 }}
                              />
                            )}
                            <StatusChip status={session.session_status} />
                          </Stack>
                        }
                        sx={{ pb: 1 }}
                      />
                      <Divider />
                      <Box sx={{ px: 2, py: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'action.hover' }}>
                         <Typography variant="caption" color="text.secondary">
                           {feedbacks[session.session_id] ? `Rating: ${feedbacks[session.session_id].rating}/5 ⭐` : "No feedback yet"}
                         </Typography>
                         <IconButton size="small" onClick={() => handleCaptureFeedback(session.session_id)}>
                           <Star sx={{ fontSize: 16, color: feedbacks[session.session_id] ? '#ffb400' : 'action.disabled' }} />
                         </IconButton>
                      </Box>
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
                                    x{order.quantity} • {formatCurrency(order.menu_item.price)}
                                  </Typography>
                                </Box>

                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      icon={<AddCircleOutline sx={{ fontSize: '14px !important' }} />}
                                      label="ONE"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRepeatItem(order, session);
                                      }}
                                      sx={{ 
                                        height: 20, 
                                        fontSize: '0.6rem', 
                                        bgcolor: 'action.hover',
                                        '&:hover': { bgcolor: 'action.selected' }
                                      }}
                                    />
                                    {(() => {
                                      const breakdown = getItemStatusBreakdown(order.id);
                                      
                                      if (breakdown) {
                                        return (
                                          <Stack direction="row" gap={0.5} flexWrap="wrap" justifyContent="flex-end" sx={{ maxWidth: '60%' }}>
                                            {breakdown['pending'] > 0 && <Chip label={`${breakdown['pending']} P`} size="small" color="default" sx={{ height: 18, fontSize: '0.6rem' }} />}
                                            {breakdown['preparing'] > 0 && <Chip label={`${breakdown['preparing']} PR`} size="small" color="warning" variant="filled" sx={{ height: 18, fontSize: '0.6rem' }} />}
                                            {breakdown['ready'] > 0 && <Chip label={`${breakdown['ready']} RD`} size="small" color="success" variant="filled" sx={{ height: 18, fontSize: '0.6rem' }} />}
                                            {breakdown['served'] > 0 && <Chip label={`${breakdown['served']} SV`} size="small" color="success" sx={{ height: 18, fontSize: '0.6rem' }} />}
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
                                  </Box>
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
                          Total: {formatCurrency(session.order_total)}
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
