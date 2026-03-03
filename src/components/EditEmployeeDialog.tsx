import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Box,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

interface EditEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  employee: any;
  onSave: (data: {
    first_name: string;
    last_name: string;
    phone: string;
    role: string;
    status: string;
    avatarFile?: File | null;
  }) => Promise<void>;
}

const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({ open, onClose, employee, onSave }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("waiter");
  const [status, setStatus] = useState("active");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (employee) {
      setFirstName(employee.first_name || "");
      setLastName(employee.last_name || "");
      setPhone(employee.phone || "");
      setRole(employee.role || "waiter");
      setStatus(employee.status || "active");
      setAvatarPreview(employee.avatar_url || "");
      setAvatarFile(null);
    }
  }, [employee, open]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        status,
        avatarFile,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ fontWeight: 800 }}>Edit Employee</DialogTitle>
      <DialogContent>
        {/* Avatar */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: 1 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={avatarPreview}
              alt={firstName}
              sx={{ width: 100, height: 100, border: "2px solid", borderColor: "primary.main" }}
            />
            <IconButton
              component="label"
              size="small"
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <CameraAltIcon fontSize="small" />
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={employee?.email || ""}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="chef">Chef</MenuItem>
              <MenuItem value="waiter">Waiter</MenuItem>
              <MenuItem value="bartender">Bartender</MenuItem>
              <MenuItem value="cashier">Cashier</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} /> : null}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmployeeDialog;
