import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  useMediaQuery,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Collapse,
  Pagination,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from "@mui/material";
import {
  Assignment,
  Person,
  Restaurant,
  Search,
  RestaurantMenu,
  DateRange,
  Download,
  FilterList,
  FileDownload,
  Print,
  ExpandMore,
  Assessment,
  Schedule,
  Article,
  GridOn,
} from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import useCashierStore from "../lib/cashierStore";
import DashboardHeader from "./dashboards/components/dashboard-header";
import { useTheme, alpha } from "@mui/material/styles";
import { getCurrencySymbol } from "../utils/currency";
import MetricCard from "../components/MetricCard";
import ExpandableMetricSection from "../components/ExpandableMetricSection";
import MiniChart from "../components/MiniChart";
import {
  ShoppingBag,
  TrendingUp,
  PriceCheck,
  People,
  AttachMoney,
} from "@mui/icons-material";
import EmptyState from "../components/empty-state";
import {
  exportToCSV,
  exportToPDF,
  exportToExcel,
  exportToTXT,
} from "../utils/exportUtils";
import { useSettings } from "../providers/settingsProvider";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useFeatureGate } from "../hooks/useFeatureGate";

const CashierDetailedReports: React.FC = () => {
  const theme = useTheme();
  const { settings } = useSettings();
  const cs = (settings as any).cashier_settings || {};
  const rs = settings?.report_settings || {};
  const {
    detailedOrderItems,
    loadingDetailedOrderItems,
    fetchDetailedReportItems,
    formatCashInput,
  } = useCashierStore();
  const currencySymbol = getCurrencySymbol();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { canAccess } = useFeatureGate();

  // Access guard
  useEffect(() => {
    if (rs.enable_audit_logs === false) {
      Swal.fire({
        title: "Disabled",
        text: "Audit Logs are disabled by settings.",
        icon: "info",
        timer: 2500,
        showConfirmButton: false,
      });
      navigate("/app/dashboard");
    }
  }, [rs.enable_audit_logs, navigate]);

  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedPersonnel, setSelectedPersonnel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchDetailedReportItems(dateRange);
    setPage(1);
  }, [fetchDetailedReportItems, dateRange]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedPersonnel, selectedStatus]);

  const handleExportClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!canAccess("canUseCsvExport")) {
      Swal.fire("Upgrade Required", "Please upgrade your plan to export data.", "info");
      return;
    }
    setExportAnchorEl(e.currentTarget);
  };
  const handleExportClose = () => setExportAnchorEl(null);

  const getExportData = () => {
    return detailedOrderItems.map((item) => ({
      "Date/Time": new Date(item.created_at).toLocaleString("en-GB"),
      "Order Ref": item.order_ref && item.order_ref !== "N/A" ? `ORD-${item.order_ref.toString().slice(0, 8)}` : "OTC",
      Item: item.item_name,
      Qty: item.quantity,
      "Total Cost": item.sum_price,
      "Disc.": item.discount > 0 ? `${item.discount}%` : "0%",
      "Waitered By": item.waiter_first_name ? `${item.waiter_first_name} ${item.waiter_last_name || ""}` : "System",
      "Prepared By": item.preparer_first_name && !["In Progress", "Ready"].includes(item.preparer_first_name)
          ? `${item.preparer_first_name} ${item.preparer_last_name || ""}`
          : item.status === "pending" ? "Start" : "Pending",
      Status: item.status,
    }));
  };

  const handleExportCSV = () => { handleExportClose(); exportToCSV(getExportData(), `audit_logs_${new Date().toISOString().split("T")[0]}`); };
  const handleExportExcel = () => { handleExportClose(); exportToExcel(getExportData(), `audit_logs_${new Date().toISOString().split("T")[0]}`); };
  const handleExportTXT = () => { handleExportClose(); exportToTXT(getExportData(), `audit_logs_${new Date().toISOString().split("T")[0]}`); };
  const handleExportPDF = () => { handleExportClose(); exportToPDF(getExportData(), `audit_logs_${new Date().toISOString().split("T")[0]}`, "Audit Logs Narrative"); };

  const uniquePersonnel = useMemo(() => {
    const personnel = [
      ...detailedOrderItems.map(i => ({ id: i.prepared_by, name: i.preparer_first_name })),
      ...detailedOrderItems.map(i => ({ id: i.waiter_id, name: i.waiter_first_name })),
    ].filter(p => p.id && p.name);
    return Array.from(new Set(personnel.map(p => p.id))).map(id => personnel.find(p => p.id === id));
  }, [detailedOrderItems]);

  const filteredRows = detailedOrderItems.filter((item) => {
    const name = (item.item_name || "").toLowerCase();
    const ref = (item.order_ref || "").toString().toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query) || ref.includes(query);
    const matchesPersonnel = !selectedPersonnel || item.prepared_by === selectedPersonnel || item.waiter_id === selectedPersonnel;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    return matchesSearch && matchesPersonnel && matchesStatus;
  });

  const paginatedMobileRows = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, page]);

  const stats = useMemo(() => ({
    totalItems: detailedOrderItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0),
    totalSales: detailedOrderItems.reduce((acc, curr) => acc + (parseFloat(curr.sum_price?.toString()) || 0), 0),
    avgItemVal: detailedOrderItems.length > 0 ? detailedOrderItems.reduce((acc, curr) => acc + (parseFloat(curr.sum_price?.toString()) || 0), 0) / detailedOrderItems.length : 0,
  }), [detailedOrderItems]);

  const analysisMetrics = useMemo(() => {
    // 1. Staff Performance
    const waiterStats: any = {};
    const preparerStats: any = {};
    
    // 2. Menu Analytics
    const itemSales: any = {};
    const statusCounts: any = { served: 0, ready: 0, preparing: 0, cancelled: 0, ordered: 0 };
    
    // 3. Operational (Peak Hours)
    const hourStats: any = {};
    
    // 4. Financial (Order Value Distribution)
    let smallOrders = 0, mediumOrders = 0, largeOrders = 0;
    const avgValue = stats.avgItemVal;

    detailedOrderItems.forEach(item => {
      // Staff
      if (item.waiter_first_name) {
        const name = item.waiter_first_name;
        waiterStats[name] = (waiterStats[name] || 0) + (item.quantity || 0);
      }
      if (item.preparer_first_name && !["In Progress", "Ready", "Not assigned"].includes(item.preparer_first_name)) {
        const name = item.preparer_first_name;
        preparerStats[name] = (preparerStats[name] || 0) + (item.quantity || 0);
      }
      
      // Menu
      const itemName = item.item_name || "Unknown";
      itemSales[itemName] = (itemSales[itemName] || 0) + (item.quantity || 0);
      if (statusCounts.hasOwnProperty(item.status)) {
        statusCounts[item.status]++;
      } else {
        statusCounts.ordered++;
      }
      
      // Operational
      const hour = new Date(item.created_at).getHours();
      hourStats[hour] = (hourStats[hour] || 0) + 1;
      
      // Financial
      const val = parseFloat(item.sum_price) || 0;
      if (val < avgValue * 0.5) smallOrders++;
      else if (val > avgValue * 1.5) largeOrders++;
      else mediumOrders++;
    });

    const topWaiters = Object.entries(waiterStats).sort((a:any, b:any) => b[1] - a[1]).slice(0, 5);
    const topPreparers = Object.entries(preparerStats).sort((a:any, b:any) => b[1] - a[1]).slice(0, 5);
    const topItems = Object.entries(itemSales).sort((a:any, b:any) => b[1] - a[1]).slice(0, 5);
    const peakHours = Object.entries(hourStats).sort((a:any, b:any) => b[1] - a[1]).slice(0, 3);

    return {
      topWaiters,
      topPreparers,
      topItems,
      statusDistribution: Object.entries(statusCounts).map(([label, value]) => ({ label, value })),
      peakHours: Object.entries(hourStats).map(([h, v]) => ({ label: `${h}:00`, value: v })),
      orderValueDist: [
        { label: "Small", value: smallOrders },
        { label: "Medium", value: mediumOrders },
        { label: "Large", value: largeOrders }
      ]
    };
  }, [detailedOrderItems, stats.avgItemVal]);

  const columns: GridColDef[] = [
    { field: "created_at", headerName: "Date/Time", flex: 1.2, renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {new Date(params.value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </Typography>
    )},
    { field: "order_ref", headerName: "Order Ref", flex: 1, renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="primary">
          {params.value && params.value !== "N/A" ? `ORD-${params.value.toString().slice(0, 8)}` : "OTC"}
        </Typography>
    )},
    { field: "item_name", headerName: "Item", flex: 1.5, renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar variant="rounded" src={params.row.image_url} sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <RestaurantMenu sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
        </Stack>
    )},
    { field: "quantity", headerName: "Qty", width: 70, align: "center", headerAlign: "center" },
    { field: "sum_price", headerName: `Cost (${currencySymbol})`, flex: 1, align: "right", headerAlign: "right", renderCell: (params) => (
        <Typography variant="body2" fontWeight={800}>{formatCashInput(params.value)}</Typography>
    )},
    { field: "waiter_first_name", headerName: "Waiter", flex: 1.2, renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar src={params.row.waiter_avatar_url} sx={{ width: 24, height: 24 }}><Person sx={{ fontSize: 14 }} /></Avatar>
          <Typography variant="caption" fontWeight={600}>{params.value || "System"}</Typography>
        </Stack>
    )},
    { field: "status", headerName: "Status", flex: 1, renderCell: (params) => (
        <Chip label={params.value} size="small" color={params.value === "served" ? "success" : params.value === "cancelled" ? "error" : "warning"} variant="outlined" sx={{ textTransform: "capitalize", fontWeight: 700 }} />
    )},
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: "auto" }}>
      {/* Header Row */}
      <Stack 
        direction={{ xs: "column", md: "row" }} 
        justifyContent="space-between" 
        alignItems="center" 
        spacing={2} 
        mb={3}
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>Audit Logs</Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Detailed tracking of every order item and personnel action.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
           <Button variant="outlined" startIcon={<Download />} onClick={handleExportClick} sx={{ borderRadius: 2, fontWeight: 700 }}>Export</Button>
        </Stack>
      </Stack>

      {/* Stats Row */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), border: "1px solid", borderColor: alpha(theme.palette.primary.main, 0.1), height: '100%' }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ fontSize: '0.65rem' }}>TOTAL QTY</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>{stats.totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.03), border: "1px solid", borderColor: alpha(theme.palette.success.main, 0.1), height: '100%' }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ fontSize: '0.65rem' }}>GROSS SALES</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5, fontSize: { xs: '1.1rem', sm: '1.5rem' }, wordBreak: 'break-all' }}>{currencySymbol}{formatCashInput(stats.totalSales)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.03), border: "1px solid", borderColor: alpha(theme.palette.info.main, 0.1), height: '100%' }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ fontSize: '0.65rem' }}>AVG ITEM PRICE</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5, fontSize: { xs: '1.1rem', sm: '1.5rem' }, wordBreak: 'break-all' }}>{currencySymbol}{formatCashInput(stats.avgItemVal)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.03), border: "1px solid", borderColor: alpha(theme.palette.warning.main, 0.1), height: '100%' }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ fontSize: '0.65rem' }}>MATCHING LOGS</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>{filteredRows.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Card */}
      <Card sx={{ borderRadius: 4, overflow: "hidden", boxShadow: theme.shadows[3] }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: alpha(theme.palette.background.default, 0.5) }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>, 
                  sx: { borderRadius: 3 } 
                }}
              />
              
              <IconButton 
                onClick={handleExportClick}
                sx={{ display: { xs: "flex", md: "none" } }}
              >
                <Download fontSize="small" />
              </IconButton>

              <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={handleExportClose}>
                <MenuItem onClick={handleExportCSV}><FileDownload sx={{ mr: 1 }} fontSize="small" /> CSV</MenuItem>
                <MenuItem onClick={handleExportExcel}><GridOn sx={{ mr: 1 }} fontSize="small" /> Excel (XLSX)</MenuItem>
                <MenuItem onClick={handleExportTXT}><Article sx={{ mr: 1 }} fontSize="small" /> TXT</MenuItem>
                <MenuItem onClick={handleExportPDF}><Print sx={{ mr: 1 }} fontSize="small" /> PDF</MenuItem>
              </Menu>

              <Button
                variant={showFilters ? "contained" : "outlined"}
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ borderRadius: 3, whiteSpace: "nowrap", display: { xs: "none", sm: "flex" } }}
              >
                {showFilters ? "Hide Filters" : "Filters"}
              </Button>
              <IconButton 
                color={showFilters ? "primary" : "inherit"}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ display: { xs: "flex", sm: "none" } }}
              >
                <FilterList />
              </IconButton>
            </Stack>

            <Collapse in={showFilters}>
                <Box sx={{ pt: 1, pb: 0.5 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <TextField type="date" size="small" fullWidth label="From" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ "& fieldset": { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField type="date" size="small" fullWidth label="To" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ "& fieldset": { borderRadius: 2 } }} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField select fullWidth size="small" label="Staff" value={selectedPersonnel} onChange={(e) => setSelectedPersonnel(e.target.value)} sx={{ "& fieldset": { borderRadius: 2 } }}>
                        <MenuItem value="">All Staff</MenuItem>
                        {uniquePersonnel.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField select fullWidth size="small" label="Status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} sx={{ "& fieldset": { borderRadius: 2 } }}>
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="served">Served</MenuItem>
                        <MenuItem value="ready">Ready</MenuItem>
                        <MenuItem value="preparing">Preparing</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </Box>
            </Collapse>
          </Stack>
        </Box>

        <Box sx={{ height: isMobile ? "auto" : 650, width: "100%" }}>
          {isMobile ? (
            <Stack spacing={0} divider={<Divider />}>
              {paginatedMobileRows.map((row) => (
                <Box key={row.order_item_id} sx={{ p: 2, "&:hover": { bgcolor: alpha(theme.palette.action.hover, 0.05) } }}>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="nowrap">
                    <Avatar variant="rounded" src={row.image_url} sx={{ width: 44, height: 44, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5} flexWrap="wrap" gap={1}>
                        <Typography variant="body2" fontWeight={800} sx={{ wordBreak: 'break-word', mr: 1 }}>{row.item_name}</Typography>
                        <Typography variant="body2" fontWeight={900} sx={{ whiteSpace: 'nowrap' }}>{currencySymbol}{formatCashInput(row.sum_price)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" fontWeight={700} color="primary">ORD-{String(row.order_ref || "").slice(0, 8) || "OTC"}</Typography>
                          <Typography variant="caption" color="text.secondary">Qty: {row.quantity}</Typography>
                        </Stack>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip label={row.status} size="small" variant="outlined" color={row.status === "served" ? "success" : "warning"} sx={{ height: 20, fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }} />
                        </Box>
                      </Stack>
                      <Box mt={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(row.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })} • By {row.waiter_first_name || "System"}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              ))}
              {filteredRows.length > 0 && (
                <Box sx={{ p: 2, display: "flex", justifyContent: "center", borderTop: "1px solid", borderColor: "divider" }}>
                  <Pagination 
                    count={Math.ceil(filteredRows.length / itemsPerPage)} 
                    page={page} 
                    onChange={(_, v) => setPage(v)}
                    size="small"
                    color="primary"
                    sx={{ "& .MuiPaginationItem-root": { fontWeight: 700 } }}
                  />
                </Box>
              )}
              {filteredRows.length === 0 && (
                <EmptyState title="No Records" description="Adjust filters to see results" emoji="🔎" height={300} />
              )}
            </Stack>
          ) : (
            <DataGrid
              rows={filteredRows}
              columns={columns}
              loading={loadingDetailedOrderItems}
              getRowId={(row) => row.order_item_id}
              initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
              pageSizeOptions={[15, 30, 50]}
              disableRowSelectionOnClick
              sx={{ border: "none", "& .MuiDataGrid-columnHeaders": { bgcolor: alpha(theme.palette.background.default, 0.7), fontWeight: 800, borderBottom: "1px solid", borderColor: "divider" } }}
            />
          )}
        </Box>
      </Card>
      
      {/* Mobile Export SpeedDial */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Export Options"
          sx={{ position: "fixed", bottom: 24, left: 24 }}
          icon={<SpeedDialIcon icon={<Download />} />}
          direction="up"
        >
          <SpeedDialAction
            icon={<FileDownload />}
            tooltipTitle="CSV"
            onClick={handleExportCSV}
          />
          <SpeedDialAction
            icon={<GridOn />}
            tooltipTitle="Excel"
            onClick={handleExportExcel}
          />
          <SpeedDialAction
            icon={<Article />}
            tooltipTitle="TXT"
            onClick={handleExportTXT}
          />
          <SpeedDialAction
            icon={<Print />}
            tooltipTitle="PDF"
            onClick={handleExportPDF}
          />
        </SpeedDial>
      )}

      {/* Analysis Sections */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
         <Grid item xs={12} md={6}>
            <ExpandableMetricSection title="Staff Performance" icon={<People />} color="primary" defaultExpanded={false}>
               <Grid item xs={6}>
                  <MetricCard title="Top Waiter" value={analysisMetrics.topWaiters[0]?.[0] || "N/A"} subtitle={`${analysisMetrics.topWaiters[0]?.[1] || 0} items`} icon={<Person />} color="primary" />
               </Grid>
               <Grid item xs={6}>
                  <MetricCard title="Top Kitchen" value={analysisMetrics.topPreparers[0]?.[0] || "N/A"} subtitle={`${analysisMetrics.topPreparers[0]?.[1] || 0} items`} icon={<Restaurant />} color="success" />
               </Grid>
               <Grid item xs={12}>
                  <MiniChart type="simple" title="Waiter Leaderboard" data={analysisMetrics.topWaiters.map(w => ({ label: w[0], value: w[1] }))} />
               </Grid>
            </ExpandableMetricSection>
         </Grid>
         <Grid item xs={12} md={6}>
            <ExpandableMetricSection title="Menu Analytics" icon={<Assessment />} color="secondary" defaultExpanded={false}>
               <Grid item xs={6}>
                  <MetricCard title="Best Seller" value={analysisMetrics.topItems[0]?.[0] || "N/A"} subtitle={`${analysisMetrics.topItems[0]?.[1] || 0} sold`} icon={<RestaurantMenu />} color="secondary" />
               </Grid>
               <Grid item xs={6}>
                  <MiniChart type="pie" title="Status Split" data={analysisMetrics.statusDistribution} height={100} />
               </Grid>
               <Grid item xs={12}>
                  <MiniChart type="bar" title="Top 5 Items (Qty)" data={analysisMetrics.topItems.map(i => ({ label: i[0], value: i[1] }))} />
               </Grid>
            </ExpandableMetricSection>
         </Grid>
         <Grid item xs={12} md={6}>
            <ExpandableMetricSection title="Operations" icon={<Schedule />} color="info" defaultExpanded={false}>
               <Grid item xs={6}>
                  <MetricCard title="Peak Hour" value={analysisMetrics.peakHours.length ? `${analysisMetrics.peakHours.slice().sort((a: any, b: any) => (b.value - a.value))[0].label}` : "N/A"} icon={<Schedule />} color="info" />
               </Grid>
               <Grid item xs={6}>
                  <MiniChart type="bar" title="Hourly Order Vol" data={analysisMetrics.peakHours} height={120} />
               </Grid>
            </ExpandableMetricSection>
         </Grid>
         <Grid item xs={12} md={6}>
            <ExpandableMetricSection title="Financial Trends" icon={<AttachMoney />} color="success" defaultExpanded={false}>
                <Grid item xs={12}>
                  <MiniChart type="progress" title="Ticket Value Distribution" data={analysisMetrics.orderValueDist} />
                </Grid>
            </ExpandableMetricSection>
         </Grid>
      </Grid>
    </Box>
  );
};

export default CashierDetailedReports;
