import React from "react";
import { Box, Grid, Card, CardContent, Skeleton, Typography } from "@mui/material";

export default function CashierReportsProSkeleton() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}><Skeleton variant="text" width={240} height={40} /><Skeleton variant="text" width={400} height={28} /></Box>
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} md={3} key={i}>
            <Card sx={{ borderRadius: 2, p: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width="60%" height={28} sx={{ mt: 2 }} /><Skeleton variant="text" width="40%" height={22} /><Skeleton variant="text" width="30%" height={18} />
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2 }}><CardContent><Typography variant="subtitle1" sx={{ mb: 1 }}><Skeleton width={140} height={24} /></Typography><Skeleton variant="rectangular" width="100%" height={240} /></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}><CardContent><Typography variant="subtitle1" sx={{ mb: 1 }}><Skeleton width={180} height={24} /></Typography><Skeleton variant="circular" width={220} height={220} sx={{ mx: "auto" }} /></CardContent></Card>
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ mt: 3 }}>
        <Card sx={{ borderRadius: 2 }}><CardContent><Skeleton width={200} height={24} sx={{ mb: 2 }} />{[...Array(6)].map((_, i) => <Skeleton key={i} variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />)}</CardContent></Card>
      </Grid>
    </Box>
  );
}
