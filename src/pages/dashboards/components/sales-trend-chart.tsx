import React, { useMemo } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer } from "recharts";

interface SalesTrendChartProps {
  allSessions: any[];
}

const formatDay = (date: Date) => date.toLocaleDateString("en-US", { weekday: "short" });

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ allSessions }) => {
  const salesData = useMemo(() => {
    const now = new Date();
    const dots = [];
    const daysMap: Record<string, any> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      daysMap[key] = { day: formatDay(d), sales: 0 };
    }
    allSessions.forEach((s) => {
      const dateVal = s.opened_at || s.session_created_at || s.created_at;
      if (!dateVal) return;
      const key = new Date(dateVal).toISOString().split("T")[0];
      if (daysMap[key]) daysMap[key].sales += Number(s.order_total || s.total || 0);
    });
    return Object.values(daysMap);
  }, [allSessions]);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Sales Trend (Last 7 Days)</Typography>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={salesData}>
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(value) => `£${value}`} />
            <RTooltip formatter={(value: number) => [`£${value.toFixed(2)}`, "Sales"]} />
            <Line type="monotone" dataKey="sales" stroke="#1976d2" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesTrendChart;
