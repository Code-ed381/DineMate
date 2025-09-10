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
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  Restaurant,
  AssignmentTurnedIn,
  AccessTime,
  Warning,
  LocalDining,
  CheckCircle,
  Kitchen,
  Timer,
  ReportProblem,
  RoomService,
  Notifications,
  MoreHoriz,
} from "@mui/icons-material";

/**
 * ChefDashboard_Pro.jsx
 * A polished, production-ready chef dashboard that matches the visual language
 * and UX patterns of the other "Pro" dashboards (Waiter, Cashier).
 *
 * Key features:
 *  - KPI strip (Pending, In Progress, Avg Prep, Low Stock)
 *  - Live Order Queue with elapsed-time SLA and quick actions
 *  - Kitchen Health & Stations panel (staff + equipment)
 *  - Notifications / Alerts stream
 *  - Prop-driven with sensible defaults for rapid integration
 */

const STATUS_COLORS = {
  Pending: "warning",
  Preparing: "info",
  Ready: "success",
  Delayed: "error",
};

function SmallStat({ icon, label, value, accent }) {
  return (
    <Card sx={{ borderRadius: 2, height: "100%" }} elevation={1}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: accent ?? "rgba(0,0,0,0.06)", width: 48, height: 48 }}>{icon}</Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

SmallStat.propTypes = { icon: PropTypes.node, label: PropTypes.string, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), accent: PropTypes.string };

function StatusChip({ status }) {
  return <Chip size="small" label={status} color={STATUS_COLORS[status] ? STATUS_COLORS[status] : "default"} />;
}

StatusChip.propTypes = { status: PropTypes.string };

function elapsedMinutesSince(iso) {
  try {
    const then = new Date(iso);
    const diff = Date.now() - then.getTime();
    return Math.floor(diff / 60000);
  } catch {
    return 0;
  }
}

