import React from "react";
import {
  Box,
  Grid,
  Paper,
  Avatar,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import { Search } from "@mui/icons-material";

export default function TableManagementSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        {/* Summary Bar */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ ml: 2 }}>
                  <Skeleton variant="text" width={60} height={28} />
                  <Skeleton variant="text" width={100} height={20} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Search and Filters */}
      <Grid
        container
        spacing={2}
        mb={4}
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={12} md="auto">
          <ToggleButtonGroup exclusive size="large" value="all">
            {["All", "Available", "Occupied", "Reserved"].map((label) => (
              <ToggleButton key={label} value={label.toLowerCase()} disabled>
                <Skeleton variant="text" width={70} height={28} />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search tables..."
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      {/* Tables Grid */}
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}
            >
              <Box sx={{ height: "6px", bgcolor: "grey.300" }} />

              <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                {/* Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width={80} />
                  </Box>
                  <Chip
                    label=""
                    size="small"
                    sx={{ borderRadius: 2, width: 70, height: 24 }}
                  />
                </Box>

                {/* Capacity */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Skeleton variant="circular" width={20} height={20} />
                  <Skeleton variant="text" width={60} />
                </Box>

                {/* Location + Notes */}
                <Skeleton variant="text" width={100} />
                <Skeleton variant="text" width={140} />
              </CardContent>

              {/* Actions */}
              <Box sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.2}>
                  <Skeleton variant="rectangular" width="100%" height={36} />
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
