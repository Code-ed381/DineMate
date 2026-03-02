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
  Button
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AdminHeader from "../../components/admin-header";
import DataTable from "../../components/data-table";
import FAB from "../../components/fab";
import { GridColDef } from "@mui/x-data-grid";
import EmptyState from "../../components/empty-state";

import Swal from "sweetalert2";
import useRestaurantStore from "../../lib/restaurantStore";
import useEmployeesStore from "../../lib/employeesStore";
import useAppStore from "../../lib/appstore";
import useAuthStore from "../../lib/authStore";
import { useSettings } from "../../providers/settingsProvider";
import { useSettingsStore } from "../../lib/settingsStore";
import { useSubscription } from "../../providers/subscriptionProvider";

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
  const { settings } = useSettings();
  const { viewMode } = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [role, setRole] = useState<string | null>(null);
  const { subscriptionPlan } = useSubscription();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedEmpIdForUpload, setSelectedEmpIdForUpload] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
    if (storeRole) {
      setRole(storeRole);
    }
  }, [fetchEmployees, storeRole]);

  const filteredEmployees = employees.filter((emp) => {
      const matchesSearch = (emp.first_name + " " + emp.last_name + " " + emp.email + " " + (emp.phone || "")).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || emp.role === roleFilter;
      return matchesSearch && matchesRole;
  });

  const handleRowClick = (params: any) => {
    let selectedAvatar: File | null = null;
    const employee = params.row as EmployeeRow;

    if (subscriptionPlan === "free") {
        Swal.fire("Upgrade Required", "Please upgrade to a pro plan to edit employees.", "info");
        return;
    }

    Swal.fire({
      title: "Edit Employee",
      html: `
        <style>
          .swal2-container .edit-employee-container {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .swal2-container .avatar-wrapper {
            position: relative;
            width: 100px;
            height: 100px;
            margin-bottom: 15px;
          }
          .swal2-container .avatar-wrapper img {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #ddd;
          }
          .swal2-container .edit-avatar {
            position: absolute;
            bottom: 5px;
            right: 5px;
            background: #1976d2;
            color: white;
            border-radius: 50%;
            padding: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .swal2-container .edit-avatar:hover {
            background: #1565c0;
          }
          .swal2-container input, .swal2-container select {
            width: 100%;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid #ccc;
            margin-bottom: 10px;
            font-size: 14px;
          }
        </style>

        <div class="edit-employee-container">
          <div class="avatar-wrapper">
            <img id="avatar-img" src="${employee.avatar_url}" alt="${employee.name}" />
            <div class="edit-avatar" id="edit-avatar-btn">
              ✏️
            </div>
          </div>
          <input type="text" id="first_name" value="${employee.first_name}" placeholder="First Name" />
          <input type="text" id="last_name" value="${employee.last_name}" placeholder="Last Name" />
          <input type="email" disabled id="email" value="${employee.email}" placeholder="Email" />
          <input type="text" id="phone" value="${employee.phone}" placeholder="Phone" />
          <select id="role">
            <option value="admin" ${employee.role === "admin" ? "selected" : ""}>Admin</option>
            <option value="chef" ${employee.role === "chef" ? "selected" : ""}>Chef</option>
            <option value="waiter" ${employee.role === "waiter" ? "selected" : ""}>Waiter</option>
            <option value="bartender" ${employee.role === "bartender" ? "selected" : ""}>Bartender</option>
            <option value="cashier" ${employee.role === "cashier" ? "selected" : ""}>Cashier</option>
          </select>
          <select id="status">
            <option value="active" ${employee.status === "active" ? "selected" : ""}>Active</option>
            <option value="pending" ${employee.status === "pending" ? "selected" : ""}>Pending</option>
            <option value="suspended" ${employee.status === "suspended" ? "selected" : ""}>Suspended</option>
          </select>
          <input type="file" id="avatar-upload" accept="image/*" style="display:none;" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      showLoaderOnConfirm: true,
      didOpen: () => {
        const editBtn = document.getElementById("edit-avatar-btn");
        const uploadInput = document.getElementById("avatar-upload") as HTMLInputElement;
        const avatarImg = document.getElementById("avatar-img") as HTMLImageElement;

        editBtn?.addEventListener("click", () => {
          uploadInput?.click();
        });

        uploadInput?.addEventListener("change", (e: any) => {
          const file = e.target.files[0];
          if (file) {
            selectedAvatar = file;
            const reader = new FileReader();
            reader.onload = (ev: any) => {
              if (avatarImg) avatarImg.src = ev.target.result;
            };
            reader.readAsDataURL(file);
          }
        });
      },
      preConfirm: () => {
        const first_name = (document.getElementById("first_name") as HTMLInputElement).value;
        const last_name = (document.getElementById("last_name") as HTMLInputElement).value;
        const email = (document.getElementById("email") as HTMLInputElement).value;
        const phone = (document.getElementById("phone") as HTMLInputElement).value;
        const role = (document.getElementById("role") as HTMLSelectElement).value;
        const status = (document.getElementById("status") as HTMLSelectElement).value;
        const avatar = (document.getElementById("avatar-img") as HTMLImageElement).src;

        return { first_name, last_name, email, phone, role, status, avatar };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { first_name, last_name, phone, role, status } = result.value;

        const details = { first_name, last_name, phone_number: phone };
        const other_details = { role, status };

        if (selectedAvatar) {
          await handleLogoUpload(employee.user_id, selectedAvatar);
        }

        const response = await updateUserDetailsAsAdmin(employee.user_id, details);
        if (response) {
            await updateEmployeeDetailsAsAdmin(employee.user_id, other_details);
            await fetchEmployees();
        }
      }
    });
  };

  const handleLogoUpload = async (employeeId: string, file: File) => {
    if (!file) return;

    try {
      const avatarUrl = await uploadFile(file);
      if (avatarUrl) {
        const response = await updateUserAvatarAsAdmin(employeeId, avatarUrl);
        if (response) {
            await fetchEmployees();
        }
      }
    } catch (err: any) {
      console.error("Upload failed:", err.message);
    }
  };

  const handleTriggerUpload = (empUserId: string) => {
      setSelectedEmpIdForUpload(empUserId);
      fileInputRef.current?.click();
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
    { field: "phone", headerName: "Phone", maxWidth: 250, flex: 1 },
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
    {
      field: "created_at",
      headerName: "Joined Date",
      width: 150,
      valueFormatter: (params: any) => new Date(params.value).toLocaleDateString(),
    },
    {
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
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <AdminHeader
        title="Employee Management"
        description="Manage your restaurant staff, track roles, and update details"
      />

       <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <ToggleButtonGroup exclusive value={roleFilter} onChange={(_e, v) => v && setRoleFilter(v)} size="small">
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="admin">Admin</ToggleButton>
              <ToggleButton value="waiter">Waiter</ToggleButton>
              <ToggleButton value="chef">Chef</ToggleButton>
              <ToggleButton value="kitchen">Kitchen</ToggleButton>
              <ToggleButton value="cashier">Cashier</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            size="small"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ width: 300 }}
          />
      </Box>

      {viewMode === "list" && (
        <DataTable
          rows={filteredEmployees}
          columns={columns}
          getRowId={(row: any) => row.member_id}
          onRowClick={handleRowClick}
          slots={{
            noRowsOverlay: () => (
              <EmptyState
                title="No Employees Found"
                description="Try adjusting your search or filters, or add a new employee."
                height={400}
              />
            ),
          }}
          sx={{ minHeight: 400 }}
        />
      )}

      {viewMode === "grid" && (
        <Grid container spacing={3}>
          {filteredEmployees.length === 0 ? (
            <Grid item xs={12}>
               <EmptyState
                title="No Employees Found"
                description="Try adjusting your search or filters, or add a new employee."
              />
            </Grid>
          ) : (
            filteredEmployees.map((emp: any) => (
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
                    <Typography variant="caption">{new Date(emp.created_at).toLocaleDateString()}</Typography>
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

      {/* Hidden file input controlled by ref */}
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={(e: any) => {
            if (selectedEmpIdForUpload && e.target.files[0]) {
                handleLogoUpload(selectedEmpIdForUpload, e.target.files[0]);
            }
            setSelectedEmpIdForUpload(null);
        }}
        accept="image/*"
      />

       <FAB handleAdd={() => useEmployeesStore.getState().handleAddEmployee()} title="Add Employee" />
    </Box>
  );
};

export default EmployeeManagement;
