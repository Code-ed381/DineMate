import React, { useEffect, useState } from "react";
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
} from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import useCashierStore from "../lib/cashierStore";
import DashboardHeader from "./dashboards/components/dashboard-header";
import { useTheme, alpha } from "@mui/material/styles";
import { getCurrencySymbol } from "../utils/currency";
import MetricCard from "../components/MetricCard";
import { ShoppingBag, TrendingUp, PriceCheck } from "@mui/icons-material";
import EmptyState from "../components/empty-state";
import { exportToCSV } from "../utils/exportUtils";
import { useSettings } from "../providers/settingsProvider";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  // Access guard: audit logs disabled or cashier not allowed
  React.useEffect(() => {
    if (rs.enable_audit_logs === false) {
      Swal.fire({ title: "Disabled", text: "Audit Logs are disabled by settings.", icon: "info", timer: 2500, showConfirmButton: false });
      navigate("/app/dashboard");
    }
  }, [rs.enable_audit_logs, navigate]);

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDetailedReportItems(dateRange);
  }, [fetchDetailedReportItems, dateRange]);

  const handleExport = () => {
    if (detailedOrderItems.length > 0) {
      exportToCSV(detailedOrderItems, `audit_logs_${new Date().toISOString().split('T')[0]}`);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "created_at",
      headerName: "Date/Time",
      flex: 1.2,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleString('en-GB', {
            weekday: 'short', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          })}
        </Typography>
      ),
    },
    {
      field: "order_ref",
      headerName: "Order Ref",
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="primary">
          {params.value && params.value !== "N/A" ? `ORD-${params.value.toString().slice(0, 8)}` : "OTC"}
        </Typography>
      ),
    },
    {
      field: "item_name",
      headerName: "Item",
      flex: 1.5,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            variant="rounded"
            src={params.row.image_url}
            sx={{ width: 24, height: 24, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
          >
            <RestaurantMenu sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "quantity",
      headerName: "Qty",
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "sum_price",
      headerName: `Total Cost (${getCurrencySymbol()})`,
      flex: 0.8,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700}>
          {formatCashInput(params.value)}
        </Typography>
      ),
    },
    {
      field: "discount",
      headerName: "Disc.",
      width: 70,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
         <Typography variant="body2" color="text.secondary">
            {params.value > 0 ? `-${params.value}%` : "-"}
         </Typography>
      ),
    },
    {
      field: "waiter_first_name",
      headerName: "Waitered By",
      flex: 1.5,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            src={params.row.waiter_avatar_url}
            sx={{ width: 24, height: 24 }}
          >
            <Person sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography variant="body2">
            {params.value ? `${params.value} ${params.row.waiter_last_name || ""}` : "System"}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "preparer_first_name",
      headerName: "Prepared By",
      flex: 1.5,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            src={params.row.preparer_avatar_url}
            sx={{ width: 24, height: 24, bgcolor: alpha(theme.palette.success.main, 0.1) }}
          >
            <Restaurant sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography variant="body2">
            {params.value && params.value !== "In Progress" && params.value !== "Ready" ? `${params.value} ${params.row.preparer_last_name || ""}` : (params.row.status === "pending" ? "Start" : "Pending")}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === "served"
              ? "success"
              : params.value === "ready"
              ? "info"
              : params.value === "preparing"
              ? "warning" 
              : params.value === "cancelled"
              ? "error"
              : "default"
          }
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
  ];

  // Removed debug logs for cleaner production code

  const filteredRows = detailedOrderItems.filter((item) => {
    const name = item.item_name || "";
    const ref = item.order_ref || "";
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.toLowerCase().includes(query) || ref.toString().toLowerCase().includes(query);
    
    const matchesPersonnel = !selectedPersonnel || 
      item.prepared_by === selectedPersonnel || 
      item.waiter_id === selectedPersonnel; // Checking both if available
      
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    
    return matchesSearch && matchesPersonnel && matchesStatus;
  });

  const uniquePersonnel = Array.from(new Set([
    ...detailedOrderItems.map(i => ({ id: i.prepared_by, name: i.preparer_first_name })),
    ...detailedOrderItems.map(i => ({ id: i.waiter_id, name: i.waiter_first_name }))
  ].filter(p => p.id && p.name))).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  const stats = {
    totalItems: detailedOrderItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0),
    totalSales: detailedOrderItems.reduce((acc, curr) => acc + (parseFloat(curr.sum_price?.toString()) || 0), 0),
    avgOrderValue: detailedOrderItems.length > 0 
      ? detailedOrderItems.reduce((acc, curr) => acc + (parseFloat(curr.sum_price?.toString()) || 0), 0) / detailedOrderItems.length 
      : 0,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight={900} sx={{ mb: 1, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>Audit Logs</Typography>
      <Typography variant="body1" sx={{ mb: 4, opacity: 0.7 }}>Extensive overview of all transactions and personnel tracking.</Typography>

      {cs.show_audit_stats !== false && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              title="Total Quantity Sold"
              value={stats.totalItems}
              icon={<ShoppingBag />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              title="Gross Transaction Value"
              value={`${getCurrencySymbol()}${formatCashInput(stats.totalSales)}`}
              icon={<TrendingUp />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <MetricCard
              title="Avg. Item Price"
              value={`${getCurrencySymbol()}${formatCashInput(stats.avgOrderValue)}`}
              icon={<PriceCheck />}
              color="info"
            />
          </Grid>
        </Grid>
      )}

      <Card sx={{ borderRadius: 3, overflow: "visible" }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
              size="small"
              placeholder="Search item or order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { md: 300 } }}
            />
          <Stack direction="row" spacing={1}>
             {cs.enable_csv_export !== false && (
               <Tooltip title="Export CSV">
                 <IconButton onClick={handleExport} disabled={detailedOrderItems.length === 0}>
                   <Download />
                 </IconButton>
               </Tooltip>
             )}
             <IconButton onClick={() => setShowFilters(!showFilters)}>
                <FilterList color={showFilters ? "primary" : "inherit"} />
             </IconButton>
          </Stack>
        </Box>

        {showFilters && (
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderBottom: `1px solid ${theme.palette.divider}` }}>
             <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    label="From"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    label="To"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="By Personnel"
                    value={selectedPersonnel}
                    onChange={(e) => setSelectedPersonnel(e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="">All Staff</option>
                    {uniquePersonnel.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="By Status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="">All Statuses</option>
                    <option value="served">Served</option>
                    <option value="ready">Ready</option>
                    <option value="preparing">Preparing</option>
                    <option value="cancelled">Cancelled</option>
                  </TextField>
                </Grid>
             </Grid>
             <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => {
                  setDateRange({ startDate: "", endDate: "" });
                  setSelectedPersonnel("");
                  setSelectedStatus("");
                }}>Clear Filters</Button>
             </Box>
          </Box>
        )}
        <Box sx={{ height: { xs: '60vh', md: 600 }, width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns.map(c => ({ ...c, minWidth: c.minWidth || 120 }))}
            loading={loadingDetailedOrderItems}
            getRowId={(row) => row.order_item_id} 
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            slots={{
              noRowsOverlay: () => (
                <EmptyState
                  title="No Records Found"
                  description="Try adjusting your filters or date range."
                  emoji="🕵️"
                  height={400}
                />
              ),
            }}
            sx={{
              border: 'none',
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                fontWeight: 700,
              },
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default CashierDetailedReports;
