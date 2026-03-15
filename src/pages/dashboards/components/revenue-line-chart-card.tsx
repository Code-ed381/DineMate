import React, { useMemo } from "react";
import { Card, CardHeader, CardContent, Typography, Box } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import StackedLineChartTwoToneIcon from "@mui/icons-material/StackedLineChartTwoTone";
import EmptyState from "../../../components/empty-state";

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
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(val: any) => [`₵${val.toFixed(2)}`, "Revenue"]} 
                />
                <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={2} dot={{ r: 3, fill: "#1976d2" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center', opacity: 0.7 }}>Revenue fluctuations over time</Typography>
          </>
        ) : (
          <EmptyState 
            title="No Orders Found" 
            description="No transaction data captured yet for today." 
            emoji="💸"
            height={200}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueLineChartCard;
