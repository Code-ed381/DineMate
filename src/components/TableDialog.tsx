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
  useTheme,
  useMediaQuery,
} from "@mui/material";

interface TableDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    table_number: string;
    capacity: number;
    location: string;
    description: string;
    status?: string;
  }) => Promise<void>;
  table?: any; // null for add, existing table for edit
}

const TableDialog: React.FC<TableDialogProps> = ({ open, onClose, onSubmit, table }) => {
  const isEdit = !!table;
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("available");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (table) {
      setTableNumber(table.table_number?.toString() || "");
      setCapacity(table.capacity?.toString() || "");
      setLocation(table.location || "");
      setDescription(table.description || "");
      setStatus(table.status || "available");
    } else {
      setTableNumber("");
      setCapacity("");
      setLocation("");
      setDescription("");
      setStatus("available");
    }
    setError("");
  }, [table, open]);

  const handleSubmit = async () => {
    if (!tableNumber || !capacity) {
      setError("Table number and capacity are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        table_number: tableNumber,
        capacity: parseInt(capacity),
        location,
        description,
        ...(isEdit ? { status } : {}),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isEdit ? `Edit Table ${table?.table_number}` : "Add New Table"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Table Number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
              error={!!error && !tableNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
              error={!!error && !capacity}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main Hall, Patio"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description / Notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
            />
          </Grid>
          {isEdit && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="unavailable">Unavailable</MenuItem>
              </TextField>
            </Grid>
          )}
        </Grid>
        {error && (
          <p style={{ color: "red", marginTop: 8, fontSize: 14 }}>{error}</p>
        )}
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
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Table"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableDialog;