export default function ChefDashboardPro({ initialOrders, stations, staff, notifications }) {
  const [orders, setOrders] = useState(initialOrders);
  const [alerts, setAlerts] = useState(notifications);

  useEffect(() => setOrders(initialOrders), [initialOrders]);
  useEffect(() => setAlerts(notifications), [notifications]);

  const pending = orders.filter((o) => o.status === "Pending").length;
  const preparing = orders.filter((o) => o.status === "Preparing").length;
  const completedToday = orders.filter((o) => o.status === "Completed").length;
  const lowStock = stations.filter((s) => s.stockWarning).length;

  const avgPrep = useMemo(() => {
    const done = orders.filter((o) => o.status === "Completed" && o.startedAt && o.completedAt);
    if (!done.length) return "—";
    const total = done.reduce((acc, d) => acc + (new Date(d.completedAt) - new Date(d.startedAt)), 0);
    const avgMs = total / done.length;
    return `${Math.round(avgMs / 60000)} min`;
  }, [orders]);

  // Actions
  const startCooking = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "Preparing", startedAt: new Date().toISOString() } : o)));
  };
  const completeOrder = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "Completed", completedAt: new Date().toISOString() } : o)));
  };
  const delayOrder = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "Delayed" } : o)));
  };

  const acknowledgeAlert = (id) => setAlerts((a) => a.filter((x) => x.id !== id));

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ p: 3, borderRadius: 2, mb: 3, background: "linear-gradient(135deg,#ff6b6b 0%, #ffb74d 100%)", color: "#fff" }}>
        <Typography variant="h5" fontWeight={800}>Welcome Chef 👨‍🍳</Typography>
        <Typography variant="body2">Manage the line, monitor stations, and keep the kitchen running smoothly.</Typography>
      </Box>

      {/* KPI strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}><SmallStat icon={<Restaurant />} label="Pending Orders" value={pending} accent="#ffe6e6" /></Grid>
        <Grid item xs={12} md={3}><SmallStat icon={<AccessTime />} label="In Progress" value={preparing} accent="#fff3e0" /></Grid>
        <Grid item xs={12} md={3}><SmallStat icon={<Timer />} label="Avg Prep" value={avgPrep} accent="#e8f5e9" /></Grid>
        <Grid item xs={12} md={3}><SmallStat icon={<Warning />} label="Low Stock Alerts" value={lowStock} accent="#e3f2fd" /></Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left: Live Order Queue */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 2 }}>
            <CardHeader title={`Live Order Queue (${orders.length})`} subheader={`Completed today: ${completedToday}`} />
            <CardContent>
              <List>
                {orders.map((order) => {
                  const elapsed = elapsedMinutesSince(order.createdAt);
                  const sla = order.slaMinutes ?? 15;
                  const isLate = elapsed > sla;
                  return (
                    <React.Fragment key={order.id}>
                      <ListItem sx={{ alignItems: "flex-start", py: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontWeight: 700 }}>{order.item}</Typography>
                            <StatusChip status={order.status} />
                            {isLate && <Chip label={`${elapsed}m`} size="small" color="error" />}
                          </Stack>

                          <Typography variant="body2" color="text.secondary">{order.table} • {order.notes || "—"}</Typography>

                          <Box sx={{ mt: 1, display: "flex", gap: 1, alignItems: "center" }}>
                            <Typography variant="caption" color="text.secondary">Placed {elapsed} minutes ago</Typography>
                            <LinearProgress sx={{ width: 160, ml: 1, height: 8, borderRadius: 1 }} variant="determinate" value={Math.min(100, (elapsed / sla) * 100)} />
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          {order.status === "Pending" && (
                            <Tooltip title="Start cooking">
                              <Button size="small" variant="contained" onClick={() => startCooking(order.id)} startIcon={<Kitchen />}>Start</Button>
                            </Tooltip>
                          )}

                          {order.status !== "Completed" && (
                            <Tooltip title="Mark complete">
                              <Button size="small" variant="outlined" color="success" onClick={() => completeOrder(order.id)} startIcon={<CheckCircle />}>Complete</Button>
                            </Tooltip>
                          )}

                          <Tooltip title="Delay order">
                            <Button size="small" variant="outlined" color="warning" onClick={() => delayOrder(order.id)}>Delay</Button>
                          </Tooltip>

                          <Tooltip title="More">
                            <IconButton><MoreHoriz /></IconButton>
                          </Tooltip>
                        </Stack>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  );
                })}

                {orders.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No active orders" secondary="All clear — great job!" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Kitchen Health + Alerts */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <Card sx={{ borderRadius: 2 }}>
              <CardHeader title="Kitchen Health" />
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Stations</Typography>
                <Box sx={{ mt: 1 }}>
                  {stations.map((s) => (
                    <Box key={s.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{s.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.staffAssigned || "Unassigned"}</Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" color={s.status === "OK" ? "success.main" : "warning.main"}>{s.status}</Typography>
                        {s.stockWarning && <Chip label="Low stock" size="small" color="warning" sx={{ mt: 0.5 }} />}
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Staff on shift</Typography>
                <Box sx={{ mt: 1 }}>
                  {staff.map((p) => (
                    <Box key={p.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
                      <Box><Typography sx={{ fontWeight: 700 }}>{p.name}</Typography><Typography variant="caption" color="text.secondary">{p.role}</Typography></Box>
                      <Chip label={p.status} size="small" color={p.status === "Active" ? "success" : "default"} />
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button startIcon={<LocalDining />} variant="contained">View Recipes</Button>
                  <Button startIcon={<RoomService />} variant="outlined">Request Runner</Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2 }}>
              <CardHeader title={"Notifications & Alerts"} />
              <CardContent>
                <List>
                  {alerts.map((a) => (
                    <ListItem key={a.id} secondaryAction={<Button size="small" onClick={() => acknowledgeAlert(a.id)}>Acknowledge</Button>}>
                      <ListItemText primary={<Typography sx={{ fontWeight: 700 }}>{a.title}</Typography>} secondary={<Typography variant="caption" color="text.secondary">{a.detail}</Typography>} />
                    </ListItem>
                  ))}
                  {alerts.length === 0 && (
                    <ListItem><ListItemText primary="No active alerts" secondary="Kitchen running smoothly" /></ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">Pro tip: integrate with printers and kitchen display systems (KDS) for fastest throughput.</Typography>
      </Box>
    </Box>
  );
}

ChefDashboardPro.propTypes = {
  initialOrders: PropTypes.array,
  stations: PropTypes.array,
  staff: PropTypes.array,
  notifications: PropTypes.array,
};

ChefDashboardPro.defaultProps = {
  initialOrders: [
    { id: 1, table: "Table 5", item: "Margherita Pizza", status: "Preparing", createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), slaMinutes: 12, notes: "No olives" },
    { id: 2, table: "Table 2", item: "Grilled Chicken", status: "Pending", createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(), slaMinutes: 15 },
    { id: 3, table: "Table 7", item: "Pasta Alfredo", status: "Preparing", createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), slaMinutes: 12 },
    { id: 4, table: "Takeout", item: "Burger & Fries", status: "Pending", createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(), slaMinutes: 10 },
  ],
  stations: [
    { id: "grill", name: "Grill", status: "OK", staffAssigned: "Kwame", stockWarning: false },
    { id: "oven", name: "Oven", status: "OK", staffAssigned: "Ama", stockWarning: true },
    { id: "fryer", name: "Fryer", status: "Attention", staffAssigned: "Kojo", stockWarning: false },
  ],
  staff: [
    { id: "s1", name: "Kwame", role: "Grill", status: "Active" },
    { id: "s2", name: "Ama", role: "Oven", status: "Active" },
    { id: "s3", name: "Kojo", role: "Expediter", status: "Idle" },
  ],
  notifications: [
    { id: "a1", title: "Fridge temp high", detail: "Freezer reads 6°C (threshold 4°C)" },
    { id: "a2", title: "Low: Tomato Sauce", detail: "Only 1 unit left" },
  ],
};
