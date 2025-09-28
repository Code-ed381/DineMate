import {
  List,
  ListItem,
  Box,
  Typography,
  LinearProgress,
  Avatar,
} from "@mui/material";
import { useState, useEffect } from "react";

function useNow(interval = 60000) {
  // re-renders the component every interval (default: 1 min)
  const [, setTick] = useState(0);

  useEffect(() => {
      const id = setInterval(() => {
      setTick((t) => t + 1); // force re-render
      }, interval);
      return () => clearInterval(id);
  }, [interval]);
}

function PendingMealsList({ pendingMeals, handleUpdateOrderItemStatus, getTimeAgo, elapsedMinutesSince, progressValue }) {
  // auto re-render every 30s
  useNow(30000);

  return (
    <List>
          {pendingMeals?.map((dish) => {
            const time_for_blinker = elapsedMinutesSince(dish.item_created_at);
            const elapsed = elapsedMinutesSince(dish.item_updated_at);
            
            const nearDeadline = elapsed >= dish?.menu_item_preparation_time - 2 && elapsed < dish?.menu_item_preparation_time;
            const overdue = elapsed >= dish?.menu_item_preparation_time;
              
            const blinker_near_deadline = time_for_blinker >= dish?.menu_item_preparation_time - 2 && time_for_blinker < dish?.menu_item_preparation_time;
            const blinker_overdue = time_for_blinker >= dish?.menu_item_preparation_time;

            return (
              <ListItem
                key={dish.order_item_id}
                sx={{
                  mb: 1.5,
                  py: 2,
                  px: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  backgroundColor: blinker_overdue
                    ? "#ffebee" // light red when overdue
                    : blinker_near_deadline
                    ? "#fff3e0" // amber for near
                    : "#fff",
                  animation:
                    blinker_near_deadline || blinker_overdue
                      ? "pulseBg 1.5s infinite"
                      : "none",
                  "@keyframes pulseBg": {
                    "0%": { boxShadow: "0 0 0px rgba(211,47,47,0.6)" },
                    "50%": { boxShadow: "0 0 12px rgba(211,47,47,0.9)" },
                    "100%": { boxShadow: "0 0 0px rgba(211,47,47,0.6)" },
                  },
                  display: "flex",
                  alignItems: "center",
                }}
                button
                onClick={() => handleUpdateOrderItemStatus(dish)}
              >
                {/* Dish Thumbnail */}
                <Avatar
                  src={dish.menu_item_image_url}
                  alt={dish.menu_item_name}
                  variant="rounded"
                  sx={{
                    width: 64,
                    height: 64,
                    mr: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                />

                {/* Dish Details */}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: "#bf360c" }}>
                    {dish.menu_item_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6d4c41" }}>
                    Order #{dish.order_id} • Table {dish.table_number} •{" "}
                    {dish?.waiter_first_name && dish?.waiter_last_name ? `${dish?.waiter_first_name} ${dish?.waiter_last_name}` : "Unknown Waiter"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6d4c41" }}>
                    {getTimeAgo(dish.item_created_at)}
                  </Typography>
                </Box>

                {/* Status / Progress */}
                {dish?.item_status === "pending" ? (
                  <Typography variant="caption" sx={{ color: "#bf360c" }}>
                    TAP TO START
                  </Typography>
                ) : dish?.item_status === "preparing" ? (
                  <Box sx={{ width: 120, ml: 2, position: "relative" }}>
                    <LinearProgress
                      variant="determinate"
                      value={progressValue(
                        dish?.item_updated_at,
                        dish?.menu_item_preparation_time
                      )}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: "#ffe0b2",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: overdue
                            ? "#b71c1c"
                            : nearDeadline
                            ? "#d32f2f"
                            : "#ff5722",
                          animation:
                            nearDeadline || overdue
                              ? "pulse 1.2s infinite"
                              : "none",
                        },
                        "@keyframes pulse": {
                          "0%": { opacity: 1 },
                          "50%": { opacity: 0.4 },
                          "100%": { opacity: 1 },
                        },
                      }}
                    />

                    <Typography
                      variant="caption"
                      sx={{
                        color: overdue ? "#b71c1c" : "#6d4c41",
                        textAlign: "right",
                      }}
                    >
                      {Math.min(elapsed, dish?.menu_item_preparation_time)}/
                      {dish?.menu_item_preparation_time +
                        " min - Tap when ready"}
                    </Typography>

                    {nearDeadline && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -12,
                          right: -12,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: "#d32f2f",
                          animation: "blinker 1s linear infinite",
                          "@keyframes blinker": {
                            "50%": { opacity: 0 },
                          },
                        }}
                      />
                    )}
                  </Box>
                ) : null}
              </ListItem>
            );
        })}
    </List>
  );
}


export default PendingMealsList;
