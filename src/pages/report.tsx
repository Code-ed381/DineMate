import React, { useEffect, useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { TrendingUp, FilterList, Download, CreditCard, AttachMoney, ReceiptLong } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";

import useReportStore from "../lib/reportStore";
import useRestaurantStore from "../lib/restaurantStore";
import DataTable from "../components/data-table";
import EmptyState from "../components/empty-state";
import { formatCurrency } from "../utils/currency";
import { exportToCSV } from "../utils/exportUtils";
import MetricCard from "../components/MetricCard";

const ReportDashboard: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Stores
  const { selectedRestaurant } = useRestaurantStore();
  const { 
    getOrdersNow, 
    getWaiters, 
    filteredOrders, 
    waiters, 
    filterOrders,
    loading,
    cash, 
    card, 
    total, 
    overallTotal 
  } = useReportStore();

  // Local State
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("today");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedWaiter, setSelectedWaiter] = useState<string>("");

  // Initial Fetch & Date Range Logic
  useEffect(() => {
    if (selectedRestaurant?.id) {
      getWaiters(selectedRestaurant.id);
      handleFetchOrders();
    }
  }, [selectedRestaurant?.id]);

  useEffect(() => {
    // Update dates based on predefined ranges
    const today = dayjs();
    if (filterType === "today") {
      setStartDate(today.format("YYYY-MM-DD"));
      setEndDate(today.format("YYYY-MM-DD"));
    } else if (filterType === "week") {
      setStartDate(today.startOf("week").format("YYYY-MM-DD"));
      setEndDate(today.endOf("week").format("YYYY-MM-DD"));
    } else if (filterType === "month") {
      setStartDate(today.startOf("month").format("YYYY-MM-DD"));
      setEndDate(today.endOf("month").format("YYYY-MM-DD"));
    }
    // "custom" leaves dates as is
  }, [filterType]);

  const handleFetchOrders = () => {
    if (selectedRestaurant?.id) {
      getOrdersNow(selectedRestaurant.id, startDate, endDate);
    }
  };

  const handleApplyFilters = () => {
    handleFetchOrders();
    // After fetching (which updates orders), we can optionally filter by waiter client-side
    // or we could have passed waiterId to getOrdersNow if backend supported it.
    // For now, we filter by waiter client-side using filterOrders
    if (selectedWaiter) {
        filterOrders(null, null, selectedWaiter);
    } else {
        // If no waiter selected, we might need to ensure we show all fetched orders
        // Currently filterOrders logic requires startDate/endDate to re-filter everything
        // This is a bit disjointed due to hybrid approach.
        // Simplified: The store's getOrdersNow updates 'filteredOrders' to all fetched.
        // If we have a waiter selected, we refine that.
        // We can call filterOrders with null dates (to ignore date check or use store's logic)
        // usage: filterOrders(null, null, selectedWaiter)
        filterOrders(startDate, endDate, selectedWaiter || null);
    }
  };

  const handleExport = () => {
    if (filteredOrders.length > 0) {
        exportToCSV(filteredOrders, `sales_report_${selectedRestaurant?.name || 'restaurant'}`);
    }
  };

  // Columns for DataTable
  const columns: GridColDef[] = [
    { field: "id", headerName: "Order ID", width: 120 },
    { field: "created_at", headerName: "Date", flex: 1, minWidth: 160 },
    { field: "waiter", headerName: "Waiter", flex: 1, minWidth: 140 },
    { 
      field: "cash", 
      headerName: "Cash", 
      width: 100, 
      renderCell: (params) => formatCurrency(params.value) 
    },
    { 
      field: "card", 
      headerName: "Card", 
      width: 100,
      renderCell: (params) => formatCurrency(params.value)
    },
    { 
        field: "balance", 
        headerName: "Balance", 
        width: 100,
        renderCell: (params) => formatCurrency(params.value)
    },
    { 
        field: "total", 
        headerName: "Total", 
        width: 100,
        renderCell: (params) => formatCurrency(params.value)
    },
  ];



  return (
    <Box p={3} sx={{ width: "100%" }}>
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
            <Typography variant="h4" fontWeight={700}>Sales Report</Typography>
            <Typography variant="body2" color="text.secondary">
                {selectedRestaurant?.name} • {dayjs(startDate).format("MMM DD")} - {dayjs(endDate).format("MMM DD")}
            </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
            Export
          </Button>
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            <FilterList color={showFilters ? "primary" : "inherit"} />
          </IconButton>
        </Box>
      </Grid>

      {/* Filter Panel */}
      {showFilters && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Period</InputLabel>
                <Select
                  value={filterType}
                  label="Period"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {filterType === "custom" && (
                <>
                    <Grid item xs={12} md={2}>
                        <TextField 
                            type="date" 
                            fullWidth 
                            label="From" 
                            size="small"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }} 
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField 
                            type="date" 
                            fullWidth 
                            label="To" 
                            size="small"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }} 
                        />
                    </Grid>
                </>
            )}
            <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                    <InputLabel>Waiter</InputLabel>
                    <Select
                        value={selectedWaiter}
                        label="Waiter"
                        onChange={(e) => setSelectedWaiter(e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="">All Waiters</MenuItem>
                        {waiters.map((w: any) => (
                            <MenuItem key={w.user_id} value={w.user_id}>
                                {w.first_name} {w.last_name || ''}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button variant="contained" fullWidth onClick={handleApplyFilters}>
                Apply
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Cash Total"
            value={formatCurrency(cash)}
            icon={<AttachMoney />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Card Total"
            value={formatCurrency(card)}
            icon={<CreditCard />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Orders"
            value={filteredOrders.length}
            icon={<ReceiptLong />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Sales"
            value={formatCurrency(total)}
            icon={<TrendingUp />}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Data Table */}
      <Card>
        <CardHeader title="Transaction History" />
        <CardContent>
          <DataTable
            rows={filteredOrders}
            columns={columns}
            getRowId={(row: any) => row.id}
            loading={loading}
            pagination
            slots={{
                noRowsOverlay: () => (
                  <EmptyState
                    title="No Transactions Found"
                    description="Adjust filters or check back later."
                    height={400}
                  />
                ),
            }}
            sx={{ minHeight: 400 }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportDashboard;
