import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
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
  Button,
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
  CheckCircleOutline,
  Search,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import useMenuStore from "../../lib/menuStore";
import DashboardHeader from "./components/dashboard-header";
import WaiterDashboardSkeleton from "./components/skeletons/waiter-dashboard-skeleton";
import { formatDateTimeWithSuffix } from "../../utils/format-datetime";

// ----- Helper Components -----
const StatCard = ({ icon, value, subtitle, accent }) => (
  <Card
    sx={{
      p: 2,
      display: "flex",
      alignItems: "center",
      gap: 2,
      borderRadius: 2,
    }}
  >
    <Avatar sx={{ bgcolor: accent ?? "primary.main", width: 56, height: 56 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  </Card>
);

const StatusChip = ({ status }) => {
  const map = {
    billed: { label: "Bill Printed", color: "primary", variant: "filled" },
    open: { label: "In Session", color: "success", variant: "filled" },
    closed: { label: "Session Closed", color: "error", variant: "outlined" },
    pending: { label: "Pending", color: "warning", variant: "outlined" },
    ready: { label: "Ready", color: "success", variant: "outlined" },
    cooking: { label: "Cooking", color: "secondary", variant: "outlined" },
  };
  const meta = map[status?.toLowerCase()] || {
    label: status,
    color: "default",
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
const WaiterDashboard = () => {
  const {
    getActiveSessionByRestaurant,
    assignedTables,
    loadingActiveSessionByRestaurant,
  } = useMenuStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getActiveSessionByRestaurant();
  }, [getActiveSessionByRestaurant]);

  // ---- Derived Insights ----
  const totalRevenue = useMemo(
    () =>
      assignedTables
        .reduce((acc, t) => acc + (t?.order_total ?? 0), 0)
        .toFixed(2),
    [assignedTables]
  );

  const totalActiveOrders = useMemo(
    () =>
      assignedTables.reduce((acc, t) => acc + (t?.order_items ?? []).length, 0),
    [assignedTables]
  );

  // ---- Filtering ----
  const filteredTables = useMemo(() => {
    let result = assignedTables;

    if (statusFilter !== "all") {
      result = result.filter(
        (t) => t.session_status?.toLowerCase() === statusFilter
      );
    }

    if (searchTerm) {
      result = result.filter((t) =>
        t.table_number.toString().includes(searchTerm.trim())
      );
    }

    return result;
  }, [assignedTables, searchTerm, statusFilter]);

  // ---- Dummy chart data ----
  const performanceData = [
    { name: "Orders", value: totalActiveOrders || 25 },
    { name: "Tables", value: assignedTables.length || 10 },
    { name: "Revenue", value: parseFloat(totalRevenue) || 450 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const topOrdersData = [
    { name: "Pizza", qty: 15 },
    { name: "Burger", qty: 10 },
    { name: "Salad", qty: 7 },
    { name: "Steak", qty: 5 },
    { name: "Fries", qty: 12 },
  ];

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
            <Grid item xs={12} md={3}>
              <StatCard
                icon={<TableBar />}
                value={assignedTables.length}
                subtitle="Assigned Tables"
                accent="#6a1b9a"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                icon={<ListAlt />}
                value={totalActiveOrders}
                subtitle="Active Order Items"
                accent="#0d47a1"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                icon={<LocalDining />}
                value={
                  assignedTables.filter((t) => t.session_status === "billed")
                    .length
                }
                subtitle="Pending Bills"
                accent="#f57c00"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                icon={<MonetizationOn />}
                value={`$${totalRevenue}`}
                subtitle="Revenue (this shift)"
                accent="#2e7d32"
              />
            </Grid>
          </Grid>

          {/* ---- Performance Charts ---- */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, height: 300 }}>
                <CardHeader title="Waiter Performance" />
                <CardContent>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={performanceData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {performanceData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, height: 300 }}>
                <CardHeader title="Top Orders Today" />
                <CardContent>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={topOrdersData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ReTooltip />
                      <Bar dataKey="qty" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ---- Filters ---- */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <ToggleButtonGroup
              exclusive
              value={statusFilter}
              onChange={(_, value) => value && setStatusFilter(value)}
              sx={{
                "& .MuiToggleButton-root": {
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "capitalize",
                },
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="open">Open</ToggleButton>
              <ToggleButton value="billed">Billed</ToggleButton>
              <ToggleButton value="closed">Closed</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              placeholder="Search table number..."
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
          <Grid container spacing={2}>
            {filteredTables.length === 0 ? (
              <Grid item xs={12}>
                <Typography
                  align="center"
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 4 }}
                >
                  No tables found 🔍
                </Typography>
              </Grid>
            ) : (
              filteredTables.map((session) => (
                <Grid item xs={12} md={6} lg={3} key={session.session_id}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      height: 450,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardHeader
                      title={`Table ${session.table_number}`}
                      action={<StatusChip status={session.session_status} />}
                    />
                    <Divider />
                    <CardContent sx={{ flex: 1, overflowY: "auto", p: 1 }}>
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
                          {session.order_items.map((order) => (
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

                              {order.item_status != "preparing" && (
                                <StatusChip status={order.item_status} />
                              )}

                              {order.item_status === "preparing" && (
                                <CircularProgress size={20} color="warning" />
                              )}
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
        </>
      )}
    </Box>
  );
};

WaiterDashboard.propTypes = {
  initialAssignedTables: PropTypes.array,
  tipsToday: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

WaiterDashboard.defaultProps = {
  initialAssignedTables: [],
  tipsToday: "$0",
};

export default WaiterDashboard;
