import React from "react";
import { Box, Grid, Card, CardHeader, CardContent, Skeleton, Stack, Divider, Paper } from "@mui/material";

const SmallStatSkeleton = () => (
    <Card sx={{ borderRadius: 2, height: "100%", boxShadow: 'none', border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
          <Skeleton variant="circular" sx={{ width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }} />
          <Box sx={{ flex: 1 }}><Skeleton variant="text" width="60%" height={14} /><Skeleton variant="text" width="40%" height={24} /></Box>
        </Stack>
      </CardContent>
    </Card>
);

export default function ChefDashboardProSkeleton() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map(idx => (
          <Grid item xs={6} md={3} key={idx}>
            <SmallStatSkeleton />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}><CardHeader title={<Skeleton variant="text" width="40%" />} subheader={<Skeleton variant="text" width="25%" />} /><Divider /><CardContent><Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} /></CardContent></Card>
            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}><CardHeader title={<Skeleton variant="text" width="30%" />} subheader={<Skeleton variant="text" width="20%" />} /><Divider /><CardContent>{[1, 2, 3, 4].map(i => <Stack key={i} spacing={1} sx={{ mb: 2 }}><Skeleton variant="text" width="60%" /><Skeleton variant="text" width="40%" /></Stack>)}</CardContent></Card>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 3, height: "100%", boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}><CardHeader title={<Skeleton variant="text" width="50%" />} subheader={<Skeleton variant="text" width="30%" />} /><CardContent sx={{ p: 2 }}><Stack spacing={2}>{[1, 2, 3].map(i => <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}><Box sx={{ flex: 1 }}><Skeleton variant="text" width="50%" /><Skeleton variant="text" width="30%" /><Skeleton variant="rectangular" height={8} sx={{ mt: 1, borderRadius: 1 }} /></Box></Paper>)}</Stack></CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
