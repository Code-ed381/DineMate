import React from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Typography,
  Chip,
  Stack,
  Paper,
  LinearProgress,
} from "@mui/material";
import EventNoteTwoToneIcon from "@mui/icons-material/EventNoteTwoTone";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// utils you already had
import { elapsedMinutesSince, formatDateTimeWithSuffix } from "../../../utils/format-datetime";

function LiveOrderQueueCard({ pendingMeals, pendingCount }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        maxHeight: "80vh",
        overflow: "auto",
        boxShadow: 3,
      }}
    >
      <CardHeader
        sx={{
          "& .MuiCardHeader-title": {
            fontWeight: 700,
            fontSize: "1.1rem",
          },
        }}
        avatar={<EventNoteTwoToneIcon />}
        title={
          <>
            Live Order Queue <Chip label={pendingCount || 0} size="small" />
          </>
        }
      />
      <Divider />
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          {pendingMeals.map((order) => {
            const elapsed = elapsedMinutesSince(order.item_created_at);
            const sla = order?.menu_item_preparation_time;
            const progress = Math.min(100, (elapsed / sla) * 100);
            const overdue = elapsed >= sla;

            const elapsed_update = elapsedMinutesSince(order?.item_updated_at);
            const progress_update = Math.min(100, (elapsed_update / sla) * 100);
            const overdue_update = elapsed_update >= sla;

            return (
              <Paper
                key={order.order_item_id}
                variant="outlined"
                sx={(theme) => ({
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                //   backgroundColor: overdue
                //     ? theme.palette.tonalOffset?.light ||
                //       theme.palette.error.light
                //     : theme.palette.background.paper,
                  animation: overdue ? "pulseBg 1.5s infinite" : "none",
                  "@keyframes pulseBg": {
                    "0%": { boxShadow: `0 0 0px ${theme.palette.error.main}` },
                    "50%": {
                      boxShadow: `0 0 12px ${theme.palette.error.main}`,
                    },
                    "100%": {
                      boxShadow: `0 0 0px ${theme.palette.error.main}`,
                    },
                  },
                })}
              >
                {/* Left: Order Info */}
                <Box sx={{ flex: 1, pr: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 600 }} color="text.primary">
                      {order?.menu_item_name}
                    </Typography>
                    {order?.item_updated_at && overdue_update && (
                      <Chip
                        label="Should be ready"
                        size="small"
                        color="success"
                      />
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Table {order?.table_number || "—"} • Order{" "}
                    {order?.order_id || "—"}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Ordered {formatDateTimeWithSuffix(order?.item_created_at)}
                  </Typography>

                  {/* Progress + Time Row */}
                  <Box
                    sx={{
                      mt: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <LinearProgress
                      sx={(theme) => ({
                        width: order?.item_updated_at ? "80%" : "100%",
                        height: 8,
                        borderRadius: 1,
                        bgcolor: theme.palette.grey[300],
                        "& .MuiLinearProgress-bar": {
                          bgcolor:
                            order?.item_status === "preparing" ||
                            order?.item_status === "pending"
                              ? theme.palette.primary.main
                              : overdue
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                        },
                      })}
                      variant={
                        order?.item_status === "preparing"
                          ? "determinate"
                          : "indeterminate"
                      }
                      value={progress_update}
                    />
                    {order.item_updated_at && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: overdue_update
                            ? "error.main"
                            : "text.secondary",
                          textAlign: "right",
                        }}
                      >
                        {Math.min(
                          elapsed_update,
                          order.menu_item_preparation_time
                        )}
                        /{order.menu_item_preparation_time + " min"}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            );
          })}

          {pendingMeals.length === 0 && (
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <InfoOutlinedIcon sx={{ mb: 1 }} fontSize="large"/>
              <Typography variant="body1" fontWeight={600}>
                No active orders
              </Typography>
              {/* <Typography variant="body2" color="text.secondary">
                All clear — great job! 🎉
              </Typography> */}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default LiveOrderQueueCard;