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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme
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
import useRestaurantStore from "../../lib/restaurantStore";

import { printReceipt } from "../../components/PrintWindow";
import { getCurrencySymbol } from "../../utils/currency";
import { useSettings } from "../../providers/settingsProvider";

const OrderHistory: React.FC = () => {
  const { user } = useAuthStore();
  const { myOrders, loadingMyOrders, fetchMyOrderHistory, getOrderItemsByOrderId } = useMenuStore();
  const { selectedRestaurant } = useRestaurantStore();
  const { settings } = useSettings();
  const ms = settings?.menu_settings || {};
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  
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
    (order.table_number?.toString() || "OTC").includes(searchTerm)
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
      order.table_number || "OTC",
      totalQty,
      totalPrice,
      items,
      totalPrice.toFixed(2),
      totalPrice.toFixed(2), // Mock cash if unknown
      "0.00",
      "0.00",
      selectedRestaurant
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header removed as requested */}


      {/* ---- Controls ---- */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid item xs={12} md="auto">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: { xs: 'space-between', md: 'flex-start' } }}>
            <TextField
              type="date"
              label="Filter by Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              size="small"
              variant="outlined"
              sx={{ minWidth: { xs: '60%', md: 200 } }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
              {filteredOrders.length} Orders Found
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6} lg>
          <Box sx={{ display: 'flex', justifyContent: { md: 'flex-end' } }}>
            <TextField
              placeholder="Search by Order ID or Table..."
              size="small"
              fullWidth
              sx={{ maxWidth: { md: 400 } }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" fontSize="small" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {loadingMyOrders ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Card sx={{ p: 10, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed grey' }}>
          <HistoryIcon sx={{ fontSize: 60, opacity: 0.2, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No orders found.</Typography>
        </Card>
      ) : isDesktop ? (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Table</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Total</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order: any) => (
                <TableRow 
                  key={order.id} 
                  hover
                  sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell onClick={() => handleViewOrder(order)}>
                    <Typography fontWeight={700}>#{order.id}</Typography>
                  </TableCell>
                  <TableCell onClick={() => handleViewOrder(order)}>
                    <Chip size="small" icon={<TableIcon />} label={order.table_number} sx={{ fontWeight: 800 }} color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell onClick={() => handleViewOrder(order)}>
                    {formatDateTimeWithSuffix(order.created_at)}
                  </TableCell>
                  <TableCell onClick={() => handleViewOrder(order)}>
                    <Chip 
                      label={order.status?.toUpperCase()} 
                      size="small" 
                      color={order.status === 'served' ? 'success' : 'warning'} 
                      variant={(order.status === 'served') ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell align="right" onClick={() => handleViewOrder(order)}>
                    <Typography fontWeight={800} color="primary.main">
                      {currency}{order.total?.toFixed(2) || "0.00"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {ms.allow_reprint !== false ? (
                      <Tooltip title="Reprint Receipt">
                        <IconButton 
                          color="secondary" 
                          onClick={async (e) => {
                            e.stopPropagation();
                            const items = await getOrderItemsByOrderId(order.id);
                            handleReprint(order, items);
                          }}
                          sx={{ bgcolor: 'secondary.light', '&:hover': { bgcolor: 'secondary.main', color: 'white' } }}
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <span />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={2}>
          {filteredOrders.map((order: any) => (
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
                    <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1, borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                      <TableIcon fontSize="small" />
                      <Typography sx={{ ml: 0.5, fontWeight: 800 }}>{order.table_number || "OTC"}</Typography>
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
                <Box sx={{ p: 1.5, display: 'grid', gridTemplateColumns: ms.allow_reprint !== false ? '1fr 1fr' : '1fr', gap: 1 }}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewOrder(order)}
                    sx={{ borderRadius: 2 }}
                    size="small"
                  >
                    Details
                  </Button>
                  {ms.allow_reprint !== false && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      startIcon={<PrintIcon />}
                      onClick={async () => {
                        const items = await getOrderItemsByOrderId(order.id);
                        handleReprint(order, items);
                      }}
                      sx={{ borderRadius: 2 }}
                      size="small"
                      disableElevation
                    >
                      Print
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
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
        <DialogTitle sx={{ textAlign: 'center', pb: 0 }} component="div">
          <ReceiptIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight={800} component="div">Order Details</Typography>
          <Typography variant="caption" color="text.secondary" component="div">#{selectedOrder?.id} • {selectedOrder?.table_number ? `Table ${selectedOrder?.table_number}` : "OTC"}</Typography>
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
          {ms.allow_reprint !== false && (
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
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderHistory;
