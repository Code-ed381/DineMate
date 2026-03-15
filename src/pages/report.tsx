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
  useMediaQuery,
  Tooltip,
  useTheme,
  alpha,
  Pagination,
  Divider,
  Fab,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { TrendingUp, FilterList, Download, CreditCard, AttachMoney, ReceiptLong, FileDownload, Print, CalendarToday } from "@mui/icons-material";
import dayjs from "dayjs";

import useReportStore from "../lib/reportStore";
import useRestaurantStore from "../lib/restaurantStore";
import DataTable from "../components/data-table";
import EmptyState from "../components/empty-state";
import { formatCurrency } from "../utils/currency";
import { exportToCSV, exportToPDF, exportToExcel, exportToTXT } from "../utils/exportUtils";
import MetricCard from "../components/MetricCard";
import { useSettings } from "../providers/settingsProvider";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useFeatureGate } from "../hooks/useFeatureGate";

const ReportDashboard: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

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
    momo,
    online,
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

  // Pagination for cards
  const [page, setPage] = useState(1);
  const itemsPerPage = isMobile ? 6 : 8; // Fewer per page on small screens
  const pageCount = Math.ceil(filteredOrders.length / itemsPerPage);
  
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (_: any, value: number) => {
    setPage(value);
    // Smooth scroll to top of table/list area
    const element = document.getElementById("transaction-history");
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    setPage(1); // Reset page when filters change
  }, [filteredOrders.length]);

  const handleExportClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canAccess("canUseCsvExport")) {
      Swal.fire({
        title: "Upgrade Required",
        text: "Please upgrade your plan to export data.",
        icon: "info",
        confirmButtonText: "Got it"
      });
      return;
    }
    setExportAnchorEl(e.currentTarget);
  };
  const handleExportClose = () => setExportAnchorEl(null);

  const getExportData = () => {
    const reportTitle = reportMode === "standard" ? "Sales" : `${reportMode} Report`;
    return filteredOrders.map(order => {
      const row: any = {
        "Order ID": order.id,
        "Date": order.created_at,
        "Waiter": order.waiter
      };
      
      if (rs.show_cash_column !== false) row["Cash"] = order.cash;
      if (rs.show_card_column !== false) row["Card"] = order.card;
      if (rs.show_momo_column !== false) row["MoMo"] = order.momo;
      if (rs.show_online_column !== false) row["Online"] = order.online;
      if (rs.show_balance_column !== false) row["Balance"] = order.balance;
      
      row["Total"] = order.total;
      
      return row;
    });
  };

  const handleExportCSV = () => {
    if (filteredOrders.length > 0) {
        const reportTitle = reportMode === "standard" ? "Sales" : `${reportMode} Report`;
        exportToCSV(getExportData(), `${reportTitle.toLowerCase().replace(" ", "_")}_${selectedRestaurant?.name || 'restaurant'}`);
    }
    handleExportClose();
  };

  const handleExportExcel = () => {
    if (filteredOrders.length > 0) {
      const reportTitle = reportMode === "standard" ? "Sales" : `${reportMode} Report`;
      exportToExcel(getExportData(), `${reportTitle.toLowerCase().replace(" ", "_")}_${selectedRestaurant?.name || 'restaurant'}`);
    }
    handleExportClose();
  };

  const handleExportTXT = () => {
    if (filteredOrders.length > 0) {
      const reportTitle = reportMode === "standard" ? "Sales" : `${reportMode} Report`;
      exportToTXT(getExportData(), `${reportTitle.toLowerCase().replace(" ", "_")}_${selectedRestaurant?.name || 'restaurant'}`);
    }
    handleExportClose();
  };

  const handleExportPDF = () => {
    if (filteredOrders.length > 0) {
      const reportTitle = reportMode === "standard" ? "Sales" : `${reportMode} Report`;
      exportToPDF(getExportData(), `${reportTitle.toLowerCase().replace(" ", "_")}_${selectedRestaurant?.name || 'restaurant'}`, `${reportTitle} Overview`);
    } else {
      exportToPDF([], "sales_report");
    }
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

  // Initial Fetch
  useEffect(() => {
    if (selectedRestaurant?.id) {
      getWaiters(selectedRestaurant.id);
    }
  }, [selectedRestaurant?.id]);
  
  // Refined Date Range & Auto-Fetch Effect
  useEffect(() => {
    if (!selectedRestaurant?.id) return;

    const today = dayjs();
    let newStart = startDate;
    let newEnd = endDate;

    if (filterType === "today") {
      newStart = today.format("YYYY-MM-DD");
      newEnd = today.format("YYYY-MM-DD");
    } else if (filterType === "week") {
      // Last 7 days including today
      newStart = today.subtract(6, 'day').format("YYYY-MM-DD");
      newEnd = today.format("YYYY-MM-DD");
    } else if (filterType === "month") {
      // Last 30 days including today
      newStart = today.subtract(29, 'day').format("YYYY-MM-DD");
      newEnd = today.format("YYYY-MM-DD");
    }

    if (filterType !== 'custom') {
      setStartDate(newStart);
      setEndDate(newEnd);
      getOrdersNow(selectedRestaurant.id, newStart, newEnd, selectedWaiter);
    }
  }, [filterType, selectedRestaurant?.id, selectedWaiter]); // Added selectedWaiter to dependencies

  const handleFetchOrders = async (wId: string = selectedWaiter) => {
    if (selectedRestaurant?.id) {
      await getOrdersNow(selectedRestaurant.id, startDate, endDate, wId);
    }
  };

  const handleApplyFilters = async () => {
    setReportMode("standard");
    await handleFetchOrders();
  };

  const handleGenerateReport = async (mode: "X" | "Z") => {
    setReportMode(mode);
    setFilterType("today");
    const today = dayjs().format("YYYY-MM-DD");
    setStartDate(today);
    setEndDate(today);
    setSelectedWaiter("");
    if (selectedRestaurant?.id) {
      await getOrdersNow(selectedRestaurant.id, today, today, null);
    }
  };

  const handleExport = () => {
    // This function is no longer used, replaced by handleExportCSV and handleExportPDF
  };

  // Columns for DataTable
  const columns: GridColDef[] = [
    { field: "id", headerName: "Order ID", width: 100 },
    { field: "created_at", headerName: "Date", flex: 1, minWidth: 160 },
    { field: "waiter", headerName: "Waiter", flex: 1, minWidth: 140 },
    ...(rs.show_cash_column !== false ? [{ 
      field: "cash", 
      headerName: `Cash (${settings?.general?.currency_symbol || "₵"})`, 
      width: 110, 
      renderCell: (params: any) => (parseFloat(params.value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }] : []),
    ...(rs.show_card_column !== false ? [{ 
      field: "card", 
      headerName: `Card (${settings?.general?.currency_symbol || "₵"})`, 
      width: 110,
      renderCell: (params: any) => (parseFloat(params.value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }] : []),
    ...(rs.show_momo_column !== false ? [{ 
      field: "momo", 
      headerName: `MoMo (${settings?.general?.currency_symbol || "₵"})`, 
      width: 110,
      renderCell: (params: any) => (parseFloat(params.value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }] : []),
    ...(rs.show_online_column !== false ? [{ 
      field: "online", 
      headerName: `Online (${settings?.general?.currency_symbol || "₵"})`, 
      width: 110,
      renderCell: (params: any) => (parseFloat(params.value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }] : []),
    ...(rs.show_balance_column !== false ? [{ 
        field: "balance", 
        headerName: `Balance (${settings?.general?.currency_symbol || "₵"})`, 
        width: 110,
        renderCell: (params: any) => (parseFloat(params.value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }] : []),
    { 
        field: "total", 
        headerName: `Total (${settings?.general?.currency_symbol || "₵"})`, 
        width: 110,
        renderCell: (params: any) => (parseFloat(params.value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
  ];

  // Card component for mobile/tablet
  const TransactionCard = ({ order }: { order: any }) => (
    <Card variant="outlined" sx={{ 
      mb: 2, 
      borderRadius: 2, 
      bgcolor: isDark ? alpha(theme.palette.background.paper, 0.4) : alpha(theme.palette.grey[50], 0.3),
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="caption" fontWeight={700} color="primary" sx={{ letterSpacing: 0.5 }}>
            #{String(order.id).slice(-6).toUpperCase()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {dayjs(order.created_at).format("HH:mm")}
          </Typography>
        </Stack>

        <Typography variant="subtitle2" fontWeight={700} noWrap gutterBottom>
          {order.waiter || "Self Service"}
        </Typography>

        <Stack spacing={0.5} mt={1}>
          {rs.show_cash_column !== false && order.cash > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">Cash ({settings?.general?.currency_symbol || "₵"})</Typography>
              <Typography variant="caption" fontWeight={600}>{(parseFloat(order.cash) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            </Stack>
          )}
          {rs.show_card_column !== false && order.card > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">Card ({settings?.general?.currency_symbol || "₵"})</Typography>
              <Typography variant="caption" fontWeight={600}>{(parseFloat(order.card) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            </Stack>
          )}
          {rs.show_momo_column !== false && order.momo > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">MoMo ({settings?.general?.currency_symbol || "₵"})</Typography>
              <Typography variant="caption" fontWeight={600}>{(parseFloat(order.momo) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            </Stack>
          )}
          {rs.show_online_column !== false && order.online > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">Online ({settings?.general?.currency_symbol || "₵"})</Typography>
              <Typography variant="caption" fontWeight={600}>{(parseFloat(order.online) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            </Stack>
          )}
          {rs.show_balance_column !== false && order.balance > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">Balance ({settings?.general?.currency_symbol || "₵"})</Typography>
              <Typography variant="caption" fontWeight={600} color="error.main">{(parseFloat(order.balance) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            </Stack>
          )}
          <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" fontWeight={800}>Total ({settings?.general?.currency_symbol || "₵"})</Typography>
            <Typography variant="body2" fontWeight={800} color="primary.main">{(parseFloat(order.total) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );



  return (
    <Box sx={{ p: { xs: 1, md: 3 }, minHeight: "100vh" }}>
      <Stack 
        direction={{ xs: "column", md: "row" }} 
        justifyContent="space-between" 
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={{ xs: 1.5, md: 3 }}
      >
        <Box sx={{ p: { xs: 1.5, md: 2 }, display: { xs: 'none', md: 'block' }, flexShrink: 0, minWidth: 'fit-content' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.6 }}>Reports</Typography>
              {reportMode !== "standard" && (
                <Chip 
                  label={`${reportMode} Report`} 
                  color={reportMode === "X" ? "primary" : "secondary"} 
                  size="small"
                  sx={{ fontWeight: "bold" }}
                  onDelete={() => setReportMode("standard")}
                />
              )}
            </Box>
            <Typography variant="h4" fontWeight={900} sx={{ mb: 1, letterSpacing: "-0.02em", fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
              {reportMode === "standard" ? "Sales Report" : `${reportMode} Report Overview`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {selectedRestaurant?.name} • {dayjs(startDate).format("MMM DD")} - {dayjs(endDate).format("MMM DD")}
            </Typography>
        </Box>

        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ width: { xs: '100%', md: 'auto' } }}
          spacing={1}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ 
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                fontWeight: 600,
                borderRadius: 2,
                '& .MuiSelect-select': {
                  py: 1,
                  px: { xs: 1.5, sm: 2 }
                }
              }}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1}>
            {isMobile ? (
              <>
                {rs.enable_xz_reports !== false && (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleGenerateReport("X")}
                      sx={{ minWidth: 36, px: 1, height: 36, fontWeight: "bold" }}
                    >
                      X
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleGenerateReport("Z")}
                      sx={{ minWidth: 36, px: 1, height: 36, fontWeight: "bold" }}
                    >
                      Z
                    </Button>
                  </>
                )}
                <Tooltip title="Advanced Filters">
                  <IconButton 
                    onClick={() => setShowFilters(!showFilters)}
                    size="small"
                    sx={{ 
                      border: '1px solid', 
                      borderColor: showFilters ? 'primary.main' : 'divider',
                      bgcolor: showFilters ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
                      color: showFilters ? 'primary.main' : 'text.secondary',
                      width: 36,
                      height: 36
                    }}
                  >
                    <FilterList sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                {rs.enable_xz_reports !== false && (
                  <Stack direction="row" spacing={1}>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small"
                      onClick={() => handleGenerateReport("X")}
                      sx={{ fontWeight: "bold" }}
                    >
                      X Report
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      size="small"
                      onClick={() => handleGenerateReport("Z")}
                      sx={{ fontWeight: "bold" }}
                    >
                      Z Report
                    </Button>
                  </Stack>
                )}
                {rs.allow_csv_export !== false && (
                  <Button 
                    variant="contained" 
                    startIcon={<Download />} 
                    size="small"
                    onClick={handleExportClick}
                  >
                    Export
                  </Button>
                )}
                {rs.show_advanced_filters !== false && (
                  <IconButton onClick={() => setShowFilters(!showFilters)}>
                    <FilterList color={showFilters ? "primary" : "inherit"} />
                  </IconButton>
                )}
              </>
            )}

            <Menu
              anchorEl={exportAnchorEl}
              open={Boolean(exportAnchorEl)}
              onClose={handleExportClose}
            >
              <MenuItem onClick={handleExportCSV}>
                <ListItemIcon><FileDownload fontSize="small" /></ListItemIcon>
                Export CSV
              </MenuItem>
              <MenuItem onClick={handleExportExcel}>
                <ListItemIcon><FileDownload fontSize="small" /></ListItemIcon>
                Export Excel
              </MenuItem>
              <MenuItem onClick={handleExportTXT}>
                <ListItemIcon><FileDownload fontSize="small" /></ListItemIcon>
                Export TXT
              </MenuItem>
              <MenuItem onClick={handleExportPDF}>
                <ListItemIcon><Print fontSize="small" /></ListItemIcon>
                Export PDF (Table)
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Stack>

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
      {rs.show_report_kpi_cards !== false && <Grid container spacing={2} sx={{ mb: { xs: 1.5, md: 3 } }}>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            title="Cash Total"
            value={formatCurrency(cash)}
            icon={<AttachMoney />}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            title="Card Total"
            value={formatCurrency(card)}
            icon={<CreditCard />}
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            title="MoMo Total"
            value={formatCurrency(momo)}
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            title="Total Sales"
            value={formatCurrency(total)}
            icon={<TrendingUp />}
            color="secondary"
          />
        </Grid>
      </Grid>}

      {/* Data Section */}
      {rs.show_transaction_table !== false && (
        <Box id="transaction-history">
          {isDesktop ? (
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardHeader 
                title={<Typography variant="h6" fontWeight={700}>Transaction History</Typography>} 
                sx={{ borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.paper, 0.5) }}
              />
              <CardContent sx={{ p: 0 }}>
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
                  sx={{ 
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      fontWeight: 700
                    }
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={800}>Transactions</Typography>
                  <Typography variant="caption" color="text.secondary">{filteredOrders.length} records found</Typography>
                </Box>
                <Chip 
                  label={dayjs(startDate).format("MMM DD")} 
                  size="small" 
                  variant="outlined" 
                  sx={{ borderRadius: 1.5, fontWeight: 600 }} 
                />
              </Stack>
              
              {loading ? (
                <Box display="flex" justifyContent="center" p={8}>
                  <CircularProgress size={32} />
                </Box>
              ) : filteredOrders.length > 0 ? (
                <>
                  <Grid container spacing={2}>
                    {paginatedOrders.map((order) => (
                      <Grid item xs={12} sm={6} key={order.id}>
                        <TransactionCard order={order} />
                      </Grid>
                    ))}
                  </Grid>
                  
                  {pageCount > 1 && (
                    <Box display="flex" justifyContent="center" mt={3} mb={1}>
                      <Pagination 
                        count={pageCount} 
                        page={page} 
                        onChange={handlePageChange}
                        color="primary"
                        size="small"
                        siblingCount={0}
                        sx={{
                          '& .MuiPaginationItem-root': {
                            fontWeight: 700,
                            borderRadius: 1.5,
                            height: 32,
                            minWidth: 32
                          }
                        }}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <EmptyState
                  title="No Transactions Found"
                  description="Adjust filters or check back later."
                  height={300}
                />
              )}
            </Card>
          )}
        </Box>
      )}
      {/* Mobile Export FAB */}
      {isMobile && rs.allow_csv_export !== false && (
        <Fab
          color="primary"
          aria-label="export"
          onClick={handleExportClick}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1100,
            boxShadow: theme.shadows[10],
          }}
        >
          <Download />
        </Fab>
      )}
    </Box>
  );
};

export default ReportDashboard;
