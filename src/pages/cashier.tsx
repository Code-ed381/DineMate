import React, { useEffect, useMemo, useState, useRef } from "react";
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
  useMediaQuery,
  Drawer,
  Fab,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Collapse,
  Tooltip,
} from "@mui/material";
import Swal from "sweetalert2";
import {
  ShoppingCart,
  Payment,
  History,
  ReceiptLong,
  Restaurant,
  TableRestaurant,
  Cancel,
  Warning,
  Close,
  Download,
  FileDownload,
  Description,
  Print,
  FilterList,
  Search,
  Refresh,
} from "@mui/icons-material";
import CreditCardTwoToneIcon from "@mui/icons-material/CreditCardTwoTone";
import MoneyTwoToneIcon from "@mui/icons-material/MoneyTwoTone";
import PriceCheckTwoToneIcon from "@mui/icons-material/PriceCheckTwoTone";
import SecurityUpdateGoodTwoToneIcon from "@mui/icons-material/SecurityUpdateGoodTwoTone";
import useCashierStore from "../lib/cashierStore";
import useRestaurantStore from "../lib/restaurantStore";
import { printReceipt } from "../components/PrintWindow";
import CashierDashboardSkeleton from "../components/skeletons/cashier-panel-skeleton";
import EmptyState from "../components/empty-state";
import { useCurrency } from "../utils/currency";
import useAppStore from "../lib/appstore";
import { useSettings } from "../providers/settingsProvider";
import { 
  exportToCSV, 
  exportToExcel, 
  exportToTXT, 
  exportToPDF 
} from "../utils/exportUtils";
import { useFeatureGate } from "../hooks/useFeatureGate";

const CashierDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { setBreadcrumb } = useAppStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setBreadcrumb("Cashier");
  }, [setBreadcrumb]);

  const { currencySymbol } = useCurrency();
  const { settings } = useSettings();
  const cs = (settings as any).cashier_settings || {};
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
    historyFilters,
    setHistoryFilters,
    fetchReportSessions,
    isFetchingHistory,
  } = useCashierStore();
  const { selectedRestaurant } = useRestaurantStore();

  const hasUnserved = useMemo(() => {
    return selectedOrderItems.some((item: any) => 
      (item.type === 'food' || item.type === 'drink') && 
      item.status !== 'served' && 
      item.status !== 'cancelled'
    );
  }, [selectedOrderItems]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isMobile && selectedSession) {
      setDrawerOpen(true);
    }
  }, [selectedSession]);

  const { canAccess } = useFeatureGate();
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [showHistoryFilters, setShowHistoryFilters] = useState(false);

  const handleExportClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!canAccess("canUseCsvExport")) {
      Swal.fire("Upgrade Required", "Please upgrade your plan to export data.", "info");
      return;
    }
    setExportAnchorEl(e.currentTarget);
  };
  const handleExportClose = () => setExportAnchorEl(null);

  const getExportData = () => {
    return closedSessions.map((session) => ({
      "Date": new Date(session.closed_at).toLocaleDateString(),
      "Time": new Date(session.closed_at).toLocaleTimeString(),
      "Order ID": `ORD-${session.order_id}`,
      "Table": session.table_number || "OTC",
      [`Total (${currencySymbol})`]: formatCashInput(session.order_total || session.total),
      "Payment Method": session.payment_method || "N/A",
      "Discount": session.discount ? `${session.discount}%` : "0%",
    }));
  };

  const handleExportCSV = () => { handleExportClose(); exportToCSV(getExportData(), `transactions_${new Date().toISOString().split("T")[0]}`); };
  const handleExportExcel = () => { handleExportClose(); exportToExcel(getExportData(), `transactions_${new Date().toISOString().split("T")[0]}`); };
  const handleExportTXT = () => { handleExportClose(); exportToTXT(getExportData(), `transactions_${new Date().toISOString().split("T")[0]}`); };
  const handleExportPDF = () => { handleExportClose(); exportToPDF(getExportData(), `transactions_${new Date().toISOString().split("T")[0]}`, "Recent Transactions"); };

  const renderCheckout = () => {
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", p: isMobile ? 3 : 0 }}>
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={900}>Checkout Summary</Typography>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ bgcolor: 'action.hover' }}>
              <Close />
            </IconButton>
          </Box>
        )}
        {selectedSession ? (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography fontWeight="bold" variant="h6">
                ORD-{selectedSession.order_id}
              </Typography>
              <Chip
                label={
                  selectedSession.table_number
                    ? `Table ${selectedSession.table_number}`
                    : "Takeaway"
                }
                color="info"
                variant="outlined"
                size="small"
              />
            </Stack>

            <Box
              sx={{
                minHeight: 150,
                maxHeight: isMobile ? "40vh" : 300,
                overflowY: "auto",
                mb: 2,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 2,
                p: 1,
              }}
            >
              {loadingOrderItems ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List disablePadding>
                  {selectedOrderItems.length > 0 ? (
                    selectedOrderItems.map((item: any, i: number) => (
                      <ListItem key={i} sx={{ px: 1, py: 0.5 }}>
                        <Avatar
                          variant="rounded"
                          src={item.image_url || "/placeholder-item.png"}
                          sx={{
                            width: 40,
                            height: 40,
                            mr: 2,
                            bgcolor: "action.hover",
                          }}
                        >
                          <Restaurant fontSize="small" />
                        </Avatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600}>
                              {item.item_name}
                            </Typography>
                          }
                          secondary={`${item.quantity} x ${currencySymbol}${formatCashInput(item.unit_price)}`}
                        />
                        <Typography variant="body2" fontWeight={700}>
                          {currencySymbol}
                          {formatCashInput(item.sum_price)}
                        </Typography>
                      </ListItem>
                    ))
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 4,
                        opacity: 0.5,
                      }}
                    >
                      <ShoppingCart sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="body2">
                        No items in checkout
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </Box>

            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={0.75}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
                sx={{ opacity: 0.7 }}
              >
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {currencySymbol}
                  {formatCashInput(
                    selectedOrderItems.length > 0
                      ? selectedOrderItems.reduce(
                          (acc, item) =>
                            acc + (parseFloat(item.sum_price) || 0),
                          0,
                        )
                      : selectedSession?.order_total ||
                          selectedSession?.total ||
                          0,
                  )}
                </Typography>
              </Box>
              {(cs.allow_manual_discount !== false && (parseFloat(discount) > 0 || (selectedSession?.discount && parseFloat(selectedSession.discount) > 0))) && (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={1}
                  sx={{ color: "error.main", opacity: 0.8 }}
                >
                  <Typography variant="body2">
                    Discount ({discount || 0}%)
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    -{currencySymbol}
                    {formatCashInput(
                      ((selectedOrderItems.length > 0
                        ? selectedOrderItems.reduce(
                            (acc, item) =>
                              acc + (parseFloat(item.sum_price) || 0),
                            0,
                          )
                        : selectedSession?.order_total ||
                          selectedSession?.total ||
                          0) *
                        (parseFloat(discount) || 0)) /
                        100,
                    )}
                  </Typography>
                </Box>
              )}
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                <Typography variant="subtitle1" fontWeight={800}>
                  Total Due
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={900} sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }}>
                  {currencySymbol}
                  {formatCashInput(
                    Math.max(
                      0,
                      (selectedOrderItems.length > 0
                        ? selectedOrderItems.reduce(
                            (acc, item) =>
                              acc + (parseFloat(item.sum_price) || 0),
                            0,
                          )
                        : selectedSession?.order_total ||
                          selectedSession?.total ||
                          0) *
                        (1 - (parseFloat(discount) || 0) / 100),
                    ),
                  )}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {!proceedToPayment &&
              cs.allow_manual_discount !== false &&
              (selectedSession?.session_status === "open" ||
                selectedSession?.session_status === "billed") && (
                <TextField
                  fullWidth
                  label="Apply Discount (%)"
                  type="number"
                  value={discount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const max = cs.max_discount_percent;
                    const capped =
                      max != null && max < 100 ? Math.min(val, max) : val;
                    setDiscount(String(capped));
                  }}
                  disabled={selectedOrderItems.length === 0}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">%</InputAdornment>
                    ),
                  }}
                  helperText={
                    cs.max_discount_percent != null &&
                    cs.max_discount_percent < 100
                      ? `Max allowed: ${cs.max_discount_percent}%`
                      : undefined
                  }
                />
              )}

            {proceedToPayment ? (
              <Box>
                {(paymentMethod === "cash" ||
                  paymentMethod === "card+cash") && (
                  <TextField
                    fullWidth
                    label="Cash Amount"
                    type="number"
                    value={cashAmount}
                    onChange={handleCashChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {currencySymbol}
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                {(paymentMethod === "card" ||
                  paymentMethod === "card+cash") && (
                  <TextField
                    fullWidth
                    label="Card Amount"
                    type="number"
                    value={cardAmount}
                    onChange={handleCardChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {currencySymbol}
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                {paymentMethod === "momo" && (
                  <TextField
                    fullWidth
                    label="MoMo Amount"
                    value={momoAmount}
                    onChange={(e) => setMomoAmount(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {currencySymbol}
                        </InputAdornment>
                      ),
                    }}
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
                  {(cs.enable_cash ?? true) && (
                    <ToggleButton value="cash">Cash</ToggleButton>
                  )}
                  {(cs.enable_card ?? true) && (
                    <ToggleButton value="card">Card</ToggleButton>
                  )}
                  {(cs.enable_card_cash ?? true) && (
                    <ToggleButton
                      value="card+cash"
                      sx={{ textTransform: "none" }}
                    >
                      Card+Cash
                    </ToggleButton>
                  )}
                  {(cs.enable_momo ?? true) && (
                    <ToggleButton value="momo">MoMo</ToggleButton>
                  )}
                  {(cs.enable_online ?? true) && (
                    <ToggleButton value="online">Online</ToggleButton>
                  )}
                </ToggleButtonGroup>
              </Box>
            ) : null}

            {hasUnserved && !selectedSession.is_otc_order && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: "warning.light",
                  color: "warning.dark",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Warning sx={{ fontSize: 20 }} />
                <Typography variant="body2" fontWeight="medium">
                  PREMATURE PAYMENT BLOCKED: Please ensure all items are served.
                </Typography>
              </Box>
            )}

            <Stack direction="row" spacing={2} mt={2}>
              {!proceedToPayment && cs.show_proforma_bill !== false && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<ReceiptLong />}
                  onClick={() => handlePrintReceipt(false)}
                  disabled={selectedOrderItems.length === 0}
                >
                  Bill
                </Button>
              )}
              <Button
                fullWidth
                variant="contained"
                size="large"
                color={proceedToPayment ? "success" : "primary"}
                onClick={handleProceedToPayment}
                disabled={
                  isProcessingPayment ||
                  selectedOrderItems.length === 0 ||
                  (hasUnserved && !selectedSession.is_otc_order)
                }
                startIcon={
                  isProcessingPayment ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {proceedToPayment ? "Confirm Pay" : "Proceed to Pay"}
              </Button>
            </Stack>
            {proceedToPayment && (
              <Button
                fullWidth
                onClick={() => setProceedToPayment(false)}
                sx={{ mt: 1 }}
              >
                Back to Summary
              </Button>
            )}
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: isMobile ? "auto" : "400px",
              minHeight: isMobile ? "300px" : "auto",
              opacity: 0.6,
              textAlign: "center",
              p: 4,
            }}
          >
            <ShoppingCart sx={{ fontSize: 64, mb: 2, color: "primary.main", opacity: 0.5 }} />
            <Typography variant="h6" fontWeight={800} gutterBottom>
              No Order Selected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select an order to view summary and process payment.
            </Typography>
          </Box>
        )}
      </Box>
    );
  };


  const handlePrintReceipt = async (isFinal: boolean = false) => {
    if (!selectedSession) return;

    const cashValue = parseFloat(cashAmount) || 0;
    const cardValue = parseFloat(cardAmount) || 0;
    const calculatedTotal =
      selectedOrderItems.length > 0
        ? selectedOrderItems.reduce(
            (acc, item) => acc + (parseFloat(item.sum_price) || 0),
            0,
          )
        : selectedSession.order_total || selectedSession.total || 0;

    const change = (cashValue + cardValue - calculatedTotal).toFixed(2);
    const footerMessage =
      cs.receipt_footer_message || "THANK YOU FOR DINING WITH US!";

    printReceipt(
      isFinal ? "ORD-" + selectedSession.order_id : "PROFORMA",
      "Cashier",
      selectedSession.table_number || "OTC",
      selectedOrderItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
      calculatedTotal,
      selectedOrderItems.map((item) => ({
        ...item,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      (cashValue + cardValue).toFixed(2),
      cashValue.toFixed(2),
      cardValue.toFixed(2),
      change,
      selectedRestaurant,
      footerMessage,
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

  useEffect(() => {
    if (selected === "recent") {
      fetchReportSessions();
    }
  }, [selected, fetchReportSessions]);

  useEffect(() => {
    getActiveSessionByRestaurant();
    subscribeToSessions();

    return () => {
      unsubscribeFromSessions();
    };
  }, [
    getActiveSessionByRestaurant,
    subscribeToSessions,
    unsubscribeFromSessions,
    selectedRestaurant?.id,
  ]);

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
    {
      value: "active",
      title: "Active Orders",
      text: "View sessions that are currently open",
    },
    {
      value: "recent",
      title: "Transaction History",
      text: "View sessions that were recently closed",
    },
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
        if (paymentMethod === "cash" && cashNum < totalDue)
          return "Insufficient cash amount";
        if (paymentMethod === "card" && cardNum < totalDue)
          return "Insufficient card amount";
        if (paymentMethod === "momo" && momoNum < totalDue)
          return "Insufficient momo amount";
        if (paymentMethod === "card+cash" && cashNum + cardNum < totalDue)
          return "Total paid (Cash + Card) is less than total due";
        return null;
      };

      const error = validatePayment();
      if (error) {
        Swal.fire({ icon: "error", title: "Oops...", text: error });
        return;
      }

      const totalPaid = cashNum + cardNum + momoNum;
      const change = Math.max(0, totalPaid - totalDue);

      const doPayment = async () => {
        await processPayment(
          selectedSession.session_id,
          selectedSession.order_id,
          selectedSession.table_id,
        );
        handlePrintReceipt(true);
        setProceedToPayment(false);
        if (cs.auto_print_receipt) handlePrintReceipt(true);
      };

      if (cs.require_payment_confirmation === false) {
        doPayment();
        return;
      }

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
          doPayment();
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
      { total: 0, cash: 0, card: 0, momo: 0, online: 0, "card+cash": 0 },
    );
  }, [allSessions]);

  if (!activeSeesionByRestaurantLoaded)
    return <CashierDashboardSkeleton />;

  return (
    <Box sx={{ p: 3, position: "relative" }}>
      {loadingActiveSessionByRestaurant && activeSeesionByRestaurantLoaded && (
        <LinearProgress
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.drawer + 2,
            height: 3,
          }}
        />
      )}
      {cs.show_revenue_stats !== false && (
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Paper
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  mr: 1.5,
                  width: 36,
                  height: 36
                }}
              >
                <PriceCheckTwoToneIcon fontSize="small" />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' }, wordBreak: 'break-all', lineHeight: 1.1 }}>
                  {currencySymbol}
                  {formatCashInput(sessionStats.total)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Total Sales
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: "success.main",
                  mr: 1.5,
                  width: 36,
                  height: 36
                }}
              >
                <MoneyTwoToneIcon fontSize="small" />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' }, wordBreak: 'break-all', lineHeight: 1.1 }}>
                  {currencySymbol}
                  {formatCashInput(sessionStats.cash)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Cash Revenue
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: "error.main",
                  mr: 1.5,
                  width: 36,
                  height: 36
                }}
              >
                <CreditCardTwoToneIcon fontSize="small" />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' }, wordBreak: 'break-all', lineHeight: 1.1 }}>
                  {currencySymbol}
                  {formatCashInput(sessionStats.card)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Card Revenue
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: "warning.main",
                  mr: 1.5,
                  width: 36,
                  height: 36
                }}
              >
                <SecurityUpdateGoodTwoToneIcon fontSize="small" />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' }, wordBreak: 'break-all', lineHeight: 1.1 }}>
                  {currencySymbol}
                  {formatCashInput(sessionStats.momo)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  MoMo Revenue
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2 }}>
            {options.map((opt) => (
              <Paper
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                sx={{
                  flex: 1,
                  p: { xs: 0.75, sm: 1.25 },
                  cursor: "pointer",
                  border:
                    selected === opt.value
                      ? `2px solid ${theme.palette.primary.main}`
                      : "1px solid divider",
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 0.25, sm: 1 },
                  borderRadius: 2,
                  transition: "all 0.2s",
                  bgcolor: selected === opt.value ? alpha(theme.palette.primary.main, 0.05) : 'background.paper'
                }}
              >
                <Radio 
                  checked={selected === opt.value} 
                  value={opt.value} 
                  size="small"
                  sx={{ p: { xs: 0.25, sm: 0.5 } }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {opt.title}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ display: { xs: "none", sm: "block" }, fontSize: '0.7rem' }}
                  >
                    {opt.text}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>

          {selected === "active" && (
            <Card
              sx={{
                borderRadius: 3,
                borderLeft:  "0px solid ",
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <ShoppingCart fontSize="small" /> Orders Awaiting Payment
                </Typography>
                <Divider />
                <List sx={{ p: 0 }}>
                  {activeSessions.length === 0 ? (
                    <EmptyState
                      title="No Orders Waiting"
                      description="There are currently no orders awaiting payment. Relax or check the history."
                      emoji="✅"
                      height={300}
                    />
                  ) : (
                    activeSessions.map((session: any) => (
                    <ListItem
                      key={session.session_id}
                      onClick={() => setSelectedSession(session)}
                      sx={{
                        border: "1px solid divider",
                        borderRadius: 2,
                        mb: 0.75,
                        mt: 0.75,
                        p: 1.25,
                        cursor: "pointer",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        bgcolor: selectedSession?.session_id === session.session_id ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        width="100%"
                        gap={1}
                        mb={0.5}
                      >
                        <Typography variant="body2" fontWeight="bold" sx={{ wordBreak: 'break-all', minWidth: '80px', flex: 1 }}>
                          ORD-{session.order_id}
                        </Typography>
                        <Chip
                          label={session.session_status}
                          color="warning"
                          size="small"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.25}
                          color="primary.main"
                          fontWeight={700}
                          fontSize="0.9rem"
                        >
                          {currencySymbol}
                          {formatCashInput(
                            session.order_total || session.total,
                          )}
                        </Box>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={0.25}
                          sx={{ opacity: 0.7, fontSize: '0.8rem' }}
                        >
                          <TableRestaurant sx={{ fontSize: 14 }} />
                          T-{session.table_number || "OTC"}
                        </Box>
                      </Stack>
                    </ListItem>
                  )))}
                </List>
              </CardContent>
            </Card>
          )}

          {selected === "recent" && (
            <Card
              sx={{
                borderRadius: 3,
                borderLeft: "0px solid red",
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>

                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search Order ID or Table..."
                      value={historyFilters.searchQuery}
                      onChange={(e) => setHistoryFilters({ searchQuery: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        sx: { 
                          borderRadius: 2.5,
                          backgroundColor: alpha(theme.palette.action.hover, 0.05),
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.divider, 0.1),
                          },
                          height: 38
                        }
                      }}
                    />
                  </Box>

                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Export Transactions">
                      <IconButton 
                        size="small"
                        onClick={handleExportClick}
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          color: 'primary.main',
                          width: 38,
                          height: 38,
                          borderRadius: 2.5,
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                        }}
                      >
                        <FileDownload fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Date Filters">
                      <IconButton 
                        size="small"
                        onClick={() => setShowHistoryFilters(!showHistoryFilters)}
                        sx={{ 
                          bgcolor: showHistoryFilters ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.action.hover, 0.05),
                          color: showHistoryFilters ? 'primary.main' : 'text.secondary',
                          width: 38,
                          height: 38,
                          borderRadius: 2.5,
                          border: showHistoryFilters ? `1px solid ${theme.palette.primary.main}` : 'none'
                        }}
                      >
                        <FilterList fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                <Collapse in={showHistoryFilters}>
                  <Box sx={{ 
                    mb: 2, 
                    p: 1.5, 
                    borderRadius: 2.5, 
                    bgcolor: alpha(theme.palette.action.hover, 0.03),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}>
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={6}>
                        <TextField
                          type="date"
                          size="small"
                          fullWidth
                          label="From"
                          InputLabelProps={{ shrink: true }}
                          value={historyFilters.startDate}
                          onChange={(e) => setHistoryFilters({ startDate: e.target.value })}
                          sx={{ '& fieldset': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          type="date"
                          size="small"
                          fullWidth
                          label="To"
                          InputLabelProps={{ shrink: true }}
                          value={historyFilters.endDate}
                          onChange={(e) => setHistoryFilters({ endDate: e.target.value })}
                          sx={{ '& fieldset': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="small"
                          startIcon={<Refresh />}
                          onClick={() => fetchReportSessions()}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            height: 36,
                            boxShadow: 'none'
                          }}
                        >
                          Refresh Results
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>

                <Menu
                  anchorEl={exportAnchorEl}
                  open={Boolean(exportAnchorEl)}
                  onClose={handleExportClose}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      minWidth: 150,
                      boxShadow: theme.shadows[10],
                      '& .MuiMenuItem-root': {
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        py: 1,
                        borderRadius: 1,
                        mx: 0.5,
                      }
                    }
                  }}
                >
                  <MenuItem onClick={handleExportCSV}>
                    <ListItemIcon><FileDownload fontSize="small" /></ListItemIcon>
                    CSV File
                  </MenuItem>
                  <MenuItem onClick={handleExportExcel}>
                    <ListItemIcon><Description fontSize="small" /></ListItemIcon>
                    Excel Sheet
                  </MenuItem>
                  <MenuItem onClick={handleExportTXT}>
                    <ListItemIcon><Description fontSize="small" /></ListItemIcon>
                    Text File
                  </MenuItem>
                  <MenuItem onClick={handleExportPDF}>
                    <ListItemIcon><Print fontSize="small" /></ListItemIcon>
                    PDF Document
                  </MenuItem>
                </Menu>

                {isFetchingHistory && (
                  <LinearProgress 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      height: 2,
                      borderRadius: '3px 3px 0 0',
                      zIndex: 2
                    }} 
                  />
                )}
                {isMobile ? (
                  <Stack spacing={2}>
                    {closedSessions.map((session: any) => (
                      <Box
                        key={session.session_id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: alpha(theme.palette.background.default, 0.3),
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          flexWrap="wrap"
                          gap={1}
                          mb={1}
                        >
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ wordBreak: 'break-all', minWidth: '100px', flex: 1 }}>
                            ORD-{session.order_id}
                          </Typography>
                          <Chip
                            label={session.payment_method}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </Stack>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <TableRestaurant fontSize="small" color="action" />
                            <Typography variant="body2">
                              Table {session.table_number || "OTC"}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "right", minWidth: 80 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="primary.main"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {currencySymbol}
                              {formatCashInput(
                                session.order_total || session.total,
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(session.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell sx={{ py: 1, fontWeight: 'bold' }}>Table</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 'bold' }}>Order</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 'bold' }}>Amount ({currencySymbol})</TableCell>
                          <TableCell sx={{ py: 1, fontWeight: 'bold' }}>Method</TableCell>
                          <TableCell align="right" sx={{ py: 1, fontWeight: 'bold' }}>Closed At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {closedSessions.map((session: any) => (
                          <TableRow key={session.session_id}>
                            <TableCell sx={{ py: 0.75 }}>
                              T-{session.table_number || "OTC"}
                            </TableCell>
                            <TableCell sx={{ py: 0.75 }}>
                              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                ORD-{session.order_id}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 0.75, fontWeight: 'bold' }}>
                              {formatCashInput(
                                session.order_total || session.total,
                              )}
                            </TableCell>
                            <TableCell sx={{ py: 0.75 }}>
                              <Chip
                                label={session.payment_method}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ py: 0.75 }}>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', lineHeight: 1.1 }}>
                                {new Date(session.closed_at).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                {new Date(session.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Card sx={{ borderRadius: 3, borderTop: "5px solid green" }}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Payment fontSize="small" /> Checkout
              </Typography>
              {renderCheckout()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mobile Checkout FAB and Drawer */}
      {isMobile && (
        <>
          {selectedSession && (
            <Fab
              color="primary"
              aria-label="checkout"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                boxShadow: 4,
                zIndex: (theme) => theme.zIndex.speedDial
              }}
              onClick={() => setDrawerOpen(true)}
            >
              <Payment />
            </Fab>
          )}

          <Drawer
            anchor="bottom"
            open={drawerOpen && !!selectedSession}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
              sx: {
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: '85vh',
                bgcolor: 'background.paper'
              }
            }}
          >
            {renderCheckout()}
          </Drawer>
        </>
      )}
    </Box>
  );
};

export default CashierDashboard;
