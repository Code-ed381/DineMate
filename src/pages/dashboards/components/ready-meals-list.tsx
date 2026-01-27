import React from "react";
import { List, ListItem, Box, Typography, Avatar, Chip } from "@mui/material";
import { formatDateTimeWithSuffix } from "../../../utils/format-datetime";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface ReadyMealsListProps {
  readyMeals: any[];
  handleUpdateOrderItemStatus: (dish: any) => void;
}

const ReadyMealsList: React.FC<ReadyMealsListProps> = ({ readyMeals, handleUpdateOrderItemStatus }) => {
  return (
    <List sx={{ p: 0 }}>
      {readyMeals?.map((dish, index) => (
        <ListItem
          key={dish.order_item_id || index}
          sx={{
            mb: 2, py: 2.5, px: 2.5, borderRadius: 3, bgcolor: "#e3f2fd", border: "2px solid #1976d2", boxShadow: 2, 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", animation: "readyPulse 2s ease-in-out infinite", "@keyframes readyPulse": { "0%, 100%": { boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)" }, "50%": { boxShadow: "0 6px 16px rgba(25, 118, 210, 0.5)" } }, "&:hover": { backgroundColor: "#bbdefb", transform: "translateY(-2px)", boxShadow: 4 }
          }}
          onClick={() => handleUpdateOrderItemStatus(dish)}
        >
          <Box sx={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", bgcolor: "#4caf50", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(76, 175, 80, 0.8)", animation: "readyBlink 1.5s ease-in-out infinite", "@keyframes readyBlink": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.6 } } }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: "#fff" }} />
          </Box>
          <Box sx={{ display: 'flex', width: { xs: '100%', sm: 'auto' }, alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
            <Avatar src={dish?.menu_item_image_url} alt={dish?.menu_item_name} variant="rounded" sx={{ width: 72, height: 72, mr: 2.5, borderRadius: 2, boxShadow: 2, border: "2px solid #fff" }}>
              <RestaurantIcon sx={{ fontSize: 32, color: "#757575" }} />
            </Avatar>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0d47a1", fontSize: "1.1rem", mb: 1 }}>{dish.menu_item_name}</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
              <Chip label={`Order #${dish.order_id}`} size="small" sx={{ bgcolor: "#bbdefb", color: "#0d47a1", fontWeight: 500 }} />
              <Chip label={`Table ${dish?.table_number}`} size="small" sx={{ bgcolor: "#c5cae9", color: "#283593", fontWeight: 500 }} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><AccessTimeIcon sx={{ fontSize: 14, color: "#1976d2" }} /><Typography variant="caption" sx={{ color: "#1976d2", fontWeight: 500 }}>{formatDateTimeWithSuffix(dish.task_updated_at)}</Typography></Box>
              <Typography variant="caption" sx={{ color: "#0d47a1", fontWeight: 600 }}>Tap to serve</Typography>
            </Box>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default ReadyMealsList;
