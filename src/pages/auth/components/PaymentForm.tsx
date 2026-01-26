import * as React from "react";
import Box from "@mui/material/Box";
import MuiCard from "@mui/material/Card";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import Button from "@mui/material/Button";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import SimCardRoundedIcon from "@mui/icons-material/SimCardRounded";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import useAuthStore from "../../../lib/authStore";

const plans = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    subtitle: "Start your journey",
    selected: false,
    cta: "Get Started",
    features: [
      { text: "Basic menu management", included: true },
      { text: "1 staff account", included: true },
      { text: "Email support", included: false },
    ],
  },
  {
    id: "basic",
    name: "Basic",
    monthly: 19,
    yearly: 190, // ~2 months free
    subtitle: "For small teams",
    cta: "Choose Basic",
    selected: true,
    features: [
      { text: "Full menu management", included: true },
      { text: "Up to 5 staff accounts", included: true },
      { text: "Email support", included: true },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 49,
    yearly: 490,
    subtitle: "For growing restaurants",
    selected: false,
    cta: "Go Pro",
    features: [
      { text: "Unlimited menu management", included: true },
      { text: "Unlimited staff accounts", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

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

const PaymentContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  width: "100%",
  height: 375,
  padding: theme.spacing(3),
  borderRadius: `calc(${theme.shape.borderRadius}px + 4px)`,
  border: "1px solid ",
  borderColor: (theme as any).vars?.palette.divider || theme.palette.divider,
  background:
    "linear-gradient(to bottom right, hsla(220, 35%, 97%, 0.3) 25%, hsla(220, 20%, 88%, 0.3) 100%)",
  boxShadow: "0px 4px 8px hsla(210, 0%, 0%, 0.05)",
  [theme.breakpoints.up("xs")]: {
    height: 300,
  },
  [theme.breakpoints.up("sm")]: {
    height: 350,
  },
  ...theme.applyStyles("dark", {
    background:
      "linear-gradient(to right bottom, hsla(220, 30%, 6%, 0.2) 25%, hsla(220, 20%, 25%, 0.2) 100%)",
    boxShadow: "0px 4px 8px hsl(220, 35%, 0%)",
  }),
}));

const FormGrid = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
}));

