import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  TextField,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import useRestaurantStore from '../../lib/restaurantStore'

export default function RestaurantDetailsPanel({ restaurant }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    description: restaurant?.description || "",
    phone: restaurant?.phone || "",
    email: restaurant?.email || "",
    website: restaurant?.website || "",
    logo: restaurant?.logo || "",
    address_line_1: restaurant?.address_line_1 || "",
    address_line_2: restaurant?.address_line_2 || "",
    city: restaurant?.city || "",
    state: restaurant?.state || "",
    zip_code: restaurant?.zip_code || "",
    country: restaurant?.country || "",
  });
  const { selectedRestaurant } = useRestaurantStore();

  const handleChange = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleSave = () => {
    // TODO: call API
    console.log("Saving details:", formData);
    setEditMode(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Just local preview — replace with upload logic
      setFormData({ ...formData, logo: URL.createObjectURL(file) });
    }
  };

  const renderField = (label, value, field, multiline = false) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      {editMode ? (
        <TextField
          value={formData[field]}
          onChange={handleChange(field)}
          fullWidth
          size="small"
          multiline={multiline}
          rows={multiline ? 3 : 1}
        />
      ) : (
        <Typography variant="subtitle1">{value || "—"}</Typography>
      )}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Logo Avatar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
          position: "relative",
        }}
      >
        <Avatar
          src={formData.logo}
          alt="Restaurant Logo"
          sx={{
            width: 140,
            height: 140,
            borderRadius: 3,
            bgcolor: "grey.200",
            fontSize: 40,
          }}
        >
          {formData.name?.[0] || "R"}
        </Avatar>
        <IconButton
          component="label"
          sx={{
            position: "absolute",
            bottom: 10,
            right: "calc(50% - 70px)", // centers relative to avatar
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": { bgcolor: "grey.100" },
          }}
          size="small"
        >
          <CameraAltIcon fontSize="small" />
          <input type="file" hidden onChange={handleLogoUpload} />
        </IconButton>
      </Box>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Restaurant Details
        </Typography>
        {!editMode ? (selectedRestaurant?.role === "owner" && 
          <IconButton onClick={() => setEditMode(true)} color="primary">
            <EditIcon />
          </IconButton>
        ) : (
          <Box>
            <IconButton onClick={handleSave} color="success">
              <SaveIcon />
            </IconButton>
            <IconButton onClick={() => setEditMode(false)} color="error">
              <CancelIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Section: Basic Info */}
      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
        Basic Information
      </Typography>
      <Grid container spacing={2} mb={3}>
        {renderField("Restaurant Name", formData.name, "name")}
        {renderField("Phone", formData.phone, "phone")}
        {renderField("Email", formData.email, "email")}
        {renderField("Website", formData.website, "website")}
        {renderField("Description", formData.description, "description", true)}
      </Grid>
      <Divider sx={{ mb: 3 }} />

      {/* Section: Address */}
      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
        Address
      </Typography>
      <Grid container spacing={2}>
        {renderField(
          "Address Line 1",
          formData.address_line_1,
          "address_line_1"
        )}
        {renderField(
          "Address Line 2",
          formData.address_line_2,
          "address_line_2"
        )}
        {renderField("City", formData.city, "city")}
        {renderField("State", formData.state, "state")}
        {renderField("Zip Code", formData.zip_code, "zip_code")}
        {renderField("Country", formData.country, "country")}
      </Grid>

      {/* Save / Cancel buttons */}
      {editMode && (
        <Box
          sx={{
            mt: 4,
            display: "flex",
            gap: 2,
            justifyContent: { xs: "center", sm: "flex-end" },
          }}
        >
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="outlined" onClick={() => setEditMode(false)}>
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  );
}
