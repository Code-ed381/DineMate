import { List, ListItem, Box, Typography, Avatar } from "@mui/material";

function ReadyMealsList({ readyMeals, handleUpdateOrderItemStatus, getTimeAgo }) {
  return (
    <List>
      {readyMeals.map((dish) => (
        <ListItem
          key={dish.id}
          sx={{
            mb: 1.5,
            py: 2,
            px: 2,
            backgroundColor: "#e3f2fd", // light blue
            borderRadius: 2,
            boxShadow: 2,
            display: "flex",
            alignItems: "center",
          }}
          button
          onClick={() => handleUpdateOrderItemStatus(dish)}
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
            <Typography sx={{ fontWeight: 600, color: "#0d47a1" }}>
              {dish.menu_item_name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#1976d2" }}>
              Order #{dish.order_id} • Table {dish?.table_number} •{" "}
              {dish?.waiter_first_name && dish?.waiter_last_name
                ? `${dish?.waiter_first_name} ${dish?.waiter_last_name}`
                : "Unknown Waiter"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#1976d2" }}>
              {getTimeAgo(dish.item_updated_at)}
            </Typography>
          </Box>

          {/* Action Label */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: "#0d47a1",
              whiteSpace: "nowrap",
              ml: 2,
            }}
          >
            TAP TO SERVE
          </Typography>
        </ListItem>
      ))}
    </List>
  );
}

export default ReadyMealsList;