const PaymentForm: React.FC = () => {
  const {
    subscription,
    updateSubscription,
    validationErrors,
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
                        ? "$0"
                        : `$${plan.monthly}`
                      : `$${plan.yearly}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {subscription.billing_cycle === "monthly" ? "per month" : "per year"}
                  </Typography>

                  {/* CTA */}
                  <Button
                    fullWidth
                    variant={isSelected ? "contained" : "outlined"}
                    sx={{ mt: 3, borderRadius: 2, fontWeight: 600 }}
                    onClick={() => updateSubscription("subscription_plan", plan.id, plans)}
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
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              aria-label="Payment options"
              name="paymentType"
              value={subscription.payment_method}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Card selected={subscription.payment_method === "momo"}>
                <CardActionArea
                  onClick={() => updateSubscription("payment_method", "momo", plans)}
                  sx={{
                    ".MuiCardActionArea-focusHighlight": {
                      backgroundColor: "transparent",
                    },
                    "&:focus-visible": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <CardContent
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <PhoneIphoneIcon
                      fontSize="small"
                      sx={[
                        (theme) => ({
                          color: "grey.400",
                          ...theme.applyStyles("dark", {
                            color: "grey.600",
                          }),
                        }),
                        subscription.payment_method === "momo" && {
                          color: "primary.main",
                        },
                      ]}
                    />
                    <Typography sx={{ fontWeight: "medium" }}>Momo</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
              <Card selected={subscription.payment_method === "creditCard"}>
                <CardActionArea
                  onClick={() => updateSubscription("payment_method", "creditCard", plans)}
                  sx={{
                    ".MuiCardActionArea-focusHighlight": {
                      backgroundColor: "transparent",
                    },
                    "&:focus-visible": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <CardContent
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <CreditCardRoundedIcon
                      fontSize="small"
                      sx={[
                        (theme) => ({
                          color: "grey.400",
                          ...theme.applyStyles("dark", {
                            color: "grey.600",
                          }),
                        }),
                        subscription.payment_method === "creditCard" && {
                          color: "primary.main",
                        },
                      ]}
                    />
                    <Typography sx={{ fontWeight: "medium" }}>Card</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </RadioGroup>
          </FormControl>
          {subscription.payment_method === "creditCard" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <PaymentContainer>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle2">Credit card</Typography>
                  <CreditCardRoundedIcon sx={{ color: "text.secondary" }} />
                </Box>
                <SimCardRoundedIcon
                  sx={{
                    fontSize: { xs: 48, sm: 56 },
                    transform: "rotate(90deg)",
                    color: "text.secondary",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    gap: 2,
                  }}
                >
                  <FormGrid sx={{ flexGrow: 1 }}>
                    <FormLabel htmlFor="card-number" required>
                      Card number
                    </FormLabel>
                    <OutlinedInput
                      id="card-number"
                      autoComplete="card-number"
                      placeholder="0000 0000 0000 0000"
                      required
                      size="small"
                      value={subscription.card_details.card_number}
                      onChange={(e) => updateSubscription("card_details", { card_number: e.target.value }, plans)}
                    />
                    {validationErrors.cardNumber && (
                      <Typography color="error" variant="caption">
                        {validationErrors.cardNumber}
                      </Typography>
                    )}
                  </FormGrid>
                  <FormGrid sx={{ maxWidth: "20%" }}>
                    <FormLabel htmlFor="cvv" required>
                      CVV
                    </FormLabel>
                    <OutlinedInput
                      id="cvv"
                      autoComplete="CVV"
                      placeholder="123"
                      required
                      size="small"
                      value={subscription.card_details.card_cvv}
                      onChange={(e) => updateSubscription("card_details", { card_cvv: e.target.value }, plans)}
                    />
                    {validationErrors.card_cvv && (
                      <Typography color="error" variant="caption">
                        {validationErrors.card_cvv}
                      </Typography>
                    )}
                  </FormGrid>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormGrid sx={{ flexGrow: 1 }}>
                    <FormLabel htmlFor="card-name" required>
                      Name
                    </FormLabel>
                    <OutlinedInput
                      id="card-name"
                      autoComplete="card-name"
                      placeholder="John Smith"
                      required
                      size="small"
                    />
                    {validationErrors.card_holder_name && (
                      <Typography color="error" variant="caption">
                        {validationErrors.card_holder_name}
                      </Typography>
                    )}
                  </FormGrid>
                  <FormGrid sx={{ flexGrow: 1 }}>
                    <FormLabel htmlFor="card-expiration" required>
                      Expiration date
                    </FormLabel>
                    <OutlinedInput
                      id="card-expiration"
                      autoComplete="card-expiration"
                      placeholder="MM/YY"
                      required
                      size="small"
                      value={subscription.card_details.card_expiry_date}
                      onChange={(e) => updateSubscription("card_details", { card_expiry_date: e.target.value }, plans)}
                    />
                    {validationErrors.card_expiry_date && (
                      <Typography color="error" variant="caption">
                        {validationErrors.card_expiry_date}
                      </Typography>
                    )}
                  </FormGrid>
                </Box>
              </PaymentContainer>
              <FormControlLabel
                control={<Checkbox name="saveCard" />}
                label="Remember credit card details for next time"
              />
            </Box>
          )}
          {subscription.payment_method === "momo" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle2">Momo Number</Typography>
              <TextField
                id="outlined-basic"
                label="+233 54 xxx xxx"
                variant="outlined"
                value={subscription.card_details.momo_number}
                onChange={(e) => updateSubscription("card_details", { momo_number: e.target.value }, plans)}
              />
              {validationErrors.momo_number && (
                <Typography color="error" variant="caption">
                  {validationErrors.momo_number}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      )}
    </>
  );
};

export default PaymentForm;
