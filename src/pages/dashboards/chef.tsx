import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
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

interface SmallStatProps {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  accent?: string;
}

const SmallStat: React.FC<SmallStatProps> = ({ icon, label, value, accent }) => {
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
            {React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: 28 } })}
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
};

const ChefDashboard: React.FC = () => {
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
    subscribeToOrderItems,
    unsubscribeFromOrderItems,
  } = useKitchenStore();

  const isLoading =
    !pendingMeals || !preparingMeals || !readyMeals || !servedMeals;

  useEffect(() => {
    handleFetchPendingMeals();
    handleFetchPreparingMeals();
    handleFetchReadyMeals();
    handleFetchServedMeals();
    handleFetchOrderItems();

    subscribeToOrderItems();

    return () => {
      unsubscribeFromOrderItems();
    };
  }, [
    handleFetchPendingMeals,
    handleFetchPreparingMeals,
    handleFetchReadyMeals,
    handleFetchServedMeals,
    handleFetchOrderItems,
    subscribeToOrderItems,
    unsubscribeFromOrderItems,
  ]);

  const pendingCount = pendingMeals?.filter((meal: any) => meal?.order_item_status !== "preparing").length || 0;
  const preparingCount = preparingMeals?.filter((meal: any) => meal?.order_item_status !== "pending").length || 0;
  const readyCount = readyMeals?.length || 0;
  const servedCount = servedMeals?.length || 0;

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
            <Grid item xs={6} sm={6} md={3}>
              <SmallStat
                icon={<Timer />}
                label="Pending"
                value={pendingCount}
                accent="#ffe6e6"
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <SmallStat
                icon={<UpdateTwoToneIcon />}
                label="Preparing"
                value={preparingCount}
                accent="#fff3e0"
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <SmallStat
                icon={<AlarmOnTwoToneIcon />}
                label="Ready"
                value={readyCount}
                accent="#e3f2fd"
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <SmallStat
                icon={<RoomServiceTwoToneIcon />}
                label="Served"
                value={servedCount}
                accent="#e8f5e9"
              />
            </Grid>
          </Grid>

          {/* Orders Bar Chart */}
          <OrdersBarChart />

          <Grid container spacing={3} sx={{ my: 3 }}>
            {/* Left: Live Order Queue */}
            <Grid item xs={12} lg={6}>
              <LiveOrderQueueCard
                pendingMeals={pendingMeals}
                filter="pending"
                title="Pending Orders"
              />
            </Grid>

            {/* Right: Preparing Orders */}
            <Grid item xs={12} lg={6}>
              <LiveOrderQueueCard
                pendingMeals={pendingMeals}
                filter="preparing"
                title="Preparing Orders"
              />
            </Grid>
          </Grid>

          {/* Order History Table */}
          <OrderHistoryTable />
        </Box>
      )}
    </>
  );
};

export default ChefDashboard;
