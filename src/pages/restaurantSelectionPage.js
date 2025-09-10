import React, { useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Box,
} from "@mui/material";
import useRestaurantStore from "../lib/restaurantStore";
import { useNavigate } from "react-router-dom";

// const restaurants = [
//   {
//     id: 1,
//     name: "Ocean Breeze",
//     description: "Fresh seafood and coastal vibes.",
//     image: "https://source.unsplash.com/400x300/?restaurant,seafood",
//   },
//   {
//     id: 2,
//     name: "Urban Grill",
//     description: "Modern grill house with bold flavors.",
//     image: "https://source.unsplash.com/400x300/?restaurant,grill",
//   },
//   {
//     id: 3,
//     name: "Sakura Garden",
//     description: "Authentic Japanese cuisine in style.",
//     image: "https://source.unsplash.com/400x300/?restaurant,japanese",
//   },
//   {
//     id: 4,
//     name: "Café Aroma",
//     description: "Cozy café with artisan coffee & bakes.",
//     image: "https://source.unsplash.com/400x300/?cafe,coffee",
//   },
//   {
//     id: 5,
//     name: "La Fiesta",
//     description: "Mexican street food reinvented.",
//     image: "https://source.unsplash.com/400x300/?mexican,restaurant",
//   },
//   {
//     id: 6,
//     name: "The Green Bowl",
//     description: "Healthy bowls, salads & smoothies.",
//     image: "https://source.unsplash.com/400x300/?healthy,restaurant",
//   },
//   {
//     id: 7,
//     name: "Spice Route",
//     description: "Exotic Indian dishes with rich spices.",
//     image: "https://source.unsplash.com/400x300/?indian,restaurant",
//   },
//   {
//     id: 8,
//     name: "Bella Italia",
//     description: "Classic Italian pasta & pizza.",
//     image: "https://source.unsplash.com/400x300/?italian,restaurant",
//   },
// ];

export default function RestaurantGrid() {
  const { getRestaurantById, restaurants, selectedRestaurant, getRestaurants, setSelectedRestaurant } = useRestaurantStore();
  const navigate = useNavigate();

  useEffect(() => {
    getRestaurants();
  }, [getRestaurants]);

  useEffect(() => {
    if (restaurants.length === 1) {
      const restaurant = restaurants[0];
      getRestaurantById(restaurant.id);
      setSelectedRestaurant(restaurant);
      navigate("/app/dashboard");
    }
  }, [restaurants, getRestaurantById, navigate, setSelectedRestaurant]);

  const handleSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    navigate('/app/dashboard');
  };

  return (
    <Box sx={{ flexGrow: 1, p: 20 }}>
      <Typography variant="h5" textAlign="center" m={4} fontWeight="bold">
        Select Restaurant
      </Typography>
      <Grid container spacing={4}>
        {restaurants.map((restaurant) => (
          <Grid item xs={12} sm={6} md={3} key={restaurant.id}>
            <Card
              onClick={() => handleSelect(restaurant)}
              sx={{
                borderRadius: 3,
                boxShadow: 4,
                transition: "transform 0.2s, box-shadow 0.2s",
                transform:
                  selectedRestaurant === restaurant.restaurants.id ? "scale(1.05)" : "scale(1)",
                boxShadow: selectedRestaurant === restaurant.restaurants.id ? 8 : 4,
                border:
                  selectedRestaurant === restaurant.restaurants.id
                    ? "2px solid #1976d2"
                    : "2px solid transparent",
              }}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="160"
                  image={restaurant.restaurants.logo}
                  alt={restaurant.restaurants.name}
                />
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    fontWeight="bold"
                  >
                    {restaurant.restaurants.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {restaurant.restaurants.description}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" noWrap>
                    {restaurant.role}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
