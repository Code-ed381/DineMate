import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from "@mui/material";

import useAuthStore from "../../../lib/authStore";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const RestaurantForm: React.FC = () => {
    const {
      restaurantInfo,
      updateRestaurantInfo,
      validationErrors,
      countries,
    } = useAuthStore();
  
  return (
    <Grid container spacing={3} mt={4}>
      {/* Restaurant name */}
      <FormGrid item xs={12} sx={{ mb: 2 }}>
        <FormLabel htmlFor="name" required>
          Restaurant name
        </FormLabel>
        <OutlinedInput
          id="name"
          name="name"
          type="text"
          placeholder="eg. The Best Restaurant"
          autoComplete="restaurant name"
          required
          size="medium"
          value={restaurantInfo.name}
          onChange={(e) => updateRestaurantInfo("name", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-input": {
              fontSize: "1rem",
            },
            mr: 2,
          }}
        />
        {validationErrors.name && (
          <Typography color="error" variant="caption">
            {validationErrors.name}
          </Typography>
        )}
      </FormGrid>
      {/* Restaurant description */}
      <FormGrid item xs={12} sx={{ mb: 2 }}>
        <FormLabel htmlFor="description">Restaurant description</FormLabel>
        <OutlinedInput
          id="description"
          name="description"
          type="text"
          multiline
          rows={3}
          placeholder="Tell customers about your restaurant"
          autoComplete="description"
          required
          size="medium"
          value={restaurantInfo.description}
          onChange={(e) => updateRestaurantInfo("description", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-input": {
              fontSize: "1rem",
            },
          }}
        />
      </FormGrid>
      {/* Email */}
      <FormGrid item xs={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="email" required>
          Email
        </FormLabel>
        <OutlinedInput
          id="email"
          name="email"
          type="email"
          placeholder="eg. restaurant@example.com"
          autoComplete="restaurant email"
          required
          size="medium"
          value={restaurantInfo.email}
          onChange={(e) => updateRestaurantInfo("email", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-input": {
              fontSize: "1rem",
            },
            mr: 2,
          }}
        />
        {validationErrors.email && (
          <Typography color="error" variant="caption">
            {validationErrors.email}
          </Typography>
        )}
      </FormGrid>
      {/* Phone number */}
      <FormGrid item xs={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="phone_number" required>
          Phone number
        </FormLabel>
        <OutlinedInput
          id="phone_number"
          name="phone_number"
          type="tel"
          placeholder="eg. +2334567890"
          autoComplete="State"
          required
          size="medium"
          value={restaurantInfo.phone_number}
          onChange={(e) => updateRestaurantInfo("phone_number", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-input": {
              fontSize: "1rem",
            },
          }}
        />
        {validationErrors.phone_number && (
          <Typography color="error" variant="caption">
            {validationErrors.phone_number}
          </Typography>
        )}
      </FormGrid>
      {/* Website */}
      <FormGrid item xs={12} sx={{ mb: 2 }}>
        <FormLabel htmlFor="website">Website</FormLabel>
        <OutlinedInput  
          id="website"
          name="website"
          type="text"
          placeholder="eg. https://restaurant.com"
          autoComplete="shipping address-line1"
          required
          size="medium"
          value={restaurantInfo.website}
          onChange={(e) => updateRestaurantInfo("website", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-input": {
              fontSize: "1rem",
            },
          }}
        />
      </FormGrid>
      {/* Address line 1 */}
      <FormGrid item xs={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="address_line_1" required>
          Address line 1
        </FormLabel>
        <OutlinedInput
          id="address_line_1"
          name="address_line_1"
          type="text"
          placeholder="Street name and number"
          autoComplete="address-line1"
          required
          size="medium"
          value={restaurantInfo.address_line_1}
          onChange={(e) => updateRestaurantInfo("address_line_1", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-input": {
              fontSize: "1rem",
            },
            mr: 2,
          }}
        />
        {validationErrors.address_line_1 && (
          <Typography color="error" variant="caption">
            {validationErrors.address_line_1}
          </Typography>
        )}
      </FormGrid>
      {/* Address line 2 */}
      <FormGrid item xs={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="address_line_2">Address line 2</FormLabel>
        <OutlinedInput
          id="address_line_2"
          name="address_line_2"
          type="text"
          placeholder="Apartment, suite, unit, etc. (optional)"
          autoComplete="address-line2"
          required
          size="medium"
          value={restaurantInfo.address_line_2}
          onChange={(e) => updateRestaurantInfo("address_line_2", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-input": {
              fontSize: "1rem",
            },
          }}
        />
        {validationErrors.address_line_2 && (
          <Typography color="error" variant="caption">
            {validationErrors.address_line_2}
          </Typography>
        )}
      </FormGrid>
      {/* City */}
      <FormGrid item xs={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="city" required>
          City
        </FormLabel>
        <OutlinedInput
          id="city"
          name="city"
          type="text"
          placeholder="e.g. Tema"
          autoComplete="City"
          required
          size="medium"
          value={restaurantInfo.city}
          onChange={(e) => updateRestaurantInfo("city", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-input": {
              fontSize: "1rem",
            },
            mr: 2,
          }}
        />
        {validationErrors.city && (
          <Typography color="error" variant="caption">
            {validationErrors.city}
          </Typography>
        )}
      </FormGrid>
      {/* State */}
      <FormGrid item xs={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="state" required>
          State
        </FormLabel>
        <OutlinedInput
          id="state"
          name="state"
          type="text"
          placeholder="e.g. Greater Accra"
          autoComplete="State"
          required
          size="medium"
          value={restaurantInfo.state}
          onChange={(e) => updateRestaurantInfo("state", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-input": {
              fontSize: "1rem",
            },
          }}
        />
        {validationErrors.state && (
          <Typography color="error" variant="caption">
            {validationErrors.state}
          </Typography>
        )}
      </FormGrid>
      {/* Zip / Postal code */}
      <FormGrid item xs={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="zip" required>
          Zip / Postal code
        </FormLabel>
        <OutlinedInput
          id="zip"
          name="zip"
          type="text"
          placeholder="e.g. GZ-xxx-1289"
          autoComplete="shipping postal-code"
          required
          size="medium"
          value={restaurantInfo.zip_code}
          onChange={(e) => updateRestaurantInfo("zip_code", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-input": {
              fontSize: "1rem",
            },
            mr: 2,
          }}
        />
        {validationErrors.zip && (
          <Typography color="error" variant="caption">
            {validationErrors.zip}
          </Typography>
        )}
      </FormGrid>
      {/* Country */}
      <FormGrid item xs={6} sx={{ mb: 2 }}>
        <FormLabel htmlFor="country" required>
          Country
        </FormLabel>
        <FormControl
          fullWidth
          error={Boolean(validationErrors.country)}
          size="small"
        >
          <InputLabel id="country-label">Country</InputLabel>
          <Select
            labelId="country-label"
            id="country"
            name="country"
            value={restaurantInfo.country}
            onChange={(e) => updateRestaurantInfo("country", e.target.value as string)}
          >
            {countries.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
          {validationErrors.country && (
            <FormHelperText>{validationErrors.country}</FormHelperText>
          )}
        </FormControl>
      </FormGrid>
      {/* Use this address for payment details */}
      <FormGrid item xs={12} sx={{ mb: 2 }}>
        <FormControlLabel
          control={<Checkbox name="saveAddress" value="yes" />}
          label="Use this address for payment details"
        />
      </FormGrid>
    </Grid>
  );
};

export default RestaurantForm;
