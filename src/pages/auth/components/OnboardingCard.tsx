import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import { SitemarkIcon } from './CustomIcons';
import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../../lib/authStore';
import useAppStore from '../../../lib/appstore';
import Swal from 'sweetalert2';
import { isValidGhanaianPhone, GHANA_PHONE_ERROR_MESSAGE, toE164 } from '../../../utils/phoneValidation';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '500px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const OnboardingCard: React.FC = () => {
  const {
    validateConfirmPassword,
    setLoading,
    setAuth,
    password,
    passwordError,
    passwordErrorMessage,
    confirmPassword,
    confirmPasswordError,
    confirmPasswordErrorMessage,
    setConfirmPassword,
    setPassword,
    setProcessing,
    processing,
  } = useAuthStore();
  const { uploadFile } = useAppStore();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idType, setIdType] = useState("Ghana Card");
  const [idNumber, setIdNumber] = useState("");
  const [idImageFile, setIdImageFile] = useState<File | null>(null);
  const [idImagePreview, setIdImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hash = window.location.hash; // HashRouter uses # as routing, so we need to be careful.
    // Hash format can be #/onboarding#access_token=...
    const hashParts = hash.split("#");
    // Part 1 is the route, Part 2 is the access token params if it exists
    const tokenParams = hashParts[2];
    
    const params = new URLSearchParams(tokenParams || "");
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth
        .setSession({
          access_token,
          refresh_token,
        })
        .then(async ({ data, error }) => {
          if (error) {
            console.error("Error setting session:", error);
            Swal.fire("Error", "Invalid or expired invite link.", "error");
            navigate("/sign-in");
          } else if (data.user && data.session) {
            setAuth({ user: data.user, session: data.session });
            const meta = data.user.user_metadata || {};
            setFirstName(meta.firstName || "");
            setLastName(meta.lastName || "");
            setPhone(meta.phone || "");
            setEmail(data.user.email || "");
            setAvatarPreview(meta.profileAvatar || null);
          }
          setLoading(false);
        });
    } else {
        // Check if there's already a session if it's not a hash redirect
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                const user = session.user;
                setAuth({ user, session });
                const meta = user.user_metadata || {};
                setFirstName(meta.firstName || meta.first_name || "");
                setLastName(meta.lastName || meta.last_name || "");
                setPhone(meta.phone || meta.phone_number || "");
                setEmail(user.email || "");
                setAvatarPreview(meta.profileAvatar || meta.avatar_url || meta.avatar || null);
                setLoading(false);
            } else {
                navigate("/sign-in");
            }
        });
    }
  }, [navigate, setAuth, setLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdImageFile(file);
      setIdImagePreview(URL.createObjectURL(file));
    }
  };

  const getIdPlaceholder = () => {
    if (idType === "Ghana Card") return "GHA-123456789-0";
    if (idType === "Passport") return "G1234567";
    return "License Number";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProcessing(true);

      if (!validateConfirmPassword(password, confirmPassword)) return;
      if (!firstName || !lastName || !idNumber || !idImageFile) {
          Swal.fire("Error", "All fields including ID details are required.", "error");
          return;
      }
      if (phone && !isValidGhanaianPhone(phone)) {
          Swal.fire("Invalid Phone", GHANA_PHONE_ERROR_MESSAGE, "error");
          return;
      }

      let finalAvatarUrl = avatarPreview;
      if (avatarFile) {
          finalAvatarUrl = await uploadFile(avatarFile, "avatars");
      }

      let finalIdUrl = "";
      if (idImageFile) {
        finalIdUrl = await uploadFile(idImageFile, "documents");
      }

      // Update auth user
      const normalizedPhone = phone ? toE164(phone) : '';
      const { data: authResult, error: authError } = await supabase.auth.updateUser({ 
          password,
          data: {
              firstName,
              lastName,
              phone: normalizedPhone,
              profileAvatar: finalAvatarUrl,
              id_type: idType,
              id_number: idNumber,
              id_document_url: finalIdUrl
          }
      });

      if (authError) {
        console.error(authError);
        Swal.fire("Error", authError.message, "error");
        return;
      }

      // Update restaurant_members table and set status to active
      const { error: memberError } = await supabase
        .from('restaurant_members')
        .update({
            first_name: firstName,
            last_name: lastName,
            phone: normalizedPhone,
            status: 'active'
        })
        .eq('user_id', authResult.user.id);

      if (memberError) {
          console.error("Member update failed:", memberError);
          // Not critical enough to stop the redirect, but should log
      }

      Swal.fire({
          title: "Account Ready!",
          text: "Your password has been set and your profile updated.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
      }).then(() => {
          navigate("/app/dashboard", { replace: true });
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "An unexpected error occurred. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card variant="outlined">
      <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 1 }}>
        <SitemarkIcon />
      </Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: '100%', fontSize: 'clamp(1.5rem, 8vw, 2rem)', fontWeight: 'bold' }}
      >
        Complete Your Setup
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Review your details and set your password to activate your account.
      </Typography>
      
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
          <Box position="relative">
            <Avatar
              src={avatarPreview || "/default-user.png"}
              sx={{ width: 100, height: 100, border: "2px solid #ddd" }}
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
          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl>
                <FormLabel htmlFor="firstName">First Name</FormLabel>
                <TextField
                    id="firstName"
                    required
                    fullWidth
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    variant="outlined"
                    size="small"
                />
            </FormControl>
            <FormControl>
                <FormLabel htmlFor="lastName">Last Name</FormLabel>
                <TextField
                    id="lastName"
                    required
                    fullWidth
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    variant="outlined"
                    size="small"
                />
            </FormControl>
        </Box>

        <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
                id="email"
                disabled
                fullWidth
                value={email}
                variant="outlined"
                size="small"
            />
        </FormControl>

        <FormControl>
            <FormLabel htmlFor="phone">Phone</FormLabel>
            <TextField
                id="phone"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                variant="outlined"
                size="small"
                placeholder="+233..."
            />
        </FormControl>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <FormControl size="small">
            <FormLabel>ID Type</FormLabel>
            <Select
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              variant="outlined"
            >
              <MenuItem value="Ghana Card">Ghana Card</MenuItem>
              <MenuItem value="Passport">Passport</MenuItem>
              <MenuItem value="Driver's License">Driver's License</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <FormLabel>ID Number</FormLabel>
            <TextField
              required
              fullWidth
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              variant="outlined"
              size="small"
              placeholder={getIdPlaceholder()}
            />
          </FormControl>
        </Box>

        <FormControl>
          <FormLabel>Upload ID Photo (Front)</FormLabel>
          <Box 
            sx={{ 
              mt: 1, 
              p: 2, 
              border: '2px dashed #ddd', 
              borderRadius: 2, 
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: idImagePreview ? 'alpha(primary.main, 0.05)' : 'transparent',
              '&:hover': { border: '2px dashed #1976d2' }
            }}
            onClick={() => idFileInputRef.current?.click()}
          >
            {idImagePreview ? (
              <img src={idImagePreview} alt="ID Preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px' }} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Click to upload ID photo
              </Typography>
            )}
            <input
              type="file"
              hidden
              ref={idFileInputRef}
              accept="image/*"
              onChange={handleIdFileChange}
            />
          </Box>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="password">New Password</FormLabel>
          <TextField
            id="password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            size="small"
            color={passwordError ? 'error' : 'primary'}
          />
          {passwordError && (
            <FormHelperText error>
              {passwordErrorMessage}
            </FormHelperText>
          )}
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
          <TextField
            name="confirmPassword"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            required
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            size="small"
            color={confirmPasswordError ? 'error' : 'primary'}
          />
          {confirmPasswordError && (
            <FormHelperText error>
              {confirmPasswordErrorMessage}
            </FormHelperText>
          )}
        </FormControl>
        <Button 
          type="submit" 
          fullWidth 
          variant="contained" 
          disabled={processing}
          startIcon={processing ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {processing ? "Activating Account..." : "Complete Setup"}
        </Button>
      </Box>
    </Card>
  );
};

export default OnboardingCard;
