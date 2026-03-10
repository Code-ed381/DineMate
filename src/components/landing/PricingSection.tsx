import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Switch,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { plans } from "../../config/plans";
import useAuthStore from "../../lib/authStore";
import useRestaurantStore from "../../lib/restaurantStore";
import { useSubscription } from "../../providers/subscriptionProvider";

const PricingSection: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const { user } = useAuthStore();
  const { selectedRestaurant } = useRestaurantStore();
  const {
    subscriptionPlan,
    subscriptionStatus,
    loading: subscriptionLoading,
  } = useSubscription();

  const accent = "#3b82f6";

  // Show all tiers for landing page: Starter (free), Growth (29), Professional (59), Enterprise (99)
  const displayPlans = plans;

  const currentPlanId =
    subscriptionStatus === "active" && subscriptionPlan
      ? subscriptionPlan
      : null;

  const handlePricingCta = (planId: string) => {
    if (!user) {
      navigate("/sign-in");
      return;
    }
    if (!selectedRestaurant) {
      setToastOpen(true);
      return;
    }

    if (planId === currentPlanId) return;

    navigate("/app/settings");
  };

  return (
    <Box
      id="pricing"
      sx={{
        py: { xs: 8, md: 12 },
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, #12121f 0%, #0a0a0f 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              mb: 2,
              color: "text.primary",
              fontSize: { xs: "1.75rem", md: "2.5rem" },
            }}
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mb: 4,
              fontWeight: 400,
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Start free, scale as you grow
          </Typography>

          {user && selectedRestaurant && (
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "text.secondary",
                mb: 1,
              }}
            >
              For <strong>{selectedRestaurant.name}</strong>
              {subscriptionLoading
                ? " · Loading subscription…"
                : subscriptionStatus === "active"
                  ? " · Subscription active"
                  : subscriptionStatus === "pending"
                    ? " · Subscription pending"
                    : ""}
            </Typography>
          )}
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mb: 6,
            }}
          >
            <Typography
              sx={{
                color: !isYearly ? "text.primary" : "text.secondary",
                fontWeight: 600,
              }}
            >
              Monthly
            </Typography>
            <Switch
              checked={isYearly}
              onChange={(e) => setIsYearly(e.target.checked)}
              color="primary"
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  color: isYearly ? "text.primary" : "text.secondary",
                  fontWeight: 600,
                }}
              >
                Yearly
              </Typography>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  background: "#4caf50",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#fff", fontWeight: 700 }}
                >
                  Save 17%
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Pricing Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          {displayPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 3,
                  background: plan.popular
                    ? theme.palette.mode === "dark"
                      ? "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.06) 100%)"
                      : "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.03) 100%)"
                    : theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "#ffffff",
                  border: `2px solid ${plan.popular ? accent : theme.palette.divider}`,
                  position: "relative",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: plan.popular ? accent : "primary.main",
                  },
                }}
              >
                {currentPlanId === plan.id && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      background: "#4caf50",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      zIndex: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#fff", fontWeight: 700 }}
                    >
                      Current Plan
                    </Typography>
                  </Box>
                )}

                {plan.popular && currentPlanId !== plan.id && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      background: accent,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Sparkles size={14} color="#fff" />
                    <Typography
                      variant="caption"
                      sx={{ color: "#fff", fontWeight: 700 }}
                    >
                      Most Popular
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}
                >
                  {plan.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 3 }}
                >
                  {plan.subtitle}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: "text.primary",
                      display: "inline",
                    }}
                  >
                    GHS {isYearly ? plan.yearly : plan.monthly}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "text.secondary", display: "inline", ml: 1 }}
                  >
                    /{isYearly ? "year" : "month"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  {plan.features.slice(0, 6).map((feature, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      {feature.included ? (
                        <Check size={16} color="#4caf50" />
                      ) : (
                        <X size={16} color="rgba(255,255,255,0.3)" />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: feature.included
                            ? "text.secondary"
                            : "text.disabled",
                        }}
                      >
                        {feature.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant={plan.popular ? "contained" : "outlined"}
                  color="primary"
                  disabled={currentPlanId === plan.id}
                  onClick={() => handlePricingCta(plan.id)}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  {currentPlanId === plan.id
                    ? "Current Plan"
                    : user
                      ? "Upgrade"
                      : "Sign In"}
                </Button>
              </Paper>
            </motion.div>
          ))}
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mt: 4,
            }}
          >
            14-day free trial, no credit card required
          </Typography>
        </motion.div>
      </Container>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="info"
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          Please select a restaurant first.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PricingSection;
