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
  IconButton,
} from "@mui/material";
import {
  ShoppingCart,
  AttachMoney,
  AccessTime,
  Restaurant,
  Receipt,
  TableRestaurant,
} from "@mui/icons-material";

export default function OrdersAwaitingPayment({
  activeSessions,
  setSelectedSession,
}) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        mb: 3,
        borderLeft: "5px solid",
        borderColor: "primary.main",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "primary.main",
          }}
        >
          <ShoppingCart /> Orders Awaiting Payment
        </Typography>

        <List>
          {activeSessions.map((session) => (
            <ListItem
              key={session.id}
              button
              onClick={() => setSelectedSession(session)}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                mb: 1,
                p: 2,
                "&:hover": { backgroundColor: "action.hover" },
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              {/* Top Row: Order ID and Status */}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  <Receipt fontSize="small" sx={{ mr: 0.5 }} />
                  Order #{session.order_id}
                </Typography>
                <Chip
                  label={session.session_status}
                  color={
                    session.session_status === "billed"
                      ? "warning"
                      : session.session_status === "open"
                      ? "info"
                      : "error"
                  }
                  size="small"
                />
              </Box>

              {/* Second Row: Details Grid */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AttachMoney fontSize="small" color="success" />
                    <Typography variant="body2">
                      Total: ${session.order_total}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Restaurant fontSize="small" color="secondary" />
                    <Typography variant="body2" noWrap>
                      {session.order_items
                        .map((item) => item.menu_item.name)
                        .join(", ")}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TableRestaurant fontSize="small" color="primary" />
                    <Typography variant="body2">
                      Table {session.table_number ?? "N/A"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2">
                      {new Date(session.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
