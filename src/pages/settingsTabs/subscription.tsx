import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import { useSubscriptionStore } from "../../lib/subscriptionStore";
import { getPlanById } from "../../config/plans";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UpgradeModal from "../../components/UpgradeModal";

const SubscriptionSettingsPanel: React.FC = () => {
  const { 
    subscriptionPlan, 
    getCurrentSubscription,
  } = useSubscriptionStore();
  
  const [openUpgrade, setOpenUpgrade] = React.useState(false);
  const currentSub = getCurrentSubscription();
  const plan = getPlanById(subscriptionPlan);



  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Subscription & Billing
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your restaurant's plan, billing cycle, and feature limits.
      </Typography>

      <Grid container spacing={3}>
        {/* Current Plan Summary */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">Current Plan</Typography>
                <Chip 
                  label={plan.name} 
                  color={plan.id === "free" ? "default" : "primary"} 
                  icon={plan.id !== "free" ? <StarIcon /> : undefined}
                />
              </Box>
              
              <Typography variant="h4" fontWeight="800" sx={{ mb: 1 }}>
                ₵{currentSub?.billing_cycle === "yearly" ? plan.yearly : plan.monthly}
                <Typography component="span" variant="body1" color="text.secondary">
                  /{currentSub?.billing_cycle || "month"}
                </Typography>
              </Typography>

              {currentSub && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Started on {new Date(currentSub.created_at).toLocaleDateString()}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                {plan.features.slice(0, 4).map((f, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={1} mb={1}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{f.text}</Typography>
                  </Box>
                ))}
              </Box>

              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => setOpenUpgrade(true)}
              >
                {plan.id === "pro" ? "Manage Subscription" : "Upgrade Plan"}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Plan Limits */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Resource Limits</Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight="medium">Employees</Typography>
                    <Typography variant="body2">{plan.limits.maxEmployees === 9999 ? "Unlimited" : plan.limits.maxEmployees}</Typography>
                  </Box>
                  <Box sx={{ height: 6, bgcolor: "grey.100", borderRadius: 3 }} />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight="medium">Tables</Typography>
                    <Typography variant="body2">{plan.limits.maxTables === 9999 ? "Unlimited" : plan.limits.maxTables}</Typography>
                  </Box>
                  <Box sx={{ height: 6, bgcolor: "grey.100", borderRadius: 3 }} />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight="medium">Menu Items</Typography>
                    <Typography variant="body2">{plan.limits.maxMenuItems === 9999 ? "Unlimited" : plan.limits.maxMenuItems}</Typography>
                  </ Box>
                  <Box sx={{ height: 6, bgcolor: "grey.100", borderRadius: 3 }} />
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Reach out to support if you need custom limits for large enterprises.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <UpgradeModal 
        open={openUpgrade} 
        onClose={() => setOpenUpgrade(false)} 
      />
    </Box>
  );
};

export default SubscriptionSettingsPanel;
