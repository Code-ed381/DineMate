import * as React from "react";
import Box from "@mui/material/Box";
import MuiCard from "@mui/material/Card";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import CardContent from "@mui/material/CardContent";
import useAuthStore from "../../../lib/authStore";

import { plans } from "../../../config/plans";

const Card = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  border: "1px solid",
  borderColor: (theme as any).vars?.palette.divider || theme.palette.divider,
  width: "100%",
  "&:hover": {
    background:
      "linear-gradient(to bottom right, hsla(210, 100%, 97%, 0.5) 25%, hsla(210, 100%, 90%, 0.3) 100%)",
    borderColor: "primary.light",
    boxShadow: "0px 2px 8px hsla(0, 0%, 0%, 0.1)",
    ...theme.applyStyles("dark", {
      background:
        "linear-gradient(to right bottom, hsla(210, 100%, 12%, 0.2) 25%, hsla(210, 100%, 16%, 0.2) 100%)",
      borderColor: "primary.dark",
      boxShadow: "0px 1px 8px hsla(210, 100%, 25%, 0.5) ",
    }),
  },
  [theme.breakpoints.up("md")]: {
    flexGrow: 1,
    maxWidth: `calc(50% - ${theme.spacing(1)})`,
  },
  ...(selected && {
    borderColor: (theme as any).vars?.palette.primary.light || theme.palette.primary.light,
    ...theme.applyStyles("dark", {
      borderColor: (theme as any).vars?.palette.primary.dark || theme.palette.primary.dark,
    }),
  }),
}));



const PaymentForm: React.FC = () => {
  const {
    subscription,
    updateSubscription,
  } = useAuthStore();

  return (
    <>
      <Typography variant="h6" fontWeight={600} textAlign="center">
        Choose a Plan
      </Typography>
      <Stack spacing={4}>
        {/* Billing Cycle Toggle */}
        <Stack direction="row" justifyContent="center">
          <ToggleButtonGroup
            value={subscription.billing_cycle}
            exclusive
            onChange={(_e, value) => updateSubscription("billing_cycle", value)}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="yearly">Yearly (2 months free)</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Plans */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {plans.map((plan) => {
            const isSelected = subscription.subscription_plan === plan.id;

            return (
              <Card
                key={plan.id}
                selected={isSelected}
                sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                  },
                  border: isSelected ? "2px solid #1976d2" : "1px solid #333",
                }}
              >
                <CardContent>
                  {/* Plan Name */}
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {plan.name}
                  </Typography>

                  {/* Price */}
                  <Typography variant="h4" fontWeight={800} gutterBottom>
                    {subscription.billing_cycle === "monthly"
                      ? plan.monthly === 0
                        ? "₵0"
                        : `₵${plan.monthly}`
                      : `₵${plan.yearly}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {subscription.billing_cycle === "monthly" ? "per month" : "per year"}
                  </Typography>

                  {/* CTA */}
                  <Button
                    fullWidth
                    variant={isSelected ? "contained" : "outlined"}
                    sx={{ mt: 3, borderRadius: 2, fontWeight: 600 }}
                    onClick={() => updateSubscription("subscription_plan", plan.id)}
                  >
                    {plan.cta}
                  </Button>

                  {/* Divider */}
                  <Divider sx={{ my: 3 }} />

                  {/* Features */}
                  <List dense>
                    {plan.features.map((f, idx) => (
                      <ListItem key={idx} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {f.included ? (
                            <CheckCircleRoundedIcon
                              color="primary"
                              fontSize="small"
                            />
                          ) : (
                            <CancelRoundedIcon
                              color="disabled"
                              fontSize="small"
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              color={
                                f.included ? "text.primary" : "text.disabled"
                              }
                            >
                              {f.text}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Stack>

      {subscription.subscription_plan !== "free" && (
        <Stack spacing={{ xs: 3, sm: 6 }} useFlexGap>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: 'center', textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 2, border: '1px dashed grey' }}>
            <Typography variant="h6">Pay Securely with Paystack</Typography>
            <Typography variant="body2" color="text.secondary">
              We use Paystack to securely process all payments. You will be prompted to enter your payment details on the final step.
            </Typography>
          </Box>
        </Stack>
      )}
    </>
  );
};

export default PaymentForm;
