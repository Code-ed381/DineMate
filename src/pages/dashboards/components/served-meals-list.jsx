import { List, ListItem, Box, Typography, Avatar } from "@mui/material";
import { formatDateTimeWithSuffix } from "../../../utils/format-datetime";

function ServedMealsList({ servedMeals }) {
  return (
    <List>
      {servedMeals?.map((dish) => (
        <ListItem
          key={dish.id}
          sx={{
            mb: 1.5,
            py: 2,
            px: 2,
            backgroundColor: "#e8f5e9", // light green background
            borderRadius: 2,
            boxShadow: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Dish Thumbnail */}
          <Avatar
            src={dish?.menu_item_image_url}
            alt={dish?.menu_item_name}
            variant="rounded"
            sx={{
              width: 64,
              height: 64,
              mr: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          />

          {/* Dish Details */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, color: "#2e7d32" }}>
              {dish?.menu_item_name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#43a047" }}>
              Order #{dish?.order_id} • Table {dish?.table_number} •{" "}
              {dish?.waiter_first_name && dish?.waiter_last_name
                ? `${dish?.waiter_first_name} ${dish?.waiter_last_name}`
                : "Unknown Waiter"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#43a047" }}>
              {formatDateTimeWithSuffix(dish?.item_updated_at)}
            </Typography>
          </Box>

          {/* Optional Status Label (Uncomment if needed) */}
          {/* <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color:
                dish?.orders?.table_sessions?.status === "close"
                  ? "#b00020"
                  : "#1b5e20",
              whiteSpace: "nowrap",
              ml: 2,
            }}
          >
            {dish?.orders?.table_sessions?.status === "close"
              ? "CLOSED"
              : "OPEN"}
          </Typography> */}
        </ListItem>
      ))}
    </List>
  );
}

export default ServedMealsList;