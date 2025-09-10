import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  CircularProgress,
  List,
  ListItem,
  Divider,
} from "@mui/material";
import { PendingActions, DoneAll } from "@mui/icons-material";
import AlarmOnIcon from "@mui/icons-material/AlarmOn";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Kitchen = () => {
  // Dummy data
  const pendingMeals = [
    {
      id: 1,
      menuItems: { item_name: "Grilled Chicken" },
      order_no: "101",
      orders: { tables: { table_no: "5" }, waiter: { name: "Alice" } },
      status: "pending",
      created_at: dayjs().subtract(15, "minute"),
    },
    {
      id: 2,
      menuItems: { item_name: "Pasta Alfredo" },
      order_no: "102",
      orders: { tables: { table_no: "2" }, waiter: { name: "Bob" } },
      status: "cooking",
      created_at: dayjs().subtract(25, "minute"),
    },
  ];
  const readyMeals = [
    {
      id: 3,
      menuItems: { item_name: "Caesar Salad" },
      order_no: "103",
      orders: { tables: { table_no: "8" }, waiter: { name: "Jane" } },
      status: "ready",
      created_at: dayjs().subtract(10, "minute"),
    },
  ];
  const servedMeals = [
    {
      id: 4,
      menuItems: { item_name: "Steak" },
      order_no: "104",
      orders: { tables: { table_no: "1" }, waiter: { name: "Tom" } },
      status: "served",
      created_at: dayjs().subtract(40, "minute"),
      paid: true,
    },
    {
      id: 5,
      menuItems: { item_name: "Burger" },
      order_no: "105",
      orders: { tables: { table_no: "3" }, waiter: { name: "Lucy" } },
      status: "served",
      created_at: dayjs().subtract(60, "minute"),
      paid: false,
    },
  ];

  const getTimeAgo = (timestamp) => dayjs(timestamp).fromNow();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        {/* Left: Icon + Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <RestaurantMenuIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", letterSpacing: 0.5 }}
            >
              Kitchen Panel
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Manage orders • Track status • Stay efficient
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              borderRadius: 3,
              backgroundColor: "#fff3e0",
              boxShadow: 2,
            }}
          >
            <Avatar sx={{ backgroundColor: "#ff5722", mr: 2 }}>
              <PendingActions />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#bf360c" }}
              >
                {pendingMeals.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#bf360c" }}>
                Pending Orders
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              borderRadius: 3,
              backgroundColor: "#e3f2fd",
              boxShadow: 2,
            }}
          >
            <Avatar sx={{ backgroundColor: "#2196f3", mr: 2 }}>
              <AlarmOnIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#0d47a1" }}
              >
                {readyMeals.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#0d47a1" }}>
                Ready Orders
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              borderRadius: 3,
              backgroundColor: "#e8f5e9",
              boxShadow: 2,
            }}
          >
            <Avatar sx={{ backgroundColor: "#4caf50", mr: 2 }}>
              <DoneAll />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#2e7d32" }}
              >
                {servedMeals.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "#2e7d32" }}>
                Served Orders
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Dashboard */}
      <Grid container spacing={2}>
        {/* Pending Orders */}
        <Grid item xs={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              height: "80vh",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <CardHeader
              title="Pending Orders"
              sx={{ backgroundColor: "#ff5722", color: "#fff" }}
            />
            <CardContent sx={{ overflowY: "auto", flexGrow: 1 }}>
              {pendingMeals.length === 0 ? (
                <Typography textAlign="center" sx={{ mt: 3, color: "#9e9e9e" }}>
                  No pending meals.
                </Typography>
              ) : (
                <List>
                  {pendingMeals.map((dish) => (
                    <ListItem
                      key={dish.id}
                      sx={{
                        mb: 1.5,
                        py: 2,
                        px: 2,
                        backgroundColor: "#fff3e0",
                        borderRadius: 2,
                        boxShadow: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, color: "#bf360c" }}>
                          {dish.menuItems.item_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#6d4c41" }}>
                          Order #{dish.order_no} • Table{" "}
                          {dish.orders.tables.table_no} •{" "}
                          {dish.orders.waiter.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6d4c41" }}>
                          {getTimeAgo(dish.created_at)}
                        </Typography>
                      </Box>
                      {dish.status === "pending" && (
                        <Typography variant="caption" sx={{ color: "#bf360c" }}>
                          TAP TO START
                        </Typography>
                      )}
                      {dish.status === "cooking" && (
                        <CircularProgress size={40} sx={{ color: "#ff5722" }} />
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Ready Orders */}
        <Grid item xs={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              height: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardHeader
              title="Ready Orders"
              sx={{ backgroundColor: "#2196f3", color: "#fff" }}
            />
            <CardContent sx={{ overflowY: "auto", flexGrow: 1 }}>
              {readyMeals.length === 0 ? (
                <Typography textAlign="center" sx={{ mt: 3, color: "#9e9e9e" }}>
                  No ready meals.
                </Typography>
              ) : (
                <List>
                  {readyMeals.map((dish) => (
                    <ListItem
                      key={dish.id}
                      sx={{
                        mb: 1.5,
                        py: 2,
                        px: 2,
                        backgroundColor: "#e3f2fd",
                        borderRadius: 2,
                        boxShadow: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, color: "#0d47a1" }}>
                          {dish.menuItems.item_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#1976d2" }}>
                          Order #{dish.order_no} • Table{" "}
                          {dish.orders.tables.table_no} •{" "}
                          {dish.orders.waiter.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#1976d2" }}>
                          {getTimeAgo(dish.created_at)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: "#0d47a1" }}
                      >
                        TAP TO SERVE
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Served Orders */}
        <Grid item xs={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              height: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardHeader
              title="Served Orders"
              sx={{ backgroundColor: "#4caf50", color: "#fff" }}
            />
            <CardContent sx={{ overflowY: "auto", flexGrow: 1 }}>
              {servedMeals.length === 0 ? (
                <Typography textAlign="center" sx={{ mt: 3, color: "#9e9e9e" }}>
                  No served meals.
                </Typography>
              ) : (
                <List>
                  {servedMeals.map((dish) => (
                    <ListItem
                      key={dish.id}
                      sx={{
                        mb: 1.5,
                        py: 2,
                        px: 2,
                        backgroundColor: "#e8f5e9",
                        borderRadius: 2,
                        boxShadow: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, color: "#2e7d32" }}>
                          {dish.menuItems.item_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#43a047" }}>
                          Order #{dish.order_no} • Table{" "}
                          {dish.orders.tables.table_no} •{" "}
                          {dish.orders.waiter.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#43a047" }}>
                          {getTimeAgo(dish.created_at)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: dish.paid ? "#1b5e20" : "#b00020",
                        }}
                      >
                        {dish.paid ? "PAID" : "NOT PAID"}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Kitchen;
