// stores/notificationStore.js
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { toast } from "react-toastify";
import NotificationToastContent from "../components/notificationToastContent";
import useRestaurantStore from "./restaurantStore";
import useAuthStore from "./authStore";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  notification: null,
  unreadCount: 0,
  loading: false,
  subscription: null,
  setNotifications: (notifications) => set({ notifications }),

  // Fetch notifications for current user
  fetchNotifications: async () => {
    set({ loading: true });

    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;

    const { user } = useAuthStore.getState();
    const userId = user?.user?.id;

    console.log("🔍 Fetching notifications for:", { userId, restaurantId });

    try {
      const { data, error } = await supabase
        .from("user_notifications")
        .select(
          `
        id,
        is_read,
        read_at,
        created_at,
        notification:notifications (
            id,
            title,
            message,
            type,
            priority,
            metadata,
            created_at,
            sender:users!notifications_sender_id_fkey (
                user_id,
                first_name,
                last_name,
                default_role
            )
        )
      `
        )
        .eq("user_id", userId)
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Deduplicate by user_notification id
      const uniqueNotifications = Array.from(
        new Map(data.map((n) => [n.id, n])).values()
      );

      // Optional: add full_name for sender
      uniqueNotifications.forEach((n) => {
        if (n.notification?.sender) {
          const sender = n.notification.sender;
          sender.full_name = `${sender.first_name} ${sender.last_name}`;
        }
      });

      set({
        notifications: uniqueNotifications,
        unreadCount: uniqueNotifications.filter((n) => !n.is_read).length,
        loading: false,
      });

      console.log("✅ Fetched notifications:", {
        total: uniqueNotifications.length,
        unread: uniqueNotifications.filter((n) => !n.is_read).length,
        notifications: uniqueNotifications,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ loading: false });
    }
  },

  // Fetch notification by id
  fetchNotificationById: async (notificationId) => {
    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", notificationId)
        .single();

      if (error) throw error;

      console.log("Notification: ", data);
      set({ notification: data });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ loading: false });
    }
  },

  // Mark notification as read
  markAsRead: async (userNotificationId) => {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", userNotificationId);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === userNotificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  // Mark all as read
  markAllAsRead: async (userId, restaurantId) => {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("restaurant_id", restaurantId)
        .eq("is_read", false);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications: () => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;

    const { user } = useAuthStore.getState();
    const userId = user?.user?.id;

    if (!restaurantId || !userId) {
      console.warn("No restaurant or user selected for subscription");
      return;
    }

    // Remove old channel
    const oldChannel = get().subscription;
    if (oldChannel) supabase.removeChannel(oldChannel);

    // IMPORTANT: Include userId in channel name and filter
    const subscription = supabase
      .channel(`notifications:${restaurantId}:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${userId}`, // Filter to only this user's notifications
        },
        async (payload) => {
          try {
            console.log("Realtime payload:", payload);
            const userNotifRow = payload.new;

            // Double-check this notification is for the current user
            if (userNotifRow.user_id !== userId) {
              console.log("Notification not for current user, skipping");
              return;
            }

            const notifId = userNotifRow.notification_id;

            if (!notifId) {
              console.warn("Realtime payload missing notification_id", payload);
              return;
            }

            // Fetch full notification (including sender) from notifications table
            const { data: notifData, error: notifError } = await supabase
              .from("notifications")
              .select(
                `
              id,
              title,
              message,
              type,
              priority,
              metadata,
              created_at,
              sender:users!notifications_sender_id_fkey (
                user_id,
                first_name,
                last_name,
                default_role
              )
            `
              )
              .eq("id", notifId)
              .limit(1)
              .single();

            if (notifError) {
              console.error("Error fetching notification details:", notifError);
              return;
            }

            // Build combined object EXACTLY like fetchNotifications returns
            const combined = {
              id: userNotifRow.id, // user_notification ID
              is_read: userNotifRow.is_read || false,
              read_at: userNotifRow.read_at || null,
              created_at: userNotifRow.created_at,
              user_id: userNotifRow.user_id,
              restaurant_id: userNotifRow.restaurant_id,
              notification: notifData || null,
            };

            // Add full_name for sender if present
            if (combined.notification?.sender) {
              const s = combined.notification.sender;
              combined.notification.sender.full_name = `${s.first_name ?? ""} ${
                s.last_name ?? ""
              }`.trim();
            }

            console.log(
              "📬 New notification received for current user:",
              combined
            );

            // Check if this notification already exists (avoid duplicates)
            const exists = get().notifications.some(
              (n) => n.id === combined.id
            );

            if (exists) {
              console.log("⚠️ Notification already exists, skipping duplicate");
              return;
            }

            // Update notifications list (lightweight state change)
            set((state) => ({
              notifications: [combined, ...state.notifications],
              unreadCount: combined.is_read
                ? state.unreadCount
                : state.unreadCount + 1,
            }));

            // Fire toast and browser notifications using the combined object
            get().showToastNotification(
              combined.notification || { title: "Notification", message: "" }
            );
            get().showBrowserNotification(
              combined.notification || {
                title: "Notification",
                message: "",
                id: combined.id,
              }
            );
          } catch (err) {
            console.error("Realtime handler error:", err);
          }
        }
      )
      .subscribe();

    set({ subscription });
    console.log(
      `✅ Subscribed to notifications for user ${userId} in restaurant ${restaurantId}`
    );
  },

  // Unsubscribe from real-time notifications
  unsubscribe: () => {
    const { subscription } = get();
    if (subscription) {
      supabase.removeChannel(subscription);
      set({ subscription: null });
      console.log("❌ Unsubscribed from notifications");
    }
  },

  // 🎯 Show toast notification based on priority and type
  showToastNotification: (notification) => {
    const { title, message, priority, type } = notification;

    // Custom toast options based on priority
    const toastOptions = {
      position: "bottom-right",
      autoClose: getAutoCloseTime(priority),
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    // Show different toast types based on priority
    switch (priority) {
      case "urgent":
        toast.error(
          <NotificationToastContent
            title={title}
            message={message}
            type={type}
          />,
          {
            ...toastOptions,
            autoClose: false, // Don't auto close urgent notifications
            icon: "🚨",
          }
        );
        // Play sound for urgent notifications
        playNotificationSound("urgent");
        break;

      case "high":
        toast.warning(
          <NotificationToastContent
            title={title}
            message={message}
            type={type}
          />,
          {
            ...toastOptions,
            icon: "⚠️",
          }
        );
        playNotificationSound("high");
        break;

      case "normal":
        toast.info(
          <NotificationToastContent
            title={title}
            message={message}
            type={type}
          />,
          {
            ...toastOptions,
            icon: "🔔",
          }
        );
        playNotificationSound("normal");
        break;

      case "low":
        toast(
          <NotificationToastContent
            title={title}
            message={message}
            type={type}
          />,
          {
            ...toastOptions,
            icon: "ℹ️",
          }
        );
        break;

      default:
        toast.info(
          <NotificationToastContent
            title={title}
            message={message}
            type={type}
          />,
          toastOptions
        );
    }
  },

  // Show browser notification
  showBrowserNotification: (notification) => {
    console.log("Browser Notification:-------> ", notification);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification?.title, {
        body: notification?.message,
        icon: "/notification-icon.png",
        badge: "/badge-icon.png",
        tag: notification?.id,
        requireInteraction: notification?.priority === "urgent",
      });
    }
  },

  // Request notification permission
  requestPermission: async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  },
}));

// Helper function to determine auto-close time based on priority
function getAutoCloseTime(priority) {
  switch (priority) {
    case "urgent":
      return false; // Don't auto close
    case "high":
      return 8000; // 8 seconds
    case "normal":
      return 5000; // 5 seconds
    case "low":
      return 3000; // 3 seconds
    default:
      return 5000;
  }
}

// Helper function to play notification sound
function playNotificationSound(priority) {
  const audio = new Audio();

  switch (priority) {
    case "urgent":
      audio.src = "/sounds/urgent-notification.mp3";
      break;
    case "high":
      audio.src = "/sounds/high-notification.mp3";
      break;
    case "normal":
      audio.src = "/sounds/normal-notification.mp3";
      break;
    default:
      audio.src = "/sounds/normal-notification.mp3";
  }

  audio.play().catch((err) => console.log("Could not play sound:", err));
}

export default useNotificationStore;
