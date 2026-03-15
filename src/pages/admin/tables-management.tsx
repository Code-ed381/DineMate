import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Button,
  useTheme,
  useMediaQuery,
  Pagination,
  Menu,
  MenuItem,
  ListItemIcon,
  Fab,
} from "@mui/material";
import {
  Search,
  TableRestaurant,
  People,
  LocalDining,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  EventSeat as EventSeatIcon,
  Restaurant as RestaurantIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Receipt as ReceiptIcon,
  DoneAll as DoneAllIcon,
  Download,
  FileDownload,
  Print,
} from "@mui/icons-material";
import useTableManagementStore from "../../lib/tableManagementStore";
import AdminHeader from "../../components/admin-header";
import FAB from "../../components/fab";
import DataTable from "../../components/data-table";
import EmptyState from "../../components/empty-state";
import { useSettingsStore } from "../../lib/settingsStore";
import TableDialog from "../../components/TableDialog";
import { useFeatureGate } from "../../hooks/useFeatureGate";
import UpgradeModal from "../../components/UpgradeModal";
import Swal from "sweetalert2";
import { useSubscriptionStore } from "../../lib/subscriptionStore";
import { useSubscription } from "../../providers/subscriptionProvider";
import useRestaurantStore from "../../lib/restaurantStore";
import { useSettings } from "../../providers/settingsProvider";
import { exportToCSV, exportToPDF, exportToExcel, exportToTXT } from "../../utils/exportUtils";

const statusColors: Record<string, { color: any; icon: any }> = {
  available: { color: "success", icon: CheckCircleIcon },
  unavailable: { color: "default", icon: BlockIcon },
  reserved: { color: "warning", icon: EventSeatIcon },
  occupied: { color: "error", icon: RestaurantIcon },
  open: { color: "info", icon: HourglassEmptyIcon },
  billed: { color: "warning", icon: ReceiptIcon },
  close: { color: "default", icon: DoneAllIcon },
};

