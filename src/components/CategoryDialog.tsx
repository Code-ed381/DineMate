import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  category?: { id: string; name: string } | null;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({ open, onClose, onSubmit, category }) => {
  const isEdit = !!category;
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name || "");
    } else {
      setName("");
    }
    setError("");
  }, [category, open]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit(name.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isEdit ? "Edit Category" : "Add Category"}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          error={!!error}
          helperText={error}
          sx={{ mt: 1 }}
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} /> : null}
        >
          {saving ? "Saving..." : isEdit ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;
