// stores/notificationStore.ts
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { toast, ToastOptions } from "react-toastify";
import { RealtimeChannel } from "@supabase/supabase-js";
import useRestaurantStore from "./restaurantStore";
import useAuthStore from "./authStore";



export interface NotificationSender {
  user_id: string;
  first_name: string;
  last_name: string;
  default_role: string;
  avatar_url?: string;
  full_name?: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  metadata: any;
  created_at: string;
  sender?: NotificationSender;
}

export interface UserNotification {
  id: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  user_id?: string;
  restaurant_id?: string;
  notification: NotificationData | null;
}

export interface NotificationState {
  notifications: UserNotification[];
  notification: NotificationData | null;
  unreadCount: number;
  loading: boolean;
  subscription: RealtimeChannel | null;
  setNotifications: (notifications: UserNotification[]) => void;
  fetchNotifications: () => Promise<void>;
  fetchNotificationById: (notificationId: string) => Promise<void>;
  markAsRead: (userNotificationId: string) => Promise<void>;
  markAllAsRead: (userId: string, restaurantId: string) => Promise<void>;
  deleteNotification: (userNotificationId: string) => Promise<void>;
  clearAllNotifications: (userId: string, restaurantId: string) => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribe: () => void;
  showToastNotification: (notification: NotificationData) => void;
  showBrowserNotification: (notification: NotificationData) => void;
  requestPermission: () => Promise<void>;
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  notification: null,
  unreadCount: 0,
  loading: false,
  subscription: null,
  setNotifications: (notifications: UserNotification[]) => set({ notifications }),

  fetchNotifications: async () => {
    set({ loading: true });

    const { selectedRestaurant } = useRestaurantStore.getState() as any;
    const restaurantId = selectedRestaurant?.id;

    const { user } = useAuthStore.getState();
    const userId = user?.id;

    if (!userId || !restaurantId) {
      set({ loading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_notifications")
        .select(`
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
              first_name,
              last_name,
              default_role,
              avatar_url
            )
          )
        `)
        .eq("user_id", userId)
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const uniqueNotifications = Array.from(
        new Map((data as any[]).map((n) => [n.id, n])).values()
      ).map((n: any): UserNotification => {
        if (n.notification?.sender) {
          const sender = n.notification.sender;
          sender.full_name = `${sender.first_name} ${sender.last_name}`;
        }
        return n as UserNotification;
      });

      set({
        notifications: uniqueNotifications,
        unreadCount: uniqueNotifications.filter((n) => !n.is_read).length,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ loading: false });
    }
  },

  fetchNotificationById: async (notificationId: string) => {
    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", notificationId)
        .single();

      if (error) throw error;

      set({ notification: data as NotificationData });
    } catch (error) {
      console.error("Error fetching notification:", error);
      set({ loading: false });
    }
  },

  markAsRead: async (userNotificationId: string) => {
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

  markAllAsRead: async (userId: string, restaurantId: string) => {
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

  deleteNotification: async (userNotificationId: string) => {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .delete()
        .eq("id", userNotificationId);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== userNotificationId),
        unreadCount: state.notifications.find((n) => n.id === userNotificationId)?.is_read 
          ? state.unreadCount 
          : Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  },

  clearAllNotifications: async (userId: string, restaurantId: string) => {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .delete()
        .eq("user_id", userId)
        .eq("restaurant_id", restaurantId);

      if (error) throw error;

      set({
        notifications: [],
        unreadCount: 0,
      });
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  },

  subscribeToNotifications: () => {
    const { selectedRestaurant } = useRestaurantStore.getState() as any;
    const restaurantId = selectedRestaurant?.id;

    const { user } = useAuthStore.getState();
    const userId = user?.id;

    if (!restaurantId || !userId) {
      console.warn("No restaurant or user selected for subscription");
      return;
    }

    const oldChannel = get().subscription;
    if (oldChannel) supabase.removeChannel(oldChannel);

    const subscription = supabase
      .channel(`notifications:${restaurantId}:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('🔔 Real-time notification received:', payload);
          
          try {
            const userNotifRow = payload.new as any;

            if (userNotifRow.user_id !== userId) return;

            const notifId = userNotifRow.notification_id;
            if (!notifId) return;

            const { data: notifData, error: notifError } = await supabase
              .from("notifications")
              .select(`
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
              `)
              .eq("id", notifId)
              .limit(1)
              .single();

            if (notifError) {
              console.error('Error fetching notification data:', notifError);
              return;
            }

            const combined: UserNotification = {
              id: userNotifRow.id,
              is_read: userNotifRow.is_read || false,
              read_at: userNotifRow.read_at || null,
              created_at: userNotifRow.created_at,
              user_id: userNotifRow.user_id,
              restaurant_id: userNotifRow.restaurant_id,
              notification: notifData as any,
            };

            if (combined.notification?.sender) {
              const s = combined.notification.sender;
              combined.notification.sender.full_name = `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim();
            }

            const exists = get().notifications.some((n) => n.id === combined.id);
            if (exists) {
              console.log('Notification already exists, skipping');
              return;
            }

            console.log('✅ Adding new notification to state');
            set((state) => ({
              notifications: [combined, ...state.notifications],
              unreadCount: combined.is_read ? state.unreadCount : state.unreadCount + 1,
            }));

            if (combined.notification) {
                get().showToastNotification(combined.notification);
                get().showBrowserNotification(combined.notification);
            }
          } catch (err) {
            console.error("Realtime handler error:", err);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Notification subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to notifications for user:', userId, 'restaurant:', restaurantId);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Failed to subscribe to notifications. Check if realtime is enabled on user_notifications table.');
        }
      });

    set({ subscription });
  },

  unsubscribe: () => {
    const { subscription } = get();
    if (subscription) {
      supabase.removeChannel(subscription);
      set({ subscription: null });
    }
  },

  showToastNotification: (notification: NotificationData) => {
    const { title, message, priority } = notification;

    const toastOptions: ToastOptions = {
      position: "bottom-right",
      autoClose: getAutoCloseTime(priority),
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    const displayText = `${title}: ${message}`;

    switch (priority) {
      case "urgent":
        toast.error(displayText, { ...toastOptions, autoClose: false });
        playNotificationSound("urgent");
        break;
      case "high":
        toast.warning(displayText, { ...toastOptions });
        playNotificationSound("high");
        break;
      case "normal":
        toast.info(displayText, { ...toastOptions });
        playNotificationSound("normal");
        break;
      case "low":
        toast(displayText, { ...toastOptions });
        break;
      default:
        toast.info(displayText, toastOptions);
    }
  },

  showBrowserNotification: (notification: NotificationData) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification?.title, {
        body: notification?.message,
        tag: notification?.id,
        requireInteraction: notification?.priority === "urgent",
      });
    }
  },

  requestPermission: async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  },
}));

function getAutoCloseTime(priority: string): number | false {
  switch (priority) {
    case "urgent": return false;
    case "high": return 8000;
    case "normal": return 5000;
    case "low": return 3000;
    default: return 5000;
  }
}

function playNotificationSound(priority: string) {
  const audio = new Audio();
  switch (priority) {
    case "urgent": audio.src = "/sounds/urgent-notification.mp3"; break;
    case "high": audio.src = "/sounds/high-notification.mp3"; break;
    default: audio.src = "/sounds/normal-notification.mp3";
  }
  audio.play().catch(() => {});
}

export default useNotificationStore;
