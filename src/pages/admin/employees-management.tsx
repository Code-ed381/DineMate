import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Avatar,
  Chip,
  IconButton,
  Grid,
  Card,
  Divider,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  CardMedia,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
  Pagination,
  Menu,
  MenuItem,
  ListItemIcon
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { Download, FileDownload, Print } from "@mui/icons-material";
import AdminHeader from "../../components/admin-header";
import DataTable from "../../components/data-table";
import FAB from "../../components/fab";
import { GridColDef } from "@mui/x-data-grid";
import EmptyState from "../../components/empty-state";
import AddEmployeeDialog from "../../components/AddEmployeeDialog";
import EditEmployeeDialog from "../../components/EditEmployeeDialog";

import Swal from "sweetalert2";
import useRestaurantStore from "../../lib/restaurantStore";
import useEmployeesStore from "../../lib/employeesStore";
import useAppStore from "../../lib/appstore";
import useAuthStore from "../../lib/authStore";
import { useSettings } from "../../providers/settingsProvider";
import { useSettingsStore } from "../../lib/settingsStore";
import { useFeatureGate } from "../../hooks/useFeatureGate";
import UpgradeModal from "../../components/UpgradeModal";
import { useSubscriptionStore } from "../../lib/subscriptionStore";
import { useSubscription } from "../../providers/subscriptionProvider";
import { exportToCSV, exportToPDF } from "../../utils/exportUtils";
import dayjs from "dayjs";

