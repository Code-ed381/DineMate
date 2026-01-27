import React from "react";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
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
  } = useAuthStore();

  return (
    <Grid container spacing={3} mt={4}>
      {/* Profile Picture */}
      <FormGrid item xs={12} mb={2}>
        <FormLabel htmlFor="profile-picture">Profile Picture</FormLabel>
        <Button
          variant="outlined"
          component="label"
          sx={{
            mt: 1,
            textTransform: "none",
            borderRadius: "10px",
          }}
        >
          Upload Photo
          <input
            hidden
            accept="image/*"
            type="file"
            id="profile-picture"
            name="profilePicture"
          />
        </Button>
        <Typography
          variant="caption"
          display="block"
          sx={{ mt: 1, color: "text.secondary" }}
        >
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
    </Grid>
  );
};

export default PersonalInformationForm;
