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
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

interface MenuItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any, imageFile?: File) => Promise<void>;
  categories: { id: string; name: string }[];
  item?: any; // null for add, existing item for edit
}

const MenuItemDialog: React.FC<MenuItemDialogProps> = ({ open, onClose, onSubmit, categories, item }) => {
  const isEdit = !!item;
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState("true");
  const [type, setType] = useState<"food" | "drink">("food");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (item) {
      setName(item.name || item.item_name || "");
      setPrice(item.price?.toString() || "");
      setCategoryId(item.category || item.category_id || "");
      setDescription(item.description || "");
      setAvailable(item.available ? "true" : "false");
      setTags((item.tags || []).join(", "));
      setType(item.type || "food");
      setImagePreview(item.image_url || null);
    } else {
      setName("");
      setPrice("");
      setCategoryId("");
      setDescription("");
      setAvailable("true");
      setTags("");
      setType("food");
      setImagePreview(null);
    }
    setImageFile(null);
    setError("");
  }, [item, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !categoryId) {
      setError("Name, Price, and Category are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const parsedTags = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
      await onSubmit(
        {
          name,
          price,
          category_id: categoryId,
          description,
          available,
          type,
          tags: parsedTags,
          ...(isEdit ? { image_url: item.image_url } : {}),
        },
        imageFile || undefined
      );
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
        {isEdit ? "Edit Menu Item" : "Add New Menu Item"}
      </DialogTitle>
      <DialogContent>
        {/* Image Upload */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: 1 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={imagePreview || undefined}
              variant="rounded"
              sx={{ width: 120, height: 120, bgcolor: "grey.200", fontSize: 40 }}
            >
              🍽️
            </Avatar>
            <IconButton
              component="label"
              size="small"
              sx={{
                position: "absolute",
                bottom: -4,
                right: -4,
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <CameraAltIcon fontSize="small" />
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Cheeseburger"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price"
              type="number"
              inputProps={{ step: "0.01" }}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Availability"
              value={available}
              onChange={(e) => setAvailable(e.target.value)}
            >
              <MenuItem value="true">Available</MenuItem>
              <MenuItem value="false">Unavailable</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="spicy, vegan"
              helperText="Comma separated"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Type (Kitchen/Bar Routing)"
              value={type}
              onChange={(e) => setType(e.target.value as "food" | "drink")}
            >
              <MenuItem value="food">Food (Kitchen)</MenuItem>
              <MenuItem value="drink">Drink (Bar)</MenuItem>
            </TextField>
          </Grid>
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
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Item"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuItemDialog;
