import React from "react";
import { Box, Card, CardHeader, CardContent, Divider, Typography, Chip, Stack, Paper, LinearProgress } from "@mui/material";
import OutdoorGrillTwoToneIcon from "@mui/icons-material/OutdoorGrillTwoTone";
import PendingActionsTwoToneIcon from "@mui/icons-material/PendingActionsTwoTone";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { elapsedMinutesSince, formatDateTimeWithSuffix } from "../../../utils/format-datetime";

interface LiveOrderQueueCardProps {
  pendingMeals: any[];
  filter: string;
  title: string;
}

const LiveOrderQueueCard: React.FC<LiveOrderQueueCardProps> = ({ pendingMeals, filter, title }) => {
  const [_, setTick] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 5000); // Update every 5 seconds for smoother but performant UI
    return () => clearInterval(timer);
  }, []);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%", maxHeight: 900, display: "flex", flexDirection: "column" }}>
      <CardHeader 
        avatar={filter === "pending" ? <PendingActionsTwoToneIcon /> : <OutdoorGrillTwoToneIcon />} 
        title={<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">{title}</Typography>
          <Chip label={pendingMeals?.filter((o) => o?.order_item_status === filter).length || 0} size="small" color="primary" />
        </Box>} 
      />
      <Divider />
      <CardContent sx={{ p: 2, overflowY: "auto", flex: 1 }}>
        <Stack spacing={2}>
          {pendingMeals?.filter((o) => o?.order_item_status === filter).map((order) => {
            // Calculate precise elapsed time
            const startTime = filter === 'pending' ? order.task_created_at : (order.updated_at || order.task_created_at);
            const startMs = new Date(startTime).getTime();
            const nowMs = Date.now();
            const diffMs = Math.max(0, nowMs - startMs);
            const elapsedMins = Math.floor(diffMs / 60000);
            
            const sla = order?.menu_item_preparation_time || 15;
            const progress = Math.min(100, (diffMs / (sla * 60000)) * 100);
            
            const overdue = elapsedMins >= sla;
            const isCritical = progress >= 100;
            const isWarning = progress >= 75;

            // Dynamic border color
            let borderColor = "transparent";
            if (isCritical) borderColor = "#d32f2f"; // error.main
            else if (isWarning) borderColor = "#ed6c02"; // warning.main

            return (
              <Paper 
                key={order.kitchen_task_id || order.order_item_id} 
                variant="outlined" 
                sx={(theme) => ({ 
                  p: 2, 
                  borderRadius: 2, 
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${theme.palette.divider}`,
                  borderLeft: `6px solid ${isCritical ? theme.palette.error.main : isWarning ? theme.palette.warning.main : theme.palette.info.main}`,
                  boxShadow: isCritical ? `0 4px 12px ${theme.palette.error.light}` : 'none',
                  animation: isCritical ? "pulseCritical 2s infinite" : "none",
                  "@keyframes pulseCritical": {
                    "0%": { boxShadow: `0 0 0 0 ${theme.palette.error.light}40` },
                    "70%": { boxShadow: `0 0 0 10px ${theme.palette.error.light}00` },
                    "100%": { boxShadow: `0 0 0 0 ${theme.palette.error.light}00` }
                  }
                })}
              >
                <Box sx={{ width: '100%' }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>{order?.menu_item_name}</Typography>
                    {isCritical && <Chip label="Overdue" size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />}
                  </Stack>
                  
                  <Stack direction="row" spacing={2} sx={{ mb: 2, color: 'text.secondary' }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Box {order?.table_number || "—"}
                    </Typography>
                    <Typography variant="caption">Order #{String(order?.order_id || "").slice(0, 5) || "—"}</Typography>
                  </Stack>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                       <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4, 
                            bgcolor: (theme) => theme.palette.grey[200],
                            "& .MuiLinearProgress-bar": {
                                bgcolor: isCritical ? "error.main" : isWarning ? "warning.main" : "primary.main",
                                transition: "transform 0.5s linear"
                            }
                          }} 
                        />
                    </Box>
                    <Typography variant="caption" fontWeight="bold" color={isCritical ? "error.main" : "text.primary"} sx={{ minWidth: 60, textAlign: 'right' }}>
                       {elapsedMins} / {sla} m
                    </Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                     {filter === 'pending' ? 'Ordered' : 'Started'} {formatDateTimeWithSuffix(startTime)}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
          {pendingMeals?.filter((meal) => meal?.order_item_status === filter).length === 0 && (
            <Box sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
              <InfoOutlinedIcon sx={{ mb: 1, fontSize: 40 }} />
              <Typography variant="body1" fontWeight={500}>No orders pending</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LiveOrderQueueCard;
