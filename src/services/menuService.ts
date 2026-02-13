import { supabase } from "../lib/supabase";
import { Category, MenuItem, Order, OrderItem, KitchenTask } from "../types/menu";

export const menuService = {
  async fetchCategories(restaurantId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("restaurant_id", restaurantId);
    if (error) throw error;
    return (data as Category[]) || [];
  },

  async fetchMenuItems(restaurantId: string): Promise<MenuItem[]> {
    // We'll fetch items and their modifier group links
    const { data: items, error } = await supabase
      .from("menu_items_with_category")
      .select(`
        *,
        menu_item_modifier_groups (
          group_id,
          display_order,
          modifier_groups (
            id,
            name,
            min_selection,
            max_selection,
            modifiers (
              id,
              name,
              price_adjustment,
              is_available
            )
          )
        )
      `)
      .eq("restaurant_id", restaurantId)
      .order('name');
    
    if (error) throw error;
    
    // Transform to flatten modifier groups
    return (items || []).map((item) => ({
      ...item,
      modifier_groups: ((item as any).menu_item_modifier_groups || [])
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((mg: any) => mg.modifier_groups)
        .filter(Boolean)
    })) as MenuItem[];
  },

  async getOrderBySessionId(sessionId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();
    if (error) throw error;
    return data as Order | null;
  },

  async createOrder(sessionId: string, restaurantId: string): Promise<Order> {
    const { data, error } = await supabase
      .from("orders")
      .insert([{ session_id: sessionId, restaurant_id: restaurantId }])
      .select()
      .single();
    if (error) throw error;
    return data as Order;
  },

  async fetchOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select(`
        *,
        menu_items:menu_item_id (
          id,
          name,
          price,
          category_id,
          image_url
        ),
        order_item_modifiers (
          id,
          modifier_id,
          name,
          price
        )
      `)
      .eq("order_id", orderId);

    if (error) throw error;

    // Transform data to match expected structure
    return (orderItems || []).map((item: any) => ({
      ...item,
      order_item_id: item.id,
      item_name: item.menu_items?.name || "Unknown",
      unit_price: item.unit_price || item.menu_items?.price || 0,
      image_url: item.menu_items?.image_url,
      type: item.type || item.menu_items?.type,
      sum_price: item.sum_price || (item.unit_price * item.quantity),
      menu_item_name: item.menu_items?.name, 
      name: item.menu_items?.name,
      order_item_status: item.status,
      selected_modifiers: item.order_item_modifiers || [],
      course: item.course || 1,
      is_started: item.is_started !== false // Default to true if null
    })) as OrderItem[];
  },

  async fetchOrderItemsBySessionId(sessionId: string) {
    // First get the order for this session
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (!order) return [];

    // Then reuse the safe fetching logic
    return this.fetchOrderItemsByOrderId(order.id);
  },

  async updateOrderTotal(orderId: string, total: number) {
    const { error } = await supabase
      .from("orders")
      .update({ total })
      .eq("id", orderId);
    if (error) throw error;
  },

  async fetchKitchenTasks(orderId: string): Promise<KitchenTask[]> {
    const { data, error } = await supabase
      .from("kitchen_tasks")
      .select("*")
      .eq("order_id", orderId);
    if (error) throw error;
    return (data as KitchenTask[]) || [];
  },

  async updateSessionStatus(sessionId: string, status: string) {
     const { error } = await supabase
      .from("table_sessions")
      .update({ status })
      .eq("id", sessionId);
    if (error) throw error;
  },

  async closeSession(sessionId: string) {
    const { data, error } = await supabase
      .from("table_sessions")
      .update({ status: "close", closed_at: new Date().toISOString() })
      .eq("id", sessionId)
      .select("table_id")
      .single();
    if (error) throw error;
    return data;
  },

  async setTableAvailable(tableId: string) {
    const { error } = await supabase
      .from("restaurant_tables")
      .update({ status: "available" })
      .eq("id", tableId);
    if (error) throw error;
  },

  async upsertOrderItem(item: Partial<OrderItem>, selectedModifiers?: any[]): Promise<OrderItem | null> {
    const { data, error } = await supabase
      .from("order_items")
      .upsert(item)
      .select()
      .limit(1)
      .maybeSingle();
      
    if (error) throw error;
    
    if (data && selectedModifiers && selectedModifiers.length > 0) {
      // Clear existing and re-insert (simple way to sync)
      await supabase.from("order_item_modifiers").delete().eq("order_item_id", data.id);
      
      const modifierLinks = selectedModifiers.map(m => ({
        order_item_id: data.id,
        modifier_id: m.id,
        name: m.name,
        price: m.price_adjustment || 0
      }));
      
      const { error: modError } = await supabase
        .from("order_item_modifiers")
        .insert(modifierLinks);
        
      if (modError) throw modError;
    }
    
    return data as OrderItem | null;
  },

  async deleteOrderItem(orderItemId: string) {
    const { error } = await supabase
      .from("order_items")
      .delete()
      .eq("id", orderItemId);
    if (error) throw error;
  },

  async deleteKitchenTasks(orderItemId: string) {
    const { error } = await supabase
      .from("kitchen_tasks")
      .delete()
      .eq("order_item_id", orderItemId);
    if (error) throw error;
  },

  async createKitchenTasks(tasks: Partial<KitchenTask>[]): Promise<KitchenTask[]> {
    console.log("📡 menuService: Creating kitchen tasks", tasks);
    const { data, error } = await supabase
      .from("kitchen_tasks")
      .insert(tasks)
      .select();
    if (error) {
      console.error("❌ menuService: Error creating kitchen tasks", error);
      throw error;
    }
    return (data as KitchenTask[]) || [];
  },

  async updateItemNote(orderItemId: string, notes: string) {
    const { error } = await supabase
      .from("order_items")
      .update({ notes })
      .eq("id", orderItemId);
    if (error) throw error;
  },

  async updateOrderItemPaymentStatus(orderItemIds: string[], status: 'pending' | 'completed' | 'failed') {
    const { error } = await supabase
      .from("order_items")
      .update({ 
        payment_status: status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .in("id", orderItemIds);
    if (error) throw error;
  },

  async voidOrderItem(orderItemId: string, reason: string) {
    const { error } = await supabase
      .from("order_items")
      .update({ 
        status: "cancelled", 
        notes: reason ? `[VOID: ${reason}]` : "[VOID]" 
      })
      .eq("id", orderItemId);
    if (error) throw error;
  },

  async compOrderItem(orderItemId: string, reason: string, restaurantId?: string, waiterId?: string, tableNumber?: string) {
    // 1. Update the order item price and notes
    const { error } = await supabase
      .from("order_items")
      .update({ 
        unit_price: 0,
        sum_price: 0, 
        notes: reason ? `[COMP: ${reason}]` : "[COMP]" 
      })
      .eq("id", orderItemId);
    if (error) throw error;

    // 2. Trigger real-time update for kitchen tasks by updating 'updated_at'
    // This ensures kitchenStore's subscription picks up the change
    await supabase
      .from("kitchen_tasks")
      .update({ updated_at: new Date().toISOString() })
      .eq("order_item_id", orderItemId);

    // 3. Send notification to Kitchen/Bar staff if metadata provided
    if (restaurantId && waiterId) {
      const { data: item } = await supabase
        .from("order_items")
        .select("menu_item_id, type")
        .eq("id", orderItemId)
        .single();

      if (item) {
        const { data: menuItem } = await supabase
          .from("menu_items")
          .select("name")
          .eq("id", item.menu_item_id)
          .single();

        const { notificationService } = await import("./notificationService");
        const itemType = (item.type || "").toLowerCase();
        
        await notificationService.sendRoleNotification(restaurantId, waiterId, {
          title: "Item Marked FREE",
          message: `Table ${tableNumber || '?'}: ${menuItem?.name || 'Item'} is now FREE (Comped).`,
          priority: "high",
          roles: itemType === 'drink' ? ["barman", "admin", "owner"] : ["chef", "admin", "owner"]
        }).catch(e => console.error("❌ Comp notification error:", e));
      }
    }
  },

  async fetchOrdersByWaiter(waiterId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        table_sessions!inner(
          id,
          waiter_id,
          table_id,
          restaurant_tables(table_number)
        )
      `)
      .eq("table_sessions.waiter_id", waiterId)
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Flatten the Table Number for easier UI use
    return (data || []).map((order: any) => ({
      ...order,
      table_number: order.table_sessions?.restaurant_tables?.table_number
    })) as Order[];
  },

  async startCourse(orderId: string, course: number, restaurantId?: string, waiterId?: string, tableNumber?: string) {
    // 1. Fetch items for this course to create kitchen tasks
    const { data: items, error: fetchError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .eq("course", course)
      .eq("is_started", false);

    if (fetchError) throw fetchError;
    if (!items || items.length === 0) return;

    // 2. Update is_started status
    const { error: updateError } = await supabase
      .from("order_items")
      .update({ is_started: true })
      .eq("order_id", orderId)
      .eq("course", course);
    
    if (updateError) throw updateError;

    // 3. Create kitchen tasks for food/drink items
    const tasksToCreate: any[] = [];
    items.forEach(item => {
      const type = (item.type || "").toLowerCase();
      if (type === 'food' || type === 'drink') {
        // Create a task for EACH unit of quantity
        for (let i = 0; i < (item.quantity || 1); i++) {
          tasksToCreate.push({
            order_id: orderId,
            order_item_id: item.id,
            menu_item_id: item.menu_item_id,
            status: "pending",
            created_at: new Date().toISOString()
          });
        }
      }
    });

    if (tasksToCreate.length > 0) {
      await this.createKitchenTasks(tasksToCreate);

      // 4. Notify kitchen/bar
      if (restaurantId && waiterId) {
        const { notificationService } = await import("./notificationService");
        
        // Count how many food vs drink items
        const foodCount = items.filter(i => (i.type || "").toLowerCase() === 'food').length;
        const drinkCount = items.filter(i => (i.type || "").toLowerCase() === 'drink').length;

        if (foodCount > 0) {
          await notificationService.sendRoleNotification(restaurantId, waiterId, {
            title: `Course ${course} Fired!`,
            message: `Table ${tableNumber || '?'}: ${foodCount} food items are now active.`,
            priority: "high",
            roles: ["chef", "admin", "owner"]
          }).catch(e => console.error("❌ Course notification error:", e));
        }
        
        if (drinkCount > 0) {
          await notificationService.sendRoleNotification(restaurantId, waiterId, {
            title: `Course ${course} Fired!`,
            message: `Table ${tableNumber || '?'}: ${drinkCount} drink items are now active.`,
            priority: "high",
            roles: ["barman", "admin", "owner"]
          }).catch(e => console.error("❌ Course notification error:", e));
        }
      }
    }
  },
};
