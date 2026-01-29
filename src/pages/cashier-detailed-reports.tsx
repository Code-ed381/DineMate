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

const CashierDetailedReports: React.FC = () => {
  const theme = useTheme();
  const {
    detailedOrderItems,
    loadingDetailedOrderItems,
    fetchDetailedReportItems,
    formatCashInput,
  } = useCashierStore();

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDetailedReportItems(dateRange);
  }, [fetchDetailedReportItems, dateRange]);

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
      headerName: "Total Cost",
      flex: 0.8,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700}>
          £{formatCashInput(params.value)}
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
    const matches = name.toLowerCase().includes(query) || ref.toString().toLowerCase().includes(query);
    return matches;
  });

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

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Total Quantity Sold</Typography>
              <Typography variant="h4" fontWeight={800}>{stats.totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.03) }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Gross Transaction Value</Typography>
              <Typography variant="h4" fontWeight={800} color="success.main">£{formatCashInput(stats.totalSales)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.03) }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Avg. Item Price</Typography>
              <Typography variant="h4" fontWeight={800} color="info.main">£{formatCashInput(stats.avgOrderValue)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' }, flexGrow: 1 }}>
            <TextField
              size="small"
              fullWidth
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
              sx={{ minWidth: { md: 250 } }}
            />
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <TextField
                type="date"
                size="small"
                fullWidth
                label="Start Date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                size="small"
                fullWidth
                label="End Date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1}>
             <Tooltip title="Export CSV">
                <IconButton onClick={() => {/* TODO: Implement export */}}>
                  <Download />
                </IconButton>
             </Tooltip>
             <IconButton>
                <FilterList />
             </IconButton>
          </Stack>
        </Box>
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
