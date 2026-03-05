import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
} from "@mui/material";
import { plans } from "../config/plans";

import useAuthStore from "../lib/authStore";
import useRestaurantStore from "../lib/restaurantStore";
import { useSubscriptionStore } from "../lib/subscriptionStore";
import Swal from "sweetalert2";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ open, onClose }) => {
  const { user, personalInfo } = useAuthStore();
  const { selectedRestaurant } = useRestaurantStore();
  const { subscriptionPlan, fetchSubscriptions } = useSubscriptionStore();
  const currentPlanId = subscriptionPlan || "free";

  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Z3VrY2lqaGNtc2Zoenl3cm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDE1NDksImV4cCI6MjA3MDkxNzU0OX0.EP068h4rdMhq_EgMrLbN50VXN6K_TEAQTfdiLJNNj70";

  const handleUpgradeClick = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const result = await Swal.fire({
      title: `Upgrade to ${plan.name}?`,
      text: `You are about to upgrade to the ${plan.name} plan for ₵${plan.monthly}/mo.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, pay with Paystack",
      cancelButtonText: "Maybe later"
    });

    if (!result.isConfirmed) return;

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      Swal.fire("Configuration Error", "Paystack public key is not set", "error");
      return;
    }

    // Use Paystack inline popup directly
    const handler = (window as any).PaystackPop?.setup({
      key: publicKey,
      email: user?.email || personalInfo.email || "user@example.com",
      amount: plan.monthly * 100, // pesewas
      currency: "GHS",
      ref: `upgrade_${Date.now()}`,
      callback: async (response: any) => {
        Swal.fire({
          title: "Verifying payment...",
          text: "Please wait while we confirm your subscription.",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        try {
          const res = await fetch("https://bvgukcijhcmsfhzywros.supabase.co/functions/v1/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": SUPABASE_ANON_KEY,
              "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              reference: response.reference,
              planId: plan.id,
              billingCycle: "monthly",
              restaurantId: selectedRestaurant?.id,
              userId: user?.id
            })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to verify payment");

          if (selectedRestaurant) {
            await fetchSubscriptions();
          }
          onClose();
          Swal.fire("Success", `Your plan has been upgraded to ${plan.name}!`, "success");
        } catch (error: any) {
          Swal.fire("Error", error.message, "error");
        }
      },
      onClose: () => {
        Swal.fire("Cancelled", "Payment was cancelled.", "info");
      }
    });

    if (handler) {
      handler.openIframe();
    } else {
      // Fallback: load Paystack inline script if not already loaded
      Swal.fire("Error", "Paystack payment widget failed to load. Please refresh and try again.", "error");
    }
  };

  const paidPlans = plans.filter((p) => p.id !== "free");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", pb: 0 }}>
        Upgrade Your Plan
      </DialogTitle>
      <DialogContent>
        <Typography
          sx={{ mb: 3, mt: 1, color: "text.secondary", textAlign: "center" }}
        >
          Unlock powerful features by upgrading your plan.
        </Typography>
        <Grid container spacing={2}>
          {paidPlans.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              const isDowngrade = plans.findIndex(p => p.id === plan.id) < plans.findIndex(p => p.id === currentPlanId);
              return (
                <Grid item xs={12} md={4} key={plan.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      border: isCurrent
                        ? "2px solid"
                        : plan.popular
                        ? "2px solid"
                        : "1px solid",
                      borderColor: isCurrent ? "primary.main" : plan.popular ? "primary.light" : "divider",
                      backgroundColor: isCurrent
                        ? "rgba(25, 118, 210, 0.04)"
                        : "background.paper",
                      position: "relative",
                    }}
                  >
                    {plan.popular && !isCurrent && (
                      <Chip
                        label="Most Popular"
                        color="primary"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: -12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                        }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1, pt: plan.popular && !isCurrent ? 3 : 2 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          {plan.name}
                        </Typography>
                        {isCurrent && (
                          <Chip
                            label="Current"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        {plan.subtitle}
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary"
                        gutterBottom
                      >
                        ₵{plan.monthly}
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          /mo
                        </Typography>
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {plan.features
                          .filter((f) => f.included)
                          .slice(0, 8)
                          .map((f, index) => (
                            <Typography
                              key={index}
                              variant="body2"
                              sx={{
                                color: "text.primary",
                                mb: 0.5,
                              }}
                            >
                              ✓ {f.text}
                            </Typography>
                          ))}
                      </Box>
                    </CardContent>
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Button
                        variant={isCurrent ? "outlined" : "contained"}
                        fullWidth
                        onClick={() => handleUpgradeClick(plan.id)}
                        disabled={isCurrent || isDowngrade}
                      >
                        {isCurrent ? "Active Plan" : isDowngrade ? "Current plan is higher" : `Choose ${plan.name}`}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" fullWidth>
          Maybe Later
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpgradeModal;
