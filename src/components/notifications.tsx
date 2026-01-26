import React, { useEffect, ReactNode } from "react";
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalOffer as LocalOfferIcon,
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import Diversity3TwoToneIcon from "@mui/icons-material/Diversity3TwoTone";

import useNotificationStore from "../lib/notificationStore";

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const getNotificationStyle = (type: string) => {
  const styles: Record<string, { icon: ReactNode, color: string, bgColor: string }> = {
    order: { icon: <ShoppingCartIcon />, color: "#FF6B6B", bgColor: "#FFE5E5" },
    offer: { icon: <LocalOfferIcon />, color: "#4ECDC4", bgColor: "#E0F7F6" },
    general: { icon: <RestaurantIcon />, color: "#FFE135", bgColor: "#FFF4E0" },
    role: { icon: <Diversity3TwoToneIcon />, color: "#deb372ff", bgColor: "#b3684bff" },
    user: { icon: <PersonIcon />, color: "#0edb15ff", bgColor: "#FFF4E0" },
    default: { icon: <NotificationsIcon />, color: "#16b9c5ff", bgColor: "#F0F0F0" },
  };
  return styles[type] || styles.default;
};

interface NotificationListProps {
  notifications: any[]; // Or UserNotification[] if imported
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  onClearAll?: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  anchorEl,
  open,
  onClose,
  onDelete,
  onMarkAsRead,
  onClearAll,
}) => {
  const {
    fetchNotifications,
    markAsRead,
    subscribeToNotifications,
    unsubscribe,
    requestPermission,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
    requestPermission();
    return () => unsubscribe();
  }, [subscribeToNotifications, fetchNotifications, requestPermission, unsubscribe]);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(id);
    onMarkAsRead?.(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{ sx: { mt: 1.5, width: 380, maxHeight: "70vh", borderRadius: 2 } }}
    >
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={600}>Notifications</Typography>
        {notifications.length > 0 && <Button size="small" onClick={onClearAll}>Clear all</Button>}
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>
      <List sx={{ p: 0 }}>
        {notifications.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
            <NotificationsIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="body1" color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          notifications.map((n: any, idx) => {
            const style = getNotificationStyle(n?.notification?.type);
            const isUnread = !n?.read_at;
            return (
              <React.Fragment key={idx}>
                <ListItem sx={{ bgcolor: isUnread ? "action.hover" : "transparent" }} onClick={(e) => handleMarkAsRead(n.id, e)}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: style.bgColor, color: style.color }}>{style.icon}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="body2" fontWeight={isUnread ? 600 : 400}>{n?.notification?.message}</Typography>}
                    secondary={<Typography variant="caption">{formatDateTime(n?.created_at)}</Typography>}
                  />
                  <Box sx={{ display: "flex" }}>
                    <IconButton size="small" onClick={(e) => handleDelete(n.id, e)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </ListItem>
                {idx < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })
        )}
      </List>
    </Popover>
  );
};

export default NotificationList;
