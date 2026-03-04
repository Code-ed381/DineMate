import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Avatar,
  IconButton,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Swal from "sweetalert2";
import useEmployeesStore from "../lib/employeesStore";
import { useSettings } from "../providers/settingsProvider";
import useAppStore from "../lib/appstore";
import { isValidGhanaianPhone, GHANA_PHONE_ERROR_MESSAGE } from "../utils/phoneValidation";

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({ open, onClose, onSuccess }) => {
  const { addEmployee } = useEmployeesStore();
  const { settings } = useSettings();
  const ed = (settings as any)?.employee_defaults || {};
  const requireAvatar = ed.require_avatar_on_invite !== false;
  const requirePhone = !!ed.require_phone_on_invite;
  const { uploadFile } = useAppStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState((settings as any)?.employee_defaults?.default_role || "waiter");
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRole("waiter");
    setAvatarFile(null);
    setAvatarPreview(null);
    setLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !role) {
      Swal.fire("Error", "Please fill in all required fields", "error");
      return;
    }

    if (requireAvatar && !avatarFile) {
      Swal.fire("Error", "Please upload an avatar image", "error");
      return;
    }

    if (requirePhone && !phone) {
      Swal.fire("Error", "Phone number is required.", "error");
      return;
    }
    if (phone && !isValidGhanaianPhone(phone)) {
      Swal.fire("Invalid Phone", GHANA_PHONE_ERROR_MESSAGE, "error");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Avatar (only if provided)
      let avatarUrl = "";
      if (avatarFile) {
        avatarUrl = await uploadFile(avatarFile, "avatars");
      }

      // 2. Submit to store (sends invite email)
      await addEmployee({
        firstName,
        lastName,
        email,
        phone,
        role,
        avatarUrl
      });

      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error(error);
      Swal.fire("Error", error.message || "Failed to invite employee", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle>Invite New Employee</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Box position="relative">
            <Avatar
              src={avatarPreview || "/default-user.png"}
              sx={{ width: 100, height: 100, mb: 1, border: "2px solid #ddd" }}
            />
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                bottom: 5,
                right: -5,
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": { backgroundColor: "primary.dark" }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="caption" color="textSecondary">
            *Required
          </Typography>
          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
          />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 2 }}>
          <TextField
            label="First Name"
            required
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            required
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Phone"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            select
            label="Role"
            required
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}
            sx={{ gridColumn: "1 / -1" }}
          >
            <MenuItem value="waiter">Waiter</MenuItem>
            <MenuItem value="chef">Chef</MenuItem>
            <MenuItem value="bartender">Bartender</MenuItem>
            <MenuItem value="kitchen">Kitchen</MenuItem>
            <MenuItem value="cashier">Cashier</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !firstName || !lastName || !email || !role || (requireAvatar && !avatarFile)}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? "Sending Invite..." : "Invite Employee"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEmployeeDialog;
