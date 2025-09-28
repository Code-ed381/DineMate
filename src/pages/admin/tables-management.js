import React, { useState, useMemo, useEffect } from "react";
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
  MenuItem,
  Chip,
  IconButton,
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
  Search,
  Edit,
  Delete,
  TableRestaurant,
  People,
  LockClock,
  EventSeat,
  LocalDining,
  PersonAdd,
  Person,
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
import useAppStore from "../../lib/appstore";
import DataTable from "../../components/data-table";

const statusColors = {
  available: { color: "success", icon: CheckCircleIcon },
  unavailable: { color: "default", icon: BlockIcon },
  reserved: { color: "warning", icon: EventSeatIcon },
  occupied: { color: "error", icon: RestaurantIcon },

  // session-status values
  open: { color: "info", icon: HourglassEmptyIcon },
  billed: { color: "warning", icon: ReceiptIcon },
  close: { color: "default", icon: DoneAllIcon },
};

export default function TableManagement() {
  const { getTablesOverview, addTable, tables, loadingTables } = useTableManagementStore();
  const { viewMode } = useAppStore();
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

  const columns = [
    { field: "table_number", headerName: "Table #", flex: 1, maxWidth: 90 },
    { field: "capacity", headerName: "Capacity", flex: 1, maxWidth: 100 },
    { field: "location", headerName: "Location", flex: 1, maxWidth: 150 },
    {
      field: "base_status",
      headerName: "Status",
      flex: 1,
      maxWidth: 130,
      renderCell: (params) => {
        const statusKey = params.value || "available";
        const statusConfig = statusColors[statusKey] || {
          color: "default",
          label: "Unknown",
        };

        return (
          <Chip
            size="small"
            label={statusConfig.label || statusKey}
            color={statusConfig.color}
          />
        );
      },
    },
    {
      field: "waiter_name",
      headerName: "Assigned Waiter",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          {params.value ? (
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: "bold", mt: 1.5 }}
            >
              {params.value}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.disabled" noWrap>
              Unassigned
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "description",
      headerName: "Notes",
      flex: 2,
      maxWidth: 700,
      renderCell: (params) => (params.value ? params.value : "—"),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      maxWidth: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const open = Boolean(anchorEl);

        const handleOpenMenu = (event) => {
          setAnchorEl(event.currentTarget);
        };

        const handleCloseMenu = () => {
          setAnchorEl(null);
        };

        return (
          <>
            <IconButton size="small" onClick={handleOpenMenu}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  handleOpenDialog(params.row);
                }}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  handleDeleteTable(params.row);
                }}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </>
        );
      },
    },
  ];

  const [formData, setFormData] = useState({
    number: "",
    capacity: 2,
    location: "",
    notes: "",
  });

  useEffect(() => {
    getTablesOverview();
  }, [getTablesOverview]);

  const filteredTables = useMemo(() => {
    const normalize = (val) => val?.toString().toLowerCase() ?? "";

    const matchesSearch = (table) => {
      const term = searchTerm.toLowerCase();
      return (
        normalize(table.table_number).includes(term) ||
        normalize(table.location).includes(term) ||
        normalize(table.description).includes(term)
      );
    };

    const matchesStatus = (table) =>
      statusFilter === "all" || table.status === statusFilter;

    const matchesCapacity = (table) => {
      switch (capacityFilter) {
        case "1-2":
          return table.capacity <= 2;
        case "3-4":
          return table.capacity >= 3 && table.capacity <= 4;
        case "5-6":
          return table.capacity >= 5 && table.capacity <= 6;
        case "7+":
          return table.capacity >= 7;
        default:
          return true;
      }
    };

    return tables.filter(
      (table) =>
        matchesSearch(table) && matchesStatus(table) && matchesCapacity(table)
    );
  }, [tables, searchTerm, statusFilter, capacityFilter]);

  const tableStats = useMemo(() => {
    const counts = { available: 0, occupied: 0, reserved: 0, unavailable: 0 };

    for (const t of tables) {
      const bucket = t?.base_status;

      if (counts[bucket] !== undefined) {
        counts[bucket] += 1;
      } else {
        counts.available += 1; // fallback if somehow invalid
      }
    }

    return {
      total: tables.length,
      ...counts,
    };
  }, [tables]);

  const handleOpenDialog = (table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        number: table.number,
        capacity: table.capacity,
        location: table.location || "",
        notes: table.notes || "",
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
      // setTables((prev) =>
      //   prev.map((table) =>
      //     table.id === editingTable.id ? { ...table, ...formData } : table
      //   )
      // );
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

      // setTables((prev) => [...prev, newTable]);
      setSnackbar({
        open: true,
        message: "Table added successfully",
        severity: "success",
      });
    }

    handleCloseDialog();
  };

  const handleDeleteTable = (table) => {
    // setTables((prev) => prev.filter((t) => t.id !== table.id));
    setSnackbar({
      open: true,
      message: "Table deleted successfully",
      severity: "success",
    });
    handleCloseMenu();
  };

  const handleAddTable = async () => {
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: "➕ Add New Table",
      width: "700px",
      html: `
        <style>
          .swal2-popup .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 10px;
          }
          .swal2-popup .form-full {
            grid-column: span 2;
          }
          .swal2-popup input,
          .swal2-popup select,
          .swal2-popup textarea {
            width: 100% !important;
            padding: 10px 12px;
            font-size: 15px;
            border-radius: 10px;
            border: 1px solid #ccc;
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
            background: #fafafa;
            color: #222;
          }
          .swal2-popup input:focus,
          .swal2-popup select:focus,
          .swal2-popup textarea:focus {
            border-color: #1976d2;
            box-shadow: 0 0 4px rgba(25, 118, 210, 0.4);
            outline: none;
            background: #fff;
          }
          .swal2-popup textarea {
            resize: vertical;
            min-height: 70px;
          }
          .swal2-popup label {
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 4px;
            display: block;
            color: #444;
          }

          /* 🌙 Dark mode support */
          @media (prefers-color-scheme: dark) {
            .swal2-popup {
              background: #1e1e1e !important;
              color: #f1f1f1;
            }
            .swal2-popup input,
            .swal2-popup select,
            .swal2-popup textarea {
              background: #2a2a2a;
              border: 1px solid #444;
              color: #eee;
            }
            .swal2-popup input:focus,
            .swal2-popup select:focus,
            .swal2-popup textarea:focus {
              border-color: #64b5f6;
              box-shadow: 0 0 6px rgba(100, 181, 246, 0.5);
              background: #333;
            }
            .swal2-popup label {
              color: #bbb;
            }
          }
        </style>

        <div class="form-grid">
          <div class="field-group">
            <label for="swal-table-number">Table Number</label>
            <input id="swal-table-number" type="number" min="1" placeholder="e.g. 12" />
          </div>

          <div class="field-group">
            <label for="swal-capacity">Capacity</label>
            <input id="swal-capacity" type="number" min="1" placeholder="e.g. 4" />
          </div>

          <div class="field-group">
            <label for="swal-status">Status</label>
            <select id="swal-status">
              <option value="available" selected>Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div class="field-group">
            <label for="swal-location">Location</label>
            <input id="swal-location" type="text" placeholder="e.g. Patio, Main Hall" />
          </div>

          <div class="field-group form-full">
            <label for="swal-description">Description</label>
            <textarea id="swal-description" placeholder="Optional notes about this table"></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "💾 Save Table",
      cancelButtonText: "❌ Cancel",
      preConfirm: () => {
        const table_number = parseInt(
          document.getElementById("swal-table-number").value
        );
        const capacity = parseInt(
          document.getElementById("swal-capacity").value
        );
        const status = document.getElementById("swal-status").value;
        const location = document.getElementById("swal-location").value;
        const description = document.getElementById("swal-description").value;

        if (!table_number || !capacity) {
          Swal.showValidationMessage(
            "⚠️ Table number and capacity are required!"
          );
          return false;
        }

        return { table_number, capacity, status, location, description };
      },
    });

    if (isConfirmed && formValues) {
      try {
        console.log(formValues);

        await addTable(
          formValues.table_number,
          formValues.status,
          formValues.capacity,
          formValues.location,
          formValues.description
        );

        // set((state) => ({ tables: [...state.tables, ...data] }));
      } catch (err) {
        Swal.fire("❌ Error", "Failed to add table.", "error");
      }
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedTable(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <AdminHeader
        title="Table Management"
        description="Manage your restaurant tables, track availability, and update reservations"
      />

      {/* Summary Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              borderRadius: 3,
              // border: "1px solid #ddd",
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
              // border: "1px solid #ddd",
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
              // border: "1px solid #ddd",
            }}
          >
            <Avatar sx={{ bgcolor: "error.main", mr: 2 }}>
              <LocalDining />
            </Avatar>
            <Box>
              <Typography variant="h6">{tableStats.occupied}</Typography>
              <Typography variant="body2" color="text.secondary">
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
              // border: "1px solid #ddd",
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

      {/* Search and Filters */}
      <Grid
        container
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        {/* Toggle filters - left */}
        <Grid item xs={12} md="auto">
          <ToggleButtonGroup
            exclusive
            size="large"
            // value={tableStatus}
            // onChange={(_, value) => value && setTableStatus(value)}
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

        {/* Search - right */}
        <Grid
          item
          xs={12}
          md="auto"
          sx={{
            display: "flex",
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <TextField
            size="small"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: "100%", md: 300 }, // full width on mobile, fixed 300px on desktop
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      {/* Cards */}
      {viewMode === "card" && (
        <Grid container spacing={3}>
          {filteredTables.map((table) => {
            const statusKey = table.base_status || `available`;
            const StatusConfig =
              statusColors[statusKey] || statusColors["available"];
            const StatusIcon = StatusConfig.icon;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    // border: "1px solid #eee",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                    transition: "all 0.25s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  {/* Status Accent */}
                  <Box
                    sx={{
                      height: "6px",
                      bgcolor: StatusConfig.main,
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
                        icon={<StatusIcon />}
                        label={statusKey}
                        color={StatusConfig.color}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 1.5,
                          py: 0.5,
                        }}
                      />
                    </Box>

                    {/* Static Info */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {table.capacity} seats
                      </Typography>
                    </Box>
                    {table.location && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        📍 {table.location}
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
                    <Typography variant="body2" color="text.secondary">
                      💵 Current Bill: $
                      {table.order_total?.toFixed(2) || "0.00"}
                    </Typography>

                    {/* Assigned Waiter */}
                    <Box
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      {table.waiter_id && (
                        <Chip
                          fullWidth
                          icon={<Person fontSize="small" />}
                          label={
                            table.waiter_name ? table.waiter_name : "Unassigned"
                          }
                          variant="outlined"
                          fontWeight="light"
                          color={table.waiter_id ? "primary" : "text.disabled"}
                        />
                      )}

                      <Button
                        disabled={table.waiter_id ? true : false}
                        startIcon={<PersonAdd fontSize="small" />}
                        size="small"
                        color="primary"
                        fullWidth
                        variant="contained"
                        sx={{ borderRadius: 5 }}
                        onClick={() => handleOpenDialog(table)}
                      >
                        Assign Waiter
                      </Button>
                    </Box>
                  </CardContent>

                  {/* Admin Quick Actions */}
                  <Box
                    sx={{
                      p: 1.5,
                      // borderTop: "1px solid #f0f0f0",
                      // bgcolor: "grey.50",
                    }}
                  >
                    <Stack direction="row" spacing={1.2}>
                      <Button fullWidth startIcon={<Edit fontSize="small" />}>
                        Edit
                      </Button>
                      <Button
                        color="error"
                        fullWidth
                        startIcon={<Delete fontSize="small" />}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Data Table */}
      {viewMode === "table" && (
        <DataTable
          rows={filteredTables}
          columns={columns}
          getRowId={(row) => row.table_id}
        />
      )}

      {/* No Tables Found */}
      {filteredTables.length === 0 && viewMode === "cards" && (
        <Box sx={{ textAlign: "center", pt: 8 }}>
          <TableRestaurant
            sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tables found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click on the + button to add a new table
          </Typography>
        </Box>
      )}

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

      {/* Floating Action Button */}
      <FAB handleAdd={handleAddTable} title="Add Table" />
    </Box>
  );
}
