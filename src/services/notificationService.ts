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
      console.error("🚨 Error sending role notification:", error);
      // We return the error rather than throwing to avoid crashing the app, but we log the full details
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

  async sendOrderNotification(restaurantId: string, senderId: string, { title, message, userIds, priority = "normal" }: NotificationPayload & { userIds: string[] }) {
    try {
      const { data: notification, error: notifError } = await supabase
        .from("notifications")
        .insert({
          restaurant_id: restaurantId,
          title,
          message,
          type: "order", // Explicitly set type to 'order'
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
       console.error("Error sending order notification:", error);
       return { success: false, error };
    }
  }

  async sendComplaint(restaurantId: string, senderId: string, { title, message, priority = "normal" }: NotificationPayload) {
    try {
      const { data: notification, error: notifError } = await supabase
        .from("notifications")
        .insert({
          restaurant_id: restaurantId,
          title: `[Complaint] ${title}`,
          message,
          type: "role",
          priority,
          target_type: "role",
          target_roles: ["owner", "admin"],
          sender_id: senderId,
          metadata: { is_complaint: true },
        })
        .select()
        .single();

      if (notifError) throw notifError;

      const { data: users, error: usersError } = await supabase
        .from("restaurant_members")
        .select("user_id")
        .eq("restaurant_id", restaurantId)
        .in("role", ["owner", "admin"]);

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
       console.error("Error sending complaint:", error);
       return { success: false, error };
    }
  }

  /**
   * Sends targeted notifications between Cashier and Staff (Waiter/Bartender)
   */
  async sendSessionNotification(
    restaurantId: string, 
    senderId: string, 
    { title, message, targetType, targetUserId, priority = "high" }: NotificationPayload & { 
      targetType: "TO_CASHIER" | "TO_STAFF", 
      targetUserId?: string 
    }
  ) {
    try {
      let recipientIds: string[] = [];

      if (targetType === "TO_CASHIER") {
        // Find users with only 'cashier' role (or owner/admin as fallback usually, but user asked for only cashier)
        const { data: cashiers } = await supabase
          .from("restaurant_members")
          .select("user_id")
          .eq("restaurant_id", restaurantId)
          .eq("role", "cashier");
        
        recipientIds = (cashiers || []).map(c => c.user_id);
      } else if (targetType === "TO_STAFF" && targetUserId) {
        // Notify the specific waiter/bartender
        recipientIds = [targetUserId];
      }

      if (recipientIds.length === 0) {
        console.warn("⚠️ sendSessionNotification: No recipients found for", { targetType, targetUserId });
        return { success: true, message: "No recipients found" };
      }

      console.log(`🔔 Sending session notification: "${title}" to users:`, recipientIds);

      const { data: notification, error: notifError } = await supabase
        .from("notifications")
        .insert({
          restaurant_id: restaurantId,
          title,
          message,
          type: "order",
          priority,
          target_type: "user",
          target_user_ids: recipientIds,
          sender_id: senderId || null, // Allow null if senderId is missing
          metadata: { is_session_notification: true }
        })
        .select()
        .single();

      if (notifError) {
        console.error("🚨 Supabase notification insert error:", notifError);
        throw notifError;
      }

      const userNotifications = recipientIds.map((userId) => ({
        notification_id: notification.id,
        user_id: userId,
        restaurant_id: restaurantId,
      }));

      const { error: userNotifError } = await supabase.from("user_notifications").insert(userNotifications);
      if (userNotifError) {
        console.error("🚨 Supabase user_notifications insert error:", userNotifError);
        throw userNotifError;
      }

      console.log("✅ Session notification sent successfully");
      return { success: true, notification };
    } catch (error) {
      console.error("🚨 Error sending session notification:", error);
      return { success: false, error };
    }
  }
}

export const notificationService = new NotificationService();
