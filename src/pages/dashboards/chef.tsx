import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Button
} from "@mui/material";
import { Timer, Block as BlockIcon } from "@mui/icons-material";
import UpdateTwoToneIcon from "@mui/icons-material/UpdateTwoTone";
import AlarmOnTwoToneIcon from "@mui/icons-material/AlarmOnTwoTone";
import RoomServiceTwoToneIcon from "@mui/icons-material/RoomServiceTwoTone";
import OrderHistoryTable from "./components/order-history-panel";
import useKitchenStore from "../../lib/kitchenStore";
import OrdersBarChart from "./components/orders-bar-chart";
import ChefDashboardProSkeleton from "./components/skeletons/chef-dashboard-skeleton";
import LiveOrderQueueCard from "./components/live-order-status-panel";
import { useReRender } from "../../utils/re-render";
import { useSettings } from "../../providers/settingsProvider";
import { useNavigate } from "react-router-dom";

interface SmallStatProps {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  accent?: string;
}

const SmallStat: React.FC<SmallStatProps> = ({ icon, label, value, accent }) => {
  return (
    <Card sx={{ borderRadius: 2, height: "100%", boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
        <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
          <Avatar
            sx={(theme) => ({
              bgcolor: accent ?? theme.palette.primary.main,
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              color: theme.palette.getContrastText(
                accent ?? theme.palette.primary.main
              ),
            })}
          >
            {React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: { xs: 20, md: 28 } } })}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, mb: 0.5, fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
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

  const { settings } = useSettings();
  const dashSettings = settings?.dashboard_settings;
  const kitchenSettings = settings?.kitchen_settings;
  
  const isCompact = dashSettings?.compact_layout;
  const showStats = dashSettings?.show_order_stats !== false;
  const navigate = useNavigate();

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

  if (kitchenSettings?.enable_kds === false) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', mt: 10 }}>
        <BlockIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h4" fontWeight="bold">KDS Disabled</Typography>
        <Typography color="textSecondary" sx={{ mb: 3 }}>The Kitchen Display System is currently disabled.</Typography>
        <Button variant="contained" onClick={() => navigate("/app/settings?tab=kitchen")}>Enable in Settings</Button>
      </Box>
    );
  }

  return (
    <>
      {isLoading ? (
        <ChefDashboardProSkeleton />
      ) : (
        <Box sx={{ p: { xs: 2, md: 3 } }}>

          {showStats && (
            <>
              {/* KPI strip */}
              <Grid container spacing={1.5} sx={{ mb: isCompact ? 1.5 : 2.5 }}>
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
            </>
          )}

          <Grid container spacing={isCompact ? 2 : 3} sx={{ my: isCompact ? 1.5 : 3 }}>
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
