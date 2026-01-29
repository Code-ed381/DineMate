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
  InputAdornment,
  CircularProgress,
  LinearProgress,
  ListItemText,
  alpha,
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
import { printReceipt } from "../components/PrintWindow";
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
    selectedOrderItems,
    loadingOrderItems,
    isProcessingPayment,
    processPayment,
    handlePrintBill,
    formatCashInput,
    closedSessions,
    allSessions,
    setSelected,
    selected,
    proceedToPayment,
    setProceedToPayment,
    subscribeToSessions,
    unsubscribeFromSessions,
  } = useCashierStore();

  const handlePrintReceipt = async (isFinal: boolean = false) => {
    if (!selectedSession) return;

    const cashValue = parseFloat(cashAmount) || 0;
    const cardValue = parseFloat(cardAmount) || 0;
    const calculatedTotal = selectedOrderItems.length > 0 
      ? selectedOrderItems.reduce((acc, item) => acc + (parseFloat(item.sum_price) || 0), 0)
      : (selectedSession.order_total || selectedSession.total || 0);

    const change = (cashValue + cardValue - calculatedTotal).toFixed(2);

    printReceipt(
      isFinal ? "ORD-" + selectedSession.order_id : "PROFORMA",
      "Cashier",
      selectedSession.table_number || "OTC",
      selectedOrderItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
      calculatedTotal,
      selectedOrderItems.map(item => ({ ...item, item_name: item.item_name, quantity: item.quantity, unit_price: item.unit_price })),
      (cashValue + cardValue).toFixed(2),
      cashValue.toFixed(2),
      cardValue.toFixed(2),
      change
    );

    if (!isFinal) {
      await handlePrintBill();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Bill printed successfully",
        showConfirmButton: false,
        timer: 1500,
      });
    }
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
            title: "Confirm Payment",
            html: `
              <div style="text-align: left; padding: 10px;">
                <p><b>Total Due:</b> £${formatCashInput(selectedSession.order_total)}</p>
                <p><b>Cash Paid:</b> £${formatCashInput(cashAmountNum)}</p>
                <hr/>
                <p style="font-size: 1.2rem; color: green;"><b>Change:</b> £${(cashAmountNum - selectedSession.order_total).toFixed(2)}</p>
              </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: theme.palette.success.main,
            cancelButtonColor: theme.palette.error.main,
            confirmButtonText: "Confirm & Print Receipt",
          }).then(async (result) => {
            if (result.isConfirmed) {
              await processPayment(
                selectedSession.session_id,
                selectedSession.order_id,
                selectedSession.table_id
              );
              handlePrintReceipt(true);
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
        const amount = parseFloat(session.order_total || session.total || 0);
        acc.total += amount;
        if (session.payment_method) {
          acc[session.payment_method] =
            (acc[session.payment_method] || 0) + amount;
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
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", mr: 2 }}><PriceCheckTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>£{formatCashInput(sessionStats.total)}</Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Sales</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: "success.main", mr: 2 }}><MoneyTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>£{formatCashInput(sessionStats.cash)}</Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Cash Revenue</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: "error.main", mr: 2 }}><CreditCardTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>£{formatCashInput(sessionStats.card)}</Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Card Revenue</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: "warning.main", mr: 2 }}><SecurityUpdateGoodTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>£{formatCashInput(sessionStats.momo)}</Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>MoMo Revenue</Typography>
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
                        <Box display="flex" alignItems="center" gap={0.5} color="primary.main" fontWeight={700}>
                          <AttachMoney fontSize="small" />£{formatCashInput(session.order_total || session.total)}
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5} sx={{ opacity: 0.7 }}>
                          <TableRestaurant fontSize="small" />T-{session.table_number || "OTC"}
                        </Box>
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
                          <TableCell>T-{session.table_number || "OTC"}</TableCell>
                          <TableCell>ORD-{session.order_id}</TableCell>
                          <TableCell>£{formatCashInput(session.order_total || session.total)}</TableCell>
                          <TableCell>
                            <Chip label={session.payment_method} size="small" variant="outlined" />
                          </TableCell>
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
                   <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                     <Typography fontWeight="bold">ORD-{selectedSession.order_id}</Typography>
                     <Chip label={selectedSession.table_number ? `Table ${selectedSession.table_number}` : 'Takeaway'} color="info" variant="outlined" size="small" />
                   </Stack>
                   
                   <Box sx={{ minHeight: 150, maxHeight: 300, overflowY: 'auto', mb: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2, p: 1 }}>
                     {loadingOrderItems ? (
                       <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
                     ) : (
                       <List disablePadding>
                         {selectedOrderItems.map((item: any, i: number) => (
                           <ListItem key={i} sx={{ px: 1, py: 0.5 }}>
                             <Avatar 
                               variant="rounded" 
                               src={item.image_url || "/placeholder-item.png"} 
                               sx={{ width: 40, height: 40, mr: 2, bgcolor: 'action.hover' }}
                             >
                               <Restaurant fontSize="small" />
                             </Avatar>
                             <ListItemText 
                               primary={<Typography variant="body2" fontWeight={600}>{item.item_name}</Typography>}
                               secondary={`${item.quantity} x £${formatCashInput(item.unit_price)}`}
                             />
                             <Typography variant="body2" fontWeight={700}>£{formatCashInput(item.sum_price)}</Typography>
                           </ListItem>
                         ))}
                       </List>
                     )}
                   </Box>

                   <Divider sx={{ my: 2 }} />
                   <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6" fontWeight={800}>Total Due</Typography>
                        <Typography variant="h6" color="primary" fontWeight={900}>
                          £{formatCashInput(
                            selectedOrderItems.length > 0 
                              ? selectedOrderItems.reduce((acc, item) => acc + (parseFloat(item.sum_price) || 0), 0)
                              : (selectedSession.order_total || selectedSession.total || 0)
                          )}
                        </Typography>
                      </Box>
                   </Stack>
                   
                   <Divider sx={{ my: 2 }} />
                   
                   {proceedToPayment ? (
                     <Box>
                       <TextField 
                        fullWidth 
                        label="Cash Amount" 
                        type="number" 
                        value={cashAmount} 
                        onChange={handleCashChange}
                        sx={{ mb: 2 }}
                        InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
                      />
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
                     </Box>
                   ) : (
                     <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Paper variant="outlined" sx={{ flex: 1, p: 1, textAlign: 'center', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">Quantity</Typography>
                          <Typography variant="body1" fontWeight={700}>{selectedOrderItems.reduce((acc, i) => acc + (i.quantity || 1), 0)}</Typography>
                        </Paper>
                        <Paper variant="outlined" sx={{ flex: 1, p: 1, textAlign: 'center', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">Tax</Typography>
                          <Typography variant="body1" fontWeight={700}>£0.00</Typography>
                        </Paper>
                     </Box>
                   )}

                   <Stack direction="row" spacing={2} mt={2}>
                      {!proceedToPayment && (
                        <Button fullWidth variant="outlined" startIcon={<ReceiptLong />} onClick={() => handlePrintReceipt(false)}>Bill</Button>
                      )}
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color={proceedToPayment ? "success" : "primary"}
                        onClick={handleProceedToPayment}
                        disabled={isProcessingPayment}
                        startIcon={isProcessingPayment ? <CircularProgress size={20} color="inherit" /> : null}
                      >
                        {proceedToPayment ? "Confirm Pay" : "Proceed to Pay"}
                      </Button>
                   </Stack>
                   {proceedToPayment && (
                     <Button fullWidth onClick={() => setProceedToPayment(false)} sx={{ mt: 1 }}>Back to Summary</Button>
                   )}
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
