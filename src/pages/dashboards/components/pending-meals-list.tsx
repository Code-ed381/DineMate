import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  Box,
  Typography,
  LinearProgress,
  Avatar,
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";

interface PendingMealsListProps {
  pendingMeals: any[];
  handleUpdateOrderItemStatus: (dish: any) => void;
  getTimeAgo: (timestamp: string) => string;
  elapsedMinutesSince: (timestamp: string) => number;
  progressValue: (timestamp: string, prepTime: number) => number;
}

const useNow = (interval = 60000) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(id);
  }, [interval]);
};

const PendingMealsList: React.FC<PendingMealsListProps> = ({
  pendingMeals,
  handleUpdateOrderItemStatus,
  getTimeAgo,
  elapsedMinutesSince,
  progressValue,
}) => {
  useNow(30000);

  return (
    <List sx={{ p: 0 }}>
      {pendingMeals?.map((dish, index) => {
        const timeFromUpdate = elapsedMinutesSince(dish.order_item_updated_at);
        const prepTime = dish?.menu_item_prep_time || 15;
        const nearDeadline = timeFromUpdate >= prepTime - 2 && timeFromUpdate < prepTime;
        const overdue = timeFromUpdate >= prepTime;
        const shouldBlink = elapsedMinutesSince(dish.order_item_created_at) >= prepTime - 2;

        return (
          <ListItem
            key={dish.order_item_id || index}
            sx={{
              mb: 2, py: 2.5, px: 2.5, borderRadius: 3, boxShadow: shouldBlink ? 3 : 1,
              backgroundColor: overdue ? "#ffebee" : nearDeadline ? "#fff8e1" : "#ffffff",
              border: shouldBlink ? "2px solid" : "1px solid",
              borderColor: overdue ? "#d32f2f" : nearDeadline ? "#ff9800" : "#e0e0e0",
              animation: shouldBlink ? "pulseBg 1.5s ease-in-out infinite" : "none",
              "@keyframes pulseBg": {
                "0%, 100%": { boxShadow: overdue ? "0 4px 12px rgba(211,47,47,0.3)" : "0 4px 12px rgba(255,152,0,0.3)" },
                "50%": { boxShadow: overdue ? "0 8px 24px rgba(211,47,47,0.6)" : "0 8px 24px rgba(255,152,0,0.6)" },
              },
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                 backgroundColor: overdue ? "#ffcdd2" : nearDeadline ? "#ffecb3" : "#f5f5f5",
                 transform: "translateY(-2px)", boxShadow: 4,
              },
            }}
            onClick={() => handleUpdateOrderItemStatus(dish)}
          >
            <Box sx={{ display: 'flex', width: { xs: '100%', sm: 'auto' }, alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
              <Avatar src={dish.menu_item_image_url} alt={dish.menu_item_name} variant="rounded" sx={{ width: 72, height: 72, mr: 2.5, borderRadius: 2, boxShadow: 2, border: "2px solid #fff" }}>
                <RestaurantIcon sx={{ fontSize: 32, color: "#757575" }} />
              </Avatar>
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#d84315", fontSize: "1.1rem", mb: 1 }}>{dish.menu_item_name}</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                <Chip label={`Order #${dish.order_id}`} size="small" sx={{ bgcolor: "#e3f2fd", color: "#1976d2", fontWeight: 500 }} />
                <Chip label={`Table ${dish.table_number}`} size="small" sx={{ bgcolor: "#f3e5f5", color: "#7b1fa2", fontWeight: 500 }} />
                <Chip 
                  label={
                    dish.course === 1 ? "STARTER" :
                    dish.course === 2 ? "MAIN" :
                    dish.course === 3 ? "DESSERT" :
                    dish.course === 4 ? "DRINKS" :
                    `Course ${dish.course || 1}`
                  } 
                  size="small" 
                  sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 500 }} 
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 14, color: "#757575" }} />
                  <Typography variant="caption" sx={{ color: "#757575", fontWeight: 500 }}>{getTimeAgo(dish.order_item_created_at)}</Typography>
                </Box>
              </Box>
              {dish.notes && (
                <Box sx={{ mt: 1, p: 1, borderRadius: 1.5, bgcolor: 'rgba(216, 67, 21, 0.08)', borderLeft: '4px solid #d84315' }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', fontWeight: 600, color: '#bf360c' }}>
                    Note: {dish.notes}
                  </Typography>
                </Box>
              )}
              {dish.notes?.includes('[COMP') && (
                <Chip 
                  label="FREE / COMP" 
                  size="small" 
                  color="success" 
                  sx={{ mt: 1, fontWeight: 'bold', fontSize: '0.7rem' }} 
                />
              )}
              {dish.modifier_names?.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {dish.modifier_names.map((m: any, idx: number) => (
                    <Chip 
                      key={idx} 
                      label={m.name} 
                      size="small" 
                      sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'primary.light', color: 'primary.contrastText' }} 
                    />
                  ))}
                </Box>
              )}
            </Box>
            {dish?.order_item_status === "preparing" && (
              <Box sx={{ width: { xs: "100%", sm: 140 }, ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 }, position: "relative" }}>
                <LinearProgress variant="determinate" value={Math.min(progressValue(dish?.order_item_updated_at, prepTime), 100)} sx={{ height: 10, borderRadius: 5, backgroundColor: "#ffe0b2", "& .MuiLinearProgress-bar": { bgcolor: overdue ? "#c62828" : nearDeadline ? "#f57c00" : "#ff5722", borderRadius: 5 } }} />
                <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: overdue ? "#c62828" : nearDeadline ? "#f57c00" : "#6d4c41", fontWeight: 600, textAlign: "center" }}>{Math.min(Math.floor(timeFromUpdate), prepTime)}/{prepTime} min</Typography>
              </Box>
            )}
          </ListItem>
        );
      })}
    </List>
  );
};

export default PendingMealsList;
