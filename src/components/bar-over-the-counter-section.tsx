import React, { useEffect } from "react";
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
} from "@mui/material";
import {
  Close,
  Search,
  Add,
  Remove,
  ShoppingCart,
  Receipt as ReceiptIcon,
  LocalBar,
  DeleteOutline,
  KeyboardArrowRight,
} from "@mui/icons-material";
import useBarStore from "../lib/barStore";
import BarTakeAwaySkeleton from "./skeletons/bar-takeaway-skeleton";
import { printReceipt } from "./PrintWindow";
import Swal from "sweetalert2";

const OTCTabs: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
  } = useBarStore();

  useEffect(() => {
    handleFetchItems();
  }, [handleFetchItems]);

  const filteredItems = items
    .filter((item: any) => {
      const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const activeCart = getActiveCart();
  const total = getTotal();

  const handlePrintReceipt = async (isFinal: boolean = false) => {
    const activeTabObj = tabs[activeTab];
    if (!activeTabObj) return;

    const cashValue = parseFloat(cash) || 0;
    const cardValue = parseFloat(card) || 0;
    const change = (cashValue + cardValue - total).toFixed(2);

    printReceipt(
      isFinal ? "OTC-" + Date.now().toString().slice(-6) : "PROFORMA",
      "Bartender",
      "OTC",
      activeCart.reduce((sum, item) => sum + item.qty, 0),
      total,
      activeCart.map(item => ({ ...item, item_name: item.name, quantity: item.qty, unit_price: item.price })),
      (cashValue + cardValue).toFixed(2),
      cashValue.toFixed(2),
      cardValue.toFixed(2),
      change
    );
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (activeCart.length === 0) return;
      setActiveStep(1);
    } else {
      const success = await completeOTCPayment();
      if (success) {
        handlePrintReceipt(true);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const removeTab = (id: string) => {
    const newTabs = tabs.filter((tab: any) => tab.id !== id);
    setTabs(newTabs);
    if (activeTab >= newTabs.length && newTabs.length > 0) setActiveTab(newTabs.length - 1);
  };

  const getCartItemCount = (tabIndex: number) => tabs[tabIndex]?.cart.reduce((sum: number, item: any) => sum + item.qty, 0) || 0;

  if (loadingItems) return <BarTakeAwaySkeleton />;

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      bgcolor: "background.default", 
      height: "calc(100vh - 120px)",
      mt: 2,
      borderRadius: 4,
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      {/* Top Navigation & Tabs */}
      <Paper elevation={0} sx={{ 
        borderBottom: "1px solid", 
        borderColor: "divider", 
        bgcolor: "background.paper", 
        borderRadius: 0,
        p: 2
      }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
              <LocalBar />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2 }}>Takeaway Orders</Typography>
              <Typography variant="caption" color="text.secondary">Manage over-the-counter payments</Typography>
            </Box>
          </Stack>
          <Button 
            onClick={addNewTab} 
            variant="contained" 
            disableElevation
            startIcon={<Add />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            New Order
          </Button>
        </Box>
        
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
          {tabs.map((tab: any, index: number) => (
            <Chip 
              key={tab.id}
              onClick={() => setActiveTab(index)} 
              onDelete={() => removeTab(tab.id)} 
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" fontWeight={activeTab === index ? 700 : 500}>{tab.name}</Typography>
                  <Badge badgeContent={getCartItemCount(index)} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }} />
                </Stack>
              }
              variant={activeTab === index ? "filled" : "outlined"} 
              color={activeTab === index ? "primary" : "default"}
              sx={{ 
                borderRadius: 2,
                height: 40,
                px: 1,
                transition: 'all 0.2s',
                ...(activeTab === index ? {
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                } : {})
              }}
            />
          ))}
        </Stack>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex" }}>
        <Grid container sx={{ height: "100%" }}>
          {/* Menu Items Section */}
          <Grid item xs={12} md={8} sx={{ height: "100%", overflow: "auto", p: 3, bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : '#f8f9fa' }}>
            <Stack spacing={3}>
              {/* Search and Categories */}
              <Box>
                <TextField 
                  fullWidth 
                  variant="outlined"
                  placeholder="Search drinks or scan barcode..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                    }
                  }} 
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment> 
                  }} 
                />
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
                  <Chip 
                    label="All Items" 
                    onClick={() => setSelectedCategory("all")} 
                    variant={selectedCategory === "all" ? "filled" : "outlined"} 
                    color={selectedCategory === "all" ? "primary" : "default"}
                    sx={{ borderRadius: 1.5, fontWeight: 600 }}
                  />
                  {categories.map((c: any) => (
                    <Chip 
                      key={c.id} 
                      label={c.name} 
                      onClick={() => setSelectedCategory(c.id)} 
                      variant={selectedCategory === c.id ? "filled" : "outlined"} 
                      color={selectedCategory === c.id ? "primary" : "default"}
                      sx={{ borderRadius: 1.5, fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Items Grid */}
              <Grid container spacing={2}>
                {filteredItems.map((item: any) => {
                  const inCart = activeCart.find(c => c.id === item.id);
                  return (
                    <Grid item xs={6} sm={4} md={3} lg={2.4} key={item.id}>
                      <Card sx={{ 
                        borderRadius: 3, 
                        overflow: 'hidden', 
                        border: '1px solid',
                        borderColor: inCart ? 'primary.main' : 'divider',
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
                      }}>
                        <CardActionArea onClick={() => addToCart(item)}>
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia component="img" height="120" image={item.image_url} />
                            {inCart && (
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8, 
                                bgcolor: 'primary.main', 
                                color: 'white', 
                                borderRadius: '50%', 
                                width: 24, 
                                height: 24, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                boxShadow: 2
                              }}>
                                {inCart.qty}
                              </Box>
                            )}
                          </Box>
                          <CardContent sx={{ p: 1.5 }}>
                            <Typography variant="body2" noWrap fontWeight={600} sx={{ mb: 0.5 }}>{item.name}</Typography>
                            <Typography variant="subtitle2" color="primary" fontWeight={800}>£{formatCashInput(item.price)}</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Stack>
          </Grid>

          {/* Order Summary (Cart) Section */}
          <Grid item xs={12} md={4} sx={{ 
            height: "100%", 
            bgcolor: "background.paper", 
            p: 3, 
            display: "flex", 
            flexDirection: "column", 
            borderLeft: '1px solid', 
            borderColor: 'divider' 
          }}>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {["Items", "Pay"].map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <ShoppingCart color="primary" />
              <Typography variant="h6" fontWeight="800">Order Summary</Typography>
              <Box sx={{ flex: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {activeCart.length} items
              </Typography>
            </Stack>

            <Box sx={{ flex: 1, overflow: "auto", mx: -1, px: 1 }}>
              <Stack spacing={1.5}>
                {activeCart.map((item: any) => (
                  <Paper 
                    key={item.id} 
                    elevation={0}
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02)
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">£{formatCashInput(item.price)} each</Typography>
                      </Box>
                      <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                         <Typography variant="body2" color="text.secondary">Qty:</Typography>
                         <Typography variant="body2" fontWeight={800}>{item.qty}</Typography>
                      </Stack>
                       <Typography fontWeight={800} color="primary">£{formatCashInput(item.price * item.qty)}</Typography>
                    </Box>
                  </Paper>
                ))}
                {activeCart.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 10, opacity: 0.3 }}>
                    <ShoppingCart sx={{ fontSize: 64, mb: 2 }} />
                    <Typography>Your cart is empty</Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05), border: '1px dashed', borderColor: 'primary.main', mb: 2 }}>
                <Stack spacing={1}>
                   <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body1" fontWeight={600}>£{formatCashInput(total)}</Typography>
                   </Box>
                   <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Tax (0%)</Typography>
                      <Typography variant="body1" fontWeight={600}>£0.00</Typography>
                   </Box>
                   <Divider sx={{ my: 1 }} />
                   <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={800}>Total</Typography>
                      <Typography variant="h5" color="primary" fontWeight={900}>£{formatCashInput(total)}</Typography>
                   </Box>
                </Stack>
              </Paper>
              
              {activeStep === 1 && (
                <Stack spacing={2} sx={{ mb: 3 }}>
                   <TextField 
                    fullWidth 
                    label="Cash Amount" 
                    type="number" 
                    value={cash} 
                    onChange={(e) => setCash(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
                  />
                  <TextField 
                    fullWidth 
                    label="Card Amount" 
                    type="number" 
                    value={card} 
                    onChange={(e) => setCard(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }}
                  />
                  {(parseFloat(cash) || 0) + (parseFloat(card) || 0) > total && (
                    <Box sx={{ p: 1, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight="bold">Change:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        £{((parseFloat(cash) || 0) + (parseFloat(card) || 0) - total).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}

              <Stack direction="row" spacing={1}>
                {activeStep === 1 && (
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    size="large" 
                    onClick={handleBack}
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
                  >
                    Back
                  </Button>
                )}
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large" 
                  disabled={activeCart.length === 0 || isProcessingPayment}
                  onClick={handleNext}
                  endIcon={activeStep === 0 ? <KeyboardArrowRight /> : undefined}
                  sx={{ 
                    borderRadius: 3, 
                    py: 1.5, 
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                    bgcolor: activeStep === 1 ? 'success.main' : 'primary.main',
                    '&:hover': {
                      bgcolor: activeStep === 1 ? 'success.dark' : 'primary.dark',
                    }
                  }}
                >
                  {activeStep === 0 ? "Proceed to Payment" : "Confirm & Pay"}
                </Button>
              </Stack>
              
              {activeStep === 0 && activeCart.length > 0 && (
                <Button 
                  fullWidth 
                  startIcon={<ReceiptIcon />} 
                  onClick={() => handlePrintReceipt(false)}
                  sx={{ mt: 1, color: 'text.secondary' }}
                >
                  Print Proforma
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default OTCTabs;
