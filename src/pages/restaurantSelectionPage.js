import React, { useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Box,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import useRestaurantStore from "../lib/restaurantStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function RestaurantGrid() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    getRestaurantById,
    restaurants,
    selectedRestaurant,
    getRestaurants,
    setSelectedRestaurant,
    loading,
  } = useRestaurantStore();

  const navigate = useNavigate();

  useEffect(() => {
    getRestaurants();
  }, [getRestaurants]);

  useEffect(() => {
    if (!loading && restaurants.length === 1) {
      const restaurant = restaurants[0];
      getRestaurantById(restaurant.id);
      setSelectedRestaurant(restaurant);
      navigate("/app/dashboard");
    }
  }, [
    loading,
    restaurants,
    getRestaurantById,
    navigate,
    setSelectedRestaurant,
  ]);

  const handleSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    navigate("/app/dashboard");
  };

  // 🔹 Loading Skeletons
  if (loading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 3, sm: 5, md: 8 },
          background: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          textAlign="center"
          mb={6}
          fontWeight="bold"
          color="text.primary"
        >
          Loading Restaurants...
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {[1, 2, 3, 4].map((n) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={n}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: theme.shadows[2],
                  bgcolor: theme.palette.background.paper,
                  overflow: "hidden",
                }}
              >
                <Skeleton variant="rectangular" height={180} animation="wave" />
                <CardContent sx={{ textAlign: "center", py: 3 }}>
                  <Skeleton
                    width="70%"
                    height={30}
                    sx={{ mx: "auto", mb: 1 }}
                  />
                  <Skeleton width="90%" height={20} sx={{ mx: "auto" }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: { xs: 3, sm: 5, md: 8 },
        background: theme.palette.background.default,
        minHeight: "100vh",
        transition: "background 0.3s ease",
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        textAlign="center"
        mb={6}
        fontWeight="bold"
        color="text.primary"
      >
        Select a Restaurant
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {restaurants.map((restaurant) => {
          const isSelected =
            selectedRestaurant?.restaurants?.id === restaurant.restaurants.id;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={restaurant.id}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card
                  onClick={() => handleSelect(restaurant)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: isSelected
                      ? `0 0 0 2px ${theme.palette.primary.main}`
                      : theme.shadows[3],
                    bgcolor: theme.palette.background.paper,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: theme.shadows[10],
                    },
                  }}
                >
                  <CardActionArea>
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={restaurant.restaurants.logo}
                        alt={restaurant.restaurants.name}
                        sx={{
                          objectFit: "cover",
                          filter:
                            theme.palette.mode === "dark"
                              ? "brightness(0.8)"
                              : "brightness(0.95)",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)",
                          opacity: 0,
                          transition: "opacity 0.3s",
                          "&:hover": { opacity: 1 },
                        }}
                      />
                      <Chip
                        label={restaurant.role}
                        size="small"
                        color={
                          restaurant.role === "owner"
                            ? "primary"
                            : restaurant.role === "manager"
                            ? "secondary"
                            : "default"
                        }
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.05)",
                          backdropFilter: "blur(4px)",
                        }}
                      />
                    </Box>

                    <CardContent
                      sx={{
                        textAlign: "center",
                        py: 3,
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        fontWeight={700}
                        color="text.primary"
                        noWrap
                      >
                        {restaurant.restaurants.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {restaurant.restaurants.description || "No description"}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
