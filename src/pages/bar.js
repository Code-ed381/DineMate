import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  LocalBar,
  Schedule,
  Done,
  History,
  HourglassTop,
  Person,
  Receipt,
} from "@mui/icons-material";
import LocalBarIcon from "@mui/icons-material/LocalBar";

const activeOrders = [
  {
    id: "ORD-201",
    drinks: ["Mojito", "Whiskey Sour"],
    source: "Waiter Sarah (Table 12)",
    time: "2 mins ago",
    status: "Pending",
  },
  {
    id: "ORD-202",
    drinks: ["Martini"],
    source: "POS - Counter",
    time: "1 min ago",
    status: "Pending",
  },
];

const readyOrders = [
  {
    id: "ORD-198",
    drinks: ["Beer Pint"],
    source: "Waiter John (Table 7)",
    time: "5 mins ago",
    status: "Ready",
  },
];

const completedOrders = [
  { id: "ORD-190", drinks: ["Margarita"], time: "15 mins ago" },
  { id: "ORD-189", drinks: ["Old Fashioned"], time: "20 mins ago" },
];

export default function BartenderPanel() {
  const [orders, setOrders] = useState(activeOrders);

  const markAsReady = (id) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      setOrders(orders.filter((o) => o.id !== id));
      readyOrders.push({ ...order, status: "Ready" });
    }
  };

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
          <LocalBarIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", letterSpacing: 0.5 }}
            >
              Bar Panel
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Manage drinks • Track status • Stay efficient
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Active Orders */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #ffa726",
              bgcolor: "#fff8f0",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#ef6c00",
                }}
              >
                <HourglassTop /> Active Drink Orders
              </Typography>
              <List>
                {orders.map((order) => (
                  <ListItem
                    key={order.id}
                    sx={{
                      border: "1px solid #ffe0b2",
                      borderRadius: 2,
                      mb: 1,
                      background: "#fff",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {order.drinks.join(", ")}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            <Receipt fontSize="small" /> {order.id} •{" "}
                            <Person fontSize="small" /> {order.source}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <Schedule fontSize="small" /> {order.time}
                          </Typography>
                        </>
                      }
                    />
                    <Button
                      variant="contained"
                      size="small"
                      color="warning"
                      onClick={() => markAsReady(order.id)}
                      startIcon={<Done />}
                    >
                      Mark Ready
                    </Button>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Ready for Pickup */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #66bb6a",
              bgcolor: "#f1f8f5",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#2e7d32",
                }}
              >
                <LocalBar /> Ready for Pickup
              </Typography>
              {readyOrders.length > 0 ? (
                <List>
                  {readyOrders.map((order) => (
                    <ListItem
                      key={order.id}
                      sx={{
                        border: "1px solid #c8e6c9",
                        borderRadius: 2,
                        mb: 1,
                        background: "#fff",
                      }}
                    >
                      <ListItemText
                        primary={`${order.drinks.join(", ")}`}
                        secondary={`${order.id} • ${order.source}`}
                      />
                      <Chip label="Ready" color="success" size="small" />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No ready drinks yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Completed Orders */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid #42a5f5",
              bgcolor: "#f0f7ff",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#1565c0",
                }}
              >
                <History /> Recent Completed Orders
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {completedOrders.map((order) => (
                  <Chip
                    key={order.id}
                    label={`${order.drinks.join(", ")} • ${order.time}`}
                    variant="outlined"
                    color="primary"
                    icon={<Done />}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, bgcolor: "#fff3e0" }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total Drinks Made Today
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    52
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, bgcolor: "#e8f5e9" }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Pending Orders
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="success.main"
                  >
                    7
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, bgcolor: "#e3f2fd" }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Average Prep Time
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                  >
                    4 min
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 3, bgcolor: "#fce4ec" }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Most Popular Drink
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="secondary.main"
                  >
                    Mojito
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
