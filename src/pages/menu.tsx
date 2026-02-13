import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceStrict } from "date-fns";
import {
  CircularProgress,
  TableContainer,
  Paper,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from "@mui/material";
import {
  TableRestaurant as TableRestaurantIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Fastfood as FastfoodIcon,
  RestaurantMenu as RestaurantMenuIcon,
  RateReview as RateReviewIcon,
  ShoppingCart as ShoppingCartIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  LocalOffer as LocalOfferIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import useAuthStore from "../lib/authStore";
import useMenuStore from "../lib/menuStore";
import useTablesStore from "../lib/tablesStore";
import useRestaurantStore from "../lib/restaurantStore";
import { printReceipt } from "../components/PrintWindow";
import MenuSkeleton from "../components/skeletons/menu-section-skeleton";
import { useCurrency } from "../utils/currency";
import ModifierSelectionDialog from "../components/ModifierSelectionDialog";
import SplitBillDialog from "../components/SplitBillDialog";
import MenuImage from "../components/MenuImage";

const Menu: React.FC = () => {
  const { currencySymbol } = useCurrency();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    getOrderBySessionId,
    currentOrder,
    currentOrderItems,
    setCurrentOrder,
    getOrderItemsByOrderId,
    loadingCurrentOrderItems,
    totalOrdersPrice,
    totalRemaining,
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
    updateItemNote,
    voidItem,
    compItem,
    resetOrder,
    selectedCourse,
    setSelectedCourse,
    tipAmount,
    setTipAmount,
    favoriteItemIds,
    toggleFavorite,
    isFavorite,
  } = useMenuStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedItemForNote, setSelectedItemForNote] = useState<any>(null);
  const [tempNote, setTempNote] = useState("");
  
  const [modifierDialogOpen, setModifierDialogOpen] = useState(false);
  const [itemToModify, setItemToModify] = useState<any>(null);

  const [splitBillOpen, setSplitBillOpen] = useState(false);

  const { selectedRestaurant } = useRestaurantStore();
  const { payForItems, payAllItems } = useMenuStore();

  const handlePayPartial = async (itemIds: string[], cash: number, card: number) => {
    const success = await payForItems(itemIds, cash, card);
    if (success) setSplitBillOpen(false);
  };

  const handlePayEqual = async (amount: number, cash: number, card: number) => {
    // For equal split, we take the cash/card input and pay towards the order total
    // We don't have a direct "pay amount" yet, so for now we'll just pay all items
    // but this is a simplification. The store needs to handle partial amounts.
    // For MVP, we'll let them pay the whole thing or split by item.
    // If they want to pay exactly an amount, we could select items that sum to that amount.
    // Let's stick to split by item for now as it's more precise.
    const success = await payAllItems(cash, card);
    if (success) setSplitBillOpen(false);
  };

  const [itemMenuAnchor, setItemMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemData, setMenuItemData] = useState<any>(null);

  const handleOpenItemMenu = (event: React.MouseEvent<HTMLButtonElement>, item: any) => {
    setItemMenuAnchor(event.currentTarget);
    setMenuItemData(item);
  };

  const handleCloseItemMenu = () => {
    setItemMenuAnchor(null);
    setMenuItemData(null);
  };

  const handleVoidItem = async () => {
    if (!menuItemData) return;
    handleCloseItemMenu();
    
    const { value: reason } = await Swal.fire({
      title: 'Void Item',
      input: 'text',
      inputLabel: 'Reason for voiding',
      inputPlaceholder: 'e.g. Ordered by mistake, Out of stock...',
      showCancelButton: true,
      confirmButtonText: 'Void Item',
      confirmButtonColor: '#d32f2f',
      inputValidator: (value) => {
        if (!value) return 'You need to provide a reason!'
      }
    });

    if (reason) {
      await voidItem(menuItemData.order_item_id, reason);
    }
  };

  const handleCompItem = async () => {
    if (!menuItemData) return;
    handleCloseItemMenu();

    const { value: reason } = await Swal.fire({
      title: 'Comp Item (Make Free)',
      text: "This will set the item price to 0.00",
      input: 'text',
      inputLabel: 'Reason for comping',
      inputPlaceholder: 'e.g. Long wait, Spilled drink...',
      showCancelButton: true,
      confirmButtonText: 'Comp Item',
      confirmButtonColor: '#2e7d32',
      inputValidator: (value) => {
        if (!value) return 'You need to provide a reason!'
      }
    });

    if (reason) {
      await compItem(menuItemData.order_item_id, reason);
    }
  };

  const getItemStatusBreakdown = (itemId: string) => {
    const tasks = currentKitchenTasks.filter((t: any) => t.order_item_id === itemId);
    const breakdown: Record<string, number> = { pending: 0, preparing: 0, ready: 0, served: 0 };
    tasks.forEach((t: any) => {
      const status = (t.status || t.order_item_status || "pending").toLowerCase();
      if (breakdown[status] !== undefined) breakdown[status]++;
    });
    return breakdown;
  };

  const handleOpenNoteDialog = (item: any) => {
    setSelectedItemForNote(item);
    setTempNote(item.notes || "");
    setNoteDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (selectedItemForNote) {
      await updateItemNote(selectedItemForNote.order_item_id, tempNote);
      setNoteDialogOpen(false);
    }
  };

  const getRowLockState = (item: any) => {
     if (item.type !== 'food' && item.type !== 'drink') return { canRemove: true, canDecrease: true };
     
     const counts = getItemStatusBreakdown(item.order_item_id);
     
     if (!counts || (counts.pending === 0 && counts.preparing === 0 && counts.ready === 0 && counts.served === 0)) {
        const isLocked = ['preparing', 'ready', 'served'].includes(item.order_item_status);
        return { canRemove: !isLocked, canDecrease: !isLocked };
     }
     
     const pendingCount = counts['pending'] || 0;
     const preparingCount = counts['preparing'] || 0;
     const readyCount = counts['ready'] || 0;
     const servedCount = counts['served'] || 0;
     const cookingCount = preparingCount + readyCount + servedCount;
     
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

  const currentSessionData = chosenTableSession || selectedSession;
  const currentSession = (currentSessionData?.id || currentSessionData?.session_id) ? currentSessionData : null;
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
    } else if (category.name === "Favorites") {
      setSelectedCategory(category);
      setFilteredMenuItems(menuItems.filter(item => isFavorite(item.id)));
    } else {
      setSelectedCategory(category);
      filterMenuItemsByCategory();
    }
  };

  const handlePrintReceipt = async (status: string) => {
    await updateSessionStatus(status);
    const orderItems = currentOrderItems || [];
    console.log("🖨️ handlePrintReceipt - Current Order Items:", orderItems);
    
    const { user } = useAuthStore.getState();
    console.log("DEBUG: handlePrintReceipt - User:", user);
    console.log("DEBUG: handlePrintReceipt - Session:", currentSession);
    const firstName = user?.user_metadata?.firstName || user?.user_metadata?.first_name || "";
    const lastName = user?.user_metadata?.lastName || user?.user_metadata?.last_name || "";
    const userName = (firstName + " " + lastName).trim() || user?.email || "Unknown";
    const waiterName = currentSession?.waiter_name || userName;
    const tableNo = currentSession?.table_number || "N/A";
    const displayOrderId = (currentOrder as any)?.order_no || (currentOrder as any)?.order_id || String(currentOrder?.id || "N/A").slice(-6).toUpperCase();

    if (orderItems.length === 0) {
      console.warn("⚠️ handlePrintReceipt - No items to print!");
      // Attempt to refetch if empty, just in case
      if (currentOrder?.id) {
         console.log("🔄 handlePrintReceipt - Refetching items for order:", currentOrder.id);
         const fetchedItems = await getOrderItemsByOrderId(currentOrder.id);
         console.log("🔄 handlePrintReceipt - Refetched items:", fetchedItems);
         
         if (fetchedItems && fetchedItems.length > 0) {
             const newTotalQty = fetchedItems.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
             printReceipt(
              displayOrderId,
              waiterName,
              tableNo,
              newTotalQty,
              totalOrdersPrice || 0,
              fetchedItems,
              totalOrdersPrice?.toFixed(2) || "0.00", 
              cash || "0.00",
              card || "0.00",
              (Number(cash || 0) + Number(card || 0) - (totalOrdersPrice || 0)).toFixed(2),
              selectedRestaurant
            );
            return;
         }
      }
    }

    const totalQty = orderItems.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);

    printReceipt(
      displayOrderId,
      waiterName,
      tableNo,
      totalQty,
      totalOrdersPrice || 0,
      orderItems,
      totalOrdersPrice?.toFixed(2) || "0.00",
      cash || "0.00",
      card || "0.00",
      (Number(cash || 0) + Number(card || 0) - (totalOrdersPrice || 0)).toFixed(2),
      selectedRestaurant
    );
  };

  useEffect(() => {
    let isMounted = true;
    const sId = currentSession?.session_id || currentSession?.id;
    
    if (!sId) {
      if (currentOrderItems.length > 0) resetOrder();
      return;
    }

    const fetchOrder = async (targetId: string) => {
      if (!targetId || targetId === 'null' || targetId === 'undefined') return;
      
      // Only clear if we are actually switching to a different session
      if (currentOrder?.session_id !== targetId) {
        setCurrentOrderItems([]);
      }
      try {
        const order = await getOrderBySessionId(targetId);
        if (isMounted) {
          if (order) {
            setCurrentOrder(order);
            await getOrderItemsByOrderId(order.id);
          } else {
            // Order doesn't exist. We do NOT create it here.
            // It will be created when the user adds an item via addOrUpdateObject.
            // This prevents "zombie" orders from reappearing if deleted.
            setCurrentOrder(null);
            setCurrentOrderItems([]);
          }
        }
      } catch (err) { console.error(err); }
    };

    if (sId) fetchOrder(sId);
    
    return () => { isMounted = false; };
  }, [currentSession, getOrderBySessionId, getOrderItemsByOrderId, setCurrentOrder, setCurrentOrderItems, currentOrder?.session_id, currentOrderItems.length, resetOrder]);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mt={2} sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
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
                      const isCancelled = item.status === 'cancelled';
                      const lockState = getRowLockState(item);
                      const breakdown = (item.type === 'food' || item.type === 'drink') ? getItemStatusBreakdown(item.order_item_id) : null;
                      
                      return (
                      <TableRow key={idx} sx={{ opacity: isCancelled ? 0.5 : 1, bgcolor: isCancelled ? 'action.hover' : 'transparent' }}>
                         <TableCell>
                            <Stack direction="row">
                              <IconButton size="small" onClick={() => handleRemoveItem(item)} disabled={!lockState.canRemove || isCancelled} title={!lockState.canRemove ? "Cannot remove - items are being prepared" : "Remove item"}><CancelIcon fontSize="small" color={(!lockState.canRemove || isCancelled) ? "disabled" : "error"} /></IconButton>
                              <IconButton size="small" onClick={(e) => handleOpenItemMenu(e, item)} disabled={isCancelled}><MoreVertIcon fontSize="small" /></IconButton>
                            </Stack>
                          </TableCell>
                         <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 <Typography variant="body2" fontWeight={600} sx={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>{item.item_name}</Typography>
                                 {item.course && (
                                   <Chip 
                                     label={
                                       item.course === 1 ? "STARTER" :
                                       item.course === 2 ? "MAIN" :
                                       item.course === 3 ? "DESSERT" :
                                       item.course === 4 ? "DRINKS" :
                                       `Course ${item.course}`
                                     } 
                                     size="small" 
                                     variant="outlined" 
                                     sx={{ 
                                       height: 18, 
                                       fontSize: '0.6rem', 
                                       fontWeight: 'bold',
                                       borderColor: item.is_started === false ? 'warning.main' : 'divider',
                                       color: item.is_started === false ? 'warning.main' : 'text.secondary'
                                     }} 
                                   />
                                 )}
                                 <IconButton size="small" onClick={() => handleOpenNoteDialog(item)} disabled={!lockState.canRemove || isCancelled} sx={{ p: 0.5 }}>
                                   <RateReviewIcon fontSize="inherit" color={item.notes ? "primary" : "action"} />
                                 </IconButton>
                                 {item.payment_status === 'completed' && <Chip label="PAID" size="small" color="success" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 'bold' }} />}
                                 {isCancelled && <Chip label="VOID" size="small" color="error" variant="outlined" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 'bold' }} />}
                               </Box>
                               {item.notes && <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>"{item.notes}"</Typography>}
                               {item.selected_modifiers?.length > 0 && (
                                 <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                                   {item.selected_modifiers.map((m: any) => (
                                     <Typography key={m.id} variant="caption" sx={{ bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 }}>
                                       + {m.name}
                                     </Typography>
                                   ))}
                                 </Box>
                               )}
                             </Box>
                          </TableCell>
                         <TableCell>
                           {breakdown && (breakdown.pending > 0 || breakdown.preparing > 0 || breakdown.ready > 0 || breakdown.served > 0) ? (
                             <Stack direction="row" gap={0.5} flexWrap="wrap">
                               {breakdown['pending'] > 0 && <Chip label={`${breakdown['pending']} PENDING`} size="small" color="default" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                               {breakdown['preparing'] > 0 && <Chip label={`${breakdown['preparing']} PREP`} size="small" color="warning" variant="filled" sx={{ height: 20, fontSize: '0.65rem' }} />}
                               {breakdown['ready'] > 0 && <Chip label={`${breakdown['ready']} READY`} size="small" color="info" variant="filled" sx={{ height: 20, fontSize: '0.65rem' }} />}
                               {breakdown['served'] > 0 && <Chip label={`${breakdown['served']} SERVED`} size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />}
                             </Stack>
                           ) : (
                             <Chip label={(item.order_item_status || 'Pending').toUpperCase()} size="small" color={item.order_item_status === 'preparing' ? 'warning' : item.order_item_status === 'ready' ? 'info' : item.order_item_status === 'served' ? 'success' : 'default'} variant={item.order_item_status === 'pending' ? 'outlined' : 'filled'} />
                           )}
                         </TableCell>
                         <TableCell>{currencySymbol}{item.unit_price}</TableCell>
                         <TableCell align="center">
                             <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                                 <IconButton size="small" onClick={() => updateQuantity(item, 'decrease')} disabled={!lockState.canDecrease || item.quantity <= 0 || isCancelled}><RemoveIcon fontSize="small" /></IconButton>
                                 <Box sx={{ px: 1, bgcolor: isCancelled ? 'text.disabled' : 'primary.main', color: 'white', borderRadius: 1, minWidth: 20, textAlign: 'center' }}>{item.quantity}</Box>
                                 <IconButton size="small" onClick={() => updateQuantity(item, 'increase')} disabled={isCancelled}><AddIcon fontSize="small" /></IconButton>
                             </Stack>
                         </TableCell>
                         <TableCell>{currencySymbol}{item.sum_price?.toFixed(2)}</TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
                <TableFooter>
                   <TableRow><TableCell colSpan={5}>Subtotal</TableCell><TableCell>{currencySymbol}{totalOrdersPrice?.toFixed(2)}</TableCell></TableRow>
                   <TableRow><TableCell colSpan={5}><Typography variant="h6" fontWeight="bold">Total</Typography></TableCell><TableCell><Typography variant="h6" fontWeight="bold" color="primary">{currencySymbol}{totalOrdersPrice?.toFixed(2)}</Typography></TableCell></TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </>
        );
      case 1:
        const subtotal = totalRemaining;
        const totalWithTip = subtotal + tipAmount;
        
        return (
          <Stack spacing={3} mt={2} alignItems="center">
            <Box width="100%">
              <Typography variant="caption" color="text.secondary" fontWeight="bold">SELECT TIP</Typography>
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                {[0, 5, 10, 15].map((pct) => {
                  const calculatedTip = Math.round((subtotal * pct / 100) * 100) / 100;
                  const isSelected = tipAmount === calculatedTip;
                  return (
                    <Button
                      key={pct}
                      variant={isSelected ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setTipAmount(calculatedTip)}
                      sx={{ borderRadius: 2, minWidth: 60, flex: 1 }}
                    >
                      {pct}%
                    </Button>
                  );
                })}
                <TextField 
                  size="small" 
                  placeholder="Custom Tip" 
                  type="number"
                  value={tipAmount || ""}
                  onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                  sx={{ flex: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                />
              </Stack>
            </Box>

            <Divider sx={{ width: '100%' }} />

            <Stack spacing={1} width="100%" sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 2 }}>
               <Stack direction="row" justifyContent="space-between">
                 <Typography variant="body2">Subtotal</Typography>
                 <Typography variant="body2">{currencySymbol}{subtotal.toFixed(2)}</Typography>
               </Stack>
               <Stack direction="row" justifyContent="space-between">
                 <Typography variant="body2">Tip</Typography>
                 <Typography variant="body2" color="primary">+{currencySymbol}{tipAmount.toFixed(2)}</Typography>
               </Stack>
               <Divider sx={{ my: 0.5 }} />
               <Stack direction="row" justifyContent="space-between">
                 <Typography variant="h6" fontWeight="bold">Total to Pay</Typography>
                 <Typography variant="h6" fontWeight="bold" color="primary">{currencySymbol}{totalWithTip.toFixed(2)}</Typography>
               </Stack>
            </Stack>

            <Stack spacing={2} width="100%">
               <TextField fullWidth label="Card Payment" type="number" value={card} onChange={(e) => setCard(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
               <TextField fullWidth label="Cash Payment" type="number" value={cash} onChange={(e) => setCash(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
               <Button 
                variant="outlined" 
                onClick={() => setSplitBillOpen(true)}
                startIcon={<ShoppingCartIcon />}
                sx={{ borderRadius: 2, py: 1.5 }}
               >
                 Split Bill / Multiple Payments
               </Button>
            </Stack>
          </Stack>
        );
      default: return null;
    }
  };

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
                    <>
                      <Button 
                        variant={"Favorites" === selectedCategory ? "contained" : "outlined"} 
                        onClick={() => handleCategoryClick({ name: "Favorites" })}
                        startIcon={"Favorites" === selectedCategory ? <StarIcon /> : <StarIcon color="warning" />}
                        sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        Favorites
                      </Button>
                      {categories.map((c: any, idx) => (
                        <Button 
                          key={idx} 
                          variant={c.name === selectedCategory ? "contained" : "outlined"} 
                          onClick={() => handleCategoryClick(c)}
                          sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                          {c.name}
                        </Button>
                      ))}
                    </>
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
                          <Card sx={{ borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 10 }, position: 'relative' }}>
                             <CardActionArea 
                               onClick={() => {
                                 if (item.modifier_groups?.length > 0) {
                                   setItemToModify(item);
                                   setModifierDialogOpen(true);
                                 } else {
                                   addOrUpdateObject(item);
                                 }
                               }} 
                               sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, alignItems: 'center', p: { xs: 1, sm: 0 }, justifyContent: 'flex-start' }}
                             >
                               <Box sx={{ width: { xs: 70, sm: '100%' }, height: { xs: 70, sm: 150 }, borderRadius: { xs: 2, sm: 0 }, overflow: 'hidden', flexShrink: 0 }}>
                                  <MenuImage 
                                    src={item.image_url} 
                                    name={item.name} 
                                    category={item.category_name} 
                                    sx={{ width: '100%', height: '100%' }}
                                  />
                                </Box>
                                <CardContent sx={{ flexGrow: 1, width: '100%', py: { xs: 0, sm: 2 }, px: 2 }}>
                                   <Stack direction="row" justifyContent="space-between" alignItems="center">
                                       <Box>
                                          <Typography noWrap variant="body1" fontWeight="bold" sx={{ maxWidth: { xs: '60%', sm: '100%' } }}>{item.name}</Typography>
                                          {item.modifier_groups?.length > 0 && (
                                            <Typography variant="caption" color="primary">Customizable</Typography>
                                          )}
                                       </Box>
                                       <Typography variant="body1" color="primary" fontWeight="bold">{currencySymbol}{item.price}</Typography>
                                    </Stack>
                                 </CardContent>
                              </CardActionArea>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(item.id);
                                }}
                                sx={{ 
                                  position: 'absolute', 
                                  top: 5, 
                                  right: 5, 
                                  bgcolor: 'rgba(255,255,255,0.8)',
                                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                                  zIndex: 2
                                }}
                              >
                                {isFavorite(item.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                              </IconButton>
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
               <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, position: isMobile ? 'static' : 'sticky', top: 20, maxHeight: isMobile ? 'auto' : 'calc(100vh - 100px)', overflowY: isMobile ? 'visible' : 'auto' }}>
                   <Typography variant="h5" fontWeight="bold">Table {currentSession.table_number} Order</Typography>
                   <Box sx={{ mt: 1, mb: 2 }}>
                     <Typography variant="caption" color="text.secondary" fontWeight="bold">ADD TO COURSE</Typography>
                     <ToggleButtonGroup
                       fullWidth
                       size="small"
                       value={selectedCourse}
                       exclusive
                       onChange={(_, val) => val && setSelectedCourse(val)}
                       sx={{ mt: 0.5 }}
                     >
                        <ToggleButton value={1} sx={{ py: 0.5, px: 1, fontSize: '0.7rem', fontWeight: 'bold' }}>STARTER</ToggleButton>
                        <ToggleButton value={2} sx={{ py: 0.5, px: 1, fontSize: '0.7rem', fontWeight: 'bold' }}>MAIN</ToggleButton>
                        <ToggleButton value={3} sx={{ py: 0.5, px: 1, fontSize: '0.7rem', fontWeight: 'bold' }}>DESSERT</ToggleButton>
                        <ToggleButton value={4} sx={{ py: 0.5, px: 1, fontSize: '0.7rem', fontWeight: 'bold' }}>DRINKS</ToggleButton>
                     </ToggleButtonGroup>
                   </Box>
                   <Stepper activeStep={activeStep} orientation={isMobile ? "vertical" : "horizontal"} sx={{ mb: 4, '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' } }}>
                    {steps.map(s => <Step key={s}><StepLabel optional={isMobile ? <Typography variant="caption">{s}</Typography> : null}>{!isMobile && s}</StepLabel></Step>)}
                  </Stepper>
                  <Box sx={{ minHeight: isMobile ? 'auto' : 300 }}>{getStepContent(activeStep)}</Box>
                  <CardActions sx={{ mt: 4, p: 0 }}>
                      {proceedToCheckOut ? (
                        <Stack direction="row" spacing={2} width="100%">
                          <Button fullWidth variant="outlined" size="large" onClick={handleBack} sx={{ borderRadius: 2, fontWeight: 'bold' }}>Back</Button>
                          <Button fullWidth variant="contained" color="success" size="large" disabled={currentOrderItems.length === 0} onClick={handleNext} sx={{ borderRadius: 2, fontWeight: 'bold' }}>Pay</Button>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={2} width="100%">
                          <Button 
                            fullWidth 
                            variant="contained" 
                            size="large" 
                            disabled={currentOrderItems.length === 0} 
                            onClick={() => handlePrintReceipt("billed")} 
                            sx={{ borderRadius: 2, fontWeight: 'bold' }}
                          >
                            Print Bill
                          </Button>
                          {isBilled && (
                            <Button 
                              fullWidth 
                              variant="contained" 
                              color="success" 
                              size="large" 
                              disabled={currentOrderItems.length === 0} 
                              onClick={handleNext} 
                              sx={{ borderRadius: 2, fontWeight: 'bold' }}
                            >
                              Check Out
                            </Button>
                          )}
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

      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Order Note</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>Special instructions for: <strong>{selectedItemForNote?.item_name}</strong></Typography>
          <TextField fullWidth multiline rows={3} placeholder="e.g. No onions, Extra spicy, etc." value={tempNote} onChange={(e) => setTempNote(e.target.value)} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNote} variant="contained" color="primary">Save Note</Button>
        </DialogActions>
      </Dialog>

      <MuiMenu
        anchorEl={itemMenuAnchor}
        open={Boolean(itemMenuAnchor)}
        onClose={handleCloseItemMenu}
      >
        <MuiMenuItem onClick={handleVoidItem} sx={{ color: 'error.main' }}>
          <BlockIcon sx={{ mr: 1, fontSize: 20 }} /> Void Item
        </MuiMenuItem>
        <MuiMenuItem onClick={handleCompItem} sx={{ color: 'success.main' }}>
          <LocalOfferIcon sx={{ mr: 1, fontSize: 20 }} /> Comp Item (Free)
        </MuiMenuItem>
      </MuiMenu>

      <ModifierSelectionDialog 
        open={modifierDialogOpen} 
        onClose={() => setModifierDialogOpen(false)} 
        item={itemToModify} 
        currencySymbol={currencySymbol}
        onConfirm={(selected) => {
          addOrUpdateObject(itemToModify, selected);
          setModifierDialogOpen(false);
        }}
      />

      <SplitBillDialog
        open={splitBillOpen}
        onClose={() => setSplitBillOpen(false)}
        items={currentOrderItems}
        currencySymbol={currencySymbol}
        onPayPartial={handlePayPartial}
        onPayEqual={handlePayEqual}
      />

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
