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
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%", maxHeight: 900, display: "flex", flexDirection: "column" }}>
      <CardHeader avatar={filter === "pending" ? <PendingActionsTwoToneIcon /> : <OutdoorGrillTwoToneIcon />} title={<>{title} <Chip label={pendingMeals?.filter((o) => o?.item_status === filter).length || 0} size="small" /></>} />
      <Divider />
      <CardContent sx={{ p: 2, overflowY: "auto", flex: 1 }}>
        <Stack spacing={2}>
          {pendingMeals?.filter((o) => o?.item_status === filter).map((order) => {
            const elapsed = elapsedMinutesSince(order.item_created_at);
            const sla = order?.menu_item_preparation_time || 15;
            const overdue = elapsed >= sla;
            const elapsed_update = elapsedMinutesSince(order?.item_updated_at);
            const overdue_update = elapsed_update >= sla;
            return (
              <Paper key={order.order_item_id} variant="outlined" sx={(theme: any) => ({ p: 2, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", animation: overdue ? "pulseBg 1.5s infinite" : "none", "@keyframes pulseBg": { "0%, 100%": { boxShadow: `0 0 0px ${theme.palette.error.main}` }, "50%": { boxShadow: `0 0 12px ${theme.palette.error.main}` } } })}>
                <Box sx={{ flex: 1, pr: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 600 }}>{order?.menu_item_name}</Typography>
                    {order?.item_updated_at && overdue_update && <Chip label="Should be ready" size="small" color="success" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">Table {order?.table_number || "—"} • Order {order?.order_id || "—"}</Typography>
                  <Typography variant="body2" color="text.secondary">Ordered {formatDateTimeWithSuffix(order?.item_created_at)}</Typography>
                  <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <LinearProgress sx={(theme: any) => ({ width: order?.item_updated_at ? "80%" : "100%", height: 8, borderRadius: 1 })} variant={order?.item_status === "preparing" ? "determinate" : "indeterminate"} value={Math.min(100, (elapsed_update / sla) * 100)} />
                    {order.item_updated_at && <Typography variant="caption" color={overdue_update ? "error.main" : "text.secondary"}>{Math.min(elapsed_update, sla)}/{sla} min</Typography>}
                  </Box>
                </Box>
              </Paper>
            );
          })}
          {pendingMeals?.filter((meal) => meal?.item_status === filter).length === 0 && (
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <InfoOutlinedIcon sx={{ mb: 1 }} fontSize="large" />
              <Typography variant="body1" fontWeight={600}>No {filter} orders</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LiveOrderQueueCard;
