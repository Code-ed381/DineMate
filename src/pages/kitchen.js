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
import Slide from "@mui/material/Slide";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useKitchenStore from "../lib/kitchenStore";
import PendingMealsList from "./dashboards/components/pending-meals-list";
import ReadyMealsList from "./dashboards/components/ready-meals-list";
import ServedMealsList from "./dashboards/components/served-meals-list";
import useTablesStore from "../lib/tablesStore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { formatDateTimeWithSuffix } from "../utils/format-datetime";

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

  const getTimeAgo = (timestamp) => formatDateTimeWithSuffix(timestamp);

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
                variant="body2"
                sx={{
                  color: "#bf360c",
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  fontSize: "1rem",
                }}
              >
                Pending Orders {<Chip label={pendingMeals?.length} />}
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
                variant="body2"
                sx={{
                  color: "#0d47a1",
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  fontSize: "1rem",
                }}
              >
                Ready Orders {<Chip label={readyMeals?.length} />}
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
                variant="body2"
                sx={{
                  color: "#2e7d32",
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  fontSize: "1rem",
                }}
              >
                Served Orders {<Chip label={servedMeals?.length} />}
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
            <CardContent sx={{ overflowY: "auto", flexGrow: 1 }}>
              {pendingMeals?.length === 0 ? (
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <InfoOutlinedIcon sx={{ mb: 1 }} fontSize="large" />
                  <Typography variant="body1" fontWeight={600}>
                    No pending orders
                  </Typography>
                  {/* <Typography variant="body2" color="text.secondary">
                All clear — great job! 🎉
              </Typography> */}
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
            <CardContent sx={{ overflowY: "auto", flexGrow: 1 }}>
              {readyMeals.length === 0 ? (
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <InfoOutlinedIcon sx={{ mb: 1 }} fontSize="large" />
                  <Typography variant="body1" fontWeight={600}>
                    No ready orders
                  </Typography>
                  {/* <Typography variant="body2" color="text.secondary">
                All clear — great job! 🎉
              </Typography> */}
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
            <CardContent sx={{ overflowY: "auto", flexGrow: 1 }}>
              {servedMeals?.length === 0 ? (
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <InfoOutlinedIcon sx={{ mb: 1 }} fontSize="large" />
                  <Typography variant="body1" fontWeight={600}>
                    No served orders
                  </Typography>
                  {/* <Typography variant="body2" color="text.secondary">
                All clear — great job! 🎉
              </Typography> */}
                </Box>
              ) : (
                <ServedMealsList
                  servedMeals={servedMeals}
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
