import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Button,
  Paper,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  Badge,
  Avatar,
  alpha,
  Stepper,
  Step,
  StepLabel,
  Divider,
  useTheme,
  useMediaQuery,
  Fab,
  Dialog,
  AppBar,
  Toolbar,
  Slide,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  Add,
  Remove,
  ShoppingCart,
  Receipt as ReceiptIcon,
  LocalBar,
  DeleteOutline,
  KeyboardArrowRight,
  Close as CloseIcon,
} from "@mui/icons-material";
import useBarStore from "../lib/barStore";
import useRestaurantStore from "../lib/restaurantStore";
import BarTakeAwaySkeleton from "./skeletons/bar-takeaway-skeleton";
import { printReceipt } from "./PrintWindow";
import { getCurrencySymbol } from "../utils/currency";
import { useSettingsStore } from "../lib/settingsStore";
import { useSettings } from "../providers/settingsProvider";
import {
  History as HistoryIcon,
  RemoveCircleOutline,
} from "@mui/icons-material";

const OTCTabs: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [receiptOpen, setReceiptOpen] = useState(false);
  const {
    tabs,
    setTabs,
    addNewTab,
    items,
    addToCart,
    removeFromCart,
    handleFetchItems,
    categories,
    setSelectedCategory,
    selectedCategory,
    setSearchQuery,
    searchQuery,
    getActiveCart,
    getTotal,
    setActiveTab,
    activeTab,
    loadingItems,
    activeStep,
    setActiveStep,
    cash,
    setCash,
    card,
    setCard,
    completeOTCPayment,
    isProcessingPayment,
    formatCashInput,
    updateQuantity,
    tip,
    setTip,
    recentOTCOrders,
    isCreatingTab,
    handleVoidOTCOrder,
    handleRemoveTab,
  } = useBarStore();
  const { selectedRestaurant } = useRestaurantStore();
  const { settings } = useSettingsStore();
  const { settings: appSettings } = useSettings();
  const bs = (appSettings as any).bar_settings || {};

  useEffect(() => {
    handleFetchItems();
  }, [handleFetchItems]);

  const filteredItems = items
    .filter((item: any) => {
      const matchesCategory =
        selectedCategory === "all" || item.category_id === selectedCategory;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const activeCart = getActiveCart();
  const total = getTotal();

  const renderReceiptPanel = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: isMobile ? '70vh' : 'auto' }}>
        {!isMobile && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <ShoppingCart color="primary" />
            <Typography variant="h6" fontWeight={800}>
              {activeStep === 0 ? "Order Summary" : "Payment Details"}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {activeCart.length} items
            </Typography>
          </Stack>
        )}

        <Box sx={{ flex: 1, overflow: "auto", mx: -1, px: 1, mb: 2 }}>
          {activeStep === 0 ? (
            <Stack spacing={1.5}>
              {activeCart.map((item: any) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: isDark
                      ? alpha(theme.palette.common.white, 0.03)
                      : alpha(theme.palette.common.black, 0.02),
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 1 }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ lineHeight: 1.2 }}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getCurrencySymbol()}
                        {formatCashInput(item.price)} each
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                      sx={{
                        color: "text.disabled",
                        "&:hover": { color: "error.main" },
                      }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, -1)}
                        sx={{ p: 0.5 }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        sx={{ minWidth: 20, textAlign: "center" }}
                      >
                        {item.qty}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, 1)}
                        sx={{ p: 0.5 }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography fontWeight={800} color="primary">
                      {getCurrencySymbol()}
                      {formatCashInput(item.price * item.qty)}
                    </Typography>
                  </Box>
                </Paper>
              ))}
              {activeCart.length === 0 && (
                <Box sx={{ textAlign: "center", py: 10, opacity: 0.3 }}>
                  <ShoppingCart sx={{ fontSize: 64, mb: 2 }} />
                  <Typography>Your cart is empty</Typography>
                </Box>
              )}
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                  Payment Method
                </Typography>
                <Stack spacing={2}>
                  <TextField 
                    fullWidth 
                    label="Cash Payment" 
                    placeholder="0.00"
                    value={cash}
                    onChange={(e) => setCash(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{getCurrencySymbol()}</InputAdornment>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField 
                    fullWidth 
                    label="Card Payment" 
                    placeholder="0.00"
                    value={card}
                    onChange={(e) => setCard(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{getCurrencySymbol()}</InputAdornment>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                  Tip (Optional)
                </Typography>
                 <TextField 
                    fullWidth 
                    placeholder="0.00"
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{getCurrencySymbol()}</InputAdornment>
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
              </Box>
            </Stack>
          )}
        </Box>

        <Box sx={{ mt: 'auto' }}>
          {(() => {
            const taxRate = settings?.menu_settings?.default_tax_rate
              ? parseFloat(String(settings.menu_settings.default_tax_rate)) /
                100
              : settings?.general?.tax_rate
                ? parseFloat(String(settings.general.tax_rate)) / 100
                : 0;
            const taxAmountValue = total * taxRate;
            const grandTotal = total + taxAmountValue + (parseFloat(tip) || 0);

            return (
              <>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: isDark
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.05),
                    border: "1px dashed",
                    borderColor: "primary.main",
                    mb: 2,
                  }}
                >
                  <Stack spacing={1}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.secondary">
                        Subtotal
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {getCurrencySymbol()}
                        {formatCashInput(total)}
                      </Typography>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.secondary">
                        Tax ({(taxRate * 100).toFixed(0)}%)
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {getCurrencySymbol()}
                        {formatCashInput(taxAmountValue)}
                      </Typography>
                    </Box>
                    {parseFloat(tip) > 0 && (
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" color="text.secondary">
                          Tip
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="success.main">
                          +{getCurrencySymbol()}
                          {formatCashInput(tip)}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6" fontWeight={800}>
                        Total
                      </Typography>
                      <Typography variant="h5" color="primary" fontWeight={900}>
                        {getCurrencySymbol()}
                        {formatCashInput(grandTotal)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Stack direction="row" spacing={2}>
                   {activeStep === 1 && (
                     <Button 
                       fullWidth 
                       variant="outlined" 
                       onClick={handleBack}
                       sx={{ borderRadius: 2, fontWeight: 800, py: 1.2 }}
                     >
                       Back
                     </Button>
                   )}
                   <Button 
                    fullWidth 
                    variant="contained" 
                    color={activeStep === 0 ? "primary" : "success"}
                    onClick={handleNext}
                    disabled={activeCart.length === 0 || isProcessingPayment}
                    sx={{ borderRadius: 2, fontWeight: 800, py: 1.2 }}
                    endIcon={activeStep === 0 ? <KeyboardArrowRight /> : null}
                   >
                    {isProcessingPayment ? "Processing..." : activeStep === 0 ? "Next" : "Complete Pay"}
                   </Button>
                </Stack>
              </>
            );
          })()}
        </Box>
      </Box>
    );
  };

  const handlePrintReceipt = async (isFinal: boolean = false) => {
    const activeTabObj = tabs.find((t: any) => String(t.id) === String(activeTab));
    if (!activeTabObj) return;

    const cashValue = parseFloat(cash) || 0;
    const cardValue = parseFloat(card) || 0;
    const { settings } = useSettingsStore.getState();
    const taxRate = settings?.menu_settings?.default_tax_rate
      ? parseFloat(String(settings.menu_settings.default_tax_rate)) / 100
      : settings?.general?.tax_rate
        ? parseFloat(String(settings.general.tax_rate)) / 100
        : 0;
    const taxAmount = total * taxRate;
    const grandTotal = total + taxAmount;
    const change = (cashValue + cardValue - grandTotal).toFixed(2);

    const footerMsg = bs.otc_receipt_footer || "THANK YOU FOR DINING WITH US!";

    printReceipt(
      isFinal ? "OTC-" + Date.now().toString().slice(-6) : "PROFORMA",
      "Bartender",
      "OTC",
      activeCart.reduce((sum, item) => sum + item.qty, 0),
      grandTotal,
      activeCart.map((item) => ({
        ...item,
        item_name: item.name,
        quantity: item.qty,
        unit_price: item.price,
      })),
      (cashValue + cardValue).toFixed(2),
      cashValue.toFixed(2),
      cardValue.toFixed(2),
      change,
      selectedRestaurant,
      footerMsg,
    );
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (activeCart.length === 0) return;

      // Update taxAmount in store before progressing
      const { settings } = useSettingsStore.getState();
      const taxRate = settings?.menu_settings?.default_tax_rate
        ? parseFloat(String(settings.menu_settings.default_tax_rate)) / 100
        : settings?.general?.tax_rate
          ? parseFloat(String(settings.general.tax_rate)) / 100
          : 0;
      const taxAmount = (total * taxRate).toFixed(2);
      useBarStore.setState({ taxAmount });

      setActiveStep(1);
    } else {
      const success = await completeOTCPayment();
      if (success) {
        handlePrintReceipt(true);
        if (bs.auto_print_otc) handlePrintReceipt(true);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const removeTab = async (id: string) => {
    const tab = tabs.find((t: any) => String(t.id) === String(id));
    if (tab && tab.cart.length > 0) {
      Swal.fire({
        title: "Cannot Remove Tab",
        text: "This tab still contains items. You must either void the order or remove the items from the cart first.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    
    await handleRemoveTab(id);
  };

  const getCartItemCount = (tabId: string | number) => {
    const tab = tabs.find((t: any) => String(t.id) === String(tabId));
    return tab?.cart.reduce(
      (sum: number, item: any) => sum + item.qty,
      0,
    ) || 0;
  };

  if (loadingItems) return <BarTakeAwaySkeleton />;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          height: { xs: "auto", md: "calc(100vh - 120px)" },
          borderRadius: { xs: 2, md: 4 },
          overflow: { xs: "visible", md: "hidden" },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Top Navigation & Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            borderRadius: 0,
            p: { xs: 1.5, md: 2 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 2 },
              flexWrap: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {/* New Order Button - Integrated into the tab flow for speed */}
            <Button
              onClick={addNewTab}
              disabled={isCreatingTab}
              variant="outlined"
              color="primary"
              size={isMobile ? "small" : "medium"}
              startIcon={isCreatingTab ? <CircularProgress size={20} /> : <Add />}
              sx={{ 
                borderRadius: 2, 
                px: { xs: 1.5, md: 3 },
                minWidth: { xs: 40, md: 'auto' },
                height: 40,
                flexShrink: 0,
                fontWeight: 800,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }
              }}
            >
              {!isMobile && (isCreatingTab ? "Creating..." : "New Order")}
            </Button>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, my: 'auto' }} />

            <Stack
              direction="row"
              spacing={1}
              sx={{
                flex: 1,
                overflowX: "auto",
                py: 0.5,
                "&::-webkit-scrollbar": { display: "none" },
                alignItems: 'center'
              }}
            >
              {tabs.map((tab: any) => {
                const isActive = String(activeTab) === String(tab.id);
                const itemCount = getCartItemCount(tab.id);
                
                return (
                  <Box
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 1, md: 1.5 },
                      px: { xs: 1.5, md: 2 },
                      py: 1,
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      position: 'relative',
                      border: '1px solid',
                      borderColor: isActive ? 'primary.main' : 'transparent',
                      bgcolor: isActive 
                        ? alpha(theme.palette.primary.main, 0.05)
                        : 'transparent',
                      '&:hover': {
                        bgcolor: isActive 
                          ? alpha(theme.palette.primary.main, 0.08)
                          : alpha(theme.palette.action.hover, 0.5),
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight={isActive ? 900 : 700}
                        color={isActive ? "primary" : "text.secondary"}
                      >
                        {tab.name}
                      </Typography>
                      {itemCount > 0 && (
                        <Box
                          sx={{
                            bgcolor: isActive ? 'primary.main' : 'text.disabled',
                            color: 'white',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 900,
                          }}
                        >
                          {itemCount}
                        </Box>
                      )}
                    </Box>
                    
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTab(tab.id);
                      }}
                      sx={{
                        p: 0,
                        color: 'text.disabled',
                        '&:hover': { color: 'error.main' },
                        opacity: isActive ? 1 : 0.6
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>

                    {isActive && (
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          bottom: -6, 
                          left: '50%', 
                          transform: 'translateX(-50%)',
                          width: '40%',
                          height: 3,
                          borderRadius: '3px 3px 0 0',
                          bgcolor: 'primary.main'
                        }} 
                      />
                    )}
                  </Box>
                );
              })}
              {tabs.length === 0 && (
                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', ml: 1 }}>
                  No active orders...
                </Typography>
              )}
            </Stack>
          </Box>
        </Paper>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, overflow: { xs: "visible", md: "hidden" }, display: "flex", flexDirection: "column" }}>
          {tabs.length > 0 ? (
            <Grid container sx={{ height: { xs: "auto", md: "100%" } }}>
              {/* Menu Items Section */}
              <Grid
                item
                xs={12}
                md={8}
                sx={{
                  height: { xs: "auto", md: "100%" },
                  overflow: { xs: "visible", md: "auto" },
                  p: { xs: 1.5, md: 3 },
                  bgcolor: isDark
                    ? alpha(theme.palette.background.paper, 0.5)
                    : "#f8f9fa",
                }}
              >
                  {/* Items Grid */}
                  <Grid container spacing={isMobile ? 1 : 2}>
                    {/* Search and Categories inside Grid for perfect alignment */}
                    <Grid item xs={12}>
                      <Box sx={{ mb: 1 }}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Search drinks..."
                          size="small"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search color="primary" sx={{ fontSize: 20 }} />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2, bgcolor: "background.paper" },
                          }}
                          sx={{ mb: 1.5 }}
                        />
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            overflowX: "auto",
                            pb: 0.5,
                            "&::-webkit-scrollbar": { display: "none" },
                          }}
                        >
                          <Chip
                            label="All"
                            onClick={() => setSelectedCategory("all")}
                            color={selectedCategory === "all" ? "primary" : "default"}
                            sx={{ fontWeight: 800, borderRadius: 1.5, height: 26, fontSize: '0.75rem' }}
                          />
                          {categories.map((cat: any) => (
                            <Chip
                              key={cat.id}
                              label={cat.name}
                              onClick={() => setSelectedCategory(cat.id)}
                              color={selectedCategory === cat.id ? "primary" : "default"}
                              sx={{ fontWeight: 800, borderRadius: 1.5, height: 26, fontSize: '0.75rem' }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Grid>
                    {filteredItems.map((item: any) => {
                      const inCart = activeCart.find(
                        (c) =>
                          c.id === item.id || (c as any).menu_item_id === item.id,
                      );
                      const isOutOfStock =
                        item.stock_count !== null && item.stock_count <= 0;
                      return (
                        <Grid item xs={6} sm={4} md={3} lg={2.4} key={item.id}>
                          <Card
                            sx={{
                              borderRadius: 3,
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              cursor: isOutOfStock ? "not-allowed" : "pointer",
                              transition: "all 0.2s ease",
                              border: "1px solid",
                              borderColor: inCart ? "primary.main" : "divider",
                              bgcolor: isOutOfStock
                                ? "action.disabledBackground"
                                : "background.paper",
                              boxShadow: inCart
                                ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                                : "none",
                              "&:hover": {
                                transform: isOutOfStock ? "none" : "translateY(-4px)",
                                boxShadow: isOutOfStock ? "none" : 4,
                              },
                            }}
                            onClick={() => !isOutOfStock && addToCart(item)}
                          >
                            <Box sx={{ position: "relative", pt: "75%" }}>
                              <Box
                                component="img"
                                src={item.image_url}
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  filter: isOutOfStock ? "grayscale(1)" : "none",
                                  opacity: isOutOfStock ? 0.5 : 1,
                                }}
                              />
                                {isOutOfStock ? (
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      bgcolor: alpha(
                                        theme.palette.error.main,
                                        0.4,
                                      ),
                                      color: "white",
                                      backdropFilter: "blur(2px)",
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      fontWeight={900}
                                      sx={{
                                        textTransform: "uppercase",
                                        letterSpacing: 2,
                                        transform: "rotate(-15deg)",
                                      }}
                                    >
                                      86'd
                                    </Typography>
                                  </Box>
                                ) : (
                                  inCart && (
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        top: 8,
                                        right: 8,
                                        bgcolor: "primary.main",
                                        color: "white",
                                        borderRadius: "50%",
                                        width: 24,
                                        height: 24,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "bold",
                                        fontSize: "0.75rem",
                                        boxShadow: 2,
                                      }}
                                    >
                                      {inCart.qty}
                                    </Box>
                                  )
                                )}
                              </Box>
                              <CardContent
                              sx={{
                                p: { xs: 1, md: 1.5 },
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-start",
                                textAlign: "left"
                              }}
                            >
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                  variant="caption"
                                  noWrap
                                  fontWeight={800}
                                  sx={{ mb: 0.2, display: "block", fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                                >
                                  {item.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="primary"
                                  fontWeight={900}
                                  sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                                >
                                  {getCurrencySymbol()}
                                  {formatCashInput(item.price)}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
              </Grid>
  
              {!isMobile && (
                <Grid
                  item
                  xs={12}
                  md={4}
                  sx={{
                    height: "100%",
                    bgcolor: "background.paper",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    borderLeft: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {renderReceiptPanel()}
                </Grid>
              )}
            </Grid>
          ) : (
            <Box 
              sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 3, 
                textAlign: 'center',
                bgcolor: isDark ? alpha(theme.palette.background.paper, 0.3) : '#f8f9fa'
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  animation: 'pulse 2s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(0.95)', opacity: 0.8 },
                    '50%': { transform: 'scale(1.05)', opacity: 1 },
                    '100%': { transform: 'scale(0.95)', opacity: 0.8 },
                  }
                }}
              >
                <LocalBar sx={{ fontSize: 60, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" fontWeight={900} gutterBottom>
                No Active Order
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
                Click the button below or "New Order" at the top to start a new Over-The-Counter transaction.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={addNewTab}
                sx={{
                  borderRadius: 3,
                  px: 6,
                  py: 1.5,
                  fontWeight: 800,
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 12px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }
                }}
              >
                Create New Order
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* FAB for Mobile View */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="receipt"
          onClick={() => setReceiptOpen(true)}
          sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}
        >
          <Badge badgeContent={activeCart.length} color="error">
            <ReceiptIcon />
          </Badge>
        </Fab>
      )}

      {/* Full Screen Dialog for Receipt */}
      <Dialog
        fullScreen
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" } as any}
      >
        <AppBar sx={{ position: "relative", bgcolor: "primary.main" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setReceiptOpen(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
              <ShoppingCart fontSize="small" />
              <Typography
                variant="h6"
                component="div"
                fontWeight="900"
              >
                {activeStep === 0 ? "Order Summary" : "Payment Details"}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 1.5, py: 0.5, borderRadius: 2 }}>
              <Typography variant="caption" fontWeight={800} color="inherit">
                {activeCart.length} items
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            p: 2,
            bgcolor: "background.default",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {renderReceiptPanel()}
        </Box>
      </Dialog>
    </>
  );
};

export default OTCTabs;
