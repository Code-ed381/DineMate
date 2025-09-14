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
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Button,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  TableBar,
  ListAlt,
  LocalDining,
  DoneAll,
  MonetizationOn,
  Notifications,
  RoomService,
  CheckCircleOutline,
  AccessTime,
  MoreVert,
} from "@mui/icons-material";
import useAuthStore from "../../lib/authStore";
import DashboardHeader from "../../components/dashboard-header";

/**
 * WaiterDashboard_Pro.jsx
 * A redesigned, production-ready single-file React component for a waiter dashboard.
 * - Responsive layout
 * - Accessible, semantic markup
 * - Micro-interactions (hover, focus, status chips)
 * - Clear visual hierarchy, reduced cognitive load
 * - Props for data injection + sensible defaults for rapid prototyping
 *
 * Integration:
 * import WaiterDashboard from './WaiterDashboard_Pro';
 * <WaiterDashboard />
 */

const StatCard = ({ icon, title, value, subtitle, accent }) => (
  <Card
    elevation={2}
    sx={{
      p: 2,
      display: "flex",
      alignItems: "center",
      gap: 2,
      borderRadius: 2,
      transition: "transform .18s ease, box-shadow .18s ease",
      "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
      },
    }}
  >
    <Avatar
      sx={{ bgcolor: accent ?? "primary.main", width: 56, height: 56 }}
      aria-hidden
    >
      {icon}
    </Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  </Card>
);

StatCard.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subtitle: PropTypes.string,
  accent: PropTypes.string,
};

const StatusChip = ({ status }) => {
  const map = {
    Occupied: { label: "Occupied", color: "error" },
    Waiting: { label: "Waiting", color: "warning" },
    Free: { label: "Free", color: "success" },
    Ready: { label: "Ready", color: "success" },
    Cooking: { label: "Cooking", color: "info" },
  };
  const meta = map[status] || { label: status, color: "default" };
  return <Chip size="small" label={meta.label} color={meta.color} />;
};

StatusChip.propTypes = { status: PropTypes.string };

