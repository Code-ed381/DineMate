import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useSubscriptionStore } from "../lib/subscriptionStore";
import { getPlanById } from "../config/plans";
import { usePaystackPayment } from "react-paystack";
import useAuthStore from "../lib/authStore";
import useRestaurantStore from "../lib/restaurantStore";
import { supabase } from "../lib/supabase";
import Swal from "sweetalert2";

const PaymentWall: React.FC = () => {
  const { subscriptions, fetchSubscriptions } = useSubscriptionStore();
  const { signOut, user } = useAuthStore();
  const { role } = useRestaurantStore();
  const [verifying, setVerifying] = React.useState(false);

  const pendingSub = subscriptions.find((s) => s.status === "pending");
  const plan = pendingSub ? getPlanById(pendingSub.subscription_plan) : null;
  const amount = pendingSub
    ? pendingSub.billing_cycle === "monthly"
      ? plan?.monthly
      : plan?.yearly
    : 0;

  const config = {
    reference: new Date().getTime().toString(),
    email: user?.email || "",
    amount: (amount || 0) * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    currency: "GHS",
  };

  const initializePayment = usePaystackPayment(config);

  const handlePaymentSuccess = async (reference: any) => {
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          reference: reference.reference,
          planId: pendingSub?.subscription_plan,
          billingCycle: pendingSub?.billing_cycle,
          restaurantId: pendingSub?.restaurant_id,
          userId: user?.id,
        }
      });

      if (!error) {
        Swal.fire("Success", "Payment verified! Welcome back.", "success");
        await fetchSubscriptions();
      } else {
        throw new Error("Verification failed");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "We couldn't verify your payment. Please contact support.", "error");
    } finally {
      setVerifying(false);
    }
  };

  if (!pendingSub || !plan) return null;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom color="primary">
            DineMate
          </Typography>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {role === "owner" ? "Action Required: Complete Payment" : "Access Restricted"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {role === "owner" 
              ? "Your subscription is currently pending. To access your dashboard and start managing your restaurant, please complete the payment for your chosen plan."
              : "The restaurant's subscription is currently pending. Please contact the restaurant owner to complete the payment and activate the account."
            }
          </Typography>

          <Paper
            variant="outlined"
            sx={{ p: 3, mb: 4, bgcolor: "primary.main", color: "white", borderRadius: 3 }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box textAlign="left">
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                  SELECTED PLAN
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {plan.name} ({pendingSub.billing_cycle})
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="h4" fontWeight={800}>
                  ₵{amount}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Stack spacing={2}>
            {role === "owner" ? (
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={verifying}
                onClick={() => {
                  initializePayment({
                      onSuccess: handlePaymentSuccess,
                      onClose: () => {
                          Swal.fire("Cancelled", "Payment was not completed.", "info");
                      }
                  });
                }}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
              >
                {verifying ? <CircularProgress size={24} color="inherit" /> : "Complete Payment Now"}
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
              >
                Waiting for Owner Payment
              </Button>
            )}
            
            <Divider>OR</Divider>

            <Button
              variant="text"
              color="error"
              onClick={() => signOut()}
              sx={{ fontWeight: 600 }}
            >
              Sign Out
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: "block" }}>
            Secure payment powered by <strong>Paystack</strong>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentWall;
