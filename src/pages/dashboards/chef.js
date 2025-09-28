import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Stack,
} from "@mui/material";
import { Timer } from "@mui/icons-material";
import UpdateTwoToneIcon from "@mui/icons-material/UpdateTwoTone";
import AlarmOnTwoToneIcon from "@mui/icons-material/AlarmOnTwoTone";
import RoomServiceTwoToneIcon from "@mui/icons-material/RoomServiceTwoTone";
import DashboardHeader from "./components/dashboard-header";
import OrderHistoryTable from "./components/order-history-panel";
import useKitchenStore from "../../lib/kitchenStore";
import OrdersBarChart from "./components/orders-bar-chart";
import ChefDashboardProSkeleton from "./components/skeletons/chef-dashboard-skeleton";
import LiveOrderQueueCard from "./components/live-order-status-panel";
import { useReRender } from "../../utils/re-render";

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
          <Avatar
            sx={(theme) => ({
              bgcolor: accent ?? theme.palette.primary.main,
              width: 48,
              height: 48,
              color: theme.palette.getContrastText(
                accent ?? theme.palette.primary.main
              ),
            })}
          >
            {React.cloneElement(icon, { sx: { fontSize: 28 } })}
          </Avatar>

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

SmallStat.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  accent: PropTypes.string,
};

export default function ChefDashboardPro() {
  const {
    pendingMeals,
    preparingMeals,
    readyMeals,
    servedMeals,
    handleFetchPendingMeals,
    handleFetchPreparingMeals,
    handleFetchReadyMeals,
    handleFetchServedMeals,
    handleFetchOrderItems,
  } = useKitchenStore();

  const isLoading =
    !pendingMeals || !preparingMeals || !readyMeals || !servedMeals;

  useEffect(() => {
    const controller = new AbortController();
    handleFetchPendingMeals();
    handleFetchPreparingMeals();
    handleFetchReadyMeals();
    handleFetchServedMeals();
    handleFetchOrderItems();

    return () => controller.abort();
  }, []);

  const pending = pendingMeals?.length || 0;
  const preparing = preparingMeals?.length || 0;
  const ready = readyMeals?.length || 0;
  const served = servedMeals?.length || 0;

  useReRender(30000);

  return (
    <>
      {isLoading ? (
        <ChefDashboardProSkeleton />
      ) : (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <DashboardHeader
            title="Chef Dashboard"
            description="Here’s a quick summary of your restaurant’s performance today."
            background="linear-gradient(135deg,#ff6b6b 0%, #ffb74d 100%)"
            color="#fff"
          />

          {/* KPI strip */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <SmallStat
                icon={<Timer />}
                label="Pending Orders"
                value={pending}
                accent="#ffe6e6"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <SmallStat
                icon={<UpdateTwoToneIcon />}
                label="In Progress"
                value={preparing}
                accent="#fff3e0"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <SmallStat
                icon={<AlarmOnTwoToneIcon />}
                label="Ready Orders"
                value={ready}
                accent="#e3f2fd"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <SmallStat
                icon={<RoomServiceTwoToneIcon />}
                label="Completed Orders"
                value={served}
                accent="#e8f5e9"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Left: Live Order Queue */}
            <Grid item xs={12} lg={7}>
              <Stack spacing={3}>
                {/* Orders Bar Chart */}
                <OrdersBarChart />

                {/* Order History Table */}
                <OrderHistoryTable />
              </Stack>
            </Grid>

            {/* Right: Kitchen Health + Alerts */}
            <Grid item xs={12} lg={5}>
              <LiveOrderQueueCard
                pendingMeals={pendingMeals}
                preparingMeals={preparingMeals}
                readyMeals={readyMeals}
                servedMeals={servedMeals}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Pro tip: integrate with printers and kitchen display systems (KDS)
              for fastest throughput.
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}
