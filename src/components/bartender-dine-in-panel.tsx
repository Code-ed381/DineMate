import React, { useEffect } from "react";
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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { elapsedMinutesSince } from "../utils/format-datetime";
import BarDineInPanelSkeleton from "./skeletons/bar-dine-in-panel-skeleton";

dayjs.extend(relativeTime);

const BartenderDineInPanel: React.FC = () => {
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
    subscribeToOrderItems,
    unsubscribeFromOrderItems,
  } = useBarStore();

  const itemsLoaded = !orderItemsLoading && !pendingOrdersLoading && !readyOrdersLoading && !servedOrdersLoading;

  useEffect(() => {
    handleFetchOrderItems();
    handleFetchPendingOrders();
    handleFetchReadyOrders();
    handleFetchServedOrders();
    subscribeToOrderItems();
    return () => unsubscribeFromOrderItems();
  }, [handleFetchOrderItems, handleFetchPendingOrders, handleFetchReadyOrders, handleFetchServedOrders, subscribeToOrderItems, unsubscribeFromOrderItems]);

  const progressValue = (iso: string, maxMinutes: number) => {
    const elapsed = elapsedMinutesSince(iso);
    const ratio = Math.min(elapsed / maxMinutes, 1);
    return ratio * 100;
  }; 

  const getTimeAgo = (timestamp: string) => dayjs(timestamp).fromNow();

  return (
    <>
      {itemsLoaded ? (
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, border: "1px solid #ffa726" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "#ef6c00" }}>
                  <HourglassTop /> Active Drink Orders
                </Typography>
                <List>
                  {pendingOrders.map((order: any) => {
                    const elapsed = elapsedMinutesSince(order.item_updated_at);
                    const overdue = elapsed >= order?.menu_item_preparation_time;
                    return (
                      <ListItem key={order.order_item_id} sx={{ mb: 1.5, py: 2, px: 2, borderRadius: 2, boxShadow: 2, bgcolor: 'background.paper' }} onClick={() => handleUpdateOrderItemStatus(order)}>
                        <Avatar src={order.menu_item_image_url} variant="rounded" sx={{ width: 64, height: 64, mr: 2, borderRadius: 2 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 600, color: "#bf360c" }}>{order.menu_item_name}</Typography>
                          <Typography variant="body2" sx={{ color: "#6d4c41" }}>
                            <ReceiptTwoToneIcon fontSize="small" /> ORD {order.order_id} • <TableBarTwoToneIcon fontSize="small" /> {order.table_number}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#6d4c41" }}><ScheduleTwoToneIcon fontSize="small" /> {getTimeAgo(order.item_created_at)}</Typography>
                        </Box>
                        {order?.item_status === "preparing" && (
                          <Box sx={{ width: 80, ml: 1 }}>
                            <LinearProgress variant="determinate" value={progressValue(order?.item_updated_at, order?.menu_item_preparation_time)} color={overdue ? "error" : "primary"} />
                          </Box>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
             <Card sx={{ borderRadius: 3, border: "1px solid #42a5f5" }}>
               <CardContent>
                 <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "#1565c0" }}><LocalBar /> Ready</Typography>
                 <List>
                   {readyOrders.map((order: any) => (
                     <ListItem key={order.id} onClick={() => handleUpdateOrderItemStatus(order)} sx={{ mb: 1.5, py: 2, px: 2, borderRadius: 2, bgcolor: '#e3f2fd' }}>
                        <Avatar src={order?.menu_item_image_url} variant="rounded" sx={{ width: 64, height: 64, mr: 2 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={600}>{order.menu_item_name}</Typography>
                          <Typography variant="body2">Table {order.table_number}</Typography>
                        </Box>
                     </ListItem>
                   ))}
                 </List>
               </CardContent>
             </Card>
          </Grid>
          <Grid item xs={12} md={4}>
             <Card sx={{ borderRadius: 3, border: "1px solid #66bb6a" }}>
               <CardContent>
                 <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "#2e7d32" }}><History /> Served</Typography>
                 <List>
                   {servedOrders.map((order: any) => (
                     <ListItem key={order.id} sx={{ mb: 1.5, py: 2, px: 2, borderRadius: 2, bgcolor: '#e8f5e9' }}>
                        <Avatar src={order?.menu_item_image_url} variant="rounded" sx={{ width: 64, height: 64, mr: 2 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={600}>{order?.menu_item_name}</Typography>
                          <Typography variant="body2">Served {getTimeAgo(order?.updated_at)}</Typography>
                        </Box>
                     </ListItem>
                   ))}
                 </List>
               </CardContent>
             </Card>
          </Grid>
        </Grid>
      ) : (
        <BarDineInPanelSkeleton />
      )}
    </>
  );
};

export default BartenderDineInPanel;
