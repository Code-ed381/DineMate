import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  CircularProgress,
  IconButton,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useRestaurantStore from "../lib/restaurantStore";
import useAuthStore from "../lib/authStore";
import { useSettingsStore } from "../lib/settingsStore";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import LogoutIcon from "@mui/icons-material/Logout";

const RestaurantSelectionPage: React.FC = () => {
  const { restaurants, getRestaurants, setSelectedRestaurant, setRole, loading } =
    useRestaurantStore();
  const { signOut, user } = useAuthStore();
  const { fetchSettings } = useSettingsStore();
  const navigate = useNavigate();

  useEffect(() => {
    getRestaurants();
  }, [getRestaurants]);

  const handleSelect = async (restaurant: any) => {
    setSelectedRestaurant(restaurant.restaurants);
    setRole(restaurant.role);
    await fetchSettings(restaurant.restaurants.id);
    
    const roleMap: Record<string, string> = {
        owner: "/dashboard/owner",
        admin: "/dashboard/admin",
        manager: "/dashboard/admin",
        waiter: "/dashboard/waiter",
        chef: "/dashboard/chef",
        bartender: "/dashboard/bartender",
        cashier: "/dashboard/cashier",
    };

    const target = roleMap[restaurant.role.toLowerCase()] || "/dashboard/waiter";
    navigate(target);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="primary">
          DineMate
        </Typography>
        <IconButton onClick={handleLogout} color="error">
          <LogoutIcon />
        </IconButton>
      </Box>

      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Welcome back, {user?.user_metadata?.first_name || user?.user_metadata?.firstName || "User"}!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Select a restaurant to continue to your dashboard
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifySelf="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {restaurants.map((res: any) => (
              <Grid item xs={12} sm={6} md={4} key={res.restaurants.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 8,
                    },
                  }}
                  onClick={() => handleSelect(res)}
                >
                  <CardContent sx={{ textAlign: "center", flexGrow: 1, pt: 4 }}>
                    <Avatar
                      src={res.restaurants.logo_url}
                      sx={{
                        width: 80,
                        height: 80,
                        mx: "auto",
                        mb: 2,
                        bgcolor: "primary.light",
                      }}
                    >
                      <BusinessIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {res.restaurants.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Role: {res.role}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Button fullWidth variant="contained" disableElevation>
                      Enter Dashboard
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "2px dashed",
                    borderColor: "grey.300",
                    bgcolor: "transparent",
                    cursor: "pointer",
                    minHeight: 250,
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                  onClick={() => navigate("/onboarding")}
                >
                  <AddIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                  <Typography variant="subtitle1" color="text.secondary" fontWeight="medium">
                    Add New Restaurant
                  </Typography>
                </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default RestaurantSelectionPage;
