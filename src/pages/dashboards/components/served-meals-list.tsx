import React from "react";
import { List, ListItem, Box, Typography, Avatar, Chip } from "@mui/material";
import { formatDateTimeWithSuffix } from "../../../utils/format-datetime";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface ServedMealsListProps {
  servedMeals: any[];
}

const ServedMealsList: React.FC<ServedMealsListProps> = ({ servedMeals }) => {
  return (
    <List sx={{ p: 0 }}>
      {servedMeals?.map((dish, index) => (
        <ListItem
          key={index}
          sx={{
            mb: 2, py: 2.5, px: 2.5, borderRadius: 3, backgroundColor: "#e8f5e9", border: "1px solid #66bb6a", boxShadow: 1, 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            cursor: "default", opacity: 0.9, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", "&:hover": { backgroundColor: "#c8e6c9", opacity: 1 }
          }}
        >
          <Box sx={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", bgcolor: "#4caf50", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(76, 175, 80, 0.4)" }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "#fff" }} />
          </Box>
          <Box sx={{ display: 'flex', width: { xs: '100%', sm: 'auto' }, alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
            <Avatar src={dish?.menu_item_image_url} alt={dish?.menu_item_name} variant="rounded" sx={{ width: 72, height: 72, mr: 2.5, borderRadius: 2, boxShadow: 2, border: "2px solid #fff", opacity: 0.95 }}>
              <RestaurantIcon sx={{ fontSize: 32, color: "#757575" }} />
            </Avatar>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2e7d32", fontSize: "1.1rem", mb: 1 }}>{dish?.menu_item_name}</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
              <Chip label={`Order #${dish?.order_id}`} size="small" sx={{ bgcolor: "#c8e6c9", color: "#1b5e20", fontWeight: 500 }} />
              <Chip label={`Table ${dish?.table_number}`} size="small" sx={{ bgcolor: "#dcedc8", color: "#33691e", fontWeight: 500 }} />
              {dish?.waiter_first_name && dish?.waiter_last_name && <Chip label={`${dish.waiter_first_name} ${dish.waiter_last_name}`} size="small" sx={{ bgcolor: "#e1f5fe", color: "#01579b", fontWeight: 500 }} />}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><AccessTimeIcon sx={{ fontSize: 14, color: "#43a047" }} /><Typography variant="caption" sx={{ color: "#43a047", fontWeight: 500 }}>{formatDateTimeWithSuffix(dish?.task_updated_at)}</Typography></Box>
              <Typography variant="caption" sx={{ color: "#2e7d32", fontWeight: 600 }}>Served</Typography>
            </Box>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default ServedMealsList;
