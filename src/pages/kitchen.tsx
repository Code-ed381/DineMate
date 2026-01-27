import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { PendingActions, DoneAll } from "@mui/icons-material";
import AlarmOnIcon from "@mui/icons-material/AlarmOn";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useKitchenStore from "../lib/kitchenStore";
import PendingMealsList from "./dashboards/components/pending-meals-list";
import ReadyMealsList from "./dashboards/components/ready-meals-list";
import ServedMealsList from "./dashboards/components/served-meals-list";
import { formatDateTimeWithSuffix } from "../utils/format-datetime";

dayjs.extend(relativeTime);

const Kitchen: React.FC = () => {
  const {
    pendingMeals,
    readyMeals,
    servedMeals,
    handleFetchPendingMeals,
    handleUpdateOrderItemStatus,
    handleFetchReadyMeals,
    handleFetchServedMeals,
    subscribeToOrderItems,
    unsubscribeFromOrderItems,
  } = useKitchenStore();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  function elapsedMinutesSince(iso: string) {
    try {
      const then = new Date(iso);
      const diff = Date.now() - then.getTime();
      return Math.floor(diff / 60000);
    } catch {
      return 0;
    }
  }

  function progressValue(iso: string, maxMinutes: number) {
    const elapsed = elapsedMinutesSince(iso);
    const ratio = Math.min(elapsed / maxMinutes, 1);
    return ratio * 100;
  } 

  useEffect(() => {
    handleFetchPendingMeals();
    handleFetchReadyMeals();
    handleFetchServedMeals();
    subscribeToOrderItems();

    return () => {
      unsubscribeFromOrderItems();
    };
  }, [handleFetchPendingMeals, handleFetchReadyMeals, handleFetchServedMeals, subscribeToOrderItems, unsubscribeFromOrderItems]);

  const getTimeAgo = (timestamp: string) => formatDateTimeWithSuffix(timestamp);

  const renderContent = () => {
    if (isMobile) {
      return (
        <Box>
           <Tabs 
             value={activeTab} 
             onChange={handleTabChange} 
             variant="fullWidth" 
             sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
             indicatorColor="primary"
             textColor="primary"
           >
             <Tab icon={<PendingActions />} iconPosition="start" label={`Pending (${pendingMeals?.length || 0})`} />
             <Tab icon={<AlarmOnIcon />} iconPosition="start" label={`Ready (${readyMeals?.length || 0})`} />
             <Tab icon={<DoneAll />} iconPosition="start" label={`Served (${servedMeals?.length || 0})`} />
           </Tabs>

           {activeTab === 0 && (
              <Box>
                {pendingMeals?.length === 0 ? (
                  <Box textAlign="center" p={3}>
                    <InfoOutlinedIcon fontSize="large" sx={{ opacity: 0.3 }} />
                    <Typography fontWeight={600}>No pending orders</Typography>
                  </Box>
                ) : (
                  <PendingMealsList
                    pendingMeals={pendingMeals}
                    handleUpdateOrderItemStatus={handleUpdateOrderItemStatus}
                    getTimeAgo={getTimeAgo}
                    elapsedMinutesSince={elapsedMinutesSince}
                    progressValue={progressValue}
                  />
                )}
              </Box>
           )}

           {activeTab === 1 && (
              <Box>
                 {readyMeals.length === 0 ? (
                  <Box textAlign="center" p={3}>
                    <InfoOutlinedIcon fontSize="large" sx={{ opacity: 0.3 }} />
                    <Typography fontWeight={600}>No ready orders</Typography>
                  </Box>
                ) : (
                  <ReadyMealsList
                    readyMeals={readyMeals}
                    handleUpdateOrderItemStatus={handleUpdateOrderItemStatus}
                  />
                )}
              </Box>
           )}

           {activeTab === 2 && (
              <Box>
                 {servedMeals?.length === 0 ? (
                  <Box textAlign="center" p={3}>
                    <InfoOutlinedIcon fontSize="large" sx={{ opacity: 0.3 }} />
                    <Typography fontWeight={600}>No served orders</Typography>
                  </Box>
                ) : (
                  <ServedMealsList servedMeals={servedMeals} />
                )}
              </Box>
           )}
        </Box>
      );
    }

    return (
      <>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ display: "flex", alignItems: "center", p: 2, borderRadius: 3, backgroundColor: "orange.light", boxShadow: 2 }}>
              <Avatar sx={{ backgroundColor: "orange.main", mr: 2 }}><PendingActions /></Avatar>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>Pending Orders</Typography>
                <Chip label={pendingMeals?.length || 0} />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ display: "flex", alignItems: "center", p: 2, borderRadius: 3, backgroundColor: "blue.light", boxShadow: 2 }}>
              <Avatar sx={{ backgroundColor: "blue.main", mr: 2 }}><AlarmOnIcon /></Avatar>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>Ready Orders</Typography>
                <Chip label={readyMeals?.length || 0} />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ display: "flex", alignItems: "center", p: 2, borderRadius: 3, backgroundColor: "green.light", boxShadow: 2 }}>
              <Avatar sx={{ backgroundColor: "green.main", mr: 2 }}><DoneAll /></Avatar>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>Served Orders</Typography>
                <Chip label={servedMeals?.length || 0} />
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, maxHeight: "80vh", overflowY: "auto" }}>
              <CardContent>
                {pendingMeals?.length === 0 ? (
                  <Box textAlign="center" p={3}>
                    <InfoOutlinedIcon fontSize="large" sx={{ opacity: 0.3 }} />
                    <Typography fontWeight={600}>No pending orders</Typography>
                  </Box>
                ) : (
                  <PendingMealsList
                    pendingMeals={pendingMeals}
                    handleUpdateOrderItemStatus={handleUpdateOrderItemStatus}
                    getTimeAgo={getTimeAgo}
                    elapsedMinutesSince={elapsedMinutesSince}
                    progressValue={progressValue}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, maxHeight: "80vh", overflowY: "auto" }}>
              <CardContent>
                {readyMeals.length === 0 ? (
                  <Box textAlign="center" p={3}>
                    <InfoOutlinedIcon fontSize="large" sx={{ opacity: 0.3 }} />
                    <Typography fontWeight={600}>No ready orders</Typography>
                  </Box>
                ) : (
                  <ReadyMealsList
                    readyMeals={readyMeals}
                    handleUpdateOrderItemStatus={handleUpdateOrderItemStatus}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, maxHeight: "80vh", overflowY: "auto" }}>
              <CardContent>
                {servedMeals?.length === 0 ? (
                  <Box textAlign="center" p={3}>
                    <InfoOutlinedIcon fontSize="large" sx={{ opacity: 0.3 }} />
                    <Typography fontWeight={600}>No served orders</Typography>
                  </Box>
                ) : (
                  <ServedMealsList servedMeals={servedMeals} />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <RestaurantMenuIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold", letterSpacing: 0.5 }}>Kitchen Panel</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              Manage orders • Track status • Stay efficient
            </Typography>
          </Box>
        </Box>
      </Box>

      {renderContent()}
    </Box>
  );
};

export default Kitchen;
