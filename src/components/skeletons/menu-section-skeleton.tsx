import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Skeleton,
  Stack,
} from "@mui/material";

const MenuSkeleton: React.FC = () => {
  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Stack direction="row" spacing={2} mb={2}>{[1, 2].map((i) => <Skeleton key={i} variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />)}</Stack>
          <Skeleton variant="rectangular" width="100%" height={45} sx={{ borderRadius: 2, mb: 2 }} />
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>{[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rectangular" width={100} height={35} sx={{ borderRadius: 20 }} />)}</Stack>
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Card><CardActionArea disabled><Skeleton variant="rectangular" height={140} /><CardContent><Box display="flex" justifyContent="space-between" mb={1}><Skeleton variant="text" width="60%" /><Skeleton variant="text" width={40} /></Box><Skeleton variant="text" width="100%" /><Skeleton variant="text" width="80%" /></CardContent></CardActionArea></Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", p: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={2}><Skeleton variant="rectangular" width={120} height={30} /><Skeleton variant="rectangular" width={120} height={30} /></Box>
            <Box mb={2}><Skeleton variant="text" width="60%" /><Skeleton variant="text" width="40%" /></Box>
            {[1, 2, 3, 4, 5].map((row) => <Box key={row} display="flex" justifyContent="space-between" mb={1}><Skeleton variant="text" width="40%" /><Skeleton variant="text" width="20%" /></Box>)}
            <Divider sx={{ my: 2 }} />
            {[1, 2, 3].map((i) => <Box key={i} display="flex" justifyContent="space-between" mb={1}><Skeleton variant="text" width="40%" /><Skeleton variant="text" width="20%" /></Box>)}
            <Skeleton variant="rectangular" height={50} width="100%" sx={{ mt: 2 }} />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const Divider = ({ sx }: { sx?: any }) => <Box sx={{ borderTop: "1px solid", borderColor: "divider", ...sx }} />;

export default MenuSkeleton;
