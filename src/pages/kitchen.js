import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar
} from "@mui/material";
import { PendingActions, DoneAll } from "@mui/icons-material";
import AlarmOnIcon from "@mui/icons-material/AlarmOn";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useKitchenStore from "../lib/kitchenStore";
import PendingMealsList from "./dashboards/components/pending-meals-list";
import ReadyMealsList from "./dashboards/components/ready-meals-list";
import ServedMealsList from "./dashboards/components/served-meals-list";

const Kitchen = () => {
  const {
    pendingMeals,
    readyMeals,
    servedMeals,
    handleFetchPendingMeals,
    handleUpdateOrderItemStatus,
    handleFetchReadyMeals,
    handleFetchServedMeals,
    subscribeToOrderItems, // ✅ Add this
    unsubscribeFromOrderItems, // ✅ Add this
  } = useKitchenStore();
  
  dayjs.extend(relativeTime);

  function elapsedMinutesSince(iso, maxMinutes) {
    try {
      const then = new Date(iso);
      const diff = Date.now() - then.getTime();
      const minutes = Math.floor(diff / 60000);
      return maxMinutes ? Math.min(minutes, maxMinutes) : minutes;
    } catch {
      return 0;
    }
  }

  function progressValue(iso, maxMinutes) {
    const elapsed = elapsedMinutesSince(iso);
    const ratio = Math.min(elapsed / maxMinutes, 1); // cap at 100%
    return ratio * 100;
  } 

  useEffect(() => {
    // Initial fetch
    handleFetchPendingMeals();
    handleFetchReadyMeals();
    handleFetchServedMeals();

    // ✅ Subscribe to realtime updates
    subscribeToOrderItems();

    // ✅ Cleanup on unmount
    return () => {
      unsubscribeFromOrderItems();
    };
  }, []);

  const getTimeAgo = (timestamp) => dayjs(timestamp).fromNow();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        {/* Left: Icon + Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <RestaurantMenuIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", letterSpacing: 0.5 }}
            >
              Kitchen Panel
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Manage orders • Track status • Stay efficient
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              borderRadius: 3,
              backgroundColor: "#fff3e0",
              boxShadow: 2,
            }}
          >
            <Avatar sx={{ backgroundColor: "#ff5722", mr: 2 }}>
              <PendingActions />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#bf360c" }}
              >
                {pendingMeals?.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#bf360c" }}>
                Pending Orders
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              borderRadius: 3,
              backgroundColor: "#e3f2fd",
              boxShadow: 2,
            }}
          >
            <Avatar sx={{ backgroundColor: "#2196f3", mr: 2 }}>
              <AlarmOnIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#0d47a1" }}
              >
                {readyMeals?.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#0d47a1" }}>
                Ready Orders
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              borderRadius: 3,
              backgroundColor: "#e8f5e9",
              boxShadow: 2,
            }}
          >
            <Avatar sx={{ backgroundColor: "#4caf50", mr: 2 }}>
              <DoneAll />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#2e7d32" }}
              >
                {servedMeals?.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#2e7d32" }}>
                Served Orders
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Dashboard */}
      <Grid container spacing={2}>
        {/* Pending Orders */}
        <Grid item xs={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              maxHeight: "100vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <CardHeader
              title="Pending Orders"
              sx={{ backgroundColor: "#ff5722", color: "#fff" }}
            />
            <CardContent sx={{ overflowY: "auto", flexGrow: 1 }}>
              {pendingMeals?.length === 0 ? (
                <Typography textAlign="center" sx={{ mt: 3, color: "#9e9e9e" }}>
                  No pending meals.
                </Typography>
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

        {/* Ready Orders */}
        <Grid item xs={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              maxHeight: "100vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardHeader
              title="Ready Orders"
              sx={{ backgroundColor: "#2196f3", color: "#fff" }}
            />
            <CardContent sx={{ overflowY: "auto", flexGrow: 1 }}>
              {readyMeals.length === 0 ? (
                <Typography textAlign="center" sx={{ mt: 3, color: "#9e9e9e" }}>
                  No ready meals.
                </Typography>
              ) : (
                  <ReadyMealsList
                    readyMeals={readyMeals}
                    handleUpdateOrderItemStatus={handleUpdateOrderItemStatus}
                    getTimeAgo={getTimeAgo}
                  />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Served Orders */}
        <Grid item xs={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              maxHeight: "100vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardHeader
              title="Served Orders (Last 24 hours)"
              sx={{ backgroundColor: "#4caf50", color: "#fff" }}
            />
            <CardContent sx={{ overflowY: "auto", flexGrow: 1 }}>
              {servedMeals?.length === 0 ? (
                <Typography textAlign="center" sx={{ mt: 3, color: "#9e9e9e" }}>
                  No served meals.
                </Typography>
              ) : (
                  <ServedMealsList
                    servedMeals={servedMeals}
                    getTimeAgo={getTimeAgo}
                  />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Kitchen;
