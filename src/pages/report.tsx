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
  Chip,
  Stack,
  Menu,
  ListItemIcon,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { TrendingUp, FilterList, Download, CreditCard, AttachMoney, ReceiptLong, FileDownload, Print } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";

import useReportStore from "../lib/reportStore";
import useRestaurantStore from "../lib/restaurantStore";
import DataTable from "../components/data-table";
import EmptyState from "../components/empty-state";
import { formatCurrency } from "../utils/currency";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import MetricCard from "../components/MetricCard";
import { useSettings } from "../providers/settingsProvider";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useFeatureGate } from "../hooks/useFeatureGate";

const ReportDashboard: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Stores
  const { selectedRestaurant, role } = useRestaurantStore();
  const { settings } = useSettings();
  const rs = settings?.report_settings || {};
  const navigate = useNavigate();
  const { canAccess } = useFeatureGate();
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
  const [filterType, setFilterType] = useState(settings?.report_settings?.default_date_range || "today");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedWaiter, setSelectedWaiter] = useState<string>("");
  const [reportMode, setReportMode] = useState<"standard" | "X" | "Z">("standard");
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const handleExportClick = (e: React.MouseEvent<HTMLButtonElement>) => setExportAnchorEl(e.currentTarget);
  const handleExportClose = () => setExportAnchorEl(null);

  const handleExportCSV = () => {
    if (!canAccess("canUseCsvExport")) {
      handleExportClose();
      Swal.fire({
        title: "Upgrade Required",
        text: "Please upgrade your plan to export data to CSV.",
        icon: "info",
        confirmButtonText: "Got it"
      });
      return;
    }

    if (filteredOrders.length > 0) {
        const reportTitle = reportMode === "standard" ? "Sales" : `${reportMode} Report`;
        exportToCSV(filteredOrders, `${reportTitle.toLowerCase().replace(" ", "_")}_${selectedRestaurant?.name || 'restaurant'}`);
    }
    handleExportClose();
  };

  const handleExportPDF = () => {
    exportToPDF();
    handleExportClose();
  };

  // Security Check: Unauthorized Admin redirect
  useEffect(() => {
    if (role === "admin" && settings && !settings.employee_permissions?.admins_view_report) {
       Swal.fire({
          title: "Access Restricted",
          text: "You do not have permission to view this page. Redirecting to dashboard...",
          icon: "error",
          timer: 3000,
          showConfirmButton: false
       });
       navigate("/app/dashboard");
    }
  }, [role, settings, navigate]);

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
    setReportMode("standard");
    handleFetchOrders();
    if (selectedWaiter) {
        filterOrders(null, null, selectedWaiter);
    } else {
        filterOrders(startDate, endDate, selectedWaiter || null);
    }
  };

  const handleGenerateReport = (mode: "X" | "Z") => {
    setReportMode(mode);
    setFilterType("today");
    const today = dayjs().format("YYYY-MM-DD");
    setStartDate(today);
    setEndDate(today);
    setSelectedWaiter("");
    handleFetchOrders();
  };

  const handleExport = () => {
    // This function is no longer used, replaced by handleExportCSV and handleExportPDF
  };

  // Columns for DataTable
  const columns: GridColDef[] = [
    { field: "id", headerName: "Order ID", width: 120 },
    { field: "created_at", headerName: "Date", flex: 1, minWidth: 160 },
    { field: "waiter", headerName: "Waiter", flex: 1, minWidth: 140 },
    ...(rs.show_cash_column !== false ? [{ 
      field: "cash", 
      headerName: "Cash", 
      width: 100, 
      renderCell: (params: any) => formatCurrency(params.value) 
    }] : []),
    ...(rs.show_card_column !== false ? [{ 
      field: "card", 
      headerName: "Card", 
      width: 100,
      renderCell: (params: any) => formatCurrency(params.value)
    }] : []),
    ...(rs.show_balance_column !== false ? [{ 
        field: "balance", 
        headerName: "Balance", 
        width: 100,
        renderCell: (params: any) => formatCurrency(params.value)
    }] : []),
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
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h4" fontWeight={400} sx={{ opacity: 0.6 }}>Reports</Typography>
              {reportMode !== "standard" && (
                <Chip 
                  label={`${reportMode} Report`} 
                  color={reportMode === "X" ? "primary" : "secondary"} 
                  sx={{ fontWeight: "bold" }}
                  onDelete={() => setReportMode("standard")}
                />
              )}
            </Box>
            <Typography variant="h4" fontWeight={900} sx={{ mb: 1, letterSpacing: "-0.02em" }}>
              {reportMode === "standard" ? "Sales Report" : `${reportMode} Report Overview`}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.7 }}>
                {selectedRestaurant?.name} • {dayjs(startDate).format("MMM DD")} - {dayjs(endDate).format("MMM DD")}
            </Typography>
        </Box>
        <Box display="flex" gap={1}>
          {rs.enable_xz_reports !== false && (<>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => handleGenerateReport("X")}
            sx={{ fontWeight: "bold" }}
          >
            X Report
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => handleGenerateReport("Z")}
            sx={{ fontWeight: "bold" }}
          >
            Z Report
          </Button>
          </>)}
          {rs.allow_csv_export !== false && (
            <Box>
                <Button variant="contained" startIcon={<Download />} onClick={handleExportClick}>
                    Export
                </Button>
                <Menu
                    anchorEl={exportAnchorEl}
                    open={Boolean(exportAnchorEl)}
                    onClose={handleExportClose}
                >
                    <MenuItem onClick={handleExportCSV}>
                        <ListItemIcon><FileDownload fontSize="small" /></ListItemIcon>
                        Export CSV
                    </MenuItem>
                    <MenuItem onClick={handleExportPDF}>
                        <ListItemIcon><Print fontSize="small" /></ListItemIcon>
                        Print PDF (Browser)
                    </MenuItem>
                </Menu>
            </Box>
          )}
          {rs.show_advanced_filters !== false && (
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            <FilterList color={showFilters ? "primary" : "inherit"} />
          </IconButton>
          )}
        </Box>
      </Grid>

      {/* Filter Panel */}
      {showFilters && (
        <Card sx={{ mb: 3, p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={700}>Advanced Filters</Typography>
            <Button size="small" onClick={() => {
              setFilterType("today");
              setSelectedWaiter("");
              setReportMode("standard");
            }}>Reset All</Button>
          </Stack>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Date Range</InputLabel>
                <Select
                  value={filterType}
                  label="Date Range"
                  displayEmpty
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="today">Today (X/Z Mode)</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="custom">Custom Calendar</MenuItem>
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
            {rs.show_waiter_filter !== false && <Grid item xs={12} md={2.5}>
                <FormControl fullWidth size="small">
                    <InputLabel shrink>Attendant / Waiter</InputLabel>
                    <Select
                        value={selectedWaiter}
                        label="Attendant / Waiter"
                        displayEmpty
                        onChange={(e) => setSelectedWaiter(e.target.value)}
                    >
                        <MenuItem value="">All Personnel</MenuItem>
                        {waiters.map((w: any) => (
                            <MenuItem key={w.user_id} value={w.user_id}>
                                {w.first_name} {w.last_name || ''}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>}
            <Grid item xs={12} md={2.5}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleApplyFilters}
                sx={{ height: 40, borderRadius: 2, fontWeight: "bold" }}
              >
                Refine Search
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* KPI Cards */}
      {rs.show_report_kpi_cards !== false && <Grid container spacing={2} mb={3}>
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
      </Grid>}

      {/* Data Table */}
      {rs.show_transaction_table !== false && <Card>
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
      </Card>}
    </Box>
  );
};

export default ReportDashboard;
