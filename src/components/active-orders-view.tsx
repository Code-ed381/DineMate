import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  Box,
  useTheme,
  alpha,
} from "@mui/material";
import {
  ShoppingCart,
  AttachMoney,
  AccessTime,
  Restaurant,
  Receipt,
  TableRestaurant,
} from "@mui/icons-material";

interface OrdersAwaitingPaymentProps {
  activeSessions: any[];
  setSelectedSession: (session: any) => void;
  sx?: any;
}

const OrdersAwaitingPayment: React.FC<OrdersAwaitingPaymentProps> = ({
  activeSessions,
  setSelectedSession,
  sx = {}
}) => {
  const theme = useTheme();
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Typography variant="subtitle2" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1, fontWeight: 700 }}>
          <ShoppingCart sx={{ fontSize: 20 }} color="primary" /> Orders Awaiting Payment
        </Typography>
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column' }}>
          {activeSessions.length > 0 ? (
            <List sx={{ p: 0 }}>
              {activeSessions.map((session) => (
                <ListItem
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  sx={{ 
                    border: "1px solid", 
                    borderColor: "divider", 
                    borderRadius: 2, 
                    mb: 1.5, 
                    p: { xs: 1.5, sm: 2 }, 
                    cursor: 'pointer',
                    display: 'block',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="800">
                      Order #{session.order_id?.toString().slice(-4)}
                    </Typography>
                    <Chip 
                      label={session.session_status === "close" ? "CLOSED" : session.session_status?.toUpperCase()} 
                      color={session.session_status === "billed" ? "warning" : (session.session_status === "closed" || session.session_status === "close") ? "error" : "info"} 
                      size="small" 
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                    />
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AttachMoney sx={{ fontSize: 16 }} color="success" />
                        <Typography variant="caption" fontWeight={600}>Total: ₵{session.order_total}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                        <TableRestaurant sx={{ fontSize: 16 }} color="primary" />
                        <Typography variant="caption" fontWeight={600}>Table {session.table_number ?? "N/A"}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center', 
              bgcolor: 'action.hover', 
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider',
              p: 3
            }}>
              <Receipt sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                No billed orders waiting for payment
              </Typography>
              <Typography variant="caption" color="text.disabled">
                New billed sessions will appear here automatically
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrdersAwaitingPayment;
