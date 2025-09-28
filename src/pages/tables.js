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
  Alert,
  Snackbar,
  Paper,
  Avatar,
  Slide,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  CircularProgress,
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
  Add
} from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import useMenuStore from "../lib/menuStore";
import TransitionsModal from "../components/modal";
import ErrorIcon from "@mui/icons-material/Error";
import TableSectionSkeleton from "../components/skeletons/table-section-skeleton";
import useTablesStore from "../lib/tablesStore";

const statusColors = {
  available: { color: "success", icon: CheckCircle, main: "success.main" },
  occupied: { color: "error", icon: Block, main: "error.main" },
  reserved: { color: "warning", icon: Schedule, main: "warning.main" },
  unavailable: { color: "default", icon: Block, main: "grey.400" },
};

export default function TableManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const {
    getTablesOverview,
    tables,
    table,
    handleStatusChange,
    setSnackbar,
    snackbar,
    open,
    handleClose,
    tablesLoaded,
    loadingTables,
    chosenTableOrderItems,
    chosenTableSession,
    handleRemoveItem,
    loadingActiveSessionByTableNumber,
    activeSessionByTableNumberLoaded,
    setOpen,
    handleCloseTableBtn,
  } = useTablesStore();

  const setTableSelected = useMenuStore((state) => state.setTableSelected);
  const setChosenTable = useMenuStore((state) => state.setChosenTable);

  const navigate = useNavigate();

  // single filtering logic
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesSearch =
        table.table_number?.toString().includes(searchTerm.toLowerCase()) ||
        table.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        table.table_status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [tables, searchTerm, statusFilter]);

  const tableStats = useMemo(() => {
    const stats = tables.reduce((acc, table) => {
      acc[table.table_status] = (acc[table.table_status] || 0) + 1;
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
    getTablesOverview();
  }, [getTablesOverview]);

  // button handler
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status); // just update the filter
  };

  const handleTableActionButtonClick = async (table, action) => { 
    const result = await handleStatusChange(table, action);

    if (result.message === "reserved") { 
      setSnackbar({
        open: true,
        message: "Table reserved successfully",
        severity: "success",
      });
    }

    if (result.message === "cancelled") { 
      setSnackbar({
        open: true,
        message: "Table cancelled successfully",
        severity: "success",
      });
    }

    if (result.message === "ordering") { 
      setSnackbar({
        open: true,
        message: "Table ordered successfully",
        severity: "success",
      });

      navigate("/app/menu");
    }
  }

  const handleAddOrderItemBtn = () => {
    setTableSelected(true);
    setChosenTable(table);
    handleClose();
    navigate("/app/menu");
  }

  return (
    <Box sx={{ p: 2 }}>
      {loadingTables ? (
        <TableSectionSkeleton />
      ) : (
        <>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            {/* Summary Bar */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    <TableRestaurant />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{tableStats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tables
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                    <EventSeat />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{tableStats.available}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Available
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar sx={{ bgcolor: "error.main", mr: 2 }}>
                    <LocalDining />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{tableStats.occupied}</Typography>
                    <Typography variant="body2" color="texsecondaryt.">
                      Occupied
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar sx={{ bgcolor: "warning.main", mr: 2 }}>
                    <LockClock />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{tableStats.reserved}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reserved
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
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
            {/* Filters on the right */}
            <Grid item xs={12} md="auto">
              <ToggleButtonGroup
                exclusive
                size="large"
                value={statusFilter}
                disabled={!tablesLoaded || tables.length === 0}
                onChange={(_, value) =>
                  value &&
                  (value === "all"
                    ? setStatusFilter("all")
                    : handleStatusFilterChange(value))
                }
                sx={{
                  "& .MuiToggleButton-root": {
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: "capitalize",
                  },
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="available">Available</ToggleButton>
                <ToggleButton value="occupied">Occupied</ToggleButton>
                <ToggleButton value="reserved">Reserved</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Search + Clear */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
            >
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  disabled={!tablesLoaded || tables.length === 0}
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Tables Grid */}
          {tablesLoaded && tables.length > 0 && (
            <Grid container spacing={3}>
              {filteredTables.map((table) => {
                const status = table?.table_status || "unavailable";
                const StatusIcon = statusColors[status]?.icon;

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 3,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                        overflow: "hidden",
                        transition: "all 0.25s ease-in-out",
                        "&:hover": {
                          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                          transform: "translateY(-3px)",
                        },
                        borderLeft: `6px solid ${
                          statusColors[status]?.main || "grey.200"
                        }`,
                      }}
                      key={table.id}
                    >
                      {/* Status Bar Accent */}
                      <Box
                        sx={{
                          height: "6px",
                          bgcolor: statusColors[status]?.main || "grey.200",
                        }}
                      />

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
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.2,
                            }}
                          >
                            <TableRestaurant color="primary" fontSize="small" />
                            <Typography variant="h6" fontWeight="700">
                              Table {table.table_number}
                            </Typography>
                          </Box>
                          <Chip
                            icon={StatusIcon ? <StatusIcon /> : null}
                            label={
                              status.charAt(0).toUpperCase() + status.slice(1)
                            }
                            color={statusColors[status]?.color || "default"}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              borderRadius: 2,
                              px: 1.5,
                              py: 0.5,
                            }}
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
                          <People fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {table.capacity} seats
                          </Typography>
                        </Box>

                        {/* Location + Notes */}
                        {table.location && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.8 }}
                          >
                            📍 {table.location}
                          </Typography>
                        )}
                        {table.notes && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontStyle: "italic",
                              opacity: 0.8,
                            }}
                          >
                            “{table.notes}”
                          </Typography>
                        )}

                        {/* Session Info */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mb={1}
                        >
                          🕑 Started:{" "}
                          {new Date(table.opened_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                        {/* <Typography variant="body2" color="text.secondary">
                          💵 Current Bill: $
                          {table.order_total?.toFixed(2) || "0.00"}
                        </Typography> */}
                      </CardContent>

                      {/* Actions */}
                      <Box sx={{ p: 2 }}>
                        <Stack direction="row" spacing={1.2}>
                          {table.table_status === "available" && (
                            <>
                              <Button
                                fullWidth
                                size="small"
                                color="success"
                                onClick={() =>
                                  handleTableActionButtonClick(
                                    table,
                                    "reserve table"
                                  )
                                }
                                sx={{ fontWeight: 600, borderRadius: 2 }}
                              >
                                Reserve table
                              </Button>
                            </>
                          )}

                          {table.table_status === "occupied" && (
                            <Button
                              fullWidth
                              size="small"
                              color="error"
                              onClick={() =>
                                handleTableActionButtonClick(
                                  table,
                                  "view order"
                                )
                              }
                              sx={{ fontWeight: 600, borderRadius: 2 }}
                            >
                              View Order
                            </Button>
                          )}

                          {table.table_status === "reserved" && (
                            <Stack
                              direction="row"
                              spacing={1.2}
                              key={table.id}
                              sx={{ width: "100%" }}
                            >
                              <Button
                                fullWidth
                                size="small"
                                color="warning"
                                onClick={() =>
                                  handleTableActionButtonClick(
                                    table,
                                    "start ordering"
                                  )
                                }
                                sx={{ fontWeight: 600, borderRadius: 2 }}
                              >
                                Start Ordering
                              </Button>
                              <Button
                                fullWidth
                                size="small"
                                color="warning"
                                variant="contained"
                                onClick={() =>
                                  handleTableActionButtonClick(
                                    table,
                                    "cancel reservation"
                                  )
                                }
                                sx={{ width: "100%" }}
                              >
                                Cancel Reservation
                              </Button>
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {!tablesLoaded ||
            (tables.length === 0 && (
              <Box sx={{ textAlign: "center", mt: 20 }}>
                <TableRestaurant
                  sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tables found
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Try adjusting your search or filter criteria
                </Typography>
              </Box>
            ))}
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        Transition={Slide}
        key={snackbar.id}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <TransitionsModal
        open={open}
        handleClose={handleClose}
        children={
          <>
            {/* Orders */}
            {!loadingActiveSessionByTableNumber ? (
              activeSessionByTableNumberLoaded &&
              chosenTableOrderItems?.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          <CancelIcon fontSize="small" color="error"/>
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Product
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Qty</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chosenTableOrderItems?.map((item, index) => {
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <IconButton
                                onClick={() => handleRemoveItem(item)}
                                color="error"
                                size="small"
                                disabled={item?.status !== "pending" || chosenTableSession?.session_status !== "open"}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              {item.menu_item?.name?.toUpperCase()}
                            </TableCell>
                            <TableCell>{item.price?.toFixed(2)}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              {(item.price * item.quantity)?.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow sx={{ border: "none" }}>
                        <TableCell colSpan={4} sx={{ py: 0.5 }}>
                          <Typography variant="subtitle1">
                            Order Total
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <Typography variant="subtitle1">
                            {chosenTableSession?.order_total?.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ border: "none" }}>
                        <TableCell colSpan={4} sx={{ py: 0.5 }}>
                          <Typography variant="subtitle1">Tax</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <Typography variant="subtitle1">
                            {chosenTableSession?.order_total?.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ border: "none" }}>
                        <TableCell colSpan={4} sx={{ py: 0.5 }}>
                          <Typography variant="subtitle1">Discount</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <Typography variant="subtitle1">
                            {chosenTableSession?.order_total?.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ border: "none" }}>
                        <TableCell colSpan={4} sx={{ py: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Total
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {chosenTableSession?.order_total?.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <ErrorIcon
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No order items found on table{" "}
                    {chosenTableSession?.table_number}
                  </Typography>
                  <Stack
                    spacing={2}
                    direction="row"
                    justifyContent="center"
                    mt={2}
                  >
                    <Button
                      startIcon={<Add />}
                      variant="contained"
                      color="primary"
                      onClick={handleAddOrderItemBtn}
                    >
                      Add Order Item
                    </Button>
                    <Button
                      startIcon={<CancelIcon />}
                      variant="contained"
                      color="error"
                      onClick={() => handleCloseTableBtn(chosenTableSession)}
                    >
                      Close Table
                    </Button>
                  </Stack>
                </Box>
              )
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </>
        }
      />
    </Box>
  );
}