const TableManagement: React.FC = () => {
  const { getTablesOverview, addTable, tables, handleSave, handleDelete } = useTableManagementStore();
  const { settings } = useSettings();
  const tableSettings = (settings as any).table_settings || {};
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const { canUseFeature, isLimitReached, plan, canAccess } = useFeatureGate();
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const handleExportClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canAccess("canUseCsvExport")) {
      Swal.fire("Upgrade Required", "Please upgrade your plan to export data.", "info");
      return;
    }
    setExportAnchorEl(e.currentTarget);
  };
  const handleExportClose = () => setExportAnchorEl(null);

  const getExportData = () => {
    return filteredTables.map(table => ({
        "Table Number": table.table_number,
        "Capacity": table.capacity,
        "Location": table.location || 'Main Hall',
        "Status": table.effective_status || table.table_status || 'available',
        "Description": table.description || 'N/A'
    }));
  };

  const handleExportCSV = () => {
    exportToCSV(getExportData(), "restaurant_tables");
    handleExportClose();
  };

  const handleExportExcel = () => {
    exportToExcel(getExportData(), "restaurant_tables");
    handleExportClose();
  };

  const handleExportTXT = () => {
    exportToTXT(getExportData(), "restaurant_tables");
    handleExportClose();
  };

  const handleExportPDF = () => {
    exportToPDF(getExportData(), "restaurant_tables", "Restaurant Tables Overview");
    handleExportClose();
  };
  
  const [page, setPage] = useState(1);
  const cardsPerPage = 8;

  useEffect(() => {
    getTablesOverview();
  }, [getTablesOverview]);

  const filteredTables = useMemo(() => {
    return tables.filter((table: any) => {
      const matchesSearch = 
        table.table_number.toString().includes(searchTerm) || 
        (table.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (table.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const status = table.effective_status || table.table_status || "available";
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tables, searchTerm, statusFilter]);

  const pageCount = Math.ceil(filteredTables.length / cardsPerPage);
  const paginatedTables = filteredTables.slice((page - 1) * cardsPerPage, page * cardsPerPage);

  const tableStats = useMemo(() => {
    const counts: { available: number; occupied: number; reserved: number; unavailable: number; [key: string]: number } = { available: 0, occupied: 0, reserved: 0, unavailable: 0 };
    for (const t of tables) {
      const s = t.effective_status || t.table_status || "available";
      if (counts[s] !== undefined) counts[s]++;
    }
    return { total: tables.length, ...counts };
  }, [tables]);

  const handleEditTable = (table: any) => {
    if (!canAccess("canManageTables")) {
        Swal.fire("Upgrade Required", "Please upgrade your plan to manage tables.", "info");
        return;
    }
    setEditingTable(table);
    setDialogOpen(true);
  };

  const handleAddTable = () => {
    if (isLimitReached("maxTables", tables.length)) {
      Swal.fire({
        title: "Table Limit Reached",
        text: `Your current plan allows up to ${plan.limits.maxTables} tables. Please upgrade to add more tables.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Upgrade Now",
        cancelButtonText: "Later"
      }).then((res) => {
        if (res.isConfirmed) setOpenUpgradeModal(true);
      });
      return;
    }
    setEditingTable(null);
    setDialogOpen(true);
  };



  const handleDialogSubmit = async (data: any) => {
    if (editingTable) {
      useTableManagementStore.getState().handleEditStart(editingTable.table_id || editingTable.id, {
        ...editingTable,
        ...data,
      });
      await handleSave(editingTable.table_id || editingTable.id);
    } else {
      await addTable(data.table_number, "available", data.capacity, data.location, data.description);
    }
  };

  const handleDeleteTable = (id: string) => {
    handleDelete(id);
  };

  const columns = [
    { field: "table_number", headerName: "Table #", flex: 1 },
    { field: "capacity", headerName: "Capacity", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "description", headerName: "Description", flex: 1.5 },
    {
      field: "effective_status",
      headerName: "Status",
      flex: 1,
      renderCell: (params: any) => {
        const status = params.value || params.row.table_status || "available";
        const config = statusColors[status] || statusColors.available;
        return <Chip label={status} color={config.color} size="small" sx={{ textTransform: 'capitalize' }} />;
      }
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params: any) => (
        <Box>
          <IconButton color="primary" onClick={() => handleEditTable(params.row)} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteTable(params.row.table_id || params.row.id)} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <AdminHeader 
        title={isMobile ? "" : "Table Management"} 
        description={isMobile ? "" : "Manage your restaurant tables"}
      >
        {!isMobile && (
          <Box>
              <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleExportClick}
                  sx={{ borderRadius: 2 }}
              >
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
          </Box>
        )}
      </AdminHeader>

      {tableSettings.show_table_stats !== false && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Paper sx={{ p: 2, display: "flex", alignItems: "center", bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Avatar sx={{ bgcolor: "white", color: "primary.main", mr: 2 }}><TableRestaurant /></Avatar>
              <Box><Typography variant="h4" fontWeight="bold">{tableStats.total}</Typography><Typography variant="body2" fontWeight="bold">Total Tables</Typography></Box>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper sx={{ p: 2, display: "flex", alignItems: "center", bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Avatar sx={{ bgcolor: "white", color: "success.main", mr: 2 }}><CheckCircleIcon /></Avatar>
              <Box><Typography variant="h4" fontWeight="bold">{tableStats.available}</Typography><Typography variant="body2" fontWeight="bold">Available</Typography></Box>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper sx={{ p: 2, display: "flex", alignItems: "center", bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Avatar sx={{ bgcolor: "white", color: "error.main", mr: 2 }}><RestaurantIcon /></Avatar>
              <Box><Typography variant="h4" fontWeight="bold">{tableStats.occupied}</Typography><Typography variant="body2" fontWeight="bold">Occupied</Typography></Box>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper sx={{ p: 2, display: "flex", alignItems: "center", bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Avatar sx={{ bgcolor: "white", color: "warning.main", mr: 2 }}><EventSeatIcon /></Avatar>
              <Box><Typography variant="h4" fontWeight="bold">{tableStats.reserved}</Typography><Typography variant="body2" fontWeight="bold">Reserved</Typography></Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Box sx={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", 
        gap: 2,
          mb: { xs: 1.5, md: 2 }
 
      }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ width: isMobile ? "100%" : 300, order: isMobile ? 0 : 1 }}
        />
        <Box sx={{ 
          overflowX: "auto", 
          order: isMobile ? 1 : 0,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { borderRadius: 2, bgcolor: 'divider' }
        }}>
          <ToggleButtonGroup exclusive value={statusFilter} onChange={(_e, v) => v && setStatusFilter(v)} size="small" sx={{ flexWrap: "nowrap" }}>
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="available" color="success">Available</ToggleButton>
            <ToggleButton value="occupied" color="error">Occupied</ToggleButton>
            <ToggleButton value="reserved" color="warning">Reserved</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {filteredTables.length === 0 ? (
        <EmptyState
          title="No Tables Found"
          description="Try adjusting your filters or add a new table."
          emoji="🪑"
          height={400}
        />
      ) : isMobile ? (
        <Grid container spacing={3}>
          {paginatedTables.map((table: any) => {
            const status = table.effective_status || table.table_status || "available";
            const config = statusColors[status] || statusColors.available;
            return (
              <Grid item xs={12} sm={6} md={3} key={table.table_id || table.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h5" fontWeight="bold">Table {table.table_number}</Typography>
                      <Chip label={status} size="small" color={config.color} sx={{ textTransform: 'capitalize' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People fontSize="small" /> Capacity: {table.capacity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <LocalDining fontSize="small" /> {table.location || "Main Hall"}
                    </Typography>
                    {table.description && <Typography variant="caption" color="text.secondary" display="block" mt={1}>"{table.description}"</Typography>}
                  </CardContent>
                  <Divider />
                  <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditTable(table)}>Edit</Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteTable(table.table_id || table.id)}>Delete</Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <DataTable rows={filteredTables} columns={columns} getRowId={(row) => row.table_id || row.id} />
      )}

      {isMobile && pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <Pagination count={pageCount} page={page} onChange={(e, p) => setPage(p)} color="primary" />
        </Box>
      )}

      <FAB handleAdd={handleAddTable} title="Add Table" />

      <TableDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        table={editingTable}
      />

      <UpgradeModal 
        open={openUpgradeModal} 
        onClose={() => setOpenUpgradeModal(false)} 
      />

      {/* Mobile Export FAB */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="export"
          onClick={handleExportClick}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1100,
          }}
        >
          <Download />
        </Fab>
      )}
    </Box>
  );
};

export default TableManagement;
