import React, { useMemo } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { useCurrency } from "../../../utils/currency";

const COLORS = ["#4caf50", "#2196f3", "#ff9800", "#f44336"];

interface PaymentBreakdownChartProps {
  allSessions: any[];
}

const PaymentBreakdownChart: React.FC<PaymentBreakdownChartProps> = ({ allSessions }) => {
  const { currencySymbol } = useCurrency();
  const paymentBreakdown = useMemo(() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const totals = allSessions.filter((t) => {
      const dateVal = t.opened_at || t.session_created_at || t.created_at;
      return dateVal && new Date(dateVal) >= twentyFourHoursAgo;
    }).reduce((acc, t) => {
      const amount = Number(t.order_total || t.total || 0);
      if (t.payment_method === "cash") acc.Cash += amount;
      else if (t.payment_method === "card") acc.Card += amount;
      else if (t.payment_method === "momo") acc.MoMo += amount;
      else if (t.payment_method === "online") acc.Online += amount;
      else if (t.payment_method === "card+cash") acc.Split += amount;
      return acc;
    }, { Cash: 0, Card: 0, MoMo: 0, Online: 0, Split: 0 });
    return [
      { name: "Cash", value: totals.Cash },
      { name: "Card", value: totals.Card },
      { name: "MoMo", value: totals.MoMo },
      { name: "Online", value: totals.Online },
      { name: "Split", value: totals.Split },
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
            <RTooltip formatter={(value: number) => `${currencySymbol}${value.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PaymentBreakdownChart;
