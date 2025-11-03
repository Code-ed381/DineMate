import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "@mui/material/styles";
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
  TableContainer,
  Paper,
  TextField,
  Avatar,
  Radio,
} from "@mui/material";
import {
  Receipt,
  ShoppingCart,
  Payment,
  AttachMoney,
  CreditCard,
  Smartphone,
  History,
  Replay,
  LocalOffer,
  Add,
  Person,
  ReceiptLong,
  ShoppingCartCheckout,
  AccessTime,
  Restaurant,
  TableRestaurant,
} from "@mui/icons-material";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import useCashierStore from "../lib/cashierStore";
import {
  formatDateTime,
  formatDateTimeWithSuffix,
} from "../utils/format-datetime";
import CreditCardTwoToneIcon from "@mui/icons-material/CreditCardTwoTone";
import MoneyTwoToneIcon from "@mui/icons-material/MoneyTwoTone";
import PriceCheckTwoToneIcon from "@mui/icons-material/PriceCheckTwoTone";
import SecurityUpdateGoodTwoToneIcon from "@mui/icons-material/SecurityUpdateGoodTwoTone";
import OrdersAwaitingPayment from "../components/active-orders-view";
import CashierDashboardSkeleton from "../components/skeletons/cashier-panel-skeleton";

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
  const {
    activeSessions,
    loadingActiveSessionByRestaurant,
    getActiveSessionByRestaurant,
    setCashAmount,
    setCardAmount,
    setMomoAmount,
    handlePaymentMethodChange,
    cashAmount,
    cardAmount,
    momoAmount,
    paymentMethod,
    setPaymentMethod,
    setSelectedSession,
    selectedSession,
    handlePayment,
    handlePrintBill,
    closedSessions,
    allSessions,
    setSelected,
    selected,
    proceedToPayment,
    setProceedToPayment,
    subscribeToSessions, // ✅ Add
    unsubscribeFromSessions, // ✅ Add
  } = useCashierStore();
  const [discount, setDiscount] = useState(0);

  const theme = useTheme();

  useEffect(() => {
    getActiveSessionByRestaurant();
    subscribeToSessions(); // ✅ Subscribe

    return () => {
      unsubscribeFromSessions(); // ✅ Cleanup
    };
  }, []);

  const handleCashChange = (e) => {
    const { value } = e.target;
    const regex = /^\d+(\.\d{0,2})?$/;

    if (value === "" || regex.test(value)) {
      setCashAmount(value);
    }
  };

  const options = [
    {
      value: "active",
      title: "Active",
      text: "View sessions that are currently open",
    },
    {
      value: "recent",
      title: "Recent",
      text: "View sessions that were recently closed",
    },
  ];

  const handleDiscountChange = (e) => {
    const { value } = e.target;
    const regex = /^\d+(\.\d{0,2})?$/;

    if (value === "" || regex.test(value)) {
      let num = parseFloat(value);

      if (!isNaN(num)) {
        // clamp the discount to not exceed the order_total
        const maxDiscount = Number(selectedSession?.order_total) || 0;
        if (num > maxDiscount) {
          num = maxDiscount;
        }
        setDiscount(num.toString());
      } else {
        setDiscount(value); // allow empty string
      }
    }
  };


  const handleProceedToPayment = () => {
    if (!proceedToPayment) {
      setProceedToPayment(true);
    }
    else {
      handlePayment();
      setProceedToPayment(false);
    }
  };

  const sessionStats = useMemo(() => {
    return allSessions.reduce(
      (acc, session) => {
        acc.total += session.order_total || 0;

        if (session.payment_method) {
          acc[session.payment_method] =
            (acc[session.payment_method] || 0) + (session.order_total || 0);
        }

        return acc;
      },
      { total: 0, cash: 0, card: 0, momo: 0 }
    );
  }, [allSessions]);


  return (
    <>
      {loadingActiveSessionByRestaurant ? (
        <CashierDashboardSkeleton />
      ) : (
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            {/* Summary Bar */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    <PriceCheckTwoToneIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{sessionStats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                    <MoneyTwoToneIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{sessionStats.cash}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cash
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar sx={{ bgcolor: "error.main", mr: 2 }}>
                    <CreditCardTwoToneIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{sessionStats.card}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Card
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar sx={{ bgcolor: "warning.main", mr: 2 }}>
                    <SecurityUpdateGoodTwoToneIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{sessionStats.momo}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Momo
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {/* LEFT SIDE */}
            <Grid item xs={12} md={7}>
              {/* Select */}
              <Box display="flex" gap={1} sx={{ mb: 2 }}>
                {options.map((opt) => (
                  <Paper
                    key={opt.value}
                    onClick={() => setSelected(opt.value)}
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      cursor: "pointer",
                      border:
                        selected === opt.value
                          ? `2px solid ${theme.palette.primary.main}`
                          : `1px solid ${theme.palette.divider}`,
                      backgroundColor:
                        selected === opt.value
                          ? theme.palette.action.selected
                          : theme.palette.background.paper,
                    }}
                    elevation={selected === opt.value ? 3 : 1}
                  >
                    <Radio
                      checked={selected === opt.value}
                      onChange={() => setSelected(opt.value)}
                      value={opt.value}
                      color="primary"
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {opt.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {opt.text}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* Orders */}
              {selected === "active" && (
                <Card
                  sx={{
                    borderRadius: 3,
                    mb: 3,
                    borderLeft: "5px solid gold",
                    maxHeight: "calc(100vh - 200px)",
                    overflowY: "auto",
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
                      }}
                    >
                      <ShoppingCart /> Orders Awaiting Payment
                    </Typography>
                    <Divider />
                    <List>
                      {activeSessions.map((session) => (
                        <ListItem
                          key={session.id}
                          button
                          onClick={() => setSelectedSession(session)}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            mb: 1,
                            mt: 2,
                            p: 2,
                            "&:hover": { backgroundColor: "action.hover" },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          {/* Top Row: Order ID and Status */}
                          <Box
                            sx={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              <Receipt
                                fontSize="small"
                                sx={{ mr: 0.5 }}
                                color="action"
                              />
                              ORD-{session.order_id}
                            </Typography>
                            <Chip
                              label={session.session_status}
                              color={
                                session.session_status === "billed"
                                  ? "warning"
                                  : session.session_status === "open"
                                  ? "info"
                                  : "error"
                              }
                              size="small"
                            />
                          </Box>

                          {/* Second Row: Details Grid */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 1,
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <AttachMoney fontSize="small" color="action" />
                              <Typography variant="body2">
                                Total: ${session.order_total}
                              </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" gap={1}>
                              <TableRestaurant
                                fontSize="small"
                                color="action"
                              />
                              <Typography variant="body2">
                                Table {session.table_number ?? "N/A"}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Person fontSize="small" color="action" />
                              <Typography variant="body2">
                                {session.waiter_first_name}{" "}
                                {session.waiter_last_name}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <AccessTime fontSize="small" color="action" />
                              <Typography variant="body2">
                                {formatDateTimeWithSuffix(session.opened_at)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Restaurant fontSize="small" color="action" />
                            <Typography variant="body2">
                              {session.order_items
                                .map((item) => item.menu_item.name)
                                .join(", ")}
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Transactions */}
              {selected === "recent" && (
                <Card
                  sx={{
                    borderRadius: 3,
                    mb: 3,
                    borderLeft: "5px solid #ff5252",
                    maxHeight: "calc(100vh - 200px)",
                    overflowY: "auto",
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
                      }}
                    >
                      <History /> Recent Transactions
                    </Typography>
                    <Divider />
                    <Table sx={{ mt: 1 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <TableRestaurant fontSize="small" /> Table
                          </TableCell>
                          <TableCell>
                            <Receipt fontSize="small" /> Order
                          </TableCell>
                          <TableCell>
                            <AttachMoney fontSize="small" /> Amount
                          </TableCell>
                          <TableCell>
                            <Payment fontSize="small" /> Method
                          </TableCell>
                          <TableCell>
                            <AccessTime fontSize="small" /> Closed At
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {closedSessions.map((session) => (
                          <TableRow key={session.session_id}>
                            <TableCell>{session.table_number}</TableCell>
                            <TableCell>ORD-{session.order_id}</TableCell>
                            <TableCell>${session.order_total}</TableCell>
                            <TableCell>{session.payment_method}</TableCell>
                            <TableCell>
                              {formatDateTime(session.closed_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              {/* <Card sx={{ borderRadius: 3, borderLeft: "5px solid #9c27b0" }}>
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
            </Card> */}
            </Grid>

            {/* RIGHT SIDE - POS */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  borderRadius: 3,
                  borderLeft: "5px solid green",
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
                      // color: "green",
                    }}
                  >
                    <Payment /> Checkout
                  </Typography>
                  <Divider />

                  {selectedSession ? (
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 1, mt: 2, fontWeight: 600 }}
                      >
                        <Receipt fontSize="small" /> ORD-{" "}
                        {selectedSession?.order_id}
                      </Typography>

                      {/* Order Items Table */}
                      <TableContainer
                        component={Paper}
                        sx={{ mb: 2, borderRadius: 2 }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Item</TableCell>
                              <TableCell align="right">Price</TableCell>
                              <TableCell align="center">Qty</TableCell>
                              <TableCell align="right">Amount</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedSession.order_items.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.menu_item.name}</TableCell>
                                <TableCell align="right">
                                  {item.menu_item.price}
                                </TableCell>
                                <TableCell align="center">
                                  {item.quantity}
                                </TableCell>
                                <TableCell align="right">
                                  {item.menu_item.price * item.quantity}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Totals Section */}
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Subtotal</span>
                          <b>{selectedSession.order_total}</b>
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Discount</span>
                          <b>{discount ?? 0}</b>
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Tax</span>
                          <b>{selectedSession.order_tax ?? 0}</b>
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography
                          variant="h6"
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Total</span>
                          <span>
                            $
                            {selectedSession.order_total -
                              (discount ?? 0) +
                              (selectedSession.order_tax ?? 0)}
                          </span>
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />

                      {/* Payment Methods */}
                      {proceedToPayment && (
                        <Box>
                          <ToggleButtonGroup
                            value={paymentMethod}
                            fullWidth
                            exclusive
                            onChange={(e, val) => val && setPaymentMethod(val)}
                            sx={{ mb: 2 }}
                          >
                            <ToggleButton value="cash" sx={{ p: 2 }}>
                              <AttachMoney /> Cash
                            </ToggleButton>
                            <ToggleButton value="mobile" sx={{ p: 2 }}>
                              <Smartphone /> MoMo
                            </ToggleButton>
                            <ToggleButton value="card" sx={{ p: 3 }}>
                              <CreditCard /> Card
                            </ToggleButton>
                          </ToggleButtonGroup>

                          <Box>
                            {paymentMethod === "cash" && (
                              <>
                                <TextField
                                  required
                                  fullWidth
                                  variant="outlined"
                                  label="Cash Amount Received"
                                  type="text"
                                  value={cashAmount}
                                  onChange={handleCashChange}
                                  sx={{ mb: 2 }}
                                />

                                <TextField
                                  required
                                  fullWidth
                                  variant="outlined"
                                  label="Discount"
                                  type="text"
                                  value={discount}
                                  onChange={handleDiscountChange}
                                  sx={{ mb: 2 }}
                                />
                              </>
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* Actions */}
                      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        <Button
                          variant="contained"
                          color="info"
                          fullWidth
                          sx={{ textTransform: "none", p: 4 }}
                          startIcon={<ReceiptLong />}
                          onClick={handlePrintBill}
                        >
                          Print Bill
                        </Button>
                        <Button
                          variant={proceedToPayment ? "contained" : "outlined"}
                          color="success"
                          fullWidth
                          sx={{ textTransform: "none", p: 4 }}
                          startIcon={<ShoppingCartCheckout />}
                          onClick={handleProceedToPayment}
                        >
                          {proceedToPayment ? "Pay" : "Proceed to Pay"}
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
      )}
    </>
  );
}
