import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Avatar,
  Box,
  Skeleton,
} from "@mui/material";
import { HourglassTop, LocalBar, History } from "@mui/icons-material";

const BarDineInPanelSkeleton: React.FC = () => {
  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, border: "1px solid #ffa726" }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "#ef6c00" }}><HourglassTop /> Active</Typography>
            <List>{[1, 2, 3].map((i) => (
              <ListItem key={i} sx={{ mb: 1.5, py: 2, px: 2, borderRadius: 2, boxShadow: 2, display: "flex", alignItems: "center" }}>
                <Skeleton variant="rectangular" width={64} height={64} sx={{ mr: 2, borderRadius: 2 }} />
                <Box sx={{ flex: 1 }}><Skeleton width="60%" height={20} sx={{ mb: 1 }} /><Skeleton width="80%" height={16} /></Box>
              </ListItem>
            ))}</List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, border: "1px solid #42a5f5" }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "#1565c0" }}><LocalBar /> Ready</Typography>
            <List>{[1, 2, 3].map((i) => (
              <ListItem key={i} sx={{ mb: 1.5, py: 2, px: 2, borderRadius: 2, boxShadow: 1, display: "flex", alignItems: "center" }}>
                <Skeleton variant="rectangular" width={64} height={64} sx={{ mr: 2, borderRadius: 2 }} />
                <Box sx={{ flex: 1 }}><Skeleton width="60%" height={20} sx={{ mb: 1 }} /><Skeleton width="80%" height={16} /></Box>
              </ListItem>
            ))}</List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, border: "1px solid #66bb6a" }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, color: "#2e7d32" }}><History /> Recent</Typography>
            <List>{[1, 2, 3].map((i) => (
              <ListItem key={i} sx={{ mb: 1.5, py: 2, px: 2, borderRadius: 2, boxShadow: 2, display: "flex" }}>
                <Skeleton variant="rectangular" width={64} height={64} sx={{ mr: 2, borderRadius: 2 }} />
                <Box sx={{ flex: 1 }}><Skeleton width="60%" height={20} sx={{ mb: 1 }} /><Skeleton width="80%" height={16} /></Box>
              </ListItem>
            ))}</List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BarDineInPanelSkeleton;
