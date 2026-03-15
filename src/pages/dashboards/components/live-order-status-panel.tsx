import React from "react";
import { Box, Card, CardHeader, CardContent, Divider, Typography, Chip, Stack, Paper, LinearProgress, alpha } from "@mui/material";
import OutdoorGrillTwoToneIcon from "@mui/icons-material/OutdoorGrillTwoTone";
import PendingActionsTwoToneIcon from "@mui/icons-material/PendingActionsTwoTone";
import EmptyState from "../../../components/empty-state";
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
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider', height: "100%", maxHeight: 900, display: "flex", flexDirection: "column" }}>
      <CardHeader 
        avatar={filter === "pending" ? <PendingActionsTwoToneIcon sx={{ fontSize: { xs: 20, md: 24 } }} /> : <OutdoorGrillTwoToneIcon sx={{ fontSize: { xs: 20, md: 24 } }} />} 
        title={<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>{title}</Typography>
          <Chip label={pendingMeals?.filter((o) => o?.order_item_status === filter).length || 0} size="small" color="primary" sx={{ fontWeight: 800 }} />
        </Box>} 
        sx={{ p: { xs: 1.5, md: 2 }, pb: 0 }}
      />
      <Divider sx={{ mt: 1.5 }} />
      <CardContent sx={{ p: { xs: 1, md: 2 }, overflowY: "auto", flex: 1 }}>
        <Stack spacing={1.5}>
          {pendingMeals?.filter((o) => o?.order_item_status === filter).map((order) => {
            // ... (keep the same logic for calculations)
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

            return (
              <Paper 
                key={order.kitchen_task_id || order.order_item_id} 
                variant="outlined" 
                sx={(theme) => ({ 
                  p: { xs: 1.5, md: 2 }, 
                  borderRadius: 2, 
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${theme.palette.divider}`,
                  borderLeft: `${{ xs: '4px', md: '6px' }} solid ${isCritical ? theme.palette.error.main : isWarning ? theme.palette.warning.main : theme.palette.info.main}`,
                  boxShadow: isCritical ? `0 4px 12px ${theme.palette.error.light}44` : 'none',
                  animation: isCritical ? "pulseCritical 2s infinite" : "none",
                })}
              >
                <Box sx={{ width: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.2 }}>{order?.menu_item_name}</Typography>
                    {isCritical && <Chip label="Overdue" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />}
                  </Stack>
                  
                  <Stack direction="row" spacing={2} sx={{ mb: 1.5, color: 'text.secondary' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Box {order?.table_number || "—"}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>#{String(order?.order_id || "").slice(0, 5) || "—"}</Typography>
                  </Stack>

                  <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
                    <Box sx={{ flex: 1 }}>
                       <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3, 
                            bgcolor: (theme) => alpha(theme.palette.divider, 0.1),
                            "& .MuiLinearProgress-bar": {
                                bgcolor: isCritical ? "error.main" : isWarning ? "warning.main" : "primary.main",
                                transition: "transform 0.5s linear"
                            }
                          }} 
                        />
                    </Box>
                    <Typography variant="caption" fontWeight="900" color={isCritical ? "error.main" : "text.primary"} sx={{ minWidth: 50, textAlign: 'right', fontSize: '0.75rem' }}>
                       {elapsedMins}/{sla}m
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            );
          })}
          {pendingMeals?.filter((meal) => meal?.order_item_status === filter).length === 0 && (
            <EmptyState 
              title="No Tasks" 
              description={`No orders ${filter} currently.`} 
              emoji="👨‍🍳"
              height={200}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LiveOrderQueueCard;
