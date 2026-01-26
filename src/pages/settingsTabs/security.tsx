import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Divider,
} from "@mui/material";

const SecuritySettingsPanel: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Security Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your password and account security options.
      </Typography>

      <Stack spacing={3}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Change Password
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField label="Current Password" type="password" fullWidth size="small" />
              <TextField label="New Password" type="password" fullWidth size="small" />
              <TextField label="Confirm New Password" type="password" fullWidth size="small" />
              <Button variant="contained" color="primary">Update Password</Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default SecuritySettingsPanel;
