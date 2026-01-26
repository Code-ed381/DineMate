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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  Avatar,
  Radio,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
} from "@mui/material";
import Swal from "sweetalert2";
import {
  Receipt,
  ShoppingCart,
  Payment,
  AttachMoney,
  CreditCard,
  Smartphone,
  History,
  ReceiptLong,
  ShoppingCartCheckout,
  AccessTime,
  Restaurant,
  TableRestaurant,
  Person,
} from "@mui/icons-material";
import CreditCardTwoToneIcon from "@mui/icons-material/CreditCardTwoTone";
import MoneyTwoToneIcon from "@mui/icons-material/MoneyTwoTone";
import PriceCheckTwoToneIcon from "@mui/icons-material/PriceCheckTwoTone";
import SecurityUpdateGoodTwoToneIcon from "@mui/icons-material/SecurityUpdateGoodTwoTone";
import useCashierStore from "../lib/cashierStore";
import {
  formatDateTime,
  formatDateTimeWithSuffix,
} from "../utils/format-datetime";
import CashierDashboardSkeleton from "../components/skeletons/cashier-panel-skeleton";

const CashierDashboard: React.FC = () => {
  const {
    activeSessions,
    loadingActiveSessionByRestaurant,
    getActiveSessionByRestaurant,
    setCashAmount,
    setCardAmount,
    setMomoAmount,
    cashAmount,
    cardAmount,
    momoAmount,
    paymentMethod,
    setPaymentMethod,
    setSelectedSession,
    selectedSession,
    processPayment,
    handlePrintBill,
    closedSessions,
    allSessions,
    setSelected,
    selected,
    proceedToPayment,
    setProceedToPayment,
    subscribeToSessions,
    unsubscribeFromSessions,
  } = useCashierStore();

  const handlePrintBillClicked = async () => {
    await handlePrintBill();
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Bill printed successfully",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const [discount, setDiscount] = useState("0");
  const theme = useTheme();

  useEffect(() => {
    getActiveSessionByRestaurant();
    subscribeToSessions();

    return () => {
      unsubscribeFromSessions();
    };
  }, [getActiveSessionByRestaurant, subscribeToSessions, unsubscribeFromSessions]);

  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const regex = /^\d+(\.\d{0,2})?$/;
    if (value === "" || regex.test(value)) {
      setCashAmount(value);
    }
  };

  const options = [
    { value: "active", title: "Active", text: "View sessions that are currently open" },
    { value: "recent", title: "Recent", text: "View sessions that were recently closed" },
  ];

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const regex = /^\d+(\.\d{0,2})?$/;
    if (value === "" || regex.test(value)) {
        setDiscount(value);
    }
  };

  const handleProceedToPayment = () => {
    if (!proceedToPayment) {
      setProceedToPayment(true);
    } else {
      if (!selectedSession) return;

      const cashAmountNum = Number(cashAmount);
      if (paymentMethod === "cash") {
        if (cashAmountNum <= 0) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Please enter cash amount",
          });
          return;
        } else if (cashAmountNum < selectedSession.order_total) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Cash amount is less than order total",
          });
          return;
        } else if (cashAmountNum >= selectedSession.order_total) {
          Swal.fire({
            title: `Total Amount: ${selectedSession.order_total.toFixed(2)}`,
            html: '<div id="swal-content"></div>',
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, confirm",
            didOpen: () => {
              const rootElement = document.getElementById("swal-content");
              if (rootElement) {
                const root = (require("react-dom/client") as any).createRoot(rootElement);
                root.render(
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Cash Paid: {cashAmountNum.toFixed(2)}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      Change:{" "}
                      {(cashAmountNum - selectedSession.order_total).toFixed(2)}
                    </Typography>
                  </Box>
                );
              }
            },
          }).then(async (result) => {
            if (result.isConfirmed) {
              await processPayment(
                selectedSession.session_id,
                selectedSession.order_id,
                selectedSession.table_id
              );
              Swal.fire({
                icon: "success",
                title: "Success",
                text: "Payment made successfully",
                showConfirmButton: false,
                timer: 1500,
              });
              setProceedToPayment(false);
            }
          });
        }
      } else {
        // Handle other payment methods if needed
        processPayment(
          selectedSession.session_id,
          selectedSession.order_id,
          selectedSession.table_id
        ).then(() => {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Payment made successfully",
            showConfirmButton: false,
            timer: 1500,
          });
          setProceedToPayment(false);
        });
      }
    }
  };

  const sessionStats = useMemo(() => {
    return allSessions.reduce(
      (acc: any, session: any) => {
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

  if (loadingActiveSessionByRestaurant) return <CashierDashboardSkeleton />;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}><PriceCheckTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h6">{sessionStats.total.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">Total</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "success.main", mr: 2 }}><MoneyTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h6">{sessionStats.cash.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">Cash</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "error.main", mr: 2 }}><CreditCardTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h6">{sessionStats.card.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">Card</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <Avatar sx={{ bgcolor: "warning.main", mr: 2 }}><SecurityUpdateGoodTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h6">{sessionStats.momo.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">Momo</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            {options.map((opt) => (
              <Paper
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                sx={{
                  flex: 1, p: 2, cursor: "pointer",
                  border: selected === opt.value ? `2px solid ${theme.palette.primary.main}` : "1px solid divider",
                  display: "flex", alignItems: "center", gap: 2
                }}
              >
                <Radio checked={selected === opt.value} value={opt.value} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{opt.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{opt.text}</Typography>
                </Box>
              </Paper>
            ))}
          </Stack>

          {selected === "active" && (
            <Card sx={{ borderRadius: 3, borderLeft: "5px solid gold", maxHeight: "70vh", overflowY: "auto" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <ShoppingCart /> Orders Awaiting Payment
                </Typography>
                <Divider />
                <List>
                  {activeSessions.map((session: any) => (
                    <ListItem
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      sx={{
                        border: "1px solid divider", borderRadius: 2, mb: 1, mt: 2, p: 2, cursor: "pointer",
                        flexDirection: "column", alignItems: "flex-start",
                        "&:hover": { bgcolor: "action.hover" }
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" width="100%" mb={1}>
                        <Typography fontWeight="bold">ORD-{session.order_id}</Typography>
                        <Chip label={session.session_status} color="warning" size="small" />
                      </Stack>
                      <Stack direction="row" spacing={2} mb={1}>
                        <Box display="flex" alignItems="center" gap={0.5}><AttachMoney fontSize="small" />{session.order_total}</Box>
                        <Box display="flex" alignItems="center" gap={0.5}><TableRestaurant fontSize="small" />T-{session.table_number}</Box>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {selected === "recent" && (
            <Card sx={{ borderRadius: 3, borderLeft: "5px solid red", maxHeight: "70vh", overflowY: "auto" }}>
              <CardContent>
                 <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <History /> Recent Transactions
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Table</TableCell>
                        <TableCell>Order</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Method</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {closedSessions.map((session: any) => (
                        <TableRow key={session.id}>
                          <TableCell>{session.table_number}</TableCell>
                          <TableCell>ORD-{session.order_id}</TableCell>
                          <TableCell>{session.order_total}</TableCell>
                          <TableCell>{session.payment_method}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, borderLeft: "5px solid green" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Payment /> Checkout
              </Typography>
              {selectedSession ? (
                <Box>
                   <Typography fontWeight="bold" sx={{ mb: 2 }}>ORD-{selectedSession.order_id}</Typography>
                   {/* Items Table omitted for brevity but should be there in full impl */}
                   <Divider sx={{ my: 2 }} />
                   <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between"><span>Total</span><span>${selectedSession.order_total}</span></Box>
                   </Stack>
                   <Divider sx={{ my: 2 }} />
                   {proceedToPayment && (
                     <ToggleButtonGroup
                        value={paymentMethod}
                        exclusive
                        fullWidth
                        onChange={(_e, val) => val && setPaymentMethod(val)}
                        sx={{ mb: 2 }}
                     >
                        <ToggleButton value="cash">Cash</ToggleButton>
                        <ToggleButton value="card">Card</ToggleButton>
                        <ToggleButton value="momo">MoMo</ToggleButton>
                     </ToggleButtonGroup>
                   )}
                   <Stack direction="row" spacing={2} mt={2}>
                      <Button fullWidth variant="outlined" startIcon={<ReceiptLong />} onClick={handlePrintBillClicked}>Print Bill</Button>
                      <Button fullWidth variant="contained" color="success" onClick={handleProceedToPayment}>
                        {proceedToPayment ? "Pay" : "Proceed"}
                      </Button>
                   </Stack>
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
};

export default CashierDashboard;
