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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import useProfileStore from "../lib/profileStore";
import useAuthStore from "../lib/authStore";
import useAppStore from "../lib/appstore";

const Profile: React.FC = () => {
  const { profile, getProfile, loading } = useProfileStore();
  const { user } = useAuthStore();
  const { uploadFile } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    if (profile) {
      setEditedProfile(profile);
    }
  }, [profile]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save logic here
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setEditedProfile({ ...editedProfile, avatar_url: url });
      } catch (err) {
        console.error("Avatar upload failed", err);
      }
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
                sx={{ width: 150, height: 150, mx: "auto", mb: 2 }}
              />
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
