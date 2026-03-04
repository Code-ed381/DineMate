import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  CircularProgress
} from "@mui/material";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";

const SecuritySettingsPanel: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error(error);
      toast.error(error.message || "Failed to update password.");
    } else {
      toast.success("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Security Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your password and account security options.
      </Typography>

      <Stack spacing={3}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Change Password
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
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
      </Stack>
    </Box>
  );
};

export default SecuritySettingsPanel;
