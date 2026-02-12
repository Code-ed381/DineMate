import React, { useEffect, ReactNode, useState, useMemo } from "react";
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
  Tabs,
  Tab,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalOffer as LocalOfferIcon,
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
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
  notifications: any[];
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
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const {
    fetchNotifications,
    markAsRead,
    subscribeToNotifications,
    unsubscribe,
    requestPermission,
  } = useNotificationStore();

  useEffect(() => {
    if (open) {
      fetchNotifications();
      subscribeToNotifications();
      requestPermission();
    }
    return () => unsubscribe();
  }, [open, subscribeToNotifications, fetchNotifications, requestPermission, unsubscribe]);

  const filteredNotifications = useMemo(() => {
    if (tab === 0) return notifications;
    if (tab === 1) return notifications.filter(n => n.notification?.type === 'order');
    return notifications.filter(n => n.notification?.type !== 'order');
  }, [notifications, tab]);

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
      PaperProps={{ 
        sx: { 
          mt: 1.5, 
          width: 380, 
          maxHeight: "75vh", 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        } 
      }}
    >
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Alerts</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {notifications.length > 0 && (
            <Button size="small" onClick={onClearAll} sx={{ fontWeight: 700 }}>
              Clear all
            </Button>
          )}
          <IconButton size="small" onClick={onClose} sx={{ bgcolor: 'action.hover' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)} 
          variant="fullWidth"
          sx={{ 
            minHeight: 40,
            '& .MuiTab-root': { fontSize: '0.75rem', fontWeight: 700, minHeight: 40 }
          }}
        >
          <Tab label={`ALL (${notifications.length})`} />
          <Tab label="ORDERS" />
          <Tab label="SYSTEM" />
        </Tabs>
      </Box>

      <List sx={{ p: 0, overflowY: 'auto', flexGrow: 1 }}>
        {filteredNotifications.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, opacity: 0.3 }}>
            <NotificationsIcon sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="body2" fontWeight={600}>No notifications here</Typography>
          </Box>
        ) : (
          filteredNotifications.map((n: any, idx) => {
            const style = getNotificationStyle(n?.notification?.type);
            const isUnread = !n?.read_at;
            return (
              <React.Fragment key={idx}>
                <ListItem 
                  sx={{ 
                    bgcolor: isUnread ? alpha(theme.palette.primary.main, 0.03) : "transparent",
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.06) },
                    cursor: 'pointer',
                    py: 1.5
                  }} 
                  onClick={(e) => handleMarkAsRead(n.id, e)}
                >
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: style.bgColor, 
                        color: style.color,
                        width: 40,
                        height: 40,
                        boxShadow: `0 2px 8px ${alpha(style.color, 0.2)}`
                      }}
                      src={n?.notification?.sender?.avatar_url}
                    >
                      {style.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={isUnread ? 800 : 500} sx={{ lineHeight: 1.3 }}>
                        {n?.notification?.message}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.disabled' }}>
                          {formatDateTime(n?.created_at)}
                        </Typography>
                        {isUnread && (
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                        )}
                      </Box>
                    }
                  />
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleDelete(n.id, e)}
                    sx={{ opacity: 0, transition: 'opacity 0.2s', '.MuiListItem-root:hover &': { opacity: 1 } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItem>
                {idx < filteredNotifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })
        )}
      </List>
      {filteredNotifications.length > 5 && (
        <Box sx={{ p: 1.5, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
          <Button fullWidth size="small" variant="text" sx={{ fontWeight: 700 }}>
            View Full History
          </Button>
        </Box>
      )}
    </Popover>
  );
};

export default NotificationList;

