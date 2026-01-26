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
  const { getTablesOverview, addTable, tables, loadingTables } = useTableManagementStore();
  const { viewMode } = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    getTablesOverview();
  }, [getTablesOverview]);

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesSearch = table.table_number.toString().includes(searchTerm) || table.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || table.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tables, searchTerm, statusFilter]);

  const tableStats = useMemo(() => {
    const counts: Record<string, number> = { available: 0, occupied: 0, reserved: 0, unavailable: 0 };
    for (const t of tables) {
      const s = t.base_status || "available";
      if (counts[s] !== undefined) counts[s]++;
    }
    return { total: tables.length, ...counts };
  }, [tables]);

  const columns = [
    { field: "table_number", headerName: "Table #", width: 90 },
    { field: "capacity", headerName: "Capacity", width: 100 },
    { field: "location", headerName: "Location", flex: 1 },
    {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: (params: any) => {
            const config = statusColors[params.value] || statusColors.available;
            return <Chip label={params.value} color={config.color} size="small" />;
        }
    }
  ];

  const handleAddTable = () => {
      // Add table Swal logic
  };

  return (
    <Box sx={{ p: 2 }}>
      <AdminHeader title="Table Management" description="Manage your restaurant tables" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}><TableRestaurant /></Avatar>
            <Box><Typography variant="h6">{tableStats.total}</Typography><Typography variant="body2">Total</Typography></Box>
          </Paper>
        </Grid>
        {/* Other stats... */}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <ToggleButtonGroup exclusive value={statusFilter} onChange={(_e, v) => v && setStatusFilter(v)}>
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="available">Available</ToggleButton>
              <ToggleButton value="occupied">Occupied</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <Search /> }}
          />
      </Box>

      {viewMode === "grid" ? (
          <Grid container spacing={3}>
              {filteredTables.map((table) => (
                  <Grid item xs={12} sm={6} md={3} key={table.id}>
                      <Card>
                          <CardContent>
                              <Typography variant="h6">Table {table.table_number}</Typography>
                              <Chip label={table.status} size="small" variant="outlined" />
                          </CardContent>
                      </Card>
                  </Grid>
              ))}
          </Grid>
      ) : (
          <DataTable rows={tables} columns={columns} />
      )}

      <FAB handleAdd={handleAddTable} title="Add Table" />
    </Box>
  );
};

export default TableManagement;
