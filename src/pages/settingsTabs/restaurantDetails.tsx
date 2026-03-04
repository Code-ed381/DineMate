import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import useRestaurantStore from '../../lib/restaurantStore';
import useAppStore from '../../lib/appstore';
import Swal from 'sweetalert2';
import { isValidGhanaianPhone, GHANA_PHONE_ERROR_MESSAGE } from '../../utils/phoneValidation';

const buildForm = (r: any) => ({
  name: r?.name || "",
  description: r?.description || "",
  phone_number: r?.phone_number || "",
  email: r?.email || "",
  website: r?.website || "",
  logo: r?.logo || "",
  address_line_1: r?.address_line_1 || "",
  address_line_2: r?.address_line_2 || "",
  city: r?.city || "",
  state: r?.state || "",
  zip_code: r?.zip_code || "",
  country: r?.country || "",
});

const RestaurantDetailsPanel: React.FC = () => {
  // Read directly from the store — not from a stale prop
  const { selectedRestaurant, updateRestaurant, role } = useRestaurantStore();
  const { uploadFile } = useAppStore();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState(buildForm(selectedRestaurant));

  // Keep formData in sync whenever selectedRestaurant updates in the store
  useEffect(() => {
    setFormData(buildForm(selectedRestaurant));
  }, [selectedRestaurant]);

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData({ ...formData, [field]: e.target.value });

  const handleSave = async () => {
    if (!selectedRestaurant?.id) return;
    if (formData.phone_number && !isValidGhanaianPhone(formData.phone_number)) {
      Swal.fire("Invalid Phone", GHANA_PHONE_ERROR_MESSAGE, "error");
      return;
    }
    setSaving(true);
    try {
      let logoUrl = formData.logo;

      // Only upload if a new file was selected
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, "avatars");
      }

      // updateRestaurant calls .select().single() and sets selectedRestaurant in store
      await updateRestaurant(selectedRestaurant.id, {
        ...formData,
        logo: logoUrl,
      });

      setLogoFile(null);
      setEditMode(false);
      Swal.fire("Success", "Restaurant details updated", "success");
    } catch (error: any) {
      console.error("Save failed:", error);
      Swal.fire("Error", error.message || "Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedRestaurant?.id) {
      if (role !== "owner") {
        Swal.fire("Error", "Only owners can change the restaurant logo", "error");
        return;
      }

      setSaving(true);
      try {
        const logoUrl = await uploadFile(file, "avatars");
        await updateRestaurant(selectedRestaurant.id, { logo: logoUrl });
        // Local state update happens via useEffect when store updates
        setLogoFile(null);
        Swal.fire("Success", "Restaurant logo updated", "success");
      } catch (error: any) {
        console.error("Logo upload failed:", error);
        Swal.fire("Error", error.message || "Failed to upload logo", "error");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCancel = () => {
    // Reset form back to what's in the store
    setFormData(buildForm(selectedRestaurant));
    setLogoFile(null);
    setEditMode(false);
  };

  const renderField = (
    label: string,
    field: string,
    multiline = false
  ) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      {editMode ? (
        <TextField
          value={(formData as any)[field]}
          onChange={handleChange(field)}
          fullWidth
          size="small"
          multiline={multiline}
          rows={multiline ? 3 : 1}
        />
      ) : (
        <Typography variant="subtitle1">
          {(formData as any)[field] || "—"}
        </Typography>
      )}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Logo upload */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3, position: "relative" }}>
        <Avatar
          src={formData.logo}
          alt="Restaurant Logo"
          sx={{ width: 140, height: 140, borderRadius: 3, bgcolor: "grey.200", fontSize: 40 }}
        >
          {formData.name?.[0] || "R"}
        </Avatar>
        {role === "owner" && (
          <IconButton
            component="label"
            sx={{
              position: "absolute",
              bottom: 10,
              right: "calc(50% - 70px)",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: "grey.100" },
            }}
            size="small"
            disabled={saving}
          >
            {saving ? <CircularProgress size={16} /> : <CameraAltIcon fontSize="small" />}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </IconButton>
        )}
      </Box>

      {/* Header row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Restaurant Details
        </Typography>
        {!editMode
          ? role === "owner" && (
              <IconButton onClick={() => setEditMode(true)} color="primary">
                <EditIcon />
              </IconButton>
            )
          : (
            <Box>
              <IconButton onClick={handleSave} color="success" disabled={saving}>
                {saving ? <CircularProgress size={20} /> : <SaveIcon />}
              </IconButton>
              <IconButton onClick={handleCancel} color="error" disabled={saving}>
                <CancelIcon />
              </IconButton>
            </Box>
          )}
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
        Basic Information
      </Typography>
      <Grid container spacing={2} mb={3}>
        {renderField("Restaurant Name", "name")}
        {renderField("Phone", "phone_number")}
        {renderField("Email", "email")}
        {renderField("Website", "website")}
        {renderField("Description", "description", true)}
      </Grid>
      <Divider sx={{ mb: 3 }} />

      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
        Address
      </Typography>
      <Grid container spacing={2}>
        {renderField("Address Line 1", "address_line_1")}
        {renderField("Address Line 2", "address_line_2")}
        {renderField("City", "city")}
        {renderField("State", "state")}
        {renderField("Zip Code", "zip_code")}
        {renderField("Country", "country")}
      </Grid>

      {editMode && (
        <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: { xs: "center", sm: "flex-end" } }}>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
          </Button>
          <Button variant="outlined" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RestaurantDetailsPanel;
