import React, { lazy, Suspense, useEffect } from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useRestaurantStore from "../lib/restaurantStore";

// Lazy load dashboards
const OwnerDashboard = lazy(() => import("./dashboards/owner"));
const CashierDashboard = lazy(() => import("./dashboards/cashier"));
const AdminDashboard = lazy(() => import("./dashboards/admin"));
const WaiterDashboard = lazy(() => import("./dashboards/waiter"));
const ChefDashboard = lazy(() => import("./dashboards/chef"));
const BartenderDashboard = lazy(() => import("./dashboards/bartender"));

const dashboards = {
  owner: OwnerDashboard,
  cashier: CashierDashboard,
  admin: AdminDashboard,
  waiter: WaiterDashboard,
  chef: ChefDashboard,
  bartender: BartenderDashboard,
};

const Dashboard = () => {
  const { selectedRestaurant } = useRestaurantStore();
  const navigate = useNavigate();

  // If no restaurant is selected, redirect
  useEffect(() => {
    if (!selectedRestaurant) {
      navigate("/restaurant-selection");
    }
  }, [selectedRestaurant, navigate]);

  if (!selectedRestaurant) {
    return null; // nothing while redirecting
  }

  const RoleDashboard =
    dashboards[selectedRestaurant.role] ||
    (() => (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">Role not recognized</Typography>
        <Typography variant="body2" color="text.secondary">
          Please contact an administrator.
        </Typography>
      </Box>
    ));

  return (
    <Suspense
      fallback={
        <Box sx={{ width: "100%", mt: 2 }}>
          <LinearProgress />
          <Typography align="center" variant="body2" sx={{ mt: 1 }}>
            Loading dashboard...
          </Typography>
        </Box>
      }
    >
      <RoleDashboard />
    </Suspense>
  );
};

export default Dashboard;
