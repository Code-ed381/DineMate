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
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
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
  Skeleton,
  useMediaQuery,
  useTheme,
  Chip,
} from "@mui/material";
import {
  TableRestaurant as TableRestaurantIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Fastfood as FastfoodIcon,
  RestaurantMenu as RestaurantMenuIcon,
} from "@mui/icons-material";
import useMenuStore from "../lib/menuStore";
import useTablesStore from "../lib/tablesStore";
import { printReceipt } from "../components/PrintWindow";
import MenuSkeleton from "../components/skeletons/menu-section-skeleton";

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    categories,
    fetchCategories,
    filteredMenuItems,
    fetchMenuItems,
    setFilteredMenuItems,
    chosenTableSession,
    updateSessionStatus,
    setCurrentOrderItems,
    updateQuantity,
    loadingMenuItems,
    loadingCategories,
    subscribeToOrderItems,
    unsubscribeFromOrderItems,
    currentKitchenTasks,
  } = useMenuStore();
  // ... rest of logic stays same
  const [searchTerm, setSearchTerm] = useState("");

  const getItemStatusBreakdown = (itemId: string) => {
    const tasks = currentKitchenTasks.filter((t: any) => t.order_item_id === itemId);
    if (!tasks || tasks.length === 0) return null;
    
    const counts: Record<string, number> = {};
    tasks.forEach((t: any) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  };

  const getRowLockState = (item: any) => {
     // If something else or no tasks, fallback to item status
     if (item.type !== 'food' && item.type !== 'drink') return { canRemove: true, canDecrease: true };
     
     const counts = getItemStatusBreakdown(item.order_item_id);
     
     // If no tasks found but it's food, rely on main status. 
     // If 'preparing/ready/served', strictly locked.
     if (!counts) {
        const isLocked = ['preparing', 'ready', 'served'].includes(item.order_item_status);
        return { canRemove: !isLocked, canDecrease: !isLocked };
     }
     
     const pendingCount = counts['pending'] || 0;
     const preparingCount = counts['preparing'] || 0;
     const readyCount = counts['ready'] || 0;
     const servedCount = counts['served'] || 0;
     const cookingCount = preparingCount + readyCount + servedCount;
     
     // specific logic:
     // - Remove (Trash): Only allowed if NO cooking items exist. (Cannot nuke line if some are cooking)
     // - Decrease (-): Allowed if there are PENDING items to remove.
     return {
        canRemove: cookingCount === 0,
        canDecrease: pendingCount > 0
     };
  };

  const {
    selectedSession,
    setSelectedSession,
    sessionsOverview,
    getSessionsOverview,
    loadingSessionsOverview,
  } = useTablesStore();

  useEffect(() => {
    getActiveSessionByRestaurant();
    fetchCategories();
    fetchMenuItems();
    getSessionsOverview();
    
    // Subscribe to real-time updates
    subscribeToOrderItems();
    
    return () => {
      unsubscribeFromOrderItems();
    };
  }, [getActiveSessionByRestaurant, fetchCategories, fetchMenuItems, getSessionsOverview, subscribeToOrderItems, unsubscribeFromOrderItems]);

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
            <Stack 
              direction={{ xs: "column", sm: "row" }} 
              spacing={1}
              mt={2} 
              sx={{ 
                alignItems: { xs: "flex-start", sm: "center" }, 
                justifyContent: "space-between", 
                border: "1px solid", 
                borderColor: "divider", 
                borderRadius: 2, 
                p: 2 
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">ORDER NO. {currentOrder?.id || "---"}</Typography>
              <Typography variant="body2" color="textSecondary">{formatDateTime(selectedSession?.opened_at)}</Typography>
            </Stack>
            <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 2, overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: { xs: 300, sm: '100%' } }}>
                <TableHead>
                  <TableRow>
                     <TableCell><CancelIcon fontSize="small" /></TableCell>
                     <TableCell>Product</TableCell>
                     <TableCell>Status</TableCell>
                     <TableCell>Price</TableCell>
                     <TableCell align="center">Qty</TableCell>
                     <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingCurrentOrderItems ? (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                  ) : currentOrderItems?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <FastfoodIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                        <Typography color="textSecondary">No items in basket</Typography>
                      </TableCell>
                    </TableRow>
                   ) : (
                    currentOrderItems.map((item: any, idx: number) => {
                      const lockState = getRowLockState(item);
                      const breakdown = (item.type === 'food' || item.type === 'drink') ? getItemStatusBreakdown(item.order_item_id) : null;
                      
                      return (
                      <TableRow key={idx}>
                         <TableCell>
                           <IconButton 
                             size="small" 
                             onClick={() => handleRemoveItem(item)}
                             disabled={!lockState.canRemove}
                             title={!lockState.canRemove ? "Cannot remove - items are being prepared" : "Remove item"}
                           >
                             <CancelIcon fontSize="small" color={!lockState.canRemove ? "disabled" : "error"} />
                           </IconButton>
                         </TableCell>
                         <TableCell>{item.item_name}</TableCell>
                         <TableCell>
                           {breakdown ? (
                             <Stack direction="row" gap={0.5} flexWrap="wrap">
                               {breakdown['pending'] > 0 && <Chip label={`${breakdown['pending']} PENDING`} size="small" color="default" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                               {breakdown['preparing'] > 0 && <Chip label={`${breakdown['preparing']} PREP`} size="small" color="warning" variant="filled" sx={{ height: 20, fontSize: '0.65rem' }} />}
                               {breakdown['ready'] > 0 && <Chip label={`${breakdown['ready']} READY`} size="small" color="info" variant="filled" sx={{ height: 20, fontSize: '0.65rem' }} />}
                               {breakdown['served'] > 0 && <Chip label={`${breakdown['served']} SERVED`} size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />}
                             </Stack>
                           ) : (
                             <Chip 
                               label={(item.order_item_status || 'Pending').toUpperCase()} 
                               size="small" 
                               color={
                                 item.order_item_status === 'preparing' ? 'warning' :
                                 item.order_item_status === 'ready' ? 'info' :
                                 item.order_item_status === 'served' ? 'success' :
                                 'default'
                               }
                               variant={item.order_item_status === 'pending' ? 'outlined' : 'filled'}
                             />
                           )}
                         </TableCell>
                         <TableCell>£{item.unit_price}</TableCell>
                         <TableCell align="center">
                            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                                <IconButton size="small" onClick={() => updateQuantity(item, 'decrease')} disabled={!lockState.canDecrease || item.quantity <= 0}><RemoveIcon fontSize="small" /></IconButton>
                                <Box sx={{ px: 1, bgcolor: 'primary.main', color: 'white', borderRadius: 1, minWidth: 20, textAlign: 'center' }}>{item.quantity}</Box>
                                <IconButton size="small" onClick={() => updateQuantity(item, 'increase')}><AddIcon fontSize="small" /></IconButton>
                            </Stack>
                         </TableCell>
                         <TableCell>£{item.sum_price?.toFixed(2)}</TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
                <TableFooter>
                   <TableRow><TableCell colSpan={5}>Subtotal</TableCell><TableCell>£{totalOrdersPrice?.toFixed(2)}</TableCell></TableRow>
                   <TableRow><TableCell colSpan={5}><Typography variant="h6" fontWeight="bold">Total</Typography></TableCell><TableCell><Typography variant="h6" fontWeight="bold" color="primary">£{totalOrdersPrice?.toFixed(2)}</Typography></TableCell></TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </>
        );
      case 1:
        return (
          <Stack spacing={3} mt={4} alignItems="center">
            <Typography variant="h6">Total Amount</Typography>
            <Typography variant="h2"><strong>£ {formatCashInput(totalOrdersPrice)}</strong></Typography>
            <Stack spacing={2} width="100%">
               <TextField fullWidth label="Card" type="number" value={card} onChange={(e) => setCard(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }} />
               <TextField fullWidth label="Cash" type="number" value={cash} onChange={(e) => setCash(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">£</InputAdornment> }} />
            </Stack>
          </Stack>
        );
      default: return null;
    }
  };

  const currentSession = chosenTableSession || selectedSession;
  const isBilled = currentSession?.session_status === "billed";

  const searchFilter = useMemo(() => {
    return filteredMenuItems.filter((item: any) => 
      searchTerm === "" || item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredMenuItems, searchTerm]);

  const handleCategoryClick = async (category: any) => {
    if (category.name === selectedCategory) {
      setFilteredMenuItems(menuItems);
      setSelectedCategory({ id: "", name: "", restaurant_id: "" } as any); 
    } else {
      setSelectedCategory(category);
      filterMenuItemsByCategory();
    }
  };

  const handlePrintReceipt = async (status: string) => {
    await updateSessionStatus(status);
    const orderItems = currentOrderItems || [];
    const totalQty = orderItems.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
    const waiterName = currentSession?.waiter_name || "Unknown";
    const tableNo = currentSession?.table_number || "N/A";

    printReceipt(
      currentOrder?.id || "N/A",
      waiterName,
      tableNo,
      totalQty,
      totalOrdersPrice || 0,
      orderItems,
      totalOrdersPrice?.toFixed(2) || "0.00", 
      cash || "0.00",
      card || "0.00",
      (Number(cash || 0) + Number(card || 0) - (totalOrdersPrice || 0)).toFixed(2) 
    );
  };

  const sessionId = localStorage.getItem("saved_session_id");

  useEffect(() => {
    let isMounted = true;
    setCurrentOrderItems([]);
    const fetchOrder = async (sId: string) => {
      // Don't try to fetch if session ID is empty or invalid
      if (!sId || sId === 'null' || sId === 'undefined') {
        console.warn('No valid session ID provided, skipping order fetch');
        return;
      }
      
      try {
        const order = await getOrderBySessionId(sId);
        if (isMounted) {
          if (!order) await createOrder(sId, currentSession?.restaurant_id || "");
          else {
            setCurrentOrder(order);
            await getOrderItemsByOrderId(order.id);
          }
        }
      } catch (err) { console.error(err); }
    };
    if (sessionId) { fetchOrder(sessionId); localStorage.removeItem("saved_session_id"); }
    else if (currentSession?.session_id) fetchOrder(currentSession.session_id);
    return () => { isMounted = false; };
  }, [currentSession, getOrderBySessionId, createOrder, getOrderItemsByOrderId, setCurrentOrder, sessionId, setCurrentOrderItems]);

  if (loadingSessionsOverview) return <MenuSkeleton />;

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, minHeight: '90vh', bgcolor: 'background.default' }}>
      {sessionsOverview?.length === 0 ? (
         <Box sx={{ textAlign: "center", mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <TableRestaurantIcon sx={{ fontSize: 120, color: "text.disabled", opacity: 0.5 }} />
            <Typography variant="h5" color="textSecondary" fontWeight="bold">No tables assigned to you</Typography>
            <Typography color="textSecondary">You need to book tables from the table management section first.</Typography>
            <Button variant="contained" size="large" onClick={() => navigate("/app/tables")} sx={{ borderRadius: 2, px: 4 }}>Go to Tables</Button>
         </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2, mb: 3, borderRadius: 3 }}>
               <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="textSecondary">SELECT TABLE</Typography>
               <Stack direction="row" spacing={1.5} sx={{ pb: 1, overflowX: 'auto', '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 } }}>
                  {sessionsOverview
                    ?.filter((s: any) => s.session_status !== "close")
                    .map((s: any, idx: number) => (
                      <Button 
                        key={idx} 
                        variant={currentSession?.table_id === s.table_id ? "contained" : "outlined"} 
                        onClick={() => setSelectedSession(currentSession?.table_id === s.table_id ? null : s)}
                        sx={{ borderRadius: 2, minWidth: 100, py: 1.5, textTransform: 'none', fontWeight: 'bold' }}
                      >
                        Table {s.table_number}
                      </Button>
                   ))}
               </Stack>
            </Card>

            {currentSession ? (
              <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                <TextField 
                  fullWidth 
                  variant="outlined"
                  placeholder="Search for dishes, drinks..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' } }} 
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment> }}
                />
                
                <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="textSecondary">CATEGORIES</Typography>
                <Stack direction="row" spacing={1.5} sx={{ mb: 3, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 } }}>
                  {loadingCategories ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rectangular" width={100} height={40} sx={{ borderRadius: 2, flexShrink: 0 }} />)
                  ) : (
                    categories.map((c: any, idx) => (
                      <Button 
                        key={idx} 
                        variant={c.name === selectedCategory ? "contained" : "outlined"} 
                        onClick={() => handleCategoryClick(c)}
                        sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        {c.name}
                      </Button>
                    ))
                  )}
                </Stack>

                <Grid container spacing={2}>
                   {loadingMenuItems ? (
                     Array.from({ length: 8 }).map((_, i) => (
                       <Grid item xs={12} sm={6} md={3} key={i}>
                         <Skeleton variant="rectangular" height={isMobile ? 80 : 220} sx={{ borderRadius: 3 }} />
                       </Grid>
                     ))
                   ) : searchFilter.length > 0 ? (
                     searchFilter.map((item: any, idx) => (
                       <Grid item xs={12} sm={6} md={3} key={idx}>
                          <Card sx={{ 
                            borderRadius: 3, 
                            transition: 'transform 0.2s', 
                            '&:hover': { transform: 'translateY(-5px)', boxShadow: 10 },
                          }}>
                             <CardActionArea onClick={() => addOrUpdateObject(item)} sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, alignItems: 'center', p: { xs: 1, sm: 0 }, justifyContent: 'flex-start' }}>
                                <CardMedia 
                                  component="img" 
                                  sx={{ 
                                    width: { xs: 70, sm: '100%' }, 
                                    height: { xs: 70, sm: 150 },
                                    borderRadius: { xs: 2, sm: 0 },
                                    objectFit: 'cover'
                                  }} 
                                  image={item.image_url || 'https://via.placeholder.com/150?text=No+Image'} 
                                />
                                <CardContent sx={{ flexGrow: 1, width: '100%', py: { xs: 0, sm: 2 }, px: 2 }}>
                                   <Stack direction="row" justifyContent="space-between" alignItems="center">
                                      <Typography noWrap variant="body1" fontWeight="bold" sx={{ maxWidth: { xs: '60%', sm: '100%' } }}>{item.name}</Typography>
                                      <Typography variant="body1" color="primary" fontWeight="bold">£{item.price}</Typography>
                                   </Stack>
                                </CardContent>
                             </CardActionArea>
                          </Card>
                       </Grid>
                     ))
                   ) : (
                     <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'action.hover', borderRadius: 4 }}>
                           <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                           <Typography variant="h6" color="textSecondary">No items found matching "{searchTerm}"</Typography>
                           <Button sx={{ mt: 1 }} onClick={() => setSearchTerm("")}>Clear filters</Button>
                        </Box>
                     </Grid>
                   )}
                </Grid>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 15, bgcolor: 'action.hover', borderRadius: 4, border: '2px dashed', borderColor: 'divider' }}>
                 <TableRestaurantIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
                 <Typography variant="h5" color="textSecondary" fontWeight="bold">Ready to take an order?</Typography>
                 <Typography color="textSecondary">Select an active table above to view the menu and start ordering.</Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
             {currentSession ? (
               <Card sx={{ 
                 p: { xs: 2, md: 3 }, 
                 borderRadius: 4, 
                 position: isMobile ? 'static' : 'sticky', 
                 top: 20,
                 maxHeight: isMobile ? 'auto' : 'calc(100vh - 100px)',
                 overflowY: isMobile ? 'visible' : 'auto'
               }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>Table {currentSession.table_number} Order</Typography>
                  <Stepper 
                    activeStep={activeStep} 
                    orientation={isMobile ? "vertical" : "horizontal"}
                    sx={{ mb: 4, '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' } }}
                  >
                    {steps.map(s => (
                      <Step key={s}>
                        <StepLabel optional={isMobile ? <Typography variant="caption">{s}</Typography> : null}>
                          {!isMobile && s}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  
                  <Box sx={{ minHeight: isMobile ? 'auto' : 300 }}>
                    {getStepContent(activeStep)}
                  </Box>

                  <CardActions sx={{ mt: 4, p: 0 }}>
                     {proceedToCheckOut ? (
                       <Stack direction="row" spacing={2} width="100%">
                         <Button fullWidth variant="outlined" size="large" onClick={handleBack} sx={{ borderRadius: 2, fontWeight: 'bold' }}>Back</Button>
                         <Button fullWidth variant="contained" color="success" size="large" onClick={handleNext} sx={{ borderRadius: 2, fontWeight: 'bold' }}>Pay</Button>
                       </Stack>
                     ) : (
                       <Stack direction="row" spacing={2} width="100%">
                         <Button fullWidth variant="contained" size="large" onClick={() => handlePrintReceipt("billed")} sx={{ borderRadius: 2, fontWeight: 'bold' }}>Print Bill</Button>
                         <Button fullWidth variant="contained" color="success" size="large" disabled={!isBilled} onClick={handleNext} sx={{ borderRadius: 2, fontWeight: 'bold' }}>Check Out</Button>
                       </Stack>
                     )}
                  </CardActions>
               </Card>
             ) : (
                <Card sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <RestaurantMenuIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" color="textSecondary">No Table Selected</Typography>
                  <Typography color="textSecondary" variant="body2">Choose one of your assigned tables to manage its current order.</Typography>
                </Card>
              )}
          </Grid>
        </Grid>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default Menu;

