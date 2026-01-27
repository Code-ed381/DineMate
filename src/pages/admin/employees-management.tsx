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
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminHeader from "../../components/admin-header";
import DataTable from "../../components/data-table";

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
  avatar: string;
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
  const [role, setRole] = useState<string | null>(null);
  const { subscriptionPlan } = useSubscription();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEmployees();
    if (storeRole) {
      setRole(storeRole);
    }
  }, [fetchEmployees, storeRole]);

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
            <img id="avatar-img" src="${employee.avatar}" alt="${employee.name}" />
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

  const columns = [
    {
      field: "avatar",
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
      field: "delete",
      headerName: "Delete",
      width: 70,
      renderCell: (params: any) => (
        <IconButton onClick={() => console.log(params)}>
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
        description="Manage your restaurant employees, track availability, and update reservations"
      />

      {viewMode === "list" && (
        <DataTable
          rows={employees}
          columns={columns}
          getRowId={(row: any) => row.member_id}
          onRowClick={handleRowClick}
        />
      )}

      {viewMode === "grid" && (
        <Grid container spacing={3}>
          {employees.map((emp) => (
            <Grid item xs={12} md={4} key={emp.member_id}>
              <Card
                sx={{
                  borderRadius: 1,
                  display: "flex",
                  height: 250,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: "40%",
                    bgcolor: "grey.100",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={emp.avatar}
                    alt={emp.first_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {((settings as any)?.employee_permissions?.admin_delete_edit_employee && role === "admin") || role === "owner" ? (
                      <IconButton
                        color="primary"
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          bgcolor: "white",
                          boxShadow: 2,
                          "&:hover": { bgcolor: "grey.200" },
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <CameraAltIcon />
                      </IconButton>
                  ) : null}

                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={(e: any) => handleLogoUpload(emp.user_id, e.target.files[0])}
                    accept="image/*"
                  />
                </Box>

                <Box
                  sx={{
                    flexGrow: 1,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Name</Typography>
                        <Typography variant="subtitle2">{emp.first_name} {emp.last_name}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, mt: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Role</Typography>
                        <Chip label={emp.role} size="small" variant="outlined" />
                    </Box>
                    <Divider />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Status</Typography>
                        <Chip label={emp.status} size="small" color={emp.status === "active" ? "success" : "default"} />
                    </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default EmployeeManagement;
