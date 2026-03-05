import React from "react";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import useAuthStore from "../../../lib/authStore";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const PersonalInformationForm: React.FC = () => {
  const {
    personalInfo,
    updatePersonalInfo,
    validationErrors,
    updateTempFile,
    tempFiles,
  } = useAuthStore();

  const avatarPreview = React.useMemo(() => {
    if (!tempFiles.avatar) return personalInfo.profileAvatar || "";
    return URL.createObjectURL(tempFiles.avatar);
  }, [tempFiles.avatar, personalInfo.profileAvatar]);

  const idPreview = React.useMemo(() => {
    if (!tempFiles.idDocument) return "";
    return URL.createObjectURL(tempFiles.idDocument);
  }, [tempFiles.idDocument]);

  React.useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
      if (idPreview && idPreview.startsWith("blob:")) URL.revokeObjectURL(idPreview);
    };
  }, [avatarPreview, idPreview]);

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateTempFile("idDocument", e.target.files[0]);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateTempFile("avatar", e.target.files[0]);
    }
  };

  const getIdPlaceholder = () => {
    if (personalInfo.idType === "Ghana Card") return "GHA-123456789-0";
    if (personalInfo.idType === "Passport") return "G1234567";
    return "License Number";
  };

  return (
    <Grid container spacing={3} mt={4}>
      {/* Profile Picture */}
      <FormGrid item xs={12} mb={2} display="flex" flexDirection="column" alignItems="center">
        <FormLabel htmlFor="profile-picture" required sx={{ mb: 2, fontWeight: 600 }}>Profile Icon</FormLabel>
        <Box
          component="label"
          htmlFor="profile-picture"
          sx={{
            position: 'relative',
            cursor: 'pointer',
            border: validationErrors.profileAvatar ? '2px solid' : 'none',
            borderColor: 'error.main',
            borderRadius: '50%',
            p: 0.5,
            '&:hover .overlay': { opacity: 1 },
          }}
        >
          <Avatar
            src={avatarPreview}
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'background.paper',
              border: '2px dashed',
              borderColor: 'divider',
              boxShadow: 2,
            }}
          >
            {!tempFiles.avatar && !personalInfo.profileAvatar && <AddPhotoAlternateIcon sx={{ fontSize: 40, color: 'text.secondary' }} />}
          </Avatar>
          <Box
            className="overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s',
            }}
          >
            <AddPhotoAlternateIcon sx={{ color: 'white' }} />
          </Box>
          <input
            hidden
            accept="image/*"
            type="file"
            id="profile-picture"
            name="profilePicture"
            onChange={handleAvatarFileChange}
          />
        </Box>
        {validationErrors.profileAvatar && (
          <Typography color="error" variant="caption" sx={{ mt: 1 }}>
            {validationErrors.profileAvatar}
          </Typography>
        )}
        <Typography variant="caption" sx={{ mt: 1, color: "text.secondary" }}>
          JPG, PNG, or GIF. Max size: 5MB.
        </Typography>
      </FormGrid>

      {/* First Name */}
      <FormGrid item xs={12} md={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="first-name" required>
          First Name
        </FormLabel>
        <OutlinedInput
          id="first-name"
          name="firstName"
          type="text"
          placeholder="John"
          autoComplete="given-name"
          required
          size="medium"
          sx={{
            "& .MuiOutlinedInput-input": { fontSize: "1rem" },
            mr: { md: 2 },
          }}
          value={personalInfo.firstName}
          onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
          error={Boolean(validationErrors.firstName)}
        />
        {validationErrors.firstName && (
          <Typography color="error" variant="caption">
            {validationErrors.firstName}
          </Typography>
        )}
      </FormGrid>

      {/* Last Name */}
      <FormGrid item xs={12} md={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="last-name" required>
          Last Name
        </FormLabel>
        <OutlinedInput
          id="last-name"
          name="lastName"
          type="text"
          placeholder="Doe"
          autoComplete="family-name"
          required
          size="medium"
          sx={{ "& .MuiOutlinedInput-input": { fontSize: "1rem" } }}
          value={personalInfo.lastName}
          onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
          error={Boolean(validationErrors.lastName)}
        />
        {validationErrors.lastName && (
          <Typography color="error" variant="caption">
            {validationErrors.lastName}
          </Typography>
        )}
      </FormGrid>

      {/* Email */}
      <FormGrid item xs={12} md={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="email" required>
          Email
        </FormLabel>
        <OutlinedInput
          id="email"
          name="email"
          type="email"
          placeholder="john.doe@example.com"
          autoComplete="email"
          required
          size="medium"
          sx={{
            "& .MuiOutlinedInput-input": { fontSize: "1rem" },
            mr: { md: 2 },
          }}
          value={personalInfo.email}
          onChange={(e) => updatePersonalInfo("email", e.target.value)}
          error={Boolean(validationErrors.email)}
        />
        {validationErrors.email && (
          <Typography color="error" variant="caption">
            {validationErrors.email}
          </Typography>
        )}
      </FormGrid>

      {/* Phone */}
      <FormGrid item xs={12} md={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="phone" required>Phone Number</FormLabel>
        <OutlinedInput
          id="phone"
          name="phone"
          type="text"
          placeholder="+233 54 xxx xxxx"
          autoComplete="phone"
          size="medium"
          sx={{ "& .MuiOutlinedInput-input": { fontSize: "1rem" } }}
          value={personalInfo.phone_number}
          onChange={(e) => updatePersonalInfo("phone_number", e.target.value)}
          error={Boolean(validationErrors.phone_number)}
        />
        {validationErrors.phone_number && (
          <Typography color="error" variant="caption">
            {validationErrors.phone_number}
          </Typography>
        )}
      </FormGrid>

      {/* Password */}
      <FormGrid item xs={12} md={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="password" required>
          Password
        </FormLabel>
        <OutlinedInput
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          size="medium"
          sx={{
            "& .MuiOutlinedInput-input": { fontSize: "1rem" },
            mr: { md: 2 },
          }}
          value={personalInfo.password}
          onChange={(e) => updatePersonalInfo("password", e.target.value)}
          error={Boolean(validationErrors.password)}
        />
        {validationErrors.password && (
          <Typography color="error" variant="caption">
            {validationErrors.password}
          </Typography>
        )}
      </FormGrid>

      {/* Confirm Password */}
      <FormGrid item xs={12} md={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="confirm-password" required>
          Confirm Password
        </FormLabel>
        <OutlinedInput
          id="confirm-password"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          size="medium"
          sx={{ "& .MuiOutlinedInput-input": { fontSize: "1rem" } }}
          value={personalInfo.confirmPassword}
          onChange={(e) => updatePersonalInfo("confirmPassword", e.target.value)}
          error={Boolean(validationErrors.confirmPassword)}
        />
        {validationErrors.confirmPassword && (
          <Typography color="error" variant="caption">
            {validationErrors.confirmPassword}
          </Typography>
        )}
      </FormGrid>

      {/* ID Collection */}
      <FormGrid item xs={12} md={6} sx={{ mb: 2 }}>
        <FormLabel required>ID Type</FormLabel>
        <Select
          value={personalInfo.idType || "Ghana Card"}
          onChange={(e) => updatePersonalInfo("idType", e.target.value)}
          size="medium"
          sx={{ mr: { md: 2 } }}
        >
          <MenuItem value="Ghana Card">Ghana Card</MenuItem>
          <MenuItem value="Passport">Passport</MenuItem>
          <MenuItem value="Driver's License">Driver's License</MenuItem>
        </Select>
      </FormGrid>

      <FormGrid item xs={12} md={6} sx={{ mb: 2 }}>
        <FormLabel required>ID Number</FormLabel>
        <OutlinedInput
          placeholder={getIdPlaceholder()}
          value={personalInfo.idNumber}
          onChange={(e) => updatePersonalInfo("idNumber", e.target.value)}
          error={Boolean(validationErrors.idNumber)}
          size="medium"
        />
        {validationErrors.idNumber && (
          <Typography color="error" variant="caption">
            {validationErrors.idNumber}
          </Typography>
        )}
      </FormGrid>

      <FormGrid item xs={12} minHeight={150} mb={2}>
        <FormLabel required sx={{ mb: 1 }}>Upload ID Photo (Front)</FormLabel>
        <Box
          component="label"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: validationErrors.idDocumentUrl ? 'error.main' : 'divider',
            borderRadius: 2,
            p: 3,
            cursor: 'pointer',
            bgcolor: 'background.paper',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: 'action.hover' },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {tempFiles.idDocument ? (
            <>
              <Box
                component="img"
                src={idPreview}
                alt="ID Preview"
                sx={{
                  maxHeight: 180,
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: 1,
                  mb: 1
                }}
              />
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                {tempFiles.idDocument.name}
              </Typography>
            </>
          ) : (
            <>
              <DocumentScannerIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                Click to upload ID Photo
              </Typography>
              <Typography variant="caption" color={validationErrors.idDocumentUrl ? "error.main" : "text.secondary"}>
                JPG or PNG required. Ensure details are clear.
              </Typography>
            </>
          )}
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={handleIdFileChange}
          />
        </Box>
      </FormGrid>

    </Grid>
  );
};

export default PersonalInformationForm;
