import React, { useEffect, useState } from "react";
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
import Swal from "sweetalert2";
import LinearProgress from "@mui/material/LinearProgress";
import { supabase } from "../../lib/supabase";
import useRestaurantStore from "../../lib/restaurantStore";

const SubscriptionSettingsPanel: React.FC = () => {
  const { 
    subscriptionPlan, 
    getCurrentSubscription,
    downgradeToFree,
    loading,
  } = useSubscriptionStore();
  
  const { selectedRestaurant } = useRestaurantStore();
  const [openUpgrade, setOpenUpgrade] = React.useState(false);
  
  const [limitsUsage, setLimitsUsage] = useState({
    employees: 0,
    tables: 0,
    menuItems: 0,
    ordersToday: 0
  });

  const currentSub = getCurrentSubscription();
  const plan = getPlanById(subscriptionPlan);
  const isFree = plan.id === "free";

  useEffect(() => {
    const fetchUsage = async () => {
      if (!selectedRestaurant?.id) return;
      const rid = selectedRestaurant.id;

      try {
        const [empRes, tableRes, menuRes, ordersRes] = await Promise.all([
          supabase.from('restaurant_members').select('*', { count: 'exact', head: true }).eq('restaurant_id', rid),
          supabase.from('restaurant_tables').select('*', { count: 'exact', head: true }).eq('restaurant_id', rid),
          supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('restaurant_id', rid),
          supabase.from('orders').select('*', { count: 'exact', head: true })
            .eq('restaurant_id', rid)
            .gte('created_at', new Date().toISOString().split('T')[0])
        ]);

        setLimitsUsage({
          employees: empRes.count || 0,
          tables: tableRes.count || 0,
          menuItems: menuRes.count || 0,
          ordersToday: ordersRes.count || 0
        });
      } catch (err) {
        console.error("Error fetching limit usage", err);
      }
    };
    fetchUsage();
  }, [selectedRestaurant?.id]);

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "Cancel Subscription?",
      text: "You'll be downgraded to the Starter (free) plan. Some features and resource limits will be reduced.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      confirmButtonText: "Yes, downgrade to Starter",
      cancelButtonText: "Keep my plan",
    });

    if (!result.isConfirmed) return;

    await downgradeToFree();
    Swal.fire("Downgraded", "Your subscription has been cancelled. You are now on the Starter (free) plan.", "success");
  };

  const formatLimit = (value: number) => value === 9999 ? "Unlimited" : String(value);

  const renderLimitBar = (label: string, current: number, max: number) => {
    const isUnlimited = max === 9999;
    const progress = isUnlimited ? 0 : Math.min(100, (current / max) * 100);
    const isNearLimit = !isUnlimited && progress >= 85;

    return (
      <Box key={label}>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="body2" fontWeight="medium">{label}</Typography>
          <Typography variant="body2" fontWeight="bold">
            {current} / {isUnlimited ? "Unlimited" : max}
          </Typography>
        </Box>
        <LinearProgress 
          variant={isUnlimited ? "determinate" : "determinate"} 
          value={isUnlimited ? 100 : progress} 
          color={isUnlimited ? "primary" : isNearLimit ? "warning" : "primary"}
          sx={{ height: 6, borderRadius: 3, bgcolor: "grey.100" }} 
        />
      </Box>
    );
  };

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
                  color={isFree ? "default" : "primary"} 
                  icon={!isFree ? <StarIcon /> : undefined}
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
                {plan.features.filter(f => f.included).slice(0, 5).map((f, i) => (
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
                sx={{ mb: 1 }}
              >
                {isFree ? "Upgrade Plan" : "Change Plan"}
              </Button>

              {!isFree && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={handleCancel}
                  disabled={loading}
                  size="small"
                >
                  Cancel Subscription
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Plan Limits */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Resource Limits</Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {renderLimitBar("Employees", limitsUsage.employees, plan.limits.maxEmployees)}
                {renderLimitBar("Tables", limitsUsage.tables, plan.limits.maxTables)}
                {renderLimitBar("Menu Items", limitsUsage.menuItems, plan.limits.maxMenuItems)}
                {renderLimitBar("Orders / Day", limitsUsage.ordersToday, plan.limits.maxOrdersPerDay)}
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