const WaiterDashboard = ({
  initialAssignedTables,
  initialActiveOrders,
  initialNotifications,
  tipsToday,
}) => {
  const { user } = useAuthStore();

  // Local state (would be wired to real-time store/ws in production)
  const [assignedTables, setAssignedTables] = useState(initialAssignedTables);
  const [activeOrders, setActiveOrders] = useState(initialActiveOrders);
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    // subtle: keep state in sync if parent changes props
    setAssignedTables(initialAssignedTables);
    setActiveOrders(initialActiveOrders);
    setNotifications(initialNotifications);
  }, [initialAssignedTables, initialActiveOrders, initialNotifications]);

  const totalOpen = useMemo(
    () => activeOrders.length + notifications.length,
    [activeOrders, notifications]
  );

  // Actions
  const markOrderReady = (id) => {
    setActiveOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "Ready" } : o))
    );
    setNotifications((n) => [
      {
        id: `note-${id}`,
        table: activeOrders.find((o) => o.id === id)?.table,
        message: "Order is ready",
      },
      ...n,
    ]);
  };

  const serveTable = (tableId) => {
    setAssignedTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: "Free" } : t))
    );
    setNotifications((n) => n.filter((note) => note.table !== tableId));
  };

  return (
    <Box sx={{ p: 2 }}>
      <DashboardHeader
        title="Waiter Dashboard"
        description="Manage the line, monitor stations, and keep the kitchen running smoothly."
        background="linear-gradient(135deg,rgb(5, 146, 165) 0%, rgb(224, 21, 140) 100%)"
        color="#fff"
      />

      {/* Top: Greeting + quick actions */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
        }}
      >
      </Box>

      {/* Stats */}
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
            value={activeOrders.length}
            subtitle="Active Orders"
            accent="#0d47a1"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<LocalDining />}
            value={assignedTables.filter((t) => t.status === "Waiting").length}
            subtitle="Waiting Tables"
            accent="#f57c00"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<MonetizationOn />}
            value={tipsToday ?? "$0"}
            subtitle="Tips Today"
            accent="#f9a825"
          />
        </Grid>
      </Grid>

      {/* Main content: Left (Tables & Orders) / Right (Notifications & Activity) */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 2 }}>
            <CardHeader
              title="Floor Overview"
              subheader={`Open tasks: ${totalOpen}`}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ mb: 1, fontWeight: 700 }}>
                    Assigned Tables
                  </Typography>
                  <List>
                    {assignedTables.map((table) => (
                      <ListItem
                        key={table.id}
                        sx={{
                          mb: 1,
                          py: 1,
                          px: 2,
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(243,243,246,0.9))",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>
                            Table {table.number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Orders: {table.orders}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <StatusChip status={table.status} />
                          <Tooltip title="Mark table served">
                            <IconButton
                              aria-label={`serve-table-${table.id}`}
                              onClick={() => serveTable(table.id)}
                            >
                              <CheckCircleOutline />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography sx={{ mb: 1, fontWeight: 700 }}>
                    Active Orders
                  </Typography>
                  <List>
                    {activeOrders.map((order) => (
                      <ListItem
                        key={order.id}
                        sx={{
                          mb: 1,
                          py: 1,
                          px: 2,
                          borderRadius: 2,
                          background:
                            "linear-gradient(180deg, rgba(249,250,255,1), rgba(235,244,255,1))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ fontWeight: 700 }}>
                            {order.item}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Table {order.table} • {order.status}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={
                                order.status === "Cooking"
                                  ? 60
                                  : order.status === "Ready"
                                  ? 100
                                  : 30
                              }
                              sx={{ height: 6, borderRadius: 1 }}
                            />
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                          {order.status !== "Ready" && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => markOrderReady(order.id)}
                              startIcon={<AccessTime />}
                            >
                              Mark Ready
                            </Button>
                          )}
                          <Tooltip title="Order details">
                            <IconButton aria-label={`order-more-${order.id}`}>
                              <MoreVert />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 2 }}>
            <CardHeader title="Notifications & Requests" />
            <CardContent>
              {notifications.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary">
                    No active requests — great job!
                  </Typography>
                </Box>
              ) : (
                <List>
                  {notifications.map((note) => (
                    <ListItem
                      key={note.id}
                      sx={{
                        mb: 1,
                        py: 1,
                        px: 2,
                        borderRadius: 2,
                        background: "#fff8e1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>
                          Table {note.table}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {note.message}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Acknowledge">
                          <IconButton
                            onClick={() =>
                              setNotifications((n) =>
                                n.filter((x) => x.id !== note.id)
                              )
                            }
                          >
                            <CheckCircleOutline />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}

              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Daily progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (12 / (12 + 4)) * 100)}
                sx={{ height: 8, borderRadius: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                Completed 12 of 16 tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Tip: keyboard shortcuts and real-time updates improve throughput.
          Integrate with a WebSocket for live order pushing.
        </Typography>
      </Box>
    </Box>
  );
};

WaiterDashboard.propTypes = {
  initialAssignedTables: PropTypes.array,
  initialActiveOrders: PropTypes.array,
  initialNotifications: PropTypes.array,
  tipsToday: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

WaiterDashboard.defaultProps = {
  initialAssignedTables: [
    { id: 1, number: 5, status: "Occupied", orders: 2 },
    { id: 2, number: 7, status: "Occupied", orders: 1 },
    { id: 3, number: 10, status: "Waiting", orders: 0 },
  ],
  initialActiveOrders: [
    { id: 1, item: "Pasta Alfredo", table: 5, status: "Cooking" },
    { id: 2, item: "Caesar Salad", table: 7, status: "Ready" },
  ],
  initialNotifications: [
    { id: 1, table: 5, message: "Needs water" },
    { id: 2, table: 10, message: "Calling waiter" },
  ],
  tipsToday: "$85",
};

export default WaiterDashboard;
