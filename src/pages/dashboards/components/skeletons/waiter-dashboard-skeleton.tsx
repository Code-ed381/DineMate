import React from "react";
import { Box, Grid, Card, CardContent, CardHeader, Skeleton, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";

const StatCardSkeleton = () => (
  <Card sx={{ p: 2, display: "flex", gap: 2, borderRadius: 2 }}>
    <Skeleton variant="circular" width={56} height={56} /><Box sx={{ flex: 1 }}><Skeleton width="60%" height={28} /><Skeleton width="40%" height={20} /></Box>
  </Card>
);

const TableCardSkeleton = () => (
  <Card sx={{ borderRadius: 2, height: 320, display: "flex", flexDirection: "column" }}>
    <CardHeader title={<Skeleton width="40%" />} subheader={<Skeleton width="30%" />} action={<Skeleton variant="rounded" width={60} height={24} />} />
    <CardContent sx={{ flex: 1, p: 1 }}><Stack spacing={1}><Skeleton height={28} /><Skeleton height={28} /><Skeleton height={28} /></Stack></CardContent>
    <Box sx={{ p: 1.5 }}><Skeleton width="50%" height={24} /></Box>
  </Card>
);

const ChartCardSkeleton = () => (
  <Card sx={{ borderRadius: 2, height: 300 }}><CardHeader title={<Skeleton width="40%" />} /><CardContent><Skeleton variant="rectangular" width="100%" height={200} /></CardContent></Card>
);

export default function WaiterDashboardSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>{[1, 2, 3, 4].map(i => <Grid item xs={12} md={3} key={i}><StatCardSkeleton /></Grid>)}</Grid>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 3 }}><Skeleton variant="rectangular" width="100%" height={40} /><ToggleButtonGroup exclusive size="small" value="all" sx={{ "& .MuiToggleButton-root": { px: 3, py: 1, borderRadius: 2 } }}>{["All", "Active", "Billed", "Closed"].map((_, idx) => <ToggleButton key={idx} value={idx === 0 ? "all" : "other"} disabled><Skeleton width={50} height={20} /></ToggleButton>)}</ToggleButtonGroup></Stack>
      <Grid container spacing={2}>{[1, 2, 3, 4, 5, 6].map(i => <Grid item xs={12} md={6} lg={4} key={i}><TableCardSkeleton /></Grid>)}</Grid>
      <Grid container spacing={2} sx={{ mt: 4 }}><Grid item xs={12} md={6}><ChartCardSkeleton /></Grid><Grid item xs={12} md={6}><ChartCardSkeleton /></Grid></Grid>
    </Box>
  );
}
