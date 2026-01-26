import React, { useMemo } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RTooltip } from "recharts";

const COLORS = ["#4caf50", "#2196f3", "#ff9800", "#f44336"];

interface PaymentBreakdownChartProps {
  allSessions: any[];
}

const PaymentBreakdownChart: React.FC<PaymentBreakdownChartProps> = ({ allSessions }) => {
  const paymentBreakdown = useMemo(() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const totals = allSessions.filter((t) => new Date(t.opened_at) >= twentyFourHoursAgo).reduce((acc, t) => {
      if (t.payment_method === "cash") acc.Cash += Number(t.order_total) || 0;
      else if (t.payment_method === "card") acc.Card += Number(t.order_total) || 0;
      else if (t.payment_method === "momo") acc.MoMo += Number(t.order_total) || 0;
      return acc;
    }, { Cash: 0, Card: 0, MoMo: 0 });
    return [
      { name: "Cash", value: totals.Cash },
      { name: "Card", value: totals.Card },
      { name: "MoMo", value: totals.MoMo },
    ];
  }, [allSessions]);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Payment Breakdown - Last 24 hours</Typography>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={paymentBreakdown} dataKey="value" nameKey="name" outerRadius={80} innerRadius={36} label>
              {paymentBreakdown.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Legend />
            <RTooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PaymentBreakdownChart;
