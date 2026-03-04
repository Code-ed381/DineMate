import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  CircularProgress,
  FormLabel,
} from '@mui/material';
import useRestaurantStore from '../../lib/restaurantStore';
import useAppStore from '../../lib/appstore';
import Swal from 'sweetalert2';
import { isValidGhanaianPhone, GHANA_PHONE_ERROR_MESSAGE } from '../../utils/phoneValidation';

interface AddRestaurantModalProps {
  open: boolean;
  onClose: () => void;
}

const AddRestaurantModal: React.FC<AddRestaurantModalProps> = ({ open, onClose }) => {
  const { createRestaurant } = useRestaurantStore();
  const { uploadFile } = useAppStore();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address_line_1: '',
    city: '',
    state: '',
    country: 'Ghana',
    phone_number: '',
    email: '',
    description: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.address_line_1 || !formData.city || !formData.phone_number || !formData.email) {
      Swal.fire('Error', 'Please fill in all required fields.', 'error');
      return;
    }

    if (!logoFile || !certFile) {
      Swal.fire('Error', 'Logo and Business Certificate are mandatory.', 'error');
      return;
    }

    if (!isValidGhanaianPhone(formData.phone_number)) {
      Swal.fire('Invalid Phone', GHANA_PHONE_ERROR_MESSAGE, 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload Logo
      const logoUrl = await uploadFile(logoFile, "avatars");

      // 2. Upload Certificate
      const certUrl = await uploadFile(certFile, "documents");

      // 3. Create Restaurant
      const resId = await createRestaurant({
        ...formData,
        logo: logoUrl,
        business_certificate_url: certUrl,
      });

      if (resId) {
        Swal.fire('Success', 'Restaurant added successfully!', 'success');
        onClose();
        // Reset form
        setFormData({
            name: '',
            address_line_1: '',
            city: '',
            state: '',
            country: 'Ghana',
            phone_number: '',
            email: '',
            description: '',
        });
        setLogoFile(null);
        setCertFile(null);
        setLogoPreview(null);
      }
    } catch (error: any) {
      console.error(error);
      Swal.fire('Error', error.message || 'Failed to add restaurant.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Register New Restaurant</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Restaurant Name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={2}
              value={formData.description}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone_number"
              required
              value={formData.phone_number}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 1"
              name="address_line_1"
              required
              value={formData.address_line_1}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              required
              value={formData.city}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State/Region"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
            />
          </Grid>

          {/* Logo Upload */}
          <Grid item xs={12} sm={6}>
            <FormLabel required sx={{ mb: 1, display: 'block' }}>Restaurant Logo</FormLabel>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ height: '56px', borderRadius: '8px' }}
            >
              {logoFile ? 'Logo Selected' : 'Upload Logo'}
              <input hidden accept="image/*" type="file" onChange={handleLogoChange} />
            </Button>
            {logoFile && (
                <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                    {logoFile.name}
                </Typography>
            )}
          </Grid>

          {/* Business Certificate PDF Upload */}
          <Grid item xs={12} sm={6}>
            <FormLabel required sx={{ mb: 1, display: 'block' }}>Business Cert (PDF)</FormLabel>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ height: '56px', borderRadius: '8px' }}
            >
              {certFile ? 'PDF Selected' : 'Upload PDF'}
              <input hidden accept="application/pdf" type="file" onChange={handleCertChange} />
            </Button>
            {certFile && (
                <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                    {certFile.name}
                </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? 'Registering...' : 'Register Restaurant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRestaurantModal;
