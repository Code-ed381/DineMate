import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceStrict } from "date-fns";
import {
  CircularProgress,
  TableContainer,
  Paper,
  CardMedia,
  CardActions,
  Table,
  TableHead,
  Grid,
  Skeleton,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Alert,
  OutlinedInput,
  InputLabel,
  FormControl,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Stack,
  Box,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  CardActionArea,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  Cancel as CancelIcon,
  ShoppingCartCheckout as ShoppingCartCheckoutIcon,
  KeyboardBackspace as KeyboardBackspaceIcon,
  PriceCheck as PriceCheckIcon,
  CreditScore as CreditScoreIcon,
  CurrencyPound as CurrencyPoundIcon,
  MenuBook as MenuBookIcon,
  TableRestaurant as TableRestaurantIcon,
  Upload as UploadIcon,
  ReceiptLong as ReceiptLongIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import ProductionQuantityLimitsTwoToneIcon from "@mui/icons-material/ProductionQuantityLimitsTwoTone";
import useMenuStore from "../lib/menuStore";
import useTablesStore from "../lib/tablesStore";
import { printReceipt } from "../components/PrintWindow";
import MenuSkeleton from "../components/skeletons/menu-section-skeleton";

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const {
    getOrderBySessionId,
    createOrder,
    currentOrder,
    currentOrderItems,
    setCurrentOrder,
    getOrderItemsByOrderId,
    loadingCurrentOrderItems,
    totalOrdersPrice,
    activeStep,
    steps,
    handleNext,
    handleBack,
    proceedToCheckOut,
    formatCashInput,
    setCash,
    cash,
    card,
    setCard,
    addOrUpdateObject,
    handleRemoveItem,
    getActiveSessionByRestaurant,
    setSelectedCategory,
    selectedCategory,
    filterMenuItemsByCategory,
    menuItems,
    loadingMenuItems,
    categories,
    fetchCategories,
    filteredMenuItems,
    fetchMenuItems,
    setFilteredMenuItems,
    chosenTableSession,
    updateSessionStatus,
    setCurrentOrderItems,
    updateQuantity,
  } = useMenuStore();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    selectedSession,
    setSelectedSession,
    sessionsOverview,
    getSessionsOverview,
    sessionsOverviewLoaded,
    loadingSessionsOverview,
  } = useTablesStore();

  useEffect(() => {
    getActiveSessionByRestaurant();
    fetchCategories();
    fetchMenuItems();
    getSessionsOverview();
  }, [getActiveSessionByRestaurant, fetchCategories, fetchMenuItems, getSessionsOverview]);

  function formatDateTime(isoString: string | undefined) {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Invalid date";
    return formatDistanceStrict(date, new Date(), { addSuffix: true });
  }

  const handleUpdateQuantity = async (item: any, action: 'increase' | 'decrease') => {
    await updateQuantity(item, action);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <Stack direction="row" mt={2} sx={{ alignItems: "center", justifyContent: "space-between", border: "2px double #ccc", borderRadius: 2, boxShadow: 3, p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">ORDER NO. {currentOrder?.id}</Typography>
              <Typography variant="body1" fontWeight="bold">{formatDateTime(selectedSession?.opened_at)}</Typography>
            </Stack>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                     <TableCell><CancelIcon fontSize="small" /></TableCell>
                     <TableCell>Product</TableCell>
                     <TableCell>Price</TableCell>
                     <TableCell align="center">Qty</TableCell>
                     <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingCurrentOrderItems ? (
                    <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                  ) : currentOrderItems?.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center"><Typography color="textSecondary">No items</Typography></TableCell></TableRow>
                  ) : (
                    currentOrderItems.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                         <TableCell><IconButton size="small" onClick={() => handleRemoveItem(item)}><CancelIcon fontSize="small" color="error" /></IconButton></TableCell>
                         <TableCell>{item.item_name}</TableCell>
                         <TableCell>{item.unit_price}</TableCell>
                         <TableCell align="center">
                            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                                <IconButton size="small" onClick={() => handleUpdateQuantity(item, 'decrease')} disabled={item.quantity <= 1}><RemoveIcon fontSize="small" /></IconButton>
                                <Box sx={{ px: 1, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>{item.quantity}</Box>
                                <IconButton size="small" onClick={() => handleUpdateQuantity(item, 'increase')}><AddIcon fontSize="small" /></IconButton>
                            </Stack>
                         </TableCell>
                         <TableCell>{item.sum_price}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                   <TableRow><TableCell colSpan={4}>Subtotal</TableCell><TableCell>{totalOrdersPrice?.toFixed(2)}</TableCell></TableRow>
                   <TableRow><TableCell colSpan={4}><Typography variant="h6">Total</Typography></TableCell><TableCell><Typography variant="h6">${totalOrdersPrice?.toFixed(2)}</Typography></TableCell></TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </>
        );
      case 1:
        return (
          <Stack spacing={3} mt={4} alignItems="center">
            <Typography variant="h6">Total Amount</Typography>
            <Typography variant="h2"><strong>£ {formatCashInput(chosenTableSession?.order_total)}</strong></Typography>
            <TextField fullWidth label="Card" value={card} onChange={(e) => setCard(e.target.value)} />
            <TextField fullWidth label="Cash" value={cash} onChange={(e) => setCash(e.target.value)} />
          </Stack>
        );
      default: return null;
    }
  };

  const searchFilter = useMemo(() => {
    return filteredMenuItems.filter((item: any) => 
      searchTerm === "" || item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredMenuItems, searchTerm]);

  const handleCategoryClick = async (category: any) => {
    await setSelectedCategory(category);
    if (category.name === selectedCategory) {
      setFilteredMenuItems(menuItems);
      setSelectedCategory("");
    } else {
      filterMenuItemsByCategory(category);
    }
  };

  const handlePrintReceipt = async (status: string) => {
    await updateSessionStatus(status);
    printReceipt(status);
  };

  const sessionId = localStorage.getItem("saved_session_id");

  useEffect(() => {
    let isMounted = true;
    setCurrentOrderItems([]);
    const fetchOrder = async (sId: string) => {
      try {
        const order = await getOrderBySessionId(sId);
        if (isMounted) {
          if (!order) await createOrder(sId, selectedSession?.restaurant_id || "");
          else {
            setCurrentOrder(order);
            await getOrderItemsByOrderId(order.id);
          }
        }
      } catch (err) { console.error(err); }
    };
    if (sessionId) { fetchOrder(sessionId); localStorage.removeItem("saved_session_id"); }
    else if (selectedSession?.session_id) fetchOrder(selectedSession.session_id);
    return () => { isMounted = false; };
  }, [selectedSession, getOrderBySessionId, createOrder, getOrderItemsByOrderId, setCurrentOrder, sessionId, setCurrentOrderItems]);

  if (loadingSessionsOverview) return <MenuSkeleton />;

  return (
    <Box m={2}>
      {sessionsOverview?.length === 0 ? (
         <Box textAlign="center" mt={10}>
            <TableRestaurantIcon sx={{ fontSize: 100, color: "text.disabled" }} />
            <Typography>No tables assigned</Typography>
            <Button variant="contained" onClick={() => navigate("/app/tables")}>Book Tables</Button>
         </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2, mb: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
               {sessionsOverview?.map((s: any, idx) => (
                 <Button key={idx} variant={selectedSession?.table_id === s.table_id ? "contained" : "outlined"} onClick={() => setSelectedSession(selectedSession?.table_id === s.table_id ? null : s)}>
                   Table {s.table_number}
                 </Button>
               ))}
            </Card>

            {selectedSession && (
              <>
                <TextField fullWidth size="small" label="Search menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 2 }} />
                <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto' }}>
                  {categories.map((c: any, idx) => (
                    <Button key={idx} variant={c.name === selectedCategory ? "contained" : "outlined"} onClick={() => handleCategoryClick(c)}>{c.name}</Button>
                  ))}
                </Stack>
                <Grid container spacing={2}>
                   {searchFilter.map((item: any, idx) => (
                     <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Card>
                           <CardActionArea onClick={() => addOrUpdateObject(item)}>
                              <CardMedia component="img" height="140" image={item.image_url} />
                              <CardContent>
                                 <Typography noWrap fontWeight="bold">{item.name}</Typography>
                                 <Typography variant="body2" color="primary">${item.price}</Typography>
                              </CardContent>
                           </CardActionArea>
                        </Card>
                     </Grid>
                   ))}
                </Grid>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
             {selectedSession ? (
               <Card sx={{ p: 2 }}>
                  <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
                    {steps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
                  </Stepper>
                  {getStepContent(activeStep)}
                  <CardActions sx={{ mt: 2 }}>
                     {proceedToCheckOut ? (
                       <Stack direction="row" spacing={2} width="100%">
                         <Button fullWidth variant="outlined" onClick={handleBack}>Back</Button>
                         <Button fullWidth variant="contained" color="success" onClick={handleNext}>Pay</Button>
                       </Stack>
                     ) : (
                       <Stack direction="row" spacing={2} width="100%">
                         <Button fullWidth variant="contained" onClick={() => handlePrintReceipt("billed")}>Print</Button>
                         <Button fullWidth variant="contained" color="success" disabled={selectedSession.session_status !== "billed"} onClick={handleNext}>Checkout</Button>
                       </Stack>
                     )}
                  </CardActions>
               </Card>
             ) : (
               <Typography>Select a table to start</Typography>
             )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Menu;
