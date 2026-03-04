import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Close as CloseIcon, ReportProblem as ComplaintIcon } from "@mui/icons-material";
import { notificationService } from "../services/notificationService";
import useAuthStore from "../lib/authStore";
import useRestaurantStore from "../lib/restaurantStore";
import Swal from "sweetalert2";

interface ComplaintDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ComplaintDialog: React.FC<ComplaintDialogProps> = ({ open, onClose }) => {
  const { user } = useAuthStore();
  const { selectedRestaurant } = useRestaurantStore();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant || !user) return;
    setSending(true);

    try {
      const result = await notificationService.sendComplaint(
        selectedRestaurant.id,
        user.id,
        formData
      );

      if (result?.success) {
        Swal.fire({
          title: "Complaint Submitted",
          text: "Your feedback has been sent to management.",
          icon: "success",
          timer: 2500,
          showConfirmButton: false,
        });
        setFormData({ title: "", message: "", priority: "normal" });
        onClose();
      } else {
        throw new Error("Failed to send complaint");
      }
    } catch (error) {
      console.error("Error sending complaint:", error);
      Swal.fire("Error", "Failed to submit complaint. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={!sending ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <ComplaintIcon color="error" />
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          Submit Complaint
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={sending}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Use this form to submitted system issues, complaints, or important feedback directly to restaurant management.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Subject"
              type="text"
              fullWidth
              variant="outlined"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={sending}
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                label="Priority"
                disabled={sending}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <TextField
              margin="dense"
              label="Complaint Details"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              disabled={sending}
              placeholder="Describe the issue in detail..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={sending} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={sending || !formData.title || !formData.message}
            startIcon={sending && <CircularProgress size={20} />}
          >
            {sending ? "Submitting..." : "Submit Complaint"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
