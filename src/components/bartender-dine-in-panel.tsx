import React, { useEffect } from "react";
import Swal from "sweetalert2";
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
  Stack,
  Chip,
  useTheme,
  alpha,
  Tabs,
  Tab,
  useMediaQuery,
} from "@mui/material";
import {
  HourglassTop,
  LocalBar,
  History,
  MenuBook,
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
import { useSettings } from "../providers/settingsProvider";

dayjs.extend(relativeTime);

interface BartenderDineInPanelProps {
  skipSubscription?: boolean;
}

const BartenderDineInPanel: React.FC<BartenderDineInPanelProps> = ({ skipSubscription = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { settings } = useSettings();
  const bs = (settings as any).bar_settings || {};
  const {
    orderItemsLoading,
    handleFetchOrderItems,
    pendingOrders,
    readyOrders,
    servedOrders,
    handleUpdateOrderItemStatus,
    subscribeToOrderItems,
    unsubscribeFromOrderItems,
  } = useBarStore();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileTab, setMobileTab] = React.useState(0);

  const [_, setTick] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const itemsLoaded = !orderItemsLoading;

  useEffect(() => {
    handleFetchOrderItems();
    if (!skipSubscription) {
      subscribeToOrderItems();
      return () => unsubscribeFromOrderItems();
    }
  }, [handleFetchOrderItems, subscribeToOrderItems, unsubscribeFromOrderItems, skipSubscription]);

  const getTimeAgo = (timestamp: string) => dayjs(timestamp).fromNow();

  const renderActiveList = () => (
    <CardContent sx={{ flex: 1, overflowY: 'auto', pt: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5, color: isDark ? "warning.main" : "#ef6c00", fontWeight: '800' }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', width: 32, height: 32 }}>
          <HourglassTop sx={{ fontSize: 18 }} />
        </Avatar>
        Active Drink Orders
      </Typography>
      <List>
        {pendingOrders.map((order: any) => {
          const startTime = order.order_item_status === 'preparing' ? (order.updated_at || order.task_created_at) : order.task_created_at;
          const startMs = new Date(startTime).getTime();
          const diffMs = Math.max(0, Date.now() - startMs);
          const elapsedMins = Math.floor(diffMs / 60000);
          const sla = order?.menu_item_preparation_time || 5;
          const progress = Math.min(100, (diffMs / (sla * 60000)) * 100);
          
          const isCritical = progress >= 100;
          const isWarning = progress >= 75;

          return (
            <ListItem 
              key={order.kitchen_task_id} 
              sx={(theme) => ({ 
                mb: 2, 
                py: 2, 
                px: 2, 
                borderRadius: 2, 
                boxShadow: 1, 
                bgcolor: 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `1px solid ${theme.palette.divider}`,
                borderLeft: `6px solid ${isCritical ? theme.palette.error.main : isWarning ? theme.palette.warning.main : theme.palette.info.main}`,
                animation: (isCritical && bs.enable_overdue_pulse !== false) ? "pulseCriticalBar 2s infinite" : "none",
                "@keyframes pulseCriticalBar": {
                  "0%": { boxShadow: `0 0 0 0 ${theme.palette.error.light}40` },
                  "70%": { boxShadow: `0 0 0 10px ${theme.palette.error.light}00` },
                  "100%": { boxShadow: `0 0 0 0 ${theme.palette.error.light}00` }
                },
                '&:hover': { transform: 'scale(1.02)', boxShadow: 3 }
              })} 
              onClick={() => handleUpdateOrderItemStatus(order)}
            >
              <Avatar src={order.menu_item_image_url} variant="rounded" sx={{ width: 64, height: 64, mr: 2, borderRadius: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                   <Typography sx={{ fontWeight: 700, color: isDark ? "warning.light" : "#bf360c" }}>{order.menu_item_name}</Typography>
                   {isCritical && <Chip label="Overdue" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />}
                </Stack>
                
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary", mb: 1 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TableBarTwoToneIcon sx={{ fontSize: 14 }} /> {order.table_number}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonOutlineTwoToneIcon sx={{ fontSize: 14 }} /> {order.waiter_first_name}
                  </Typography>
                </Stack>

                {bs.show_order_notes !== false && order.notes && (
                  <Box sx={{ mb: 1, p: 1, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)', borderLeft: '3px solid', borderColor: 'warning.main' }}>
                    <Typography variant="caption" sx={{ fontStyle: 'italic', fontWeight: 600, color: isDark ? 'warning.light' : 'warning.dark', display: 'block' }}>
                      Note: {order.notes}
                    </Typography>
                  </Box>
                )}

                {bs.show_recipes !== false && order.recipe && (
                  <Box 
                    sx={{ 
                      mb: 1, p: 1, borderRadius: 1.5, 
                      bgcolor: isDark ? 'rgba(156, 39, 176, 0.1)' : 'rgba(156, 39, 176, 0.05)', 
                      borderLeft: '3px solid', borderColor: 'secondary.main',
                      cursor: 'help',
                      '&:hover': { bgcolor: isDark ? 'rgba(156, 39, 176, 0.2)' : 'rgba(156, 39, 176, 0.1)' }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      Swal.fire({
                        title: `${order.menu_item_name} Recipe`,
                        text: order.recipe,
                        icon: 'info',
                        confirmButtonText: 'Got it'
                      });
                    }}
                  >
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, color: 'secondary.main' }}>
                      <MenuBook sx={{ fontSize: 14 }} /> View Recipe
                    </Typography>
                  </Box>
                )}

                {order.modifier_names && order.modifier_names.length > 0 && (
                  <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {order.modifier_names.map((mod: any, i: number) => (
                      <Chip 
                        key={i} 
                        label={mod.name} 
                        size="small" 
                        variant="outlined"
                        color="warning"
                        sx={{ height: 20, fontSize: '0.65rem' }} 
                      />
                    ))}
                  </Box>
                )}

                {bs.show_sla_progress !== false && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                       <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ height: 6, borderRadius: 3 }}
                          color={isCritical ? "error" : isWarning ? "warning" : "primary"} 
                        />
                    </Box>
                    <Typography variant="caption" fontWeight="bold" sx={{ minWidth: 40 }}>
                       {elapsedMins}/{sla}m
                    </Typography>
                  </Box>
                )}
              </Box>
            </ListItem>
          );
        })}
        {pendingOrders.length === 0 && <Typography align="center" sx={{ py: 4, opacity: 0.6 }}>No pending drinks 🥂</Typography>}
      </List>
    </CardContent>
  );

  const renderReadyList = () => (
    <CardContent sx={{ flex: 1, overflowY: 'auto', pt: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5, color: isDark ? "info.main" : "#1565c0", fontWeight: '800' }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', width: 32, height: 32 }}>
         <LocalBar sx={{ fontSize: 18 }} />
        </Avatar>
        Ready to Collect
      </Typography>
      <List>
        {readyOrders.map((order: any) => (
          <ListItem 
             key={order.kitchen_task_id} 
             onClick={() => handleUpdateOrderItemStatus(order)} 
              sx={{ 
               mb: 1.5, 
               py: 2, 
               px: 2, 
               borderRadius: 2, 
               bgcolor: isDark ? 'rgba(21, 101, 192, 0.1)' : '#e3f2fd', 
               cursor: 'pointer',
               transition: '0.2s',
               border: isDark ? '1px solid rgba(21, 101, 192, 0.2)' : 'none',
               '&:hover': { bgcolor: isDark ? 'rgba(21, 101, 192, 0.2)' : '#bbdefb' }
             }}
           >
             <Avatar src={order?.menu_item_image_url} variant="rounded" sx={{ width: 56, height: 56, mr: 2, borderRadius: 2 }} />
             <Box sx={{ flex: 1 }}>
               <Typography fontWeight={700}>{order.menu_item_name}</Typography>
               <Typography variant="caption" display="block">Table {order.table_number} • {order.waiter_first_name}</Typography>
               <Typography variant="caption" color="text.secondary">Ready {getTimeAgo(order.updated_at)}</Typography>
               {order.notes && (
                 <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic', color: 'info.main', fontWeight: 600 }}>
                   Note: {order.notes}
                 </Typography>
               )}
               {order.modifier_names && order.modifier_names.length > 0 && (
                 <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                   {order.modifier_names.map((mod: any, i: number) => (
                     <Chip 
                       key={i} 
                       label={mod.name} 
                       size="small" 
                       variant="outlined"
                       color="info"
                       sx={{ height: 18, fontSize: '0.6rem' }} 
                     />
                   ))}
                 </Box>
               )}
             </Box>
          </ListItem>
        ))}
        {readyOrders.length === 0 && <Typography align="center" sx={{ py: 4, opacity: 0.6 }}>None ready</Typography>}
      </List>
    </CardContent>
  );

  const renderServedList = () => (
    <CardContent sx={{ flex: 1, overflowY: 'auto', pt: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5, color: isDark ? "success.main" : "#2e7d32", fontWeight: '800' }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', width: 32, height: 32 }}>
         <History sx={{ fontSize: 18 }} />
        </Avatar>
        Recently Served
      </Typography>
      <List>
        {servedOrders.map((order: any) => (
          <ListItem key={order.kitchen_task_id} sx={{ mb: 1.5, py: 1.5, px: 2, borderRadius: 2, bgcolor: isDark ? 'rgba(46, 125, 50, 0.1)' : '#e8f5e9', border: isDark ? '1px solid rgba(46, 125, 50, 0.2)' : 'none', opacity: 0.8 }}>
             <Avatar src={order?.menu_item_image_url} variant="rounded" sx={{ width: 48, height: 48, mr: 2, borderRadius: 2 }} />
             <Box sx={{ flex: 1 }}>
               <Typography fontWeight={600} variant="body2">{order?.menu_item_name}</Typography>
               <Typography variant="caption" display="block">Table {order.table_number}</Typography>
               <Typography variant="caption" color="text.secondary">Served {getTimeAgo(order?.updated_at)}</Typography>
             </Box>
          </ListItem>
        ))}
        {servedOrders.length === 0 && <Typography align="center" sx={{ py: 4, opacity: 0.6 }}>No history yet</Typography>}
      </List>
    </CardContent>
  );

  return (
    <>
      {itemsLoaded ? (
        <>
          {isMobile ? (
            <Box sx={{ mt: 2 }}>
              <Tabs
                value={mobileTab}
                onChange={(_, v) => setMobileTab(v)}
                variant="fullWidth"
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label={`Active (${pendingOrders.length})`} />
                <Tab label={`Ready (${readyOrders.length})`} />
                {bs.show_served_column !== false && <Tab label={`Served (${servedOrders.length})`} />}
              </Tabs>
              <Card sx={{ 
                borderRadius: 4, 
                border: "1px solid", 
                borderColor: 
                  mobileTab === 0 ? (isDark ? alpha(theme.palette.warning.dark, 0.3) : alpha(theme.palette.warning.main, 0.3)) :
                  mobileTab === 1 ? (isDark ? alpha(theme.palette.info.dark, 0.3) : alpha(theme.palette.info.main, 0.3)) :
                  (isDark ? alpha(theme.palette.success.dark, 0.3) : alpha(theme.palette.success.main, 0.3)),
                height: 'auto', 
                maxHeight: 600, 
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: isDark ? 'none' : theme.shadows[1],
                bgcolor: isDark ? alpha(theme.palette.background.paper, 0.8) : 'background.paper'
              }}>
                {mobileTab === 0 && renderActiveList()}
                {mobileTab === 1 && renderReadyList()}
                {mobileTab === 2 && (bs.show_served_column !== false) && renderServedList()}
              </Card>
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  borderRadius: 4, 
                  border: "1px solid", 
                  borderColor: isDark ? alpha(theme.palette.warning.dark, 0.3) : alpha(theme.palette.warning.main, 0.3), 
                  height: '100%', 
                  maxHeight: 800, 
                  display: 'flex', 
                  flexDirection: 'column',
                  boxShadow: isDark ? 'none' : theme.shadows[1],
                  bgcolor: isDark ? alpha(theme.palette.background.paper, 0.8) : 'background.paper'
                }}>
                  {renderActiveList()}
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                 <Card sx={{ 
                   borderRadius: 4, 
                   border: "1px solid", 
                   borderColor: isDark ? alpha(theme.palette.info.dark, 0.3) : alpha(theme.palette.info.main, 0.3), 
                   height: '100%', 
                   maxHeight: 800, 
                   display: 'flex', 
                   flexDirection: 'column',
                   boxShadow: isDark ? 'none' : theme.shadows[1],
                   bgcolor: isDark ? alpha(theme.palette.background.paper, 0.8) : 'background.paper'
                 }}>
                   {renderReadyList()}
                 </Card>
              </Grid>
              {bs.show_served_column !== false && (
              <Grid item xs={12} md={4}>
                 <Card sx={{ 
                   borderRadius: 4, 
                   border: "1px solid", 
                   borderColor: isDark ? alpha(theme.palette.success.dark, 0.3) : alpha(theme.palette.success.main, 0.3), 
                   height: '100%', 
                   maxHeight: 800, 
                   display: 'flex', 
                   flexDirection: 'column',
                   boxShadow: isDark ? 'none' : theme.shadows[1],
                   bgcolor: isDark ? alpha(theme.palette.background.paper, 0.8) : 'background.paper'
                 }}>
                   {renderServedList()}
                 </Card>
              </Grid>
              )}
            </Grid>
          )}
        </>
      ) : (
        <BarDineInPanelSkeleton />
      )}
    </>
  );
};

export default BartenderDineInPanel;
