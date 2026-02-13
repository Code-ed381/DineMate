import React, { useMemo } from "react";
import { Grid, Card, Box, Stack, Typography, CardContent } from "@mui/material";
import { TrendingUp, ReceiptLong, AttachMoney, Cancel } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

import { useCurrency } from "../../../utils/currency";

interface CompactIconProps {
  children: React.ReactNode;
}

const CompactIcon: React.FC<CompactIconProps> = ({ children }) => {
  const theme = useTheme();
  return (
    <Box component="span" sx={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: theme.palette.action.hover, color: theme.palette.text.primary }} aria-hidden>
      {children}
    </Box>
  );
};

interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  note?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, title, value, note }) => {
  return (
    <Card sx={{ borderRadius: 2, height: "100%", minHeight: 100 }} elevation={1}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {icon}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{value}</Typography>
            {note && <Typography variant="caption" color="text.secondary">{note}</Typography>}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

interface KpiDashboardProps {
  allSessions: any[];
}

const KpiDashboard: React.FC<KpiDashboardProps> = ({ allSessions }) => {
  const { currencySymbol } = useCurrency();
  const totals = useMemo(() => {
    const count = allSessions.length;
    const sum = allSessions.reduce((acc, s) => acc + (Number(s.order_total) || 0), 0);
    const avg = count > 0 ? sum / count : 0;
    const refunds = allSessions.filter((s) => s.session_status === "refund").length;
    return { sum, count, avg, refunds };
  }, [allSessions]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}><KpiCard icon={<CompactIcon><TrendingUp /></CompactIcon>} title="Total Sales" value={`${currencySymbol}${totals.sum.toFixed(2)}`} note={`Count: ${totals.count}`} /></Grid>
      <Grid item xs={12} sm={6} md={3}><KpiCard icon={<CompactIcon><ReceiptLong /></CompactIcon>} title="Transactions" value={totals.count} note={`Avg: ${currencySymbol}${totals.avg.toFixed(2)}`} /></Grid>
      <Grid item xs={12} sm={6} md={3}><KpiCard icon={<CompactIcon><AttachMoney /></CompactIcon>} title="Avg Order" value={`${currencySymbol}${totals.avg.toFixed(2)}`} /></Grid>
      <Grid item xs={12} sm={6} md={3}><KpiCard icon={<CompactIcon><Cancel /></CompactIcon>} title="Refunds" value={totals.refunds} note="Please review" /></Grid>
    </Grid>
  );
};

export default KpiDashboard;
