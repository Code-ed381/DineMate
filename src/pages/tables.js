import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  Button,
  Grid,
  TextField,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Alert,
  Snackbar,
  Paper,
  Avatar,
} from "@mui/material";
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  TableRestaurant,
  People,
  CheckCircle,
  Schedule,
  Block,
  Clear,
  LockClock,
  EventSeat,
  LocalDining,
} from "@mui/icons-material";
import useRestaurantStore from "../lib/restaurantStore";
import useTableManagementStore from "../lib/tableManagementStore";

const statusColors = {
  available: { color: "success", icon: CheckCircle, main: "success.main" },
  occupied: { color: "error", icon: Block, main: "error.main" },
  reserved: { color: "warning", icon: Schedule, main: "warning.main" },
  unavailable: { color: "default", icon: Block, main: "grey.400" },
};

function filterTablesByStatus(tables, status) {
  if (!Array.isArray(tables)) return [];
  if (!status) return tables; // return all if no status provided

  return tables.filter(
    (table) => table.table_status?.toLowerCase() === status.toLowerCase()
  );
};

export default function TableManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { selectedRestaurant, setSelectedRestaurant } = useRestaurantStore();
  const { getTablesOverview, tables, setTables, handleStatusChange } = useTableManagementStore();

  const [formData, setFormData] = useState({
    number: "",
    capacity: 2,
    location: "",
    description: "",
  });

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

      const matchesCapacity =
        capacityFilter === "all" ||
        (capacityFilter === "1-2" && table.capacity <= 2) ||
        (capacityFilter === "3-4" &&
          table.capacity >= 3 &&
          table.capacity <= 4) ||
        (capacityFilter === "5-6" &&
          table.capacity >= 5 &&
          table.capacity <= 6) ||
        (capacityFilter === "7+" && table.capacity >= 7);

      return matchesSearch && matchesStatus && matchesCapacity;
    });
  }, [tables, searchTerm, statusFilter, capacityFilter]);

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

  const handleOpenDialog = (table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        number: table.number,
        capacity: table.capacity,
        location: table.location || "",
        description: table.description || "",
      });
    } else {
      setEditingTable(null);
      setFormData({
        number: "",
        capacity: 2,
        location: "",
        notes: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTable(null);
  };

  const handleSaveTable = () => {
    if (!formData.number.trim()) {
      setSnackbar({
        open: true,
        message: "Table number is required",
        severity: "error",
      });
      return;
    }

    const tableExists = tables.some(
      (table) =>
        table.number.toLowerCase() === formData.number.toLowerCase() &&
        table.id !== editingTable?.id
    );

    if (tableExists) {
      setSnackbar({
        open: true,
        message: "Table number already exists",
        severity: "error",
      });
      return;
    }

    if (editingTable) {
      // update existing
      setTables((prev) =>
        prev.map((table) =>
          table.id === editingTable.id ? { ...table, ...formData } : table
        )
      );
      setSnackbar({
        open: true,
        message: "Table updated successfully",
        severity: "success",
      });
    } else {
      // add new
      const nextId =
        tables.length > 0 ? Math.max(...tables.map((t) => t.id)) + 1 : 1;

      const newTable = {
        id: nextId,
        ...formData,
        status: "available",
      };

      setTables((prev) => [...prev, newTable]);
      setSnackbar({
        open: true,
        message: "Table added successfully",
        severity: "success",
      });
    }

    handleCloseDialog();
  };

  const handleDeleteTable = (table) => {
    setTables((prev) => prev.filter((t) => t.id !== table.id));
    setSnackbar({
      open: true,
      message: "Table deleted successfully",
      severity: "success",
    });
    handleCloseMenu();
  };

  const handleMenuClick = (event, table) => {
    setAnchorEl(event.currentTarget);
    setSelectedTable(table);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedTable(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCapacityFilter("all");
  };

  // button handler
  const handleStatusFilterChange = (status) => {
    console.log("Clicked status:", status);
    setStatusFilter(status); // just update the filter
  };

  const handleCapacityFilterChange = (event, newCapacity) => {
    setCapacityFilter(newCapacity);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        {/* <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Table Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your restaurant tables, track availability, and update
          reservations
        </Typography> */}

        {/* Summary Bar */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                borderRadius: 3,
                border: "1px solid #ddd",
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
                borderRadius: 3,
                border: "1px solid #ddd",
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
                borderRadius: 3,
                border: "1px solid #ddd",
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
                borderRadius: 3,
                border: "1px solid #ddd",
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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Search + Clear */}
            <Grid item xs={12} md={6} sx={{ display: "flex", gap: 1 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
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

            {/* Filters on the right */}
            <Grid item xs={12} md="auto">
              <ToggleButtonGroup
                exclusive
                size="large"
                value={statusFilter}
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
                    border: "1px solid #ddd",
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
          </Grid>
        </CardContent>
      </Card>

      {/* Tables Grid */}
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
                  border: "1px solid #eee",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                  transition: "all 0.25s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                    transform: "translateY(-3px)",
                  },
                }}
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
                      sx={{ display: "flex", alignItems: "center", gap: 1.2 }}
                    >
                      <TableRestaurant color="primary" fontSize="small" />
                      <Typography variant="h6" fontWeight="700">
                        Table {table.table_number}
                      </Typography>
                    </Box>
                    <Chip
                      icon={StatusIcon ? <StatusIcon /> : null}
                      label={status.charAt(0).toUpperCase() + status.slice(1)}
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
                  <Typography variant="body2" color="text.secondary" mb={1}>
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
                <Box sx={{ p: 2, borderTop: "1px solid #f0f0f0" }}>
                  <Stack direction="row" spacing={1.2}>
                    {table.table_status === "available" && (
                      <>
                        <Button
                          fullWidth
                          size="small"
                          color="success"
                          onClick={() => handleStatusChange(table, "available")}
                          sx={{ fontWeight: 600, borderRadius: 2 }}
                        >
                          Book table
                        </Button>
                      </>
                    )}

                    {table.table_status === "occupied" && (
                      <Button
                        fullWidth
                        size="small"
                        color="error"
                        onClick={() => handleStatusChange(table, "occupied")}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                      >
                        View Order
                      </Button>
                    )}

                    {table.table_status === "reserved" && (
                      <Button
                        fullWidth
                        size="small"
                        color="warning"
                        onClick={() => handleStatusChange(table, "reserved")}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                      >
                        Start Order
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredTables.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <TableRestaurant
            sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tables found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            if (selectedTable) handleOpenDialog(selectedTable);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Table</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedTable) handleDeleteTable(selectedTable);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Table</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTable ? "Edit Table" : "Add New Table"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="normal"
              label="Table Number"
              fullWidth
              variant="outlined"
              value={formData.number}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, number: e.target.value }))
              }
              placeholder="e.g., T01, Table 1"
            />

            <Select
              value={formData.capacity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  capacity: Number(e.target.value),
                }))
              }
            >
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={4}>4</MenuItem>
              <MenuItem value={6}>6</MenuItem>
            </Select>

            <TextField
              margin="normal"
              label="Location"
              fullWidth
              variant="outlined"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="e.g., Main Floor, Patio, Private Room"
            />

            <TextField
              margin="normal"
              label="Notes"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Any special notes about this table..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTable} variant="contained">
            {editingTable ? "Update" : "Add"} Table
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
