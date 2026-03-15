import React, { useMemo, useState } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Stack, 
  Typography, 
  Divider, 
  Chip, 
  useMediaQuery, 
  Grid, 
  Pagination, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  TextField, 
  MenuItem, 
  InputAdornment,
  Button,
  alpha,
} from "@mui/material";
import { 
  AttachMoney, 
  CreditCard, 
  Smartphone, 
  TableRestaurant, 
  Person, 
  CalendarToday, 
  FilterList, 
  ExpandMore, 
  Search,
  Clear
} from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";

import { useCurrency } from "../../../utils/currency";

interface TransactionHistoryProps {
  allSessions: any[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ allSessions }) => {
  const { currencySymbol } = useCurrency();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Filtering State
  const [search, setSearch] = useState("");
  const [filterTable, setFilterTable] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = isMobile ? 6 : 10;

  const filteredRows = useMemo(() => {
    return allSessions.filter((s) => {
      const orderMatch = s.order_id?.toString().toLowerCase().includes(search.toLowerCase());
      const tableMatch = filterTable === "" || s.table_number?.toString().includes(filterTable);
      const statusMatch = filterStatus === "all" || s.session_status === filterStatus;
      const methodMatch = filterMethod === "all" || s.payment_method === filterMethod;
      return orderMatch && tableMatch && statusMatch && methodMatch;
    }).map((s, i) => ({ id: s.session_id || i, ...s }));
  }, [allSessions, search, filterTable, filterStatus, filterMethod]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const handleReset = () => {
    setSearch("");
    setFilterTable("");
    setFilterStatus("all");
    setFilterMethod("all");
    setPage(1);
  };

  const getPaymentChip = (method: string) => {
    switch (method) {
      case "cash": return <Chip icon={<AttachMoney />} label="Cash" size="small" />;
      case "card": return <Chip icon={<CreditCard />} label="Card" size="small" />;
      case "momo": return <Chip icon={<Smartphone />} label="MoMo" size="small" />;
      case "online": return <Chip label="Online" size="small" color="primary" variant="outlined" />;
      case "card+cash": return <Chip label="Card+Cash" size="small" color="secondary" variant="outlined" />;
      default: return <Chip label="Not Paid" size="small" color="error" />;
    }
  };

  const getStatusChip = (status: string) => {
    return <Chip label={status} size="small" color={status === "open" ? "success" : status === "billed" ? "warning" : "error"} />;
  };

  const columns: GridColDef[] = [
    { field: "order_id", headerName: "Order ID", flex: 1, renderCell: (params) => (
      <Typography variant="body2" fontWeight={700} color="primary">ORD-{params.value?.toString().slice(0, 8)}</Typography>
    ) },
    { field: "table_number", headerName: "Table", flex: 0.8, renderCell: (p) => p.value || "OTC" },
    { field: "opened_at", headerName: "Date", flex: 1.2, renderCell: (params) => new Date(params.value).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) },
    { field: "waiter", headerName: "Waiter", flex: 1.2, renderCell: (params) => `${params.row?.waiter_first_name ?? ""} ${params.row?.waiter_last_name ?? ""}`.trim() || "System" },
    { field: "order_total", headerName: "Amount", type: "number", flex: 1, align: "right", headerAlign: "right", renderCell: (params) => (
      <Typography variant="body2" fontWeight={800}>{currencySymbol}{Number(params.value || 0).toFixed(2)}</Typography>
    ) },
    { field: "payment_method", headerName: "Method", flex: 1, renderCell: (params) => getPaymentChip(params.value) },
    { field: "session_status", headerName: "Status", flex: 1, renderCell: (params) => getStatusChip(params.value) },
  ];

  return (
    <Card sx={{ borderRadius: 3, height: isMobile ? "auto" : "calc(100vh - 200px)", display: "flex", flexDirection: "column", boxShadow: theme.shadows[2] }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", p: isMobile ? 2 : 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800} color="text.primary">Transaction History</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {filteredRows.length} transactions found
            </Typography>
          </Box>
          
          <Box sx={{ width: { xs: "100%", md: "auto" }, minWidth: { md: 400 } }}>
            <Accordion elevation={0} sx={{ 
              bgcolor: alpha(theme.palette.background.default, 0.5), 
              border: "1px solid", 
              borderColor: "divider", 
              borderRadius: "16px !important",
              overflow: "hidden"
            }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <FilterList color="primary" />
                  <Typography variant="body2" fontWeight={700}>Search & Filters</Typography>
                  {(search || filterTable || filterStatus !== "all" || filterMethod !== "all") && (
                    <Chip label="Active" size="small" color="primary" sx={{ height: 18, fontSize: "10px", fontWeight: 800 }} />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search Order ID..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"><Search fontSize="small" color="action"/></InputAdornment>,
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Table"
                      value={filterTable}
                      onChange={(e) => { setFilterTable(e.target.value); setPage(1); }}
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      label="Status"
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                      sx={{ "& fieldset": { borderRadius: 2 } }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="billed">Billed</MenuItem>
                      <MenuItem value="close">Closed</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        fullWidth
                        size="small"
                        select
                        label="Payment Method"
                        value={filterMethod}
                        onChange={(e) => { setFilterMethod(e.target.value); setPage(1); }}
                        sx={{ "& fieldset": { borderRadius: 2 } }}
                      >
                        <MenuItem value="all">All Methods</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="card">Card</MenuItem>
                        <MenuItem value="momo">MoMo</MenuItem>
                        <MenuItem value="online">Online</MenuItem>
                      </TextField>
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleReset} 
                        sx={{ minWidth: 44, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }, boxShadow: 'none' }}
                      >
                        <Clear />
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {isMobile ? (
            <Stack spacing={2}>
              {paginatedRows.map((row) => (
                <Box key={row.id} sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  transition: "transform 0.2s",
                  '&:active': { transform: "scale(0.98)" }
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={1.5}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} color="primary">
                        ORD-{row.order_id?.toString().slice(0, 8)}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, opacity: 0.7 }}>
                        <CalendarToday sx={{ fontSize: 13 }} />
                        <Typography variant="caption" fontWeight={600}>
                          {new Date(row.opened_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box display="flex" flexDirection="row" alignItems="center" flexWrap="wrap" justifyContent="flex-end" gap={0.5}>
                      {getStatusChip(row.session_status)}
                      {getPaymentChip(row.payment_method)}
                    </Box>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={1}>
                    <Stack spacing={0.8}>
                      <Stack direction="row" spacing={0.8} alignItems="center">
                         <TableRestaurant sx={{ fontSize: 16, color: "text.secondary" }} />
                         <Typography variant="body2" fontWeight={700}>Table: {row.table_number || "OTC"}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.8} alignItems="center">
                         <Person sx={{ fontSize: 16, color: "text.secondary" }} />
                         <Typography variant="caption" fontWeight={600} color="text.secondary">
                           {`${row.waiter_first_name ?? ""} ${row.waiter_last_name ?? ""}`.trim() || "System"}
                         </Typography>
                      </Stack>
                    </Stack>
                    <Box sx={{ textAlign: 'right', flexGrow: 1 }}>
                      {row.discount > 0 && (
                        <Typography variant="caption" color="error.main" fontWeight={800} sx={{ display: 'block' }}>
                          -{row.discount}% Off
                        </Typography>
                      )}
                      <Typography variant="h6" fontWeight={900} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        {currencySymbol}{Number(row.order_total || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
              {filteredRows.length === 0 && (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>No transactions found</Typography>
                  <Button size="small" onClick={handleReset} sx={{ mt: 1 }}>Clear Filters</Button>
                </Box>
              )}
            </Stack>
          ) : (
            <DataGrid 
              rows={filteredRows} 
              columns={columns} 
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} 
              disableRowSelectionOnClick 
              sx={{ 
                border: "none",
                "& .MuiDataGrid-columnHeaders": { bgcolor: alpha(theme.palette.background.default, 0.5), fontWeight: 800 },
                "& .MuiDataGrid-cell": { borderBottom: "1px solid", borderColor: alpha(theme.palette.divider, 0.5) }
              }}
            />
          )}
        </Box>

        {filteredRows.length > pageSize && isMobile && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination 
              count={Math.ceil(filteredRows.length / pageSize)} 
              page={page} 
              onChange={(_, v) => setPage(v)} 
              color="primary" 
              size="small"
              sx={{ 
                "& .MuiPaginationItem-root": { fontWeight: 800, borderRadius: 1.5 },
                "& .Mui-selected": { bgcolor: alpha(theme.palette.primary.main, 1), color: "#fff" }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
