import React from "react";
import { Box, Typography, Card, Button, Grid, Backdrop } from "@mui/material";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: (planId: string) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ open, onClose, onUpgrade }) => {
  if (!open) return null;

  const plans = [
    {
      id: "basic",
      title: "Basic",
      price: "$9.99/mo",
      features: ["10 Employees", "Basic Reports", "POS Access"],
    },
    {
      id: "pro",
      title: "Pro",
      price: "$29.99/mo",
      features: [
        "Unlimited Employees",
        "Advanced Reports",
        "Inventory",
        "Priority Support",
      ],
    },
    {
      id: "enterprise",
      title: "Enterprise",
      price: "Custom",
      features: ["Custom Limits", "Dedicated Support", "Multi-Branch Control"],
    },
  ];

  return (
    <Backdrop
      open={open}
      sx={{ zIndex: 9999, backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        sx={{ width: "90%", maxWidth: 650, p: 4, borderRadius: 3, background: "#fff", textAlign: "center" }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>Upgrade Your Plan</Typography>
        <Typography sx={{ mb: 3, color: "text.secondary" }}>You are currently using the <strong>Free Plan</strong>. Unlock powerful features by upgrading.</Typography>
        <Grid container spacing={2}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3, height: "100%" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{plan.title}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 1 }}>{plan.price}</Typography>
                <Box sx={{ mt: 1 }}>
                  {plan.features.map((f, index) => (
                    <Typography key={index} sx={{ fontSize: 13, color: "text.secondary" }}>• {f}</Typography>
                  ))}
                </Box>
                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => onUpgrade(plan.id)}>Choose {plan.title}</Button>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button fullWidth variant="text" color="error" sx={{ mt: 3 }} onClick={onClose}>Maybe Later</Button>
      </Card>
    </Backdrop>
  );
};

export default UpgradeModal;
