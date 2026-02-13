import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  IconButton, 
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  TextField,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { TrendingUp, FilterList, Download, CreditCard, AttachMoney, ReceiptLong } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { getCurrencySymbol } from "../utils/currency";

// Dummy Data
const dummyRows = [
  { id: 1, date: "2025-11-01", waiter: "John Doe", card: 45.0, cash: 20.0, balance: 0, total: 65 },
  { id: 2, date: "2025-11-01", waiter: "Sarah", card: 0, cash: 100.0, balance: 10, total: 90 },
  { id: 3, date: "2025-11-01", waiter: "Michael", card: 120.0, cash: 0, balance: 0, total: 120 },
];

const columns: GridColDef[] = [
  { field: "id", headerName: "Order #", width: 120 },
  { field: "date", headerName: "Date", width: 180 },
  { field: "waiter", headerName: "Waiter", width: 180 },
  { field: "card", headerName: "Card", width: 120 },
  { field: "cash", headerName: "Cash", width: 120 },
  { field: "balance", headerName: "Change", width: 120 },
  { field: "total", headerName: "Total", width: 120 },
];

const ReportDashboard: React.FC = () => {
  const [filterType, setFilterType] = useState("today");
  const [showFilters, setShowFilters] = useState(false);
  
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  
  const getCardStyle = (lightColor: string) => ({
    p: 2,
    borderRadius: 3,
    bgcolor: isDark ? theme.palette.background.paper : lightColor,
    boxShadow: isDark
      ? "0 0 8px rgba(255,255,255,0.08)"
      : "0 2px 8px rgba(0,0,0,0.1)",
  });

  return (
    <Box p={3} sx={{ width: "100%" }}>
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Sales Report</Typography>
        <Box display="flex" gap={2}>
          <Button variant="contained" startIcon={<Download />}>Export</Button>
          <IconButton onClick={() => setShowFilters(!showFilters)}><FilterList /></IconButton>
        </Box>
      </Grid>

      {showFilters && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter Range</InputLabel>
                <Select
                  value={filterType}
                  label="Filter Range"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {filterType === "custom" && (
              <>
                <Grid item xs={12} md={3}><TextField type="date" fullWidth label="From" InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} md={3}><TextField type="date" fullWidth label="To" InputLabelProps={{ shrink: true }} /></Grid>
              </>
            )}
            <Grid item xs={12} md={3} display="flex" alignItems="center">
              <Button variant="contained" fullWidth>Apply</Button>
            </Grid>
          </Grid>
        </Card>
      )}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Card sx={getCardStyle("#E3F2FD")}>
            <CardHeader title="Cash Total" sx={{ p: 1 }} />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1 }}>
              <Typography variant="h5" fontWeight={700}>{getCurrencySymbol()}210</Typography>
              <AttachMoney color={isDark ? "primary" : "inherit"} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={getCardStyle("#E8F5E9")}>
            <CardHeader title="Card Total" sx={{ p: 1 }} />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1 }}>
              <Typography variant="h5" fontWeight={700}>{getCurrencySymbol()}165</Typography>
              <CreditCard color={isDark ? "success" : "inherit"} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={getCardStyle("#FFF3E0")}>
            <CardHeader title="Orders" sx={{ p: 1 }} />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1 }}>
              <Typography variant="h5" fontWeight={700}>32</Typography>
              <ReceiptLong color={isDark ? "warning" : "inherit"} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={getCardStyle("#F3E5F5")}>
            <CardHeader title="Trend" sx={{ p: 1 }} />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, p: 1 }}>
              <Typography variant="h5" fontWeight={700}>+12%</Typography>
              <TrendingUp color={isDark ? "secondary" : "inherit"} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardHeader title="Order History" />
        <CardContent>
          <Box sx={{ height: 400 }}>
            <DataGrid rows={dummyRows} columns={columns} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportDashboard;
