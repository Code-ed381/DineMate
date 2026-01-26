import { supabase } from "../lib/supabase";

export interface NotificationPayload {
  title: string;
  message: string;
  priority?: "low" | "normal" | "high" | "urgent";
}

class NotificationService {
  async sendGeneralNotification(restaurantId: string, senderId: string, { title, message, priority = "normal" }: NotificationPayload) {
    try {
      const { data: notification, error: notifError } = await supabase
        .from("notifications")
        .insert({
          restaurant_id: restaurantId,
          title,
          message,
          type: "general",
          priority,
          target_type: "all",
          sender_id: senderId,
        })
        .select()
        .single();

      if (notifError) throw notifError;

      const { data: users, error: usersError } = await supabase
        .from("restaurant_members")
        .select("user_id")
        .eq("restaurant_id", restaurantId);

      if (usersError) throw usersError;

      const userNotifications = users.map((user) => ({
        notification_id: notification.id,
        user_id: user.user_id,
        restaurant_id: restaurantId,
      }));

      await supabase.from("user_notifications").insert(userNotifications);
      return { success: true, notification };
    } catch (error) {
      console.error("Error sending general notification:", error);
      return { success: false, error };
    }
  }

  async sendRoleNotification(restaurantId: string, senderId: string, { title, message, roles, priority = "normal" }: NotificationPayload & { roles: string[] }) {
    try {
      const { data: notification, error: notifError } = await supabase
        .from("notifications")
        .insert({
          restaurant_id: restaurantId,
          title,
          message,
          type: "role",
          priority,
          target_type: "role",
          target_roles: roles,
          sender_id: senderId,
        })
        .select()
        .single();

      if (notifError) throw notifError;

      const { data: users, error: usersError } = await supabase
        .from("restaurant_members")
        .select("user_id")
        .eq("restaurant_id", restaurantId)
        .in("role", roles);

      if (usersError) throw usersError;

      if (users.length === 0) return { success: true, notification };

      const userNotifications = users.map((user) => ({
        notification_id: notification.id,
        user_id: user.user_id,
        restaurant_id: restaurantId,
      }));

      await supabase.from("user_notifications").insert(userNotifications);
      return { success: true, notification };
    } catch (error) {
      console.error("Error sending role notification:", error);
      return { success: false, error };
    }
  }

  async sendUserNotification(restaurantId: string, senderId: string, { title, message, userIds, priority = "normal" }: NotificationPayload & { userIds: string[] }) {
    try {
      const { data: notification, error: notifError } = await supabase
        .from("notifications")
        .insert({
          restaurant_id: restaurantId,
          title,
          message,
          type: "user",
          priority,
          target_type: "user",
          target_user_ids: userIds,
          sender_id: senderId,
        })
        .select()
        .single();

      if (notifError) throw notifError;

      const userNotifications = userIds.map((userId) => ({
        notification_id: notification.id,
        user_id: userId,
        restaurant_id: restaurantId,
      }));

      await supabase.from("user_notifications").insert(userNotifications);
      return { success: true, notification };
    } catch (error) {
       console.error("Error sending user notification:", error);
       return { success: false, error };
    }
  }
}

export const notificationService = new NotificationService();
