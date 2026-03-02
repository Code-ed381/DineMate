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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Paper,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Button,
} from "@mui/material";
import {
  Search,
  TableRestaurant,
  People,
  LockClock,
  EventSeat,
  LocalDining,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  EventSeat as EventSeatIcon,
  Restaurant as RestaurantIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Receipt as ReceiptIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import useTableManagementStore from "../../lib/tableManagementStore";
import AdminHeader from "../../components/admin-header";
import FAB from "../../components/fab";
import DataTable from "../../components/data-table";
import { useSettingsStore } from "../../lib/settingsStore";

const statusColors: Record<string, { color: any; icon: any; label?: string }> = {
  available: { color: "success", icon: CheckCircleIcon },
  unavailable: { color: "default", icon: BlockIcon },
  reserved: { color: "warning", icon: EventSeatIcon },
  occupied: { color: "error", icon: RestaurantIcon },
  open: { color: "info", icon: HourglassEmptyIcon },
  billed: { color: "warning", icon: ReceiptIcon },
  close: { color: "default", icon: DoneAllIcon },
};

const TableManagement: React.FC = () => {
  const { getTablesOverview, addTable, tables, loadingTables, handleSave, handleDelete } = useTableManagementStore();
  const { viewMode } = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getTablesOverview();
  }, [getTablesOverview]);

  const filteredTables = useMemo(() => {
    return tables.filter((table: any) => {
      const matchesSearch = table.table_number.toString().includes(searchTerm) || (table.location || "").toLowerCase().includes(searchTerm.toLowerCase());
      const status = table.effective_status || table.table_status || "available";
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tables, searchTerm, statusFilter]);

  const tableStats = useMemo(() => {
    const counts: { available: number; occupied: number; reserved: number; unavailable: number; [key: string]: number } = { available: 0, occupied: 0, reserved: 0, unavailable: 0 };
    for (const t of tables) {
      const s = t.effective_status || t.table_status || "available";
      if (counts[s] !== undefined) counts[s]++;
    }
    return { total: tables.length, ...counts };
  }, [tables]);

  const handleEditTable = (table: any) => {
      Swal.fire({
          title: `Edit Table ${table.table_number}`,
          html: `
              <input id="swal-number" class="swal2-input" placeholder="Table Number" value="${table.table_number}">
              <input id="swal-capacity" type="number" class="swal2-input" placeholder="Capacity" value="${table.capacity}">
              <input id="swal-location" class="swal2-input" placeholder="Location" value="${table.location || ''}">
              <input id="swal-description" class="swal2-input" placeholder="Description" value="${table.description || ''}">
              <select id="swal-status" class="swal2-select">
                  <option value="available" ${table.status === 'available' ? 'selected' : ''}>Available</option>
                  <option value="unavailable" ${table.status === 'unavailable' ? 'selected' : ''}>Unavailable</option>
              </select>
          `,
          focusConfirm: false,
          preConfirm: async () => {
              const table_number = (document.getElementById('swal-number') as HTMLInputElement).value;
              const capacity = (document.getElementById('swal-capacity') as HTMLInputElement).value;
              const location = (document.getElementById('swal-location') as HTMLInputElement).value;
              const description = (document.getElementById('swal-description') as HTMLInputElement).value;
              const status = (document.getElementById('swal-status') as HTMLSelectElement).value;

              if (!table_number || !capacity) {
                  Swal.showValidationMessage('Please enter table number and capacity');
                  return false;
              }
              
              useTableManagementStore.getState().handleEditStart(table.table_id || table.id, {
                  ...table,
                  table_number,
                  capacity: parseInt(capacity),
                  location,
                  description,
                  status
              });
              
              await handleSave(table.table_id || table.id);
          }
      });
  };

  const handleDeleteTable = (id: string) => {
      handleDelete(id);
  };

  const columns = [
    { field: "table_number", headerName: "Table #", flex: 1 },
    { field: "capacity", headerName: "Capacity", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
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

  const handleAddTable = () => {
      Swal.fire({
          title: 'Add New Table',
          html: `
              <input id="swal-number" class="swal2-input" placeholder="Table Number">
              <input id="swal-capacity" type="number" class="swal2-input" placeholder="Capacity">
              <input id="swal-location" class="swal2-input" placeholder="Location">
              <input id="swal-notes" class="swal2-input" placeholder="Description/Notes">
          `,
          focusConfirm: false,
          preConfirm: async () => {
              const table_number = (document.getElementById('swal-number') as HTMLInputElement).value;
              const capacity = (document.getElementById('swal-capacity') as HTMLInputElement).value;
              const location = (document.getElementById('swal-location') as HTMLInputElement).value;
              const notes = (document.getElementById('swal-notes') as HTMLInputElement).value;

              if (!table_number || !capacity) {
                  Swal.showValidationMessage('Please enter table number and capacity');
                  return false;
              }

              await addTable(table_number, 'available', parseInt(capacity), location, notes);
          }
      });
  };

  return (
    <Box sx={{ p: 2 }}>
      <AdminHeader title="Table Management" description="Manage your restaurant tables" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Avatar sx={{ bgcolor: "white", color: "primary.main", mr: 2 }}><TableRestaurant /></Avatar>
            <Box><Typography variant="h4" fontWeight="bold">{tableStats.total}</Typography><Typography variant="body2" fontWeight="bold">Total Tables</Typography></Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Avatar sx={{ bgcolor: "white", color: "success.main", mr: 2 }}><CheckCircleIcon /></Avatar>
            <Box><Typography variant="h4" fontWeight="bold">{tableStats.available}</Typography><Typography variant="body2" fontWeight="bold">Available</Typography></Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Avatar sx={{ bgcolor: "white", color: "error.main", mr: 2 }}><RestaurantIcon /></Avatar>
            <Box><Typography variant="h4" fontWeight="bold">{tableStats.occupied}</Typography><Typography variant="body2" fontWeight="bold">Occupied</Typography></Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Avatar sx={{ bgcolor: "white", color: "warning.main", mr: 2 }}><EventSeatIcon /></Avatar>
            <Box><Typography variant="h4" fontWeight="bold">{tableStats.reserved}</Typography><Typography variant="body2" fontWeight="bold">Reserved</Typography></Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <ToggleButtonGroup exclusive value={statusFilter} onChange={(_e, v) => v && setStatusFilter(v)} size="small">
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="available" color="success">Available</ToggleButton>
              <ToggleButton value="occupied" color="error">Occupied</ToggleButton>
              <ToggleButton value="reserved" color="warning">Reserved</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ width: 300 }}
          />
      </Box>

      {viewMode === "grid" ? (
          <Grid container spacing={3}>
              {filteredTables.map((table: any) => {
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
              )})}
          </Grid>
      ) : (
          <DataTable rows={filteredTables} columns={columns} getRowId={(row) => row.table_id || row.id} />
      )}

      <FAB handleAdd={handleAddTable} title="Add Table" />
    </Box>
  );
};

export default TableManagement;
