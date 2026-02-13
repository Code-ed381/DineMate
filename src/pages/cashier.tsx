import React, { useEffect, useMemo } from "react";
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
  ShoppingCart,
  Payment,
  History,
  ReceiptLong,
  Restaurant,
  TableRestaurant,
} from "@mui/icons-material";
import CreditCardTwoToneIcon from "@mui/icons-material/CreditCardTwoTone";
import MoneyTwoToneIcon from "@mui/icons-material/MoneyTwoTone";
import PriceCheckTwoToneIcon from "@mui/icons-material/PriceCheckTwoTone";
import SecurityUpdateGoodTwoToneIcon from "@mui/icons-material/SecurityUpdateGoodTwoTone";
import useCashierStore from "../lib/cashierStore";
import { printReceipt } from "../components/PrintWindow";
import CashierDashboardSkeleton from "../components/skeletons/cashier-panel-skeleton";
import { useCurrency } from "../utils/currency";

const CashierDashboard: React.FC = () => {
  const { currencySymbol } = useCurrency();
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
    activeSeesionByRestaurantLoaded,
    discount,
    setDiscount,
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

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const regex = /^\d+(\.\d{0,2})?$/;
    if (value === "" || regex.test(value)) {
      setCardAmount(value);
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
      const discountPercent = parseFloat(discount) || 0;
      const baseTotal = selectedSession?.order_total || 0;
      const discountAmount = (baseTotal * discountPercent) / 100;
      const totalDue = Math.max(0, baseTotal - discountAmount);

      // Auto-fill amount for single payment methods
      if (paymentMethod === "cash") setCashAmount(totalDue.toFixed(2));
      if (paymentMethod === "card") setCardAmount(totalDue.toFixed(2));
      if (paymentMethod === "momo") setMomoAmount(totalDue.toFixed(2));
    } else {
      if (!selectedSession) return;

      const cashNum = parseFloat(cashAmount) || 0;
      const cardNum = parseFloat(cardAmount) || 0;
      const momoNum = parseFloat(momoAmount) || 0;
      const discountPercent = parseFloat(discount) || 0;
      const baseTotal = selectedSession.order_total;
      const discountAmount = (baseTotal * discountPercent) / 100;
      const totalDue = Math.max(0, baseTotal - discountAmount);

      const validatePayment = () => {
        if (paymentMethod === "cash" && cashNum < totalDue) return "Insufficient cash amount";
        if (paymentMethod === "card" && cardNum < totalDue) return "Insufficient card amount";
        if (paymentMethod === "momo" && momoNum < totalDue) return "Insufficient momo amount";
        if (paymentMethod === "card+cash" && (cashNum + cardNum) < totalDue) return "Total paid (Cash + Card) is less than total due";
        return null;
      };

      const error = validatePayment();
      if (error) {
        Swal.fire({ icon: "error", title: "Oops...", text: error });
        return;
      }

      const totalPaid = cashNum + cardNum + momoNum;
      const change = Math.max(0, totalPaid - totalDue);

      Swal.fire({
        title: "Confirm Payment",
        html: `
          <div style="text-align: left; padding: 10px;">
            <p><b>Subtotal:</b> ${currencySymbol}${formatCashInput(baseTotal)}</p>
            ${discountPercent > 0 ? `<p style="color: red;"><b>Discount (${discountPercent}%):</b> -${currencySymbol}${formatCashInput(discountAmount)}</p>` : ""}
            <p><b>Total Due:</b> ${currencySymbol}${formatCashInput(totalDue)}</p>
            <p><b>Method:</b> ${paymentMethod.toUpperCase()}</p>
            <hr/>
            ${cashNum > 0 ? `<p><b>Cash:</b> ${currencySymbol}${formatCashInput(cashNum)}</p>` : ""}
            ${cardNum > 0 ? `<p><b>Card:</b> ${currencySymbol}${formatCashInput(cardNum)}</p>` : ""}
            ${momoNum > 0 ? `<p><b>MoMo:</b> ${currencySymbol}${formatCashInput(momoNum)}</p>` : ""}
            <p style="font-size: 1.2rem; color: green;"><b>Change:</b> ${currencySymbol}${change.toFixed(2)}</p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: theme.palette.success.main,
        confirmButtonText: "Confirm & Print",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await processPayment(selectedSession.session_id, selectedSession.order_id, selectedSession.table_id);
          handlePrintReceipt(true);
          setProceedToPayment(false);
        }
      });
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
      { total: 0, cash: 0, card: 0, momo: 0, online: 0, "card+cash": 0 }
    );
  }, [allSessions]);

  if (!activeSeesionByRestaurantLoaded && loadingActiveSessionByRestaurant) return <CashierDashboardSkeleton />;

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      {loadingActiveSessionByRestaurant && (
        <LinearProgress 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: theme.zIndex.drawer + 2,
            height: 3
          }} 
        />
      )}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", mr: 2 }}><PriceCheckTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>{currencySymbol}{formatCashInput(sessionStats.total)}</Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Sales</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: "success.main", mr: 2 }}><MoneyTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>{currencySymbol}{formatCashInput(sessionStats.cash)}</Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Cash Revenue</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: "error.main", mr: 2 }}><CreditCardTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>{currencySymbol}{formatCashInput(sessionStats.card)}</Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Card Revenue</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: "flex", alignItems: "center", borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: "warning.main", mr: 2 }}><SecurityUpdateGoodTwoToneIcon /></Avatar>
            <Box>
              <Typography variant="h5" fontWeight={800}>{currencySymbol}{formatCashInput(sessionStats.momo)}</Typography>
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
                          {currencySymbol}{formatCashInput(session.order_total || session.total)}
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
                          <TableCell>{currencySymbol}{formatCashInput(session.order_total || session.total)}</TableCell>
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
                <Box>
                   <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                     <Typography fontWeight="bold">
                       {selectedSession ? `ORD-${selectedSession.order_id}` : 'No Order Selected'}
                     </Typography>
                     {selectedSession && (
                       <Chip label={selectedSession.table_number ? `Table ${selectedSession.table_number}` : 'Takeaway'} color="info" variant="outlined" size="small" />
                     )}
                   </Stack>
                   
                   <Box sx={{ minHeight: 150, maxHeight: 300, overflowY: 'auto', mb: 2, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2, p: 1 }}>
                     {loadingOrderItems ? (
                       <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
                     ) : (
                       <List disablePadding>
                         {selectedOrderItems.length > 0 ? selectedOrderItems.map((item: any, i: number) => (
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
                               secondary={`${item.quantity} x ${currencySymbol}${formatCashInput(item.unit_price)}`}
                             />
                             <Typography variant="body2" fontWeight={700}>{currencySymbol}{formatCashInput(item.sum_price)}</Typography>
                           </ListItem>
                         )) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, opacity: 0.5 }}>
                              <ShoppingCart sx={{ fontSize: 40, mb: 1 }} />
                              <Typography variant="body2">No items in checkout</Typography>
                            </Box>
                         )}
                       </List>
                     )}
                   </Box>

                   <Divider sx={{ my: 2 }} />
                    <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between" sx={{ opacity: 0.7 }}>
                          <Typography variant="body1">Subtotal</Typography>
                          <Typography variant="body1">
                            {currencySymbol}{formatCashInput(
                              selectedOrderItems.length > 0 
                                ? selectedOrderItems.reduce((acc, item) => acc + (parseFloat(item.sum_price) || 0), 0)
                                : (selectedSession?.order_total || selectedSession?.total || 0)
                            )}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" sx={{ color: 'error.main', opacity: 0.8 }}>
                          <Typography variant="body1">Discount ({discount || 0}%)</Typography>
                          <Typography variant="body1">
                             -{currencySymbol}{formatCashInput(
                              ((selectedOrderItems.length > 0 
                                ? selectedOrderItems.reduce((acc, item) => acc + (parseFloat(item.sum_price) || 0), 0)
                                : (selectedSession?.order_total || selectedSession?.total || 0)) * (parseFloat(discount) || 0)) / 100
                            )}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="h6" fontWeight={800}>Total Due</Typography>
                          <Typography variant="h6" color="primary" fontWeight={900}>
                            {currencySymbol}{formatCashInput(
                              Math.max(0, (selectedOrderItems.length > 0 
                                ? selectedOrderItems.reduce((acc, item) => acc + (parseFloat(item.sum_price) || 0), 0)
                                : (selectedSession?.order_total || selectedSession?.total || 0)) * (1 - (parseFloat(discount) || 0) / 100))
                            )}
                          </Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {!proceedToPayment && (selectedSession?.session_status === "open" || selectedSession?.session_status === "billed" || !selectedSession) && (
                      <TextField 
                        fullWidth 
                        label="Apply Discount (%)" 
                        type="number" 
                        value={discount} 
                        onChange={handleDiscountChange}
                        disabled={!selectedSession}
                        sx={{ mb: 2 }}
                        InputProps={{ startAdornment: <InputAdornment position="start">%</InputAdornment> }}
                      />
                    )}
                   
                   {proceedToPayment ? (
                     <Box>
                       {(paymentMethod === "cash" || paymentMethod === "card+cash") && (
                         <TextField 
                            fullWidth 
                            label="Cash Amount" 
                            type="number" 
                            value={cashAmount} 
                            onChange={handleCashChange}
                            sx={{ mb: 2 }}
                            InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                          />
                       )}
                       {(paymentMethod === "card" || paymentMethod === "card+cash") && (
                         <TextField 
                            fullWidth 
                            label="Card Amount" 
                            type="number" 
                            value={cardAmount} 
                            onChange={handleCardChange}
                            sx={{ mb: 2 }}
                            InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                          />
                       )}
                       {paymentMethod === "momo" && (
                         <TextField 
                            fullWidth 
                            label="MoMo Amount" 
                            value={momoAmount}
                            onChange={(e) => setMomoAmount(e.target.value)}
                            sx={{ mb: 2 }}
                            InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                          />
                       )}
                       <ToggleButtonGroup
                          value={paymentMethod}
                          exclusive
                          fullWidth
                          onChange={(_e, val) => val && setPaymentMethod(val)}
                          sx={{ mb: 2 }}
                          size="small"
                       >
                          <ToggleButton value="cash">Cash</ToggleButton>
                          <ToggleButton value="card">Card</ToggleButton>
                          <ToggleButton value="card+cash" sx={{ textTransform: 'none' }}>Card+Cash</ToggleButton>
                          <ToggleButton value="momo">MoMo</ToggleButton>
                          <ToggleButton value="online">Online</ToggleButton>
                       </ToggleButtonGroup>
                     </Box>
                   ) : null}

                   <Stack direction="row" spacing={2} mt={2}>
                      {!proceedToPayment && (
                        <Button fullWidth variant="outlined" startIcon={<ReceiptLong />} onClick={() => handlePrintReceipt(false)} disabled={!selectedSession}>Bill</Button>
                      )}
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color={proceedToPayment ? "success" : "primary"}
                        onClick={handleProceedToPayment}
                        disabled={isProcessingPayment || !selectedSession}
                        startIcon={isProcessingPayment ? <CircularProgress size={20} color="inherit" /> : null}
                      >
                        {proceedToPayment ? "Confirm Pay" : "Proceed to Pay"}
                      </Button>
                   </Stack>
                   {proceedToPayment && (
                     <Button fullWidth onClick={() => setProceedToPayment(false)} sx={{ mt: 1 }}>Back to Summary</Button>
                   )}
                </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CashierDashboard;
