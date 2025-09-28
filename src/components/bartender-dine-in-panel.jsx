import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  HourglassTop,
  LocalBar,
  History,
} from "@mui/icons-material";
import TableBarTwoToneIcon from "@mui/icons-material/TableBarTwoTone";
import ReceiptTwoToneIcon from "@mui/icons-material/ReceiptTwoTone";
import PersonOutlineTwoToneIcon from "@mui/icons-material/PersonOutlineTwoTone";
import ScheduleTwoToneIcon from "@mui/icons-material/ScheduleTwoTone";
import useBarStore from "../lib/barStore";
import { useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { elapsedMinutesSince } from "../utils/format-datetime";
import BarDineInPanelSkeleton from "./skeletons/bar-dine-in-panel-skeleton";

export default function BartenderDineInPanel() {
  const {
    orderItemsLoading,
    pendingOrdersLoading,
    readyOrdersLoading,
    servedOrdersLoading,
    handleFetchOrderItems,
    pendingOrders,
    readyOrders,
    servedOrders,
    handleUpdateOrderItemStatus,
    handleFetchPendingOrders,
    handleFetchReadyOrders,
    handleFetchServedOrders,
  } = useBarStore();

  const itemsLoaded = !orderItemsLoading && !pendingOrdersLoading && !readyOrdersLoading && !servedOrdersLoading;

  useEffect(() => {
    handleFetchOrderItems();
    handleFetchPendingOrders();
    handleFetchReadyOrders();
    handleFetchServedOrders();
  }, []);

  dayjs.extend(relativeTime);

  function progressValue(iso, maxMinutes) {
    const elapsed = elapsedMinutesSince(iso);
    const ratio = Math.min(elapsed / maxMinutes, 1); // cap at 100%
    return ratio * 100;
  } 

  const getTimeAgo = (timestamp) => dayjs(timestamp).fromNow();

  return (
    <>
      {itemsLoaded ? (
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {/* Active Orders */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid #ffa726",
                cursor: "pointer",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#ef6c00",
                  }}
                >
                  <HourglassTop /> Active Drink Orders
                </Typography>
                {pendingOrders.length > 0 ? (
                  <List>
                    {pendingOrders.map((order) => {
                      const time_for_blinker = elapsedMinutesSince(
                        order.item_created_at
                      );
                      const elapsed = elapsedMinutesSince(order.item_updated_at);

                      const nearDeadline =
                        elapsed >= order?.menu_item_preparation_time - 2 &&
                        elapsed < order?.menu_item_preparation_time;
                      const overdue = elapsed >= order?.menu_item_preparation_time;

                      const blinker_near_deadline =
                        time_for_blinker >= order?.menu_item_preparation_time - 2 &&
                        time_for_blinker < order?.menu_item_preparation_time;
                      const blinker_overdue =
                        time_for_blinker >= order?.menu_item_preparation_time;
                      return (
                        <ListItem
                          key={order.order_item_id}
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
                          onClick={() => handleUpdateOrderItemStatus(order)}
                        >
                          {/* order Thumbnail */}
                          <Avatar
                            src={order.menu_item_image_url}
                            alt={order.menu_item_name}
                            variant="rounded"
                            sx={{
                              width: 64,
                              height: 64,
                              mr: 2,
                              borderRadius: 2,
                              boxShadow: 1,
                            }}
                          />

                          {/* order Details */}
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, color: "#bf360c" }}>
                              {order.menu_item_name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#6d4c41" }}>
                              <ReceiptTwoToneIcon /> ORD {order.order_id} •{" "}
                              <TableBarTwoToneIcon /> {order.table_number} •{" "}
                              <PersonOutlineTwoToneIcon />{" "}
                              {order?.waiter_first_name && order?.waiter_last_name
                                ? `${order?.waiter_first_name} ${order?.waiter_last_name}`
                                : "Unknown Waiter"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#6d4c41" }}>
                              <ScheduleTwoToneIcon />{" "}
                              {getTimeAgo(order.item_created_at)}
                            </Typography>
                          </Box>

                          {/* Status / Progress */}
                          {order?.item_status === "pending" ? (
                            <Typography variant="caption" sx={{ color: "#bf360c" }}>
                              TAP TO START
                            </Typography>
                          ) : order?.item_status === "preparing" ? (
                            <Box sx={{ width: 120, ml: 2, position: "relative" }}>
                              <LinearProgress
                                variant="determinate"
                                value={progressValue(
                                  order?.item_updated_at,
                                  order?.menu_item_preparation_time
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
                                {Math.min(
                                  elapsed,
                                  order?.menu_item_preparation_time
                                )}
                                /
                                {order?.menu_item_preparation_time +
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
                ) : (
                  <Typography color="text.secondary">No active orders</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Ready for Pickup */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid #42a5f5",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#1565c0",
                  }}
                >
                  <LocalBar /> Ready for Pickup
                </Typography>
                {readyOrders.length > 0 ? (
                  <List>
                    {readyOrders.map((order) => (
                      <ListItem
                        key={order.id}
                        sx={{
                          mb: 1.5,
                          py: 2,
                          px: 2,
                          backgroundColor: "#e3f2fd", // lighter green
                          borderRadius: 2,
                          boxShadow: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                        button
                        onClick={() => handleUpdateOrderItemStatus(order)}
                      >
                        {/* Dish Thumbnail */}
                        <Avatar
                          src={order?.menu_item_image_url}
                          alt={order?.menu_item_name}
                          variant="rounded"
                          sx={{
                            width: 64,
                            height: 64,
                            mr: 2,
                            borderRadius: 2,
                            boxShadow: 1,
                          }}
                        />

                        {/* Order Details */}
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 600, color: "#bf360c" }}>
                            {order.menu_item_name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#6d4c41" }}>
                            <ReceiptTwoToneIcon /> ORD {order.order_id} •{" "}
                            <TableBarTwoToneIcon /> {order.table_number} •{" "}
                            <PersonOutlineTwoToneIcon />{" "}
                            {order?.waiter_first_name && order?.waiter_last_name
                              ? `${order?.waiter_first_name} ${order?.waiter_last_name}`
                              : "Unknown Waiter"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#6d4c41" }}>
                            <ScheduleTwoToneIcon />{" "}
                            {getTimeAgo(order.item_created_at)}
                          </Typography>
                        </Box>

                        {/* Action Label */}
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: "#0d47a1",
                            whiteSpace: "nowrap",
                            ml: 2,
                          }}
                        >
                          TAP TO SERVE
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    No ready drinks yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Completed Orders */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid #66bb6a",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#2e7d32",
                  }}
                >
                  <History /> Recent Completed Orders
                </Typography>
                {servedOrders.length > 0 ? (
                  <List>
                    {servedOrders?.map((order) => (
                      <ListItem
                        key={order.id}
                        sx={{
                          mb: 1.5,
                          py: 2,
                          px: 2,
                          backgroundColor: "#e8f5e9", // light green background
                          borderRadius: 2,
                          boxShadow: 2,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {/* Dish Thumbnail */}
                        <Avatar
                          src={order?.menu_item_image_url}
                          alt={order?.menu_item_name}
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
                          <Typography sx={{ fontWeight: 600, color: "#2e7d32" }}>
                            {order?.menu_item_name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#43a047" }}>
                            Order #{order?.order_id} • Table {order?.table_number} •{" "}
                            {order?.waiter_first_name && order?.waiter_last_name
                              ? `${order?.waiter_first_name} ${order?.waiter_last_name}`
                              : "Unknown Waiter"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#43a047" }}>
                            {getTimeAgo(order?.updated_at)}
                          </Typography>
                        </Box>

                        {/* Optional Status Label (Uncomment if needed) */}
                        {/* <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color:
                    dish?.orders?.table_sessions?.status === "close"
                      ? "#b00020"
                      : "#1b5e20",
                  whiteSpace: "nowrap",
                  ml: 2,
                }}
              >
                {dish?.orders?.table_sessions?.status === "close"
                  ? "CLOSED"
                  : "OPEN"}
              </Typography> */}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">
                    No completed orders yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <BarDineInPanelSkeleton />
      )}
    </>
  );
}
