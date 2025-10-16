import React from "react";
import {
  Box,
  Grid,
  Paper,
  Avatar,
  Skeleton,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

export default function CashierDashboardSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Summary Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[...Array(4)].map((_, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Skeleton variant="circular">
                <Avatar />
              </Skeleton>
              <Box sx={{ ml: 2 }}>
                <Skeleton variant="text" width={60} height={28} />
                <Skeleton variant="text" width={40} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* LEFT SIDE */}
        <Grid item xs={12} md={7}>
          {/* Toggle skeletons */}
          <Box display="flex" gap={1} sx={{ mb: 2 }}>
            {[...Array(2)].map((_, idx) => (
              <Paper
                key={idx}
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Skeleton variant="rectangular" height={50} />
              </Paper>
            ))}
          </Box>

          {/* Orders Skeleton */}
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Skeleton variant="text" width={200} height={30} />
              <Divider sx={{ my: 2 }} />
              <List>
                {[...Array(3)].map((_, idx) => (
                  <ListItem
                    key={idx}
                    sx={{ flexDirection: "column", alignItems: "flex-start" }}
                  >
                    <Skeleton variant="text" width="60%" height={25} />
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT SIDE */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Skeleton variant="text" width={150} height={30} />
              <Divider sx={{ my: 2 }} />
              <Skeleton variant="text" width="50%" height={20} />
              <Skeleton
                variant="rectangular"
                height={150}
                sx={{ my: 2, borderRadius: 2 }}
              />

              {/* Totals */}
              {[...Array(3)].map((_, idx) => (
                <Skeleton key={idx} variant="text" width="70%" height={20} />
              ))}
              <Divider sx={{ my: 2 }} />
              <Skeleton
                variant="rectangular"
                height={40}
                sx={{ mb: 2, borderRadius: 2 }}
              />
              <Skeleton
                variant="rectangular"
                height={40}
                sx={{ mb: 2, borderRadius: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}