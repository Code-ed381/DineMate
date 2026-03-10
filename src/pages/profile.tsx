import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
  Chip,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import useProfileStore from "../lib/profileStore";
import useAuthStore from "../lib/authStore";
import useAppStore from "../lib/appstore";
import Swal from "sweetalert2";
import { isValidGhanaianPhone, GHANA_PHONE_ERROR_MESSAGE } from "../utils/phoneValidation";
import { useSettings } from "../providers/settingsProvider";

const Profile: React.FC = () => {
  const { profile, getProfile, updateProfile, loading } = useProfileStore();
  const { settings } = useSettings();
  const canUpdateProfile = (settings as any)?.employee_permissions?.employees_update_profile !== false;
  const { refreshSession } = useAuthStore();
  const { uploadFile } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  // Password change state
  const { changePassword } = useAuthStore();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Swal.fire("Error", "All password fields are required.", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Swal.fire("Error", "New passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire("Error", "New password must be at least 6 characters.", "error");
      return;
    }

    setIsChangingPassword(true);
    const success = await changePassword(oldPassword, newPassword);
    setIsChangingPassword(false);

    if (success) {
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    if (profile) {
      setEditedProfile(profile);
    }
  }, [profile]);

  const handleEditToggle = async () => {
    if (isEditing) {
      if (!editedProfile.first_name || !editedProfile.last_name) {
          Swal.fire("Error", "First and last name are required", "error");
          return;
      }
      if (editedProfile.phone && !isValidGhanaianPhone(editedProfile.phone)) {
          Swal.fire("Invalid Phone", GHANA_PHONE_ERROR_MESSAGE, "error");
          return;
      }
      
      try {
        await updateProfile(editedProfile);
        await refreshSession();
        Swal.fire("Success", "Profile updated successfully", "success");
        setIsEditing(false);
      } catch (error) {
        Swal.fire("Error", "Failed to update profile", "error");
      }
    } else {
      setIsEditing(true);
    }
  };

  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const url = await uploadFile(file, "avatars");
      const updated = { ...editedProfile, avatar_url: url };
      setEditedProfile(updated);
      await updateProfile(updated);
      await refreshSession();
      Swal.fire({ title: "Avatar Updated", icon: "success", timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error("Avatar upload failed", err);
      Swal.fire("Error", "Failed to upload avatar", "error");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  if (!editedProfile) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Profile not found. Please ensure you are logged in correctly.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }} 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your personal information and account settings
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: "center", p: 3 }}>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={editedProfile.avatar_url || editedProfile.avatar}
                sx={{ width: 150, height: 150, mx: "auto", mb: 2, opacity: avatarUploading ? 0.4 : 1 }}
              />
              {avatarUploading && (
                <CircularProgress
                  size={40}
                  sx={{ position: "absolute", top: "35%", left: "35%" }}
                />
              )}
              <IconButton
                component="label"
                sx={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <CameraAltIcon fontSize="small" />
                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
              </IconButton>
            </Box>
            <Typography variant="h5" fontWeight="bold">
              {editedProfile.first_name} {editedProfile.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {editedProfile.role}
            </Typography>
            <Chip
              label={editedProfile.status || "Active"}
              color="success"
              size="small"
              sx={{ mt: 1 }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Personal Details
                </Typography>
                <Button
                  startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                  onClick={handleEditToggle}
                  disabled={!isEditing && !canUpdateProfile}
                >
                  {isEditing ? "Save" : "Edit"}
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={editedProfile.first_name || ""}
                    disabled={!isEditing}
                    onChange={(e) => setEditedProfile({...editedProfile, first_name: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={editedProfile.last_name || ""}
                    disabled={!isEditing}
                    onChange={(e) => setEditedProfile({...editedProfile, last_name: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={editedProfile.email || ""}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={editedProfile.phone || ""}
                    disabled={!isEditing}
                    onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Change Password
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? "Updating Password..." : "Update Password"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
