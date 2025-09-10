import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
} from "@mui/material";
import {
  Receipt,
  ShoppingCart,
  Payment,
  CheckCircle,
  Cancel,
  AttachMoney,
  CreditCard,
  Smartphone,
  History,
  MonetizationOn,
  Replay,
  LocalOffer,
  Add,
} from "@mui/icons-material";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";

const orders = [
  {
    id: "ORD-101",
    items: ["Cheeseburger", "Coke"],
    total: 18,
    status: "Pending",
  },
  { id: "ORD-102", items: ["Salad", "Water"], total: 10, status: "Pending" },
];

const transactions = [
  {
    id: "TX-2001",
    orderId: "ORD-099",
    amount: 22,
    method: "Card",
    status: "Paid",
  },
  {
    id: "TX-2002",
    orderId: "ORD-098",
    amount: 15,
    method: "Cash",
    status: "Paid",
  },
];

export default function CashierDashboard() {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedOrder, setSelectedOrder] = useState(null);

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
          <PriceCheckIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", letterSpacing: 0.5 }}
            >
              Cashier Panel
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Track payments • Manage earnings • Record transactions
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT SIDE */}
        <Grid item xs={12} md={7}>
          {/* Daily Summary */}
          <Card
            sx={{ borderRadius: 3, mb: 3, borderLeft: "5px solid #4caf50" }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  color: "#4caf50",
                }}
              >
                <MonetizationOn /> Total Sales Today: <strong>$1,235</strong>
              </Typography>
              <Typography variant="subtitle1">
                Cash: <strong>$500</strong> | Card: <strong>$600</strong> |
                Mobile: <strong>$135</strong>
              </Typography>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card
            sx={{ borderRadius: 3, mb: 3, borderLeft: "5px solid #1976d2" }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#1976d2",
                }}
              >
                <ShoppingCart /> Orders Awaiting Payment
              </Typography>
              <List>
                {orders.map((order) => (
                  <ListItem
                    key={order.id}
                    button
                    onClick={() => setSelectedOrder(order)}
                    sx={{
                      border: "1px solid #eee",
                      borderRadius: 2,
                      mb: 1,
                      "&:hover": { background: "#f0f7ff" },
                    }}
                  >
                    <ListItemText
                      primary={`${order.id} - $${order.total}`}
                      secondary={order.items.join(", ")}
                    />
                    <Chip label={order.status} color="warning" size="small" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card
            sx={{ borderRadius: 3, mb: 3, borderLeft: "5px solid #ff9800" }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#ff9800",
                }}
              >
                <History /> Recent Transactions
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.id}</TableCell>
                      <TableCell>{tx.orderId}</TableCell>
                      <TableCell>${tx.amount}</TableCell>
                      <TableCell>{tx.method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ borderRadius: 3, borderLeft: "5px solid #9c27b0" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#9c27b0",
                }}
              >
                ⚡ Quick Actions
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" startIcon={<Replay />} color="info">
                  Refund
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LocalOffer />}
                  color="secondary"
                >
                  Discount
                </Button>
                <Button variant="outlined" startIcon={<Add />} color="primary">
                  Manual Order
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT SIDE - POS */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              borderRadius: 3,
              borderLeft: "5px solid #673ab7",
              minHeight: "100%",
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
                  color: "#673ab7",
                }}
              >
                <Payment /> Checkout / POS
              </Typography>

              {selectedOrder ? (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <Receipt fontSize="small" /> Order: {selectedOrder.id}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Items: {selectedOrder.items.join(", ")}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Total: ${selectedOrder.total}
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Select Payment Method:
                  </Typography>
                  <ToggleButtonGroup
                    value={paymentMethod}
                    exclusive
                    onChange={(e, val) => val && setPaymentMethod(val)}
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="cash">
                      <AttachMoney /> Cash
                    </ToggleButton>
                    <ToggleButton value="card">
                      <CreditCard /> Card
                    </ToggleButton>
                    <ToggleButton value="mobile">
                      <Smartphone /> Mobile
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<CheckCircle />}
                    >
                      Complete Payment
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<Cancel />}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography>Select an order to process</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