interface EmployeeRow {
  member_id: string;
  user_id: string;
  avatar_url: string;
  created_at: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

const EmployeeManagement: React.FC = () => {
  const { employees, fetchEmployees, updateEmployeeDetailsAsAdmin } =
    useEmployeesStore();
  const { role: storeRole } = useRestaurantStore();
  const { uploadFile } = useAppStore();
  const { updateUserAvatarAsAdmin, updateUserDetailsAsAdmin } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [page, setPage] = useState(1);
  const { settings: _settingsForCards } = useSettings();
  const _ed = (_settingsForCards as any)?.employee_defaults || {};
  const cardsPerPage = Number(_ed.cards_per_page) || 8;
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { canUseFeature, isLimitReached, plan } = useFeatureGate();
  const { settings } = useSettings();
  const ep = (settings as any)?.employee_permissions || {};
  const ed = (settings as any)?.employee_defaults || {};
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const handleExportClick = (e: React.MouseEvent<HTMLButtonElement>) => setExportAnchorEl(e.currentTarget);
  const handleExportClose = () => setExportAnchorEl(null);

  const handleExportCSV = () => {
    if (!canUseFeature("canUseCsvExport")) {
      handleExportClose();
      Swal.fire("Upgrade Required", "Please upgrade your plan to export data to CSV.", "info");
      return;
    }
    const dataToExport = filteredEmployees.map(emp => ({
        Name: `${emp.first_name} ${emp.last_name}`,
        Email: emp.email,
        Phone: emp.phone || 'N/A',
        Role: emp.role,
        Status: emp.status,
        Joined: dayjs(emp.created_at).format('YYYY-MM-DD')
    }));
    exportToCSV(dataToExport, "restaurant_employees");
    handleExportClose();
  };

  const handleExportPDF = () => {
    exportToPDF();
    handleExportClose();
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter((emp) => {
      const matchesSearch = (emp.first_name + " " + emp.last_name + " " + emp.email + " " + (emp.phone || "")).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || emp.role === roleFilter;
      return matchesSearch && matchesRole;
  });

  const pageCount = Math.ceil(filteredEmployees.length / cardsPerPage);
  const paginatedEmployees = filteredEmployees.slice((page - 1) * cardsPerPage, page * cardsPerPage);

  const handleRowClick = (params: any) => {
    const employee = params.row as EmployeeRow;

    if (ep.admin_delete_edit_employee === false && storeRole !== 'owner') return;

    if (!canUseFeature("Edit Employees")) {
        Swal.fire("Upgrade Required", "Please upgrade to a pro plan to edit employees.", "info");
        return;
    }

    setEditingEmployee(employee);
    setEditDialogOpen(true);
  };

  const handleEditSave = async (data: {
    first_name: string;
    last_name: string;
    phone: string;
    role: string;
    status: string;
    avatarFile?: File | null;
  }) => {
    if (!editingEmployee) return;

    const { first_name, last_name, phone, role, status, avatarFile } = data;

    if (avatarFile) {
      try {
        const avatarUrl = await uploadFile(avatarFile, "avatars");
        if (avatarUrl) {
          await updateUserAvatarAsAdmin(editingEmployee.user_id, avatarUrl);
        }
      } catch (err: any) {
        console.error("Upload failed:", err.message);
      }
    }

    const details = { first_name, last_name, phone_number: phone };
    const other_details = { role, status };

    const response = await updateUserDetailsAsAdmin(editingEmployee.user_id, details);
    if (response) {
      await updateEmployeeDetailsAsAdmin(editingEmployee.user_id, other_details);
      await fetchEmployees();
    }
  };


  const handleDelete = async (employee: any) => {
       const { handleDelete } = useEmployeesStore.getState();
       
       // Handle mismatch between data view and store expected type
       // Store expects just 'id' which maps to 'member_id' in some contexts or user_id
       // We should pass the object ensuring 'member_id' or 'id' is present
       await handleDelete(employee);
  };

  const columns: GridColDef[] = [
    {
      field: "avatar_url",
      headerName: "Avatar",
      width: 70,
      renderCell: (params: any) => (
        <Avatar src={params.value} alt={params.row.name} />
      ),
      sortable: false,
      filterable: false,
    },
    { field: "first_name", headerName: "First Name", maxWidth: 250, flex: 1 },
    { field: "last_name", headerName: "Last Name", maxWidth: 250, flex: 1 },
    { field: "email", headerName: "Email", maxWidth: 350, flex: 1 },
    ...(ed.show_phone_column !== false ? [{ field: "phone", headerName: "Phone", maxWidth: 250, flex: 1 }] : []),
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      maxWidth: 150,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={params.value === "admin" ? "primary" : "secondary"}
          size="small"
          variant="outlined"
          sx={{ textTransform: "uppercase" }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      maxWidth: 150,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={
            params.value === "active"
              ? "success"
              : params.value === "pending"
              ? "warning"
              : params.value === "suspended"
              ? "error"
              : "default"
          }
          size="small"
          sx={{ textTransform: "uppercase" }}
        />
      ),
    },
    ...(ed.show_joined_date !== false ? [{
      field: "created_at",
      headerName: "Joined Date",
      width: 150,
      renderCell: (params: any) => {
        if (!params.value) return "N/A";
        const date = dayjs(params.value);
        return date.isValid() ? date.format("ddd DD MMM YYYY").toLowerCase() : "N/A";
      },
    }] : []),
    ...(ep.admin_delete_edit_employee !== false ? [{
      field: "delete",
      headerName: "Delete",
      width: 70,
      renderCell: (params: any) => (
        <IconButton onClick={() => handleDelete(params.row)}>
          <DeleteIcon color="error" />
        </IconButton>
      ),
      sortable: false,
      filterable: false,
    }] : []),
  ];

  return (
    <Box sx={{ p: 2 }}>
      <AdminHeader
        title="Employee Management"
        description="Manage your restaurant staff, track roles, and update details"
      >
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
                <MenuItem onClick={handleExportPDF}>
                    <ListItemIcon><Print fontSize="small" /></ListItemIcon>
                    Print PDF (Browser)
                </MenuItem>
            </Menu>
        </Box>
      </AdminHeader>

       <Box sx={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", 
          gap: 2,
          mb: 2 
        }}>
          {ed.show_employee_search !== false && (
          <TextField
            size="small"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ width: isMobile ? "100%" : 300, order: isMobile ? 0 : 1 }}
          />
          )}
          {ed.show_role_filter !== false && <Box sx={{ 
            overflowX: "auto", 
            order: isMobile ? 1 : 0,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { borderRadius: 2, bgcolor: 'divider' }
          }}>
            <ToggleButtonGroup exclusive value={roleFilter} onChange={(_e, v) => v && setRoleFilter(v)} size="small" sx={{ flexWrap: "nowrap" }}>
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="admin">Admin</ToggleButton>
                <ToggleButton value="waiter">Waiter</ToggleButton>
                <ToggleButton value="bartender">Bartender</ToggleButton>
                <ToggleButton value="chef">Chef</ToggleButton>
                <ToggleButton value="kitchen">Kitchen</ToggleButton>
                <ToggleButton value="cashier">Cashier</ToggleButton>
            </ToggleButtonGroup>
          </Box>}
      </Box>

      {!isMobile && (
        filteredEmployees.length === 0 ? (
          <EmptyState
            title="No Employees Found"
            description="Try adjusting your search or filters, or add a new employee."
            emoji="👥"
            height={400}
          />
        ) : (
          <DataTable
            rows={filteredEmployees}
            columns={columns}
            getRowId={(row: any) => row.member_id}
            onRowClick={handleRowClick}
            sx={{ minHeight: 400 }}
          />
        )
      )}

      {isMobile && (
        <Grid container spacing={3}>
          {filteredEmployees.length === 0 ? (
            <Grid item xs={12}>
               <EmptyState
                 title="No Employees Found"
                 description="Try adjusting your search or filters, or add a new employee."
                 emoji="👥"
                 height={300}
              />
            </Grid>
          ) : (
            paginatedEmployees.map((emp: any) => (
            <Grid item xs={12} sm={6} md={3} key={emp.member_id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={emp.avatar_url || "/default-user.png"}
                  alt={emp.first_name}
                />
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {emp.first_name} {emp.last_name}
                  </Typography>
                  <Chip 
                    label={emp.role} 
                    size="small" 
                    variant="outlined" 
                    sx={{ textTransform: "capitalize", mb: 2 }} 
                  />

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="caption" noWrap sx={{ maxWidth: "60%" }} title={emp.email}>{emp.email}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography variant="caption">{emp.phone}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">Joined</Typography>
                    <Typography variant="caption" sx={{ textTransform: "lowercase" }}>
                      {emp.created_at && dayjs(emp.created_at).isValid() 
                        ? dayjs(emp.created_at).format("ddd DD MMM YYYY")
                        : "N/A"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, alignItems: "center" }}>
                    <Typography variant="subtitle2" fontWeight="bold">Status</Typography>
                    <Chip 
                        label={emp.status} 
                        size="small" 
                        color={emp.status === "active" ? "success" : "default"} 
                        sx={{ textTransform: "capitalize" }} 
                    />
                  </Box>
                </CardContent>
                <Divider />
                <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />} 
                    onClick={() => handleRowClick({ row: emp })}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />} 
                    onClick={() => handleDelete(emp)}
                  >
                    Delete
                  </Button>
                </Box>
              </Card>
            </Grid>
          )))}
        </Grid>
      )}

      {isMobile && pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <Pagination count={pageCount} page={page} onChange={(e, p) => setPage(p)} color="primary" />
        </Box>
      )}

       {(storeRole === "owner" || ep.admin_invite_employee !== false) && <FAB 
         handleAdd={() => {
           if (isLimitReached("maxEmployees", employees.length)) {
             Swal.fire({
               title: "Staff Limit Reached",
               text: `Your current plan allows up to ${plan.limits.maxEmployees} employees. Please upgrade to add more staff.`,
               icon: "warning",
               showCancelButton: true,
               confirmButtonText: "Upgrade Now",
               cancelButtonText: "Later"
             }).then((res) => {
               if (res.isConfirmed) setOpenUpgradeModal(true);
             });
             return;
           }
           setAddDialogOpen(true);
         }} 
         title="Add Employee" 
       />}
       <AddEmployeeDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} onSuccess={fetchEmployees} />
       <EditEmployeeDialog
         open={editDialogOpen}
         onClose={() => setEditDialogOpen(false)}
         employee={editingEmployee}
         onSave={handleEditSave}
       />

       <UpgradeModal 
         open={openUpgradeModal} 
         onClose={() => setOpenUpgradeModal(false)} 
       />
    </Box>
  );
};

export default EmployeeManagement;
