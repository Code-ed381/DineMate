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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  History as HistoryIcon,
  Search,
  ReceiptLong as ReceiptIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  TableBar as TableIcon,
  CalendarMonth as CalendarIcon,
  LocalBar,
} from "@mui/icons-material";
import useMenuStore from "../../lib/menuStore";
import useAuthStore from "../../lib/authStore";
import { formatDateTimeWithSuffix } from "../../utils/format-datetime";
import useRestaurantStore from "../../lib/restaurantStore";
import EmptyState from "../../components/empty-state";
import { printReceipt } from "../../components/PrintWindow";
import { getCurrencySymbol } from "../../utils/currency";

const BartenderHistory: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuthStore();
  const { myOrders, loadingMyOrders, fetchMyOrderHistory, getOrderItemsByOrderId } = useMenuStore();
  const { selectedRestaurant } = useRestaurantStore();
  
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
    const bartenderName = user?.user_metadata?.first_name || "Bartender";
    const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPrice = order.total || items.reduce((sum, item) => sum + (item.sum_price || 0), 0);
    
    printReceipt(
      order.id,
      bartenderName,
      order.table_number ? `Table ${order.table_number}` : "OTC",
      totalQty,
      totalPrice,
      items,
      totalPrice.toFixed(2),
      totalPrice.toFixed(2), // Assume full payment for history
      "0.00",
      "0.00",
      selectedRestaurant
    );
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Stack 
        direction="row" 
        alignItems="center" 
        spacing={1.5} 
        sx={{ 
          mb: { xs: 2.5, md: 4 }, 
          display: { xs: 'none', md: 'flex' } 
        }}
      >
        <LocalBar sx={{ fontSize: { xs: 28, md: 32 } }} color="primary" />
        <Box>
            <Typography variant="h5" fontWeight="800" sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' } }}>Order History</Typography>
            <Typography variant="caption" color="text.secondary">Review past sales and reprints</Typography>
        </Box>
      </Stack>

      {/* ---- Controls ---- */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2, mt: { xs: 1, md: 0 } }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
          <TextField
            type="date"
            label="Filter by Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            size="small"
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: { borderRadius: 2 },
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarIcon color="action" sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
          {!isMobile && (
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
              {filteredOrders.length} Orders Found
            </Typography>
          )}
        </Stack>

        <TextField
          placeholder="Search items..."
          size="small"
          fullWidth
          sx={{ maxWidth: { md: 350 } }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            sx: { borderRadius: 2 },
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" sx={{ fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {loadingMyOrders ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Box sx={{ p: 10, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed grey', borderRadius: 4 }}>
          <EmptyState 
            title="No Orders" 
            description="No orders found for this date." 
            emoji="📜"
            height={400}
          />
        </Box>
      ) : !isMobile ? (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: alpha(theme.palette.primary.main, 0.05), fontWeight: 800 } }}>
                <TableCell>Order ID</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order: any) => (
                <TableRow 
                  key={order.id} 
                  hover 
                  onClick={() => handleViewOrder(order)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                >
                  <TableCell sx={{ fontWeight: 700 }}>#{order.id.toString().slice(-6)}</TableCell>
                  <TableCell>{formatDateTimeWithSuffix(order.created_at)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.table_number ? `Table ${order.table_number}` : "OTC"} 
                      size="small" 
                      variant="outlined" 
                      sx={{ fontWeight: 700, borderColor: order.table_number ? 'primary.main' : 'secondary.main', color: order.table_number ? 'primary.main' : 'secondary.main' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {currency}{order.total?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status?.toUpperCase()} 
                      size="small" 
                      color={order.status === 'served' || order.status === 'completed' ? 'success' : 'warning'} 
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Reprint Receipt">
                      <IconButton 
                        color="primary" 
                        onClick={async (e) => {
                          e.stopPropagation();
                          const items = await getOrderItemsByOrderId(order.id);
                          handleReprint(order, items);
                        }}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={2}>
          {filteredOrders.map((order: any) => (
            <Grid item xs={12} sm={6} key={order.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none'
                }}
              >
                <CardHeader
                  avatar={
                    <Box 
                      sx={{ 
                        bgcolor: order.table_number ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.secondary.main, 0.1), 
                        color: order.table_number ? 'primary.main' : 'secondary.main', 
                        p: 1, 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: 40,
                        justifyContent: 'center'
                      }}
                    >
                      {order.table_number ? <TableIcon fontSize="small" /> : <LocalBar fontSize="small" />}
                      <Typography sx={{ ml: 0.5, fontWeight: 800, fontSize: '0.8rem' }}>
                          {order.table_number || "OTC"}
                      </Typography>
                    </Box>
                  }
                  title={`#${order.id.toString().slice(-6)}`}
                  titleTypographyProps={{ fontWeight: 700 }}
                  subheader={formatDateTimeWithSuffix(order.created_at)}
                  sx={{ pb: 1 }}
                />
                <Divider />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
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
                          color={order.status === 'served' || order.status === 'completed' ? 'success' : 'warning'} 
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: '0.65rem' }} 
                       />
                    </Box>
                  </Stack>
                </CardContent>
                <Divider />
                <Grid container>
                  <Grid item xs={6} sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
                    <Button 
                      fullWidth 
                      variant="text" 
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewOrder(order)}
                      sx={{ borderRadius: 0, py: 1.5, color: 'primary.main', fontWeight: 700 }}
                    >
                      Details
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth 
                      variant="text" 
                      startIcon={<PrintIcon />}
                      onClick={async () => {
                        const items = await getOrderItemsByOrderId(order.id);
                        handleReprint(order, items);
                      }}
                      sx={{ borderRadius: 0, py: 1.5, color: 'primary.main', fontWeight: 700 }}
                    >
                      Print
                    </Button>
                  </Grid>
                </Grid>
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
                  Processed at: {selectedOrder && formatDateTimeWithSuffix(selectedOrder.created_at)}
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

export default BartenderHistory;
