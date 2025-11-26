import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  Card,
  Divider,
  Grid,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminHeader from "../../components/admin-header";
import FAB from "../../components/fab";
import DataTable from "../../components/data-table";

import Swal from "sweetalert2";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { supabase } from "../../lib/supabase";
import useRestaurantStore from "../../lib/restaurantStore";
import useEmployeesStore from "../../lib/employeesStore";
import useAppStore from "../../lib/appstore";
import useAuthStore from "../../lib/authStore";
import { useSettings } from "../../providers/settingsProvider";
import { useSettingsStore } from "../../lib/settingsStore";
import { useSubscription } from "../../providers/subscriptionProvider";
import UpgradeModal from "../../components/UpgradeModal";

const EmployeeManagement = () => {
  const { employees, fetchEmployees, updateEmployeeDetailsAsAdmin } =
    useEmployeesStore();
  const { selectedRestaurant } = useRestaurantStore();
  const { uploadFile } = useAppStore();
  const { updateUserAvatarAsAdmin, updateUserDetailsAsAdmin } = useAuthStore();
  const { settings } = useSettings();
  const { viewMode } = useSettingsStore();
  const [role, setRole] = useState(null);
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false);
  const { subscriptionPlan } = useSubscription();

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEmployees();

    setRole(selectedRestaurant.role);
  }, [fetchEmployees]);

  useEffect(() => {
    if (subscriptionPlan === "free") {
      setOpenUpgradeModal(true);
    }
  }, [subscriptionPlan]);

  const handleRowClick = (params) => {
    let selectedAvatar;

    if (subscriptionPlan === "free") {
      setOpenUpgradeModal(true);
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
            <img id="avatar-img" src="${params.row.avatar}" alt="${
        params.row.name
      }" />
            <div class="edit-avatar" id="edit-avatar-btn">
              ✏️
            </div>
          </div>
          <input type="text" id="first_name" value="${
            params.row.first_name
          }" placeholder="First Name" />
          <input type="text" id="last_name" value="${
            params.row.last_name
          }" placeholder="Last Name" />
          <input type="email" disabled id="email" value="${
            params.row.email
          }" placeholder="Email" />
          <input type="text" id="phone" value="${
            params.row.phone
          }" placeholder="Phone" />
          <select id="role">
            <option value="admin" ${
              params.row.role === "admin" ? "selected" : ""
            }>Admin</option>
            <option value="chef" ${
              params.row.role === "chef" ? "selected" : ""
            }>Chef</option>
            <option value="waiter" ${
              params.row.role === "waiter" ? "selected" : ""
            }>Waiter</option>
            <option value="bartender" ${
              params.row.role === "bartender" ? "selected" : ""
            }>Bartender</option>
            <option value="cashier" ${
              params.row.role === "cashier" ? "selected" : ""
            }>Cashier</option>
          </select>
          <select id="status">
            <option value="active" ${
              params.row.status === "active" ? "selected" : ""
            }>Active</option>
            <option value="pending" ${
              params.row.status === "pending" ? "selected" : ""
            }>Pending</option>
            <option value="suspended" ${
              params.row.status === "suspended" ? "selected" : ""
            }>Suspended</option>
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
        const uploadInput = document.getElementById("avatar-upload");
        const avatarImg = document.getElementById("avatar-img");

        editBtn.addEventListener("click", () => {
          uploadInput.click();
        });

        uploadInput.addEventListener("change", (e) => {
          const file = e.target.files[0];

          if (file) {
            selectedAvatar = file; // <-- store in outer variable

            // Preview immediately in modal
            const reader = new FileReader();
            reader.onload = (ev) => {
              avatarImg.src = ev.target.result;
            };
            reader.readAsDataURL(file);
          }
        });
      },
      preConfirm: () => {
        const first_name = document.getElementById("first_name").value;
        const last_name = document.getElementById("last_name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const role = document.getElementById("role").value;
        const status = document.getElementById("status").value;
        const avatar = document.getElementById("avatar-img").src;

        return { first_name, last_name, email, phone, role, status, avatar };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { first_name, last_name, phone_number, role, status } =
          result.value;

        const details = {
          first_name,
          last_name,
          phone_number,
        };

        const other_details = {
          role,
          status,
        };

        if (!selectedAvatar) {
          console.log("No file selected");

          return;
        }

        await handleLogoUpload(params.row.user_id, selectedAvatar);

        const response = await updateUserDetailsAsAdmin(
          params.row.user_id,
          details
        );

        if (response) {
          const updateEmployee = await updateEmployeeDetailsAsAdmin(
            params.row.user_id,
            other_details
          );

          if (updateEmployee) {
            fetchEmployees();
            console.log("Employee updated successfully");
          }
        }
      }
    });
  };

  const handleCardEdit = (params) => {
    Swal.fire({
      title: "Edit Employee",
      html: `
    <style>
      .swal2-container .edit-employee-container {
        display: flex;
        flex-direction: column;
        align-items: center;
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
      <input type="text" id="first_name" value="${
        params.first_name
      }" placeholder="First Name" />
      <input type="text" id="last_name" value="${
        params.last_name
      }" placeholder="Last Name" />
      <input type="email" disabled id="email" value="${
        params.email
      }" placeholder="Email" />
      <input type="text" id="phone" value="${
        params.phone
      }" placeholder="Phone" />
      <select id="role">
        <option value="admin" ${
          params.role === "admin" ? "selected" : ""
        }>Admin</option>
        <option value="chef" ${
          params.role === "chef" ? "selected" : ""
        }>Chef</option>
        <option value="waiter" ${
          params.role === "waiter" ? "selected" : ""
        }>Waiter</option>
        <option value="bartender" ${
          params.role === "bartender" ? "selected" : ""
        }>Bartender</option>
        <option value="cashier" ${
          params.role === "cashier" ? "selected" : ""
        }>Cashier</option>
      </select>
      <select id="status">
        <option value="active" ${
          params.status === "active" ? "selected" : ""
        }>Active</option>
        <option value="pending" ${
          params.status === "pending" ? "selected" : ""
        }>Pending</option>
        <option value="suspended" ${
          params.status === "suspended" ? "selected" : ""
        }>Suspended</option>
      </select>
    </div>
  `,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const first_name = document.getElementById("first_name").value;
        const last_name = document.getElementById("last_name").value;
        const phone_number = document.getElementById("phone").value;
        const role = document.getElementById("role").value;
        const status = document.getElementById("status").value;

        return { first_name, last_name, phone_number, role, status };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        console.log(params);
        const { first_name, last_name, phone_number, role, status } =
          result.value;

        const details = {
          first_name,
          last_name,
          phone_number,
        };

        const other_details = {
          role,
          status,
        };

        const response = await updateUserDetailsAsAdmin(
          params.user_id,
          details
        );

        if (response) {
          const updateEmployee = await updateEmployeeDetailsAsAdmin(
            params.user_id,
            other_details
          );

          if (updateEmployee) {
            fetchEmployees();
            console.log("Employee updated successfully");
          }
        }
      }
    });
  };

  const handleLogoUpload = async (employeeId, file) => {
    if (!file) return;

    try {
      const avatarUrl = await uploadFile(file); // wait for upload

      if (avatarUrl) {
        console.log("Uploaded avatar URL:", avatarUrl);

        // You can now set it in state to update the UI
        const response = await updateUserAvatarAsAdmin(employeeId, avatarUrl);

        if (response) {
          fetchEmployees();
          console.log("Avatar updated successfully");
        }
      }
    } catch (err) {
      console.error("Upload failed:", err.message);
    }
  };

  const columns = [
    {
      field: "avatar",
      headerName: "Avatar",
      width: 70,
      renderCell: (params) => (
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
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Manager" ? "primary" : "secondary"}
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
      renderCell: (params) => (
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
      renderCell: (params) => (
        <IconButton onClick={() => console.log(params)}>
          <DeleteIcon color="error" />
        </IconButton>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  const handleAddEmployee = async (restaurantId) => {

    if (subscriptionPlan === "free") {
      setOpenUpgradeModal(true);
      return;
    }
    Swal.fire({
      title: "Invite New Employee",
      html: `
    <style>
      .invite-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: center;
        margin-top: 10px;
      }
      .invite-form input[type="text"],
      .invite-form input[type="email"] {
        width: 100%;
        padding: 10px;
        border-radius: 6px;
        border: 1px solid #ccc;
        font-size: 14px;
      }
      .role-options {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
        margin-top: 5px;
      }
      .role-options label {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border: 1px solid #ccc;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        background: #f9f9f9;
        transition: all 0.2s;
      }
      .role-options input {
        display: none;
      }
      .role-options input:checked + span {
        color: white;
        background: #1976d2;
        border-radius: 4px;
        padding: 2px 6px;
      }
      .avatar-wrapper {
        position: relative;
        width: 90px;
        height: 90px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid #ddd;
        background: #f1f1f1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .avatar-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .upload-btn {
        margin-top: 6px;
        font-size: 13px;
        color: #1976d2;
        cursor: pointer;
      }
    </style>

    <div class="invite-form">
      <div class="avatar-wrapper" id="avatar-preview">
        <span style="font-size:32px; color:#aaa;">👤</span>
      </div>
      <div class="upload-btn" id="upload-trigger">📷 Upload Avatar</div>
      <input type="file" id="avatar-upload" accept="image/*" style="display:none;" />

      <input id="swal-email" placeholder="Email" type="email" />
      <input id="swal-phone" placeholder="Phone" type="text" />
      <input id="swal-firstname" placeholder="First Name" type="text" />
      <input id="swal-lastname" placeholder="Last Name" type="text" />

      <div class="role-options">
        <label>
          <input type="radio" name="role" value="admin" />
          <span>Admin</span>
        </label>
        <label>
          <input type="radio" name="role" value="chef" />
          <span>Chef</span>
        </label>
        <label>
          <input type="radio" name="role" value="waiter" />
          <span>Waiter</span>
        </label>
        <label>
          <input type="radio" name="role" value="bartender" />
          <span>Bartender</span>
        </label>
        <label>
          <input type="radio" name="role" value="cashier" />
          <span>Cashier</span>
        </label>
      </div>
    </div>
  `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Send Invite",
      showLoaderOnConfirm: true,
      didOpen: () => {
        const uploadTrigger = document.getElementById("upload-trigger");
        const uploadInput = document.getElementById("avatar-upload");
        const avatarPreview = document.getElementById("avatar-preview");

        uploadTrigger.addEventListener("click", () => {
          uploadInput.click();
        });

        uploadInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Avatar" />`;
            };
            reader.readAsDataURL(file);
          }
        });
      },
      preConfirm: async () => {
        const email = document.getElementById("swal-email").value.trim();
        const firstName = document
          .getElementById("swal-firstname")
          .value.trim();
        const lastName = document.getElementById("swal-lastname").value.trim();
        const role = document.querySelector(
          "input[name='role']:checked"
        )?.value;
        const avatar =
          document.querySelector("#avatar-preview img")?.src || null;

        if (!email || !firstName || !lastName || !role) {
          Swal.showValidationMessage("⚠️ All fields are required.");
          return false;
        }

        try {
          // Step 1: Send Invite
          const { data, error } =
            await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
              data: { firstName, lastName, role, avatar },
              redirectTo: "http://localhost:3000/#/onboarding",
            });

          if (error) throw new Error(error.message);

          const selectedRestaurantId = selectedRestaurant.restaurants.id;
          const userId = data.user.id;

          // Step 2: Insert into restaurant_members
          const { error: memberError } = await supabase
            .from("restaurant_members")
            .insert({
              restaurant_id: selectedRestaurantId,
              user_id: userId,
              role,
            });

          if (memberError) throw new Error(memberError.message);

          return data;
        } catch (err) {
          Swal.showValidationMessage(`❌ Request failed: ${err.message}`);
          console.error("Invite error:", err);
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "✅ Invite Sent!",
        });
      }
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <AdminHeader
        title="Employee Management"
        description="Manage your restaurant employees, track availability, and update reservations"
      />

      {/* Conditional UI */}
      {viewMode === "list" && (
        <DataTable
          rows={employees}
          columns={columns}
          getRowId={(row) => row.member_id}
          onRowClick={handleRowClick}
        />
      )}

      {viewMode === "grid" && (
        <Grid container spacing={3}>
          {employees.map((emp) => (
            <Grid item xs={12} md={4} key={emp.id}>
              <Card
                sx={{
                  borderRadius: 1,
                  display: "flex",
                  height: 250, // taller card
                  overflow: "hidden",
                }}
              >
                {/* Left Side - Full Height Avatar */}
                <Box
                  sx={{
                    width: "40%",
                    bgcolor: "grey.100",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative", // needed for camera button
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  {/* Avatar image */}
                  <img
                    src={emp.avatar}
                    alt={emp.first_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover", // fill without distortion
                    }}
                  />

                  {/* Camera icon button */}
                  {settings?.employee_permissions?.admin_delete_edit_employee &&
                    role === "admin" && (
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
                        onClick={() => fileInputRef.current.click()} // open file input
                      >
                        <CameraAltIcon />
                      </IconButton>
                    )}

                  {role === "owner" && (
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
                      onClick={() => fileInputRef.current.click()} // open file input
                    >
                      <CameraAltIcon />
                    </IconButton>
                  )}

                  {/* Hidden file input */}
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={() =>
                      handleLogoUpload(
                        emp.user_id,
                        fileInputRef.current.files[0]
                      )
                    }
                    accept="image/*"
                  />
                </Box>

                {/* Right Side - Employee Details */}
                <Box
                  sx={{
                    flexGrow: 1,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    mt={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Name
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "light" }}
                    >
                      {emp.first_name} {emp.last_name}
                    </Typography>
                  </Box>
                  <Divider orientation="horizontal" />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    mt={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Email
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "light" }}
                    >
                      {emp.email}
                    </Typography>
                  </Box>
                  <Divider orientation="horizontal" />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    mt={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Phone
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "light" }}
                    >
                      {emp.phone || "N/A"}
                    </Typography>
                  </Box>
                  <Divider orientation="horizontal" />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    mt={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Role
                    </Typography>
                    <Chip
                      label={emp.role}
                      color={
                        emp.role === "admin"
                          ? "success"
                          : emp.role === "waiter"
                          ? "secondary"
                          : emp.role === "chef"
                          ? "error"
                          : emp.role === "cashier"
                          ? "warning"
                          : emp.role === "bartender"
                          ? "info"
                          : "default"
                      }
                      size="small"
                      variant="outlined"
                      sx={{
                        textTransform: "uppercase",
                        fontWeight: "light",
                        mb: 1,
                      }}
                    />
                  </Box>

                  <Divider orientation="horizontal" />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    mt={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Status
                    </Typography>
                    <Chip
                      label={emp.status.toUpperCase()}
                      color={
                        emp.status === "active"
                          ? "success"
                          : emp.status === "suspended"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                      variant="filled"
                      sx={{ mt: 1, width: "fit-content" }}
                    />
                  </Box>

                  {settings?.employee_permissions?.admin_delete_edit_employee &&
                    role === "admin" && (
                      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          fullWidth
                          onClick={() => handleCardEdit(emp)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          fullWidth
                          color="error"
                        >
                          Delete
                        </Button>
                      </Box>
                    )}

                  {role === "owner" && (
                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        fullWidth
                        onClick={() => handleCardEdit(emp)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        fullWidth
                        color="error"
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      {settings?.employee_permissions?.admin_invite_employee &&
        role === "admin" && (
          <FAB handleAdd={() => handleAddEmployee()} title="Add Employee" />
        )}

      {role === "owner" && (
        <FAB handleAdd={() => handleAddEmployee()} title="Add Employee" />
      )}


      <UpgradeModal open={openUpgradeModal} onClose={() => setOpenUpgradeModal(false)} />
    </Box>
  );
};

export default EmployeeManagement;
