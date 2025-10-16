import React, { useMemo } from "react";
import { Card, CardHeader, CardContent, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import StackedLineChartTwoToneIcon from "@mui/icons-material/StackedLineChartTwoTone";

// Dummy data mapped from waiter_orders_overview
const waiter_orders_overview = [
  {
    order_id: 41,
    order_total: 14.5,
    opened_at: "2025-10-05T18:39:12.937+00:00",
  },
  {
    order_id: 43,
    order_total: 95,
    opened_at: "2025-10-05T18:39:33.191+00:00",
  },
  {
    order_id: 44,
    order_total: 45,
    opened_at: "2025-10-05T19:05:10.191+00:00",
  },
];

const RevenueLineChartCard = () => {
  // Transform the data into chart-friendly format
  const chartData = useMemo(() => {
    return waiter_orders_overview.map((o) => ({
      time: new Date(o.opened_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      revenue: o.order_total,
    }));
  }, []);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
      <CardHeader
        title={<Typography variant="subtitle1">Revenue Trend</Typography>}
        subheader="Today’s Orders"
        avatar={<StackedLineChartTwoToneIcon color="primary" />}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip formatter={(val) => `£${val.toFixed(2)}`} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#1976d2"
              strokeWidth={3}
              dot={{ r: 5, stroke: "#1976d2", strokeWidth: 2, fill: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Tracks order totals as they come in throughout the day
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RevenueLineChartCard;
