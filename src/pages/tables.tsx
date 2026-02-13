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
  Map as MapIcon,
  GridView as GridViewIcon,
  NotificationsActive,
} from "@mui/icons-material";
import FloorPlan from "../components/FloorPlan";
import useMenuStore from "../lib/menuStore";
import TransitionsModal from "../components/modal";
import TableSectionSkeleton from "../components/skeletons/table-section-skeleton";
import useTablesStore from "../lib/tablesStore";
import EnhancedSnackbar from "../components/snackbar";
import TransferTableDialog from "../components/TransferTableDialog";
import useAuthStore from "../lib/authStore";
import useRestaurantStore from "../lib/restaurantStore";
import TableTimer from "../components/TableTimer";

const statusColors: Record<string, any> = {
  available: { color: "success", icon: CheckCircle, main: "success.main" },
  occupied: { color: "error", icon: Block, main: "error.main" },
  reserved: { color: "warning", icon: Schedule, main: "warning.main" },
  unavailable: { color: "default", icon: Block, main: "grey.400" },
};

const TableManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "floor">("grid");
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
    getSession, 
    updateTablePosition,
    cancelReservation,
    transferTable,
    sessionsOverview,
    subscribeToTables,
    unsubscribeFromTables,
    serviceRequests,
    resolveServiceRequest
  } = useTablesStore();

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [tableToTransfer, setTableToTransfer] = useState<any>(null);
  const [transferSessionId, setTransferSessionId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { selectedRestaurant } = useRestaurantStore();

  const { currentOrderItems, loadingCurrentOrderItems, totalOrdersPrice, startCourse, currentOrder } = useMenuStore();
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
    subscribeToTables();
    return () => unsubscribeFromTables();
  }, [getTables, getSessionsOverview, subscribeToTables, unsubscribeFromTables]);

  const handleTransferClick = async (table: any) => {
    if (!user?.id || !selectedRestaurant?.id) return;
    const session = await getSession(table.id, user.id, selectedRestaurant.id);
    if (session) {
      setTransferSessionId(session.id);
      setTableToTransfer(table);
      setTransferDialogOpen(true);
    } else {
      setSnackbar({
        open: true,
        message: "No active session found for this table.",
        severity: "warning",
        id: Date.now()
      });
    }
  };


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
    } else if (result.message === "viewing") {
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
            <Grid item xs={12} md="auto">
              <ToggleButtonGroup
                exclusive
                size="large"
                value={viewMode}
                onChange={(_, value) => value && setViewMode(value)}
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <GridViewIcon sx={{ mr: 1 }} /> Grid
                </ToggleButton>
                <ToggleButton value="floor" aria-label="floor plan">
                  <MapIcon sx={{ mr: 1 }} /> Floor Plan
                </ToggleButton>
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

          {viewMode === "grid" ? (
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
                           <Stack direction="row" spacing={1} alignItems="center">
                              {status === 'occupied' && (() => {
                                const session = sessionsOverview?.find((s: any) => s.table_id === table.id);
                                return session?.opened_at ? <TableTimer startDate={session.opened_at} /> : null;
                              })()}
                              
                              {/* Service Request Alert */}
                              {(() => {
                                 const request = serviceRequests?.find((r: any) => r.table_id === table.id);
                                 if (request) { 
                                   return (
                                     <Chip 
                                       icon={<NotificationsActive />} 
                                       label="SERVICE" 
                                       color="error" 
                                       size="small" 
                                       sx={{ 
                                         animation: 'pulse 1.5s infinite',
                                         '@keyframes pulse': {
                                           '0%': { opacity: 1, transform: 'scale(1)' },
                                           '50%': { opacity: 0.8, transform: 'scale(1.05)' },
                                           '100%': { opacity: 1, transform: 'scale(1)' },
                                         }
                                       }}
                                     />
                                   )
                                 }
                                 return <Chip icon={<StatusIcon />} label={status.toUpperCase()} color={statusColors[status]?.color} size="small" />;
                              })()}
                           </Stack>
                        </Stack>
                       <Stack direction="row" spacing={1} mb={1}><People fontSize="small" /><Typography variant="body2">{table.capacity} seats</Typography></Stack>
                       {table.location && <Typography variant="body2">📍 {table.location}</Typography>}
                    </CardContent>
                    <Box p={2}>
                        <Stack direction="row" spacing={1} sx={{ '& > *': { flex: 1 } }}>
                          <Button 
                            fullWidth 
                            onClick={() => handleTableActionButtonClick(table)} 
                            color={status === "available" ? "success" : status === "occupied" ? "error" : "warning"}
                            variant={status === "reserved" ? "contained" : "text"}
                          >
                             {status === "available" ? "Reserve" : status === "occupied" ? "View Order" : "Start Order"}
                          </Button>
                          {status === "occupied" && (
                            <Button 
                              fullWidth 
                              onClick={() => handleTransferClick(table)} 
                              color="primary" 
                              variant="outlined"
                              sx={{ px: 1 }}
                            >
                               Transfer
                            </Button>
                          )}
                           {status === "reserved" && (
                            <Button 
                              fullWidth 
                              onClick={() => cancelReservation(table, 'cancelled')} 
                              color="error" 
                              variant="outlined"
                              sx={{ px: 1 }}
                            >
                               Cancel
                            </Button>
                          )}
                          
                          {/* Resolve Service Request Button */}
                          {(() => {
                             const request = serviceRequests?.find((r: any) => r.table_id === table.id);
                             if (request) {
                               return (
                                 <Button 
                                    fullWidth 
                                    onClick={() => resolveServiceRequest(request.id)} 
                                    color="secondary" 
                                    variant="contained"
                                    sx={{ px: 1, bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
                                 >
                                    Resolve Alert
                                 </Button>
                               );
                             }
                             return null;
                          })()}
                        </Stack>
                     </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          ) : (
            <FloorPlan 
              tables={tables} 
              sessionsOverview={sessionsOverview}
              serviceRequests={serviceRequests}
              onTableClick={handleTableActionButtonClick}
              onUpdatePosition={(id, x, y) => updateTablePosition(id, x, y)}
              onCancelReservation={(table) => cancelReservation(table, 'cancelled')}
            />
          )}
        </Box>
      )}
      {loadingTables && <TableSectionSkeleton />}

      <TransferTableDialog
        open={transferDialogOpen}
        onClose={() => {
          setTransferDialogOpen(false);
          setTableToTransfer(null);
          setTransferSessionId(null);
        }}
        onTransfer={async (destId) => {
          if (transferSessionId && tableToTransfer) {
            await transferTable(transferSessionId, tableToTransfer.id, destId);
          }
        }}
        availableTables={tables.filter(t => t.status === 'available')}
        sourceTableNumber={tableToTransfer?.table_number || ''}
      />

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
                     <Box sx={{maxHeight: '60vh', overflow: 'auto'}}>
                        {Array.from(new Set(currentOrderItems.map((item: any) => item.course || 1))).sort((a: any, b: any) => a - b).map((course: any) => {
                          const courseItems = currentOrderItems.filter((item: any) => (item.course || 1) === course);
                          const isCourseStarted = courseItems.every((item: any) => item.is_started !== false);
                          
                          return (
                            <Box key={course} sx={{ mb: 4, bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                  {course === 1 ? "STARTER" : course === 2 ? "MAIN" : course === 3 ? "DESSERT" : "CHEF'S SPECIAL"} {isCourseStarted ? "" : "(HELD)"}
                                </Typography>
                                {!isCourseStarted && (
                                  <Button 
                                    size="small" 
                                    variant="contained" 
                                    color="warning" 
                                    onClick={() => currentOrder?.id && startCourse(currentOrder.id, course)}
                                  >
                                    Fire {course === 1 ? "STARTER" : course === 2 ? "MAIN" : course === 3 ? "DESSERT" : "COURSE"}
                                  </Button>
                                )}
                              </Stack>
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell sx={{fontWeight: 'bold'}}>Item</TableCell>
                                      <TableCell align="center" sx={{fontWeight: 'bold'}}>Qty</TableCell>
                                      <TableCell align="right" sx={{fontWeight: 'bold'}}>Price</TableCell>
                                      <TableCell align="right" sx={{fontWeight: 'bold'}}>Total</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {courseItems.map((item: any, idx: number) => (
                                      <TableRow key={item?.order_item_id || item?.id || idx}>
                                        <TableCell>{item?.item_name}</TableCell>
                                        <TableCell align="center">{item?.quantity}</TableCell>
                                        <TableCell align="right">${item?.unit_price?.toFixed(2)}</TableCell>
                                        <TableCell align="right">${item?.sum_price?.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          );
                        })}
                     </Box>
                     <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
                       <Stack direction="row" justifyContent="space-between" alignItems="center">
                         <Typography variant="h6" fontWeight="bold">Grand Total</Typography>
                         <Typography variant="h5" fontWeight="bold">${totalOrdersPrice?.toFixed(2)}</Typography>
                       </Stack>
                     </Box>
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
