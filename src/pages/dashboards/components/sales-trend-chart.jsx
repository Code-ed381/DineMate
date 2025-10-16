import React, { useMemo } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";

// helper: format date to "Mon" or "Sep 30"
const formatDay = (date) => date.toLocaleDateString("en-US", { weekday: "short" });

const SalesTrendChart = ({ allSessions }) => {
  const salesData = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // initialize last 7 days with 0 sales
    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split("T")[0]; // yyyy-mm-dd
      daysMap[key] = {
        day: formatDay(d),
        sales: 0,
      };
    }

    // aggregate sales totals
    allSessions
      .filter((s) => {
        const opened = new Date(s.opened_at);
        return opened >= sevenDaysAgo && opened <= now;
      })
      .forEach((s) => {
        const key = new Date(s.opened_at).toISOString().split("T")[0];
        if (daysMap[key]) {
          daysMap[key].sales += Number(s.order_total) || 0;
        }
      });

    return Object.values(daysMap);
  }, [allSessions]);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Sales Trend (Last 7 Days)
        </Typography>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={salesData}>
            <XAxis dataKey="day" />
            <YAxis />
            <RTooltip />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#1976d2"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesTrendChart;