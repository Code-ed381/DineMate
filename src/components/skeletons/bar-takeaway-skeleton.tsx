import React from "react";
import {
  Box,
  Grid,
  Paper,
  Stack,
  Skeleton,
  Card,
  CardContent,
  Divider,
} from "@mui/material";

const BarTakeAwaySkeleton: React.FC = () => {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f5f7fa", mt: 4 }}>
      <Paper elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "white" }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><Skeleton variant="circular" width={32} height={32} /><Skeleton variant="text" width={150} height={40} /></Box>
            <Skeleton variant="rounded" width={130} height={40} sx={{ borderRadius: 2 }} />
          </Box>
          <Stack direction="row" spacing={1} sx={{ pb: 1 }}>
            {Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} variant="rounded" width={150} height={48} sx={{ borderRadius: 3 }} />)}
          </Stack>
        </Box>
      </Paper>
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex" }}>
        <Grid container sx={{ height: "100%" }}>
          <Grid item xs={12} md={8} sx={{ height: "100%", overflow: "auto", borderRight: { md: "1px solid" }, borderColor: "divider", p: 3 }}>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: 2 }} />
              <Stack direction="row" spacing={1}>{Array.from({ length: 5 }).map((_, idx) => <Skeleton key={idx} variant="rounded" width={90} height={32} sx={{ borderRadius: 3 }} />)}</Stack>
            </Stack>
            <Grid container spacing={2}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <Grid item xs={6} sm={4} md={3} key={idx}>
                  <Card sx={{ borderRadius: 3 }}><Skeleton variant="rectangular" width="100%" height={140} /><CardContent><Skeleton variant="text" width="80%" /><Skeleton variant="text" width="40%" height={28} /></CardContent></Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={12} md={4} sx={{ height: "100%", bgcolor: "white", p: 3, display: "flex", flexDirection: "column" }}>
            <Skeleton variant="text" width={150} height={32} sx={{ mb: 3 }} />
            <Box sx={{ flex: 1, mb: 2 }}>{Array.from({ length: 3 }).map((_, idx) => <Card key={idx} sx={{ mb: 1.5, p: 2, borderRadius: 2 }}><Skeleton variant="text" width="60%" /><Skeleton variant="rectangular" height={24} sx={{ mt: 1 }} /></Card>)}</Box>
            <Divider sx={{ mb: 2 }} /><Skeleton variant="rectangular" height={48} sx={{ mb: 1 }} /><Skeleton variant="rectangular" height={48} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BarTakeAwaySkeleton;
