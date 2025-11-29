// services/notificationService.js
import { supabase } from "../lib/supabase";

class NotificationService {
  /**
   * Send a general notification to all users in a restaurant
   */
  async sendGeneralNotification(
    restaurantId,
    senderId,
    { title, message, priority = "normal" }
  ) {
    try {
      console.log("📤 Sending general notification:", {
        restaurantId,
        senderId,
        title,
      });

      // Create the notification
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

      console.log("✅ Notification created:", notification);

      // Get all users in the restaurant
      const { data: users, error: usersError } = await supabase
        .from("restaurant_members")
        .select("user_id")
        .eq("restaurant_id", restaurantId);

      if (usersError) throw usersError;

      console.log(`👥 Found ${users.length} users in restaurant`);

      // Create user_notifications entries
      const userNotifications = users.map((user) => ({
        notification_id: notification.id,
        user_id: user.user_id,
        restaurant_id: restaurantId,
      }));

      const { data: createdUserNotifs, error: userNotifError } = await supabase
        .from("user_notifications")
        .insert(userNotifications)
        .select();

      if (userNotifError) throw userNotifError;

      console.log("✅ User notifications created:", createdUserNotifs);

      return { success: true, notification };
    } catch (error) {
      console.error("❌ Error sending general notification:", error);
      return { success: false, error };
    }
  }

  /**
   * Send a role-specific notification
   */
  async sendRoleNotification(
    restaurantId,
    senderId,
    { title, message, roles, priority = "normal", metadata = null }
  ) {
    try {
      console.log("📤 Sending role notification:", {
        restaurantId,
        senderId,
        title,
        roles,
      });

      // Create the notification
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
          metadata: metadata,
        })
        .select()
        .single();

      if (notifError) {
        console.error("❌ Error creating notification:", notifError);
        throw notifError;
      }

      console.log("✅ Notification created:", notification);

      // Get users with specified roles
      const { data: users, error: usersError } = await supabase
        .from("restaurant_members")
        .select("user_id, role")
        .eq("restaurant_id", restaurantId)
        .in("role", roles);

      if (usersError) {
        console.error("❌ Error fetching users:", usersError);
        throw usersError;
      }

      console.log(
        `👥 Found ${users.length} users with roles [${roles.join(", ")}]:`,
        users
      );

      if (users.length === 0) {
        console.warn("⚠️ No users found with the specified roles!");
        return { success: true, notification, warning: "No recipients found" };
      }

      // Create user_notifications entries
      const userNotifications = users.map((user) => ({
        notification_id: notification.id,
        user_id: user.user_id,
        restaurant_id: restaurantId,
        is_read: false,
      }));

      console.log("📝 Creating user_notifications:", userNotifications);

      const { data: createdUserNotifs, error: userNotifError } = await supabase
        .from("user_notifications")
        .insert(userNotifications)
        .select();

      if (userNotifError) {
        console.error("❌ Error creating user_notifications:", userNotifError);
        throw userNotifError;
      }

      console.log(
        "✅ User notifications created successfully:",
        createdUserNotifs
      );

      return { success: true, notification, recipients: createdUserNotifs };
    } catch (error) {
      console.error("❌ Error sending role notification:", error);
      return { success: false, error };
    }
  }

  /**
   * Send a user-specific notification
   */
  async sendUserNotification(
    restaurantId,
    senderId,
    { title, message, userIds, priority = "normal", metadata = null }
  ) {
    try {
      console.log("📤 Sending user notification:", {
        restaurantId,
        senderId,
        title,
        userIds,
      });

      // Create the notification
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
          metadata: metadata,
        })
        .select()
        .single();

      if (notifError) throw notifError;

      console.log("✅ Notification created:", notification);

      // Create user_notifications entries
      const userNotifications = userIds.map((userId) => ({
        notification_id: notification.id,
        user_id: userId,
        restaurant_id: restaurantId,
        is_read: false,
      }));

      const { data: createdUserNotifs, error: userNotifError } = await supabase
        .from("user_notifications")
        .insert(userNotifications)
        .select();

      if (userNotifError) throw userNotifError;

      console.log("✅ User notifications created:", createdUserNotifs);

      return { success: true, notification, recipients: createdUserNotifs };
    } catch (error) {
      console.error("❌ Error sending user notification:", error);
      return { success: false, error };
    }
  }

  /**
   * Send order notification (waiter to kitchen/bartender)
   */
  async sendOrderNotification(
    restaurantId,
    senderId,
    { orderId, tableNumber, items, targetRole }
  ) {
    const title = `New Order - Table ${tableNumber}`;
    const message = `${items.length} item(s) for ${
      targetRole === "chef" ? "kitchen" : "bar"
    }`;

    return this.sendRoleNotification(restaurantId, senderId, {
      title,
      message,
      roles: [targetRole], // This should be "chef" not "kitchen"
      priority: "high",
      metadata: { orderId, tableNumber, items },
    });
  }

  /**
   * Send order ready notification (kitchen/bartender to waiter)
   */
  async sendOrderReadyNotification(
    restaurantId,
    senderId,
    { orderId, tableNumber, waiterId }
  ) {
    const title = `Order Ready - Table ${tableNumber}`;
    const message = `Your order is ready for pickup`;

    return this.sendUserNotification(restaurantId, senderId, {
      title,
      message,
      userIds: [waiterId],
      priority: "high",
      metadata: { orderId, tableNumber },
    });
  }

  /**
   * Send payment notification (cashier to waiter)
   */
  async sendPaymentNotification(
    restaurantId,
    senderId,
    { tableNumber, amount, waiterId }
  ) {
    const title = `Payment Processed - Table ${tableNumber}`;
    const message = `Payment of $${amount} has been received`;

    return this.sendUserNotification(restaurantId, senderId, {
      title,
      message,
      userIds: [waiterId],
      priority: "normal",
      metadata: { tableNumber, amount },
    });
  }
}

export const notificationService = new NotificationService();
