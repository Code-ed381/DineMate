import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Grid
} from "@mui/material";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import useRestaurantStore from "../../lib/restaurantStore";
import useAuthStore from "../../lib/authStore";

const SecuritySettingsPanel: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email;

    if (!email) {
      toast.error("User session not found. Please log in again.");
      setLoading(false);
      return;
    }

    // Verify current password via silent sign-in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword
    });

    if (signInError) {
      toast.error("Incorrect current password.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error(error);
      toast.error(error.message || "Failed to update password.");
    } else {
      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  };

  const handleDeactivate = async () => {
    const result = await Swal.fire({
      title: "Deactivate Account?",
      text: "Your account will be deactivated for 100 days. You can reactivate it by logging in before then. After 100 days, it will be permanently deleted.",
      icon: "warning",
      input: "text",
      inputPlaceholder: "Type 'DEACTIVATE' to confirm",
      showCancelButton: true,
      confirmButtonColor: "#ed6c02",
      confirmButtonText: "Deactivate My Account",
      preConfirm: (value) => {
        if (value !== "DEACTIVATE") {
          Swal.showValidationMessage("Please type 'DEACTIVATE' exactly to confirm.");
        }
        return value;
      }
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { selectedRestaurant, role } = useRestaurantStore.getState();

        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 100);

        // Update User Status
        const { error: userError } = await supabase
          .from("users")
          .update({
            status: "deactivated",
            scheduled_deletion_date: scheduledDate.toISOString()
          })
          .eq("id", user.id);

        if (userError) throw userError;

        // If Owner, Deactivate the Restaurant too
        if (role === 'owner' && selectedRestaurant) {
          const { error: resError } = await supabase
            .from("restaurants")
            .update({
              status: "deactivated",
              scheduled_deletion_date: scheduledDate.toISOString()
            })
            .eq("id", selectedRestaurant.id);
          
          if (resError) throw resError;
        }

        await Swal.fire("Deactivated", "Your account has been deactivated. Logging you out...", "success");
        await useAuthStore.getState().signOut();
        navigate("/login");
      } catch (error: any) {
        Swal.fire("Error", error.message || "Failed to deactivate account", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete Account Permanently?",
      text: "Your account will be deactivated immediately. If you do not login within 30 days, all your data will be permanently deleted.",
      icon: "error",
      input: "text",
      inputPlaceholder: "Type 'DELETE' to confirm",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      confirmButtonText: "Delete My Account",
      preConfirm: (value) => {
        if (value !== "DELETE") {
          Swal.showValidationMessage("Please type 'DELETE' exactly to confirm.");
        }
        return value;
      }
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { selectedRestaurant, role } = useRestaurantStore.getState();

        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 30);

        // Update User Status
        const { error: userError } = await supabase
          .from("users")
          .update({
            status: "pending_deletion",
            scheduled_deletion_date: scheduledDate.toISOString()
          })
          .eq("id", user.id);

        if (userError) throw userError;

        // If Owner, mark the Restaurant for deletion too
        if (role === 'owner' && selectedRestaurant) {
          const { error: resError } = await supabase
            .from("restaurants")
            .update({
              status: "pending_deletion",
              scheduled_deletion_date: scheduledDate.toISOString()
            })
            .eq("id", selectedRestaurant.id);
          
          if (resError) throw resError;
        }

        await Swal.fire("Deletion Initiated", "Your account is scheduled for deletion in 30 days. Logging you out...", "success");
        await useAuthStore.getState().signOut();
        navigate("/login");
      } catch (error: any) {
        Swal.fire("Error", error.message || "Failed to delete account", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Security Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your password and account security options.
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column: Password Change */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Change Password
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField 
                  label="Current Password" 
                  type="password" 
                  fullWidth 
                  size="small"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <TextField 
                  label="New Password" 
                  type="password" 
                  fullWidth 
                  size="small"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField 
                  label="Confirm New Password" 
                  type="password" 
                  fullWidth 
                  size="small"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleUpdatePassword}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Update Password"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Danger Zone */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ 
            borderRadius: 3, 
            height: "100%", 
            border: "1px solid #ffcdd2",
            backgroundColor: "rgba(255, 0, 0, 0.02)"
          }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" color="error" gutterBottom>
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Careful: Actions here can result in permanent account loss.
              </Typography>
              
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" fontWeight="bold">Deactivate Account</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Your account will stay deactivated for 100 days. Logging in during this period will reactivate it. After 100 days, it's gone forever.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="warning" 
                    fullWidth 
                    onClick={handleDeactivate}
                    disabled={loading}
                  >
                    Deactivate My Account
                  </Button>
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight="bold" color="error">Delete Account</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    You have a 30-day grace period to change your mind. If you don't log in within 30 days, your account and all data will be permanently deleted.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="error" 
                    fullWidth 
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    Delete My Account
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecuritySettingsPanel;
