import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  InputAdornment, 
  Paper,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Search,
  TableRestaurant,
  People,
  CheckCircle,
  Schedule,
  Block,
  LockClock,
  EventSeat,
  LocalDining,
} from "@mui/icons-material";
import useMenuStore from "../lib/menuStore";
import TransitionsModal from "../components/modal";
import TableSectionSkeleton from "../components/skeletons/table-section-skeleton";
import useTablesStore from "../lib/tablesStore";
import EnhancedSnackbar from "../components/snackbar";

const statusColors: Record<string, any> = {
  available: { color: "success", icon: CheckCircle, main: "success.main" },
  occupied: { color: "error", icon: Block, main: "error.main" },
  reserved: { color: "warning", icon: Schedule, main: "warning.main" },
  unavailable: { color: "default", icon: Block, main: "grey.400" },
};

const TableManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const {
    tables,
    handleStatusChange,
    setSnackbar,
    open,
    handleClose,
    tablesLoaded,
    loadingTables,
    getTables,
    getSessionsOverview,
    selectedSession,
  } = useTablesStore();

  const { currentOrderItems, loadingCurrentOrderItems, totalOrdersPrice } = useMenuStore();
  const navigate = useNavigate();

  const filteredTables = useMemo(() => {
    return tables.filter((table: any) => {
      const matchesSearch =
        table.table_number?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        table?.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [tables, searchTerm, statusFilter]);

  const tableStats = useMemo(() => {
    const stats = tables?.reduce((acc: any, table: any) => {
      acc[table?.status] = (acc[table?.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: tables.length,
      available: stats.available || 0,
      occupied: stats.occupied || 0,
      reserved: stats.reserved || 0,
    };
  }, [tables]);

  useEffect(() => {
    getTables();
    getSessionsOverview();
  }, [getTables, getSessionsOverview]);


  const handleTableActionButtonClick = async (table: any) => {
    const result = await handleStatusChange(table);
    if (!result) return;

    if (result.message === "reserved") {
      setSnackbar({ id: 1, open: true, message: "Table reserved successfully", severity: "success" });
    } else if (result.message === "cancelled") {
      setSnackbar({ id: 2, open: true, message: "Table cancelled successfully", severity: "success" });
    } else if (result.message === "occupied") {
      setSnackbar({ id: 3, open: true, message: "Table occupied now", severity: "success" });
      navigate("/app/menu");
    }
  };


  return (
    <Box sx={{ p: 2 }}>
      {tablesLoaded && (
        <Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, display: "flex", alignItems: "center" }}><Avatar sx={{ bgcolor: "primary.main", mr: 2 }}><TableRestaurant /></Avatar><Box><Typography variant="h6">{tableStats.total}</Typography><Typography variant="body2" color="text.secondary">Total Tables</Typography></Box></Paper></Grid>
            <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, display: "flex", alignItems: "center" }}><Avatar sx={{ bgcolor: "success.main", mr: 2 }}><EventSeat /></Avatar><Box><Typography variant="h6">{tableStats.available}</Typography><Typography variant="body2" color="text.secondary">Available</Typography></Box></Paper></Grid>
            <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, display: "flex", alignItems: "center" }}><Avatar sx={{ bgcolor: "error.main", mr: 2 }}><LocalDining /></Avatar><Box><Typography variant="h6">{tableStats.occupied}</Typography><Typography variant="body2" color="text.secondary">Occupied</Typography></Box></Paper></Grid>
            <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, display: "flex", alignItems: "center" }}><Avatar sx={{ bgcolor: "warning.main", mr: 2 }}><LockClock /></Avatar><Box><Typography variant="h6">{tableStats.reserved}</Typography><Typography variant="body2" color="text.secondary">Reserved</Typography></Box></Paper></Grid>
          </Grid>

          <Grid container spacing={2} mb={4} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md="auto">
              <ToggleButtonGroup
                exclusive
                size="large"
                value={statusFilter}
                onChange={(_, value) => value && setStatusFilter(value)}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="available">Available</ToggleButton>
                <ToggleButton value="occupied">Occupied</ToggleButton>
                <ToggleButton value="reserved">Reserved</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth size="small"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {filteredTables.map((table: any) => {
              const status = table?.status || "unavailable";
              const StatusIcon = statusColors[status]?.icon;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
                  <Card sx={{ height: "100%", borderRadius: 3, borderLeft: `6px solid ${statusColors[status]?.main}` }}>
                    <CardContent sx={{ p: 2.5 }}>
                       <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6" fontWeight="bold">Table {table.table_number}</Typography>
                          <Chip icon={<StatusIcon />} label={status.toUpperCase()} color={statusColors[status]?.color} size="small" />
                       </Stack>
                       <Stack direction="row" spacing={1} mb={1}><People fontSize="small" /><Typography variant="body2">{table.capacity} seats</Typography></Stack>
                       {table.location && <Typography variant="body2">📍 {table.location}</Typography>}
                    </CardContent>
                    <Box p={2}>
                       <Button fullWidth onClick={() => handleTableActionButtonClick(table)} color={status === "available" ? "success" : status === "occupied" ? "error" : "warning"}>
                          {status === "available" ? "Reserve" : status === "occupied" ? "View Order" : "Start Order"}
                       </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
      {loadingTables && <TableSectionSkeleton />}
      <EnhancedSnackbar />
      <TransitionsModal open={open} handleClose={handleClose}>
          {loadingCurrentOrderItems ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          ) : (
            <Box sx={{ minWidth: 400 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Order Details - Table {selectedSession?.table_number}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Session Started: {selectedSession?.opened_at ? new Date(selectedSession.opened_at).toLocaleString() : 'N/A'}
                </Typography>
                <Divider sx={{ my: 2 }} />

                {currentOrderItems.length === 0 ? (
                  <Typography align="center" sx={{ py: 4 }}>No items found in this order.</Typography>
                ) : (
                  <>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Item</Typography></TableCell>
                            <TableCell align="center"><Typography variant="subtitle2" fontWeight="bold">Qty</Typography></TableCell>
                            <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Price</Typography></TableCell>
                            <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Subtotal</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {currentOrderItems.map((item: any, idx: number) => (
                            <TableRow key={item?.order_item_id || item?.id || idx}>
                              <TableCell>{item?.item_name}</TableCell>
                              <TableCell align="center">{item?.quantity}</TableCell>
                              <TableCell align="right">${item?.unit_price?.toFixed(2)}</TableCell>
                              <TableCell align="right">${item?.sum_price?.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={3} align="right">
                              <Typography variant="h6" fontWeight="bold">Total Amount:</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                ${totalOrdersPrice?.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </TableContainer>
                    <Box mt={3} display="flex" justifyContent="flex-end">
                      <Button variant="contained" onClick={handleClose}>Close</Button>
                    </Box>
                  </>
                )}
            </Box>
          )}
      </TransitionsModal>
    </Box>
  );
};

export default TableManagement;
