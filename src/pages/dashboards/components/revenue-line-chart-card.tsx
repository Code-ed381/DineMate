import React, { useMemo } from "react";
import { Card, CardHeader, CardContent, Typography, Box } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import StackedLineChartTwoToneIcon from "@mui/icons-material/StackedLineChartTwoTone";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface RevenueLineChartCardProps {
  orders: any[];
}

const RevenueLineChartCard: React.FC<RevenueLineChartCardProps> = ({ orders = [] }) => {
  const chartData = useMemo(() => orders?.map((o) => ({
    time: new Date(o.opened_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    revenue: o.order_total,
  })), [orders]);

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title={<Typography variant="subtitle1">Revenue Trend</Typography>} subheader="Today’s Orders" avatar={<StackedLineChartTwoToneIcon color="primary" />} sx={{ pb: 0 }} />
      <CardContent>
        {orders?.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} />
                <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={3} dot={{ r: 5, stroke: "#1976d2", strokeWidth: 2, fill: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Tracks order totals as they come in throughout the day</Typography>
          </>
        ) : (
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <InfoOutlinedIcon sx={{ mb: 1 }} fontSize="large" />
            <Typography variant="body1" fontWeight={600}>No orders found</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueLineChartCard;
