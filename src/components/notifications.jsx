import React, { useState, useEffect } from "react";
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
  Badge,
  Divider,
  Button,
} from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import Diversity3TwoToneIcon from "@mui/icons-material/Diversity3TwoTone";

import useNotificationStore from "../lib/notificationStore";
import useAuthStore from "../lib/authStore";
import useRestaurantStore from "../lib/restaurantStore";

// Helper function to format date/time
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Get icon and color based on notification type
const getNotificationStyle = (type) => {
  const styles = {
    order: { icon: <ShoppingCartIcon />, color: "#FF6B6B", bgColor: "#FFE5E5" },
    offer: { icon: <LocalOfferIcon />, color: "#4ECDC4", bgColor: "#E0F7F6" },
    general: {
      icon: <RestaurantIcon />,
      color: "#FFE135",
      bgColor: "#FFF4E0",
    },
    role: {
      icon: <Diversity3TwoToneIcon />,
      color: "#deb372ff",
      bgColor: "#b3684bff",
    },
    user: {
      icon: <PersonIcon />,
      color: "#0edb15ff",
      bgColor: "#FFF4E0",
    },
    default: {
      icon: <NotificationsIcon />,
      color: "#16b9c5ff",
      bgColor: "#F0F0F0",
    },
  };
  return styles[type] || styles.default;
};

const NotificationList = ({
  anchorEl,
  open,
  onClose,
  // notifications = [],
  onDelete,
  onMarkAsRead,
  onClearAll,
}) => {
  const id = open ? "notification-popover" : undefined;

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications,
    unsubscribe,
    requestPermission,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
    requestPermission();

    return () => {
      unsubscribe();
    };
  }, [subscribeToNotifications, fetchNotifications]);

  const handleNotificationAction = (notification) => {
    const { type, metadata } = notification.notification;

    switch (type) {
      case "order":
        // Navigate to order details
        window.location.href = `/orders/${metadata.orderId}`;
        break;
      case "payment":
        // Navigate to payment details
        window.location.href = `/tables/${metadata.tableNumber}`;
        break;
      default:
        break;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "normal":
        return "text-blue-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const handleDelete = (notificationId, event) => {
    event.stopPropagation();
    onDelete?.(notificationId);
  };

  const handleMarkAsRead = (notificationId, event) => {
    event.stopPropagation();
    onMarkAsRead?.(notificationId);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    // Handle navigation based on notification type
    handleNotificationAction(notification);
  };

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 380,
          maxHeight: "70vh",
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Notifications
        </Typography>
        {notifications.length > 0 && (
          <Button
            size="small"
            onClick={onClearAll}
            sx={{ textTransform: "none", fontSize: "0.875rem" }}
          >
            Clear all
          </Button>
        )}
        <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Notification List */}
      <List sx={{ p: 0, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              px: 3,
            }}
          >
            <NotificationsIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              No notifications
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          notifications.map((notification, index) => {
            const style = getNotificationStyle(
              notification?.notification?.type
            );
            const isUnread = !notification?.read_at;

            return (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: isUnread ? "action.hover" : "transparent",
                    "&:hover": {
                      bgcolor: "action.selected",
                    },
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: style.bgColor,
                        color: style.color,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {style.icon}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={isUnread ? 600 : 400}
                          sx={{ flex: 1 }}
                        >
                          {notification?.notification?.message}
                        </Typography>
                        {isUnread && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(notification?.created_at)}
                        </Typography>
                        {notification?.notification?.tag && (
                          <Chip
                            label={notification?.notification?.tag}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              bgcolor: style.bgColor,
                              color: style.color,
                            }}
                          />
                        )}
                      </Box>
                    }
                    sx={{ my: 0 }}
                  />

                  <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                    {isUnread && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        sx={{ "&:hover": { color: "success.main" } }}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(notification.id, e)}
                      sx={{ "&:hover": { color: "error.main" } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })
        )}
      </List>
    </Popover>
  );
};

export default NotificationList;
