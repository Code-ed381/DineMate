import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  History as HistoryIcon,
  Search,
  ReceiptLong as ReceiptIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  TableBar as TableIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import useMenuStore from "../../lib/menuStore";
import useAuthStore from "../../lib/authStore";
import { formatDateTimeWithSuffix } from "../../utils/format-datetime";

import { printReceipt } from "../../components/PrintWindow";
import { getCurrencySymbol } from "../../utils/currency";

const OrderHistory: React.FC = () => {
  const { user } = useAuthStore();
  const { myOrders, loadingMyOrders, fetchMyOrderHistory, getOrderItemsByOrderId } = useMenuStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const currency = getCurrencySymbol();

  useEffect(() => {
    if (user?.id) {
      const startOfDay = `${selectedDate}T00:00:00.000Z`;
      const endOfDay = `${selectedDate}T23:59:59.999Z`;
      fetchMyOrderHistory(user.id, startOfDay, endOfDay);
    }
  }, [user?.id, selectedDate, fetchMyOrderHistory]);

  const filteredOrders = myOrders.filter((order: any) => 
    order.id.toString().includes(searchTerm) || 
    order.table_number?.toString().includes(searchTerm)
  );

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    try {
      const items = await getOrderItemsByOrderId(order.id);
      setOrderDetails(items);
    } catch (error) {
      console.error("Failed to fetch order details", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleReprint = (order: any, items: any[]) => {
    const waiterName = user?.user_metadata?.first_name || "Staff";
    const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPrice = order.total || items.reduce((sum, item) => sum + (item.sum_price || 0), 0);
    
    // For history reprint, we might not have the original cash/card split easily from the joined view
    // but we can pass the total.
    printReceipt(
      order.id,
      waiterName,
      order.table_number || "?",
      totalQty,
      totalPrice,
      items,
      totalPrice.toFixed(2),
      totalPrice.toFixed(2), // Mock cash if unknown
      "0.00",
      "0.00"
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header removed as requested */}


      {/* ---- Controls ---- */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            type="date"
            label="Filter by Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            size="small"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {filteredOrders.length} Orders Found
          </Typography>
        </Stack>

        <TextField
          placeholder="Search by Order ID or Table..."
          size="small"
          fullWidth
          sx={{ maxWidth: { md: 350 } }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {loadingMyOrders ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredOrders.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ p: 10, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed grey' }}>
                <HistoryIcon sx={{ fontSize: 60, opacity: 0.2, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No orders found for this date.</Typography>
              </Card>
            </Grid>
          ) : (
            filteredOrders.map((order: any) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardHeader
                    avatar={
                      <Box 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white', 
                          p: 1, 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <TableIcon fontSize="small" />
                        <Typography sx={{ ml: 0.5, fontWeight: 800 }}>{order.table_number}</Typography>
                      </Box>
                    }
                    title={`#${order.id}`}
                    titleTypographyProps={{ fontWeight: 700 }}
                    subheader={formatDateTimeWithSuffix(order.created_at)}
                    sx={{ pb: 1 }}
                  />
                  <Divider />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary" variant="body2">Total Amount</Typography>
                        <Typography fontWeight={800} color="primary.main">
                          {currency}{order.total?.toFixed(2) || "0.00"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <Typography color="text.secondary" variant="body2">Status</Typography>
                         <Chip 
                            label={order.status?.toUpperCase()} 
                            size="small" 
                            color={order.status === 'served' ? 'success' : 'warning'} 
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                         />
                      </Box>
                    </Stack>
                  </CardContent>
                  <Divider />
                  <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewOrder(order)}
                      sx={{ borderRadius: 2 }}
                    >
                      Details
                    </Button>
                    <Tooltip title="Reprint Receipt">
                      <IconButton 
                        color="secondary" 
                        onClick={async () => {
                          const items = await getOrderItemsByOrderId(order.id);
                          handleReprint(order, items);
                        }}
                        sx={{ bgcolor: 'secondary.light', '&:hover': { bgcolor: 'secondary.main', color: 'white' } }}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* ---- Order Details Modal ---- */}
      <Dialog 
        open={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
          <ReceiptIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight={800}>Order Details</Typography>
          <Typography variant="caption" color="text.secondary">#{selectedOrder?.id} • Table {selectedOrder?.table_number}</Typography>
        </DialogTitle>
        <DialogContent>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <>
              <List sx={{ mt: 2 }}>
                {orderDetails.map((item: any) => (
                  <ListItem 
                    key={item.id}
                    sx={{ 
                      px: 0, 
                      py: 1, 
                      borderBottom: '1px dashed #eee',
                      flexDirection: 'column',
                      alignItems: 'stretch'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Typography fontWeight={600}>{item.item_name}</Typography>
                      <Typography fontWeight={700}>{currency}{item.sum_price?.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Typography variant="caption" color="text.secondary">
                        Qty: {item.quantity} × {currency}{item.unit_price?.toFixed(2)}
                      </Typography>
                      {item.status === 'cancelled' && (
                        <Chip label="VOIDED" size="small" color="error" sx={{ height: 16, fontSize: '0.6rem' }} />
                      )}
                    </Box>
                    {item.selected_modifiers?.length > 0 && (
                      <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', fontStyle: 'italic' }}>
                        + {item.selected_modifiers.map((m: any) => m.name).join(", ")}
                      </Typography>
                    )}
                    {item.notes && (
                      <Typography variant="caption" sx={{ color: 'warning.main', mt: 0.5 }}>
                        Note: {item.notes}
                      </Typography>
                    )}
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 3, color: 'primary.contrastText' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">Grand Total</Typography>
                  <Typography variant="h6" fontWeight={800}>{currency}{selectedOrder?.total?.toFixed(2) || "0.00"}</Typography>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Served at: {selectedOrder && formatDateTimeWithSuffix(selectedOrder.created_at)}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={() => handleReprint(selectedOrder, orderDetails)}
            disabled={loadingDetails}
            startIcon={<PrintIcon />}
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            Reprint Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderHistory;
