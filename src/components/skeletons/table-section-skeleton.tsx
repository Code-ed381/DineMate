import React from "react";
import {
  Box,
  Grid,
  Paper,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";
import { Search } from "@mui/icons-material";

const TableManagementSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ ml: 2 }}><Skeleton variant="text" width={60} height={28} /><Skeleton variant="text" width={100} height={20} /></Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Grid container spacing={2} mb={4} alignItems="center" justifyContent="space-between">
        <Grid item xs={12} md="auto">
          <ToggleButtonGroup exclusive size="large" value="all">
            {["All", "Available", "Occupied", "Reserved"].map((label) => (
              <ToggleButton key={label} value={label.toLowerCase()} disabled><Skeleton variant="text" width={70} /></ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={12} md={6}><TextField fullWidth size="small" placeholder="Search tables..." disabled InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} /></Grid>
      </Grid>
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <Card sx={{ height: "100%", borderRadius: 3 }}>
              <Box sx={{ height: "6px", bgcolor: "grey.300" }} />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}><Skeleton variant="text" width={80} /><Chip label="" size="small" sx={{ width: 70 }} /></Box>
                <Skeleton variant="text" width={100} /><Skeleton variant="text" width={140} />
              </CardContent>
              <Box sx={{ p: 2 }}><Skeleton variant="rectangular" width="100%" height={36} /></Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TableManagementSkeleton;
