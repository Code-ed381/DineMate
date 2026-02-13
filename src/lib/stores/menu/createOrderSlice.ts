import { StateCreator } from "zustand";
import { MenuState, MenuItem, SalesData, Order, OrderItem, KitchenTask, Modifier } from "../../../types/menu";
import { supabase } from "../../../lib/supabase";
import { menuService } from "../../../services/menuService";
import { handleError } from "../../../components/Error";
import useRestaurantStore from "../../../lib/restaurantStore";
import useAuthStore from "../../../lib/authStore";
import useTablesStore from "../../../lib/tablesStore";
import Swal from "sweetalert2";
import { printReceipt } from "../../../components/PrintWindow";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface OrderSlice {
  currentOrder: Order | null;
  loadingCurrentOrder: boolean;
  currentOrderItems: OrderItem[];
  loadingCurrentOrderItems: boolean;
  totalOrdersPrice: number;
  totalOrdersQty: number;
  totalRemaining: number;
  tipAmount: number;
  orderId: string | null;
  cash: string;
  card: string;
  currentKitchenTasks: KitchenTask[];
  dashboardKitchenTasks: KitchenTask[];
  loadingCurrentKitchenTasks: boolean;
  orderItemsChannel?: RealtimeChannel | null;
  waiterName: string | null;
  salesData: SalesData;
  loadingChart: boolean;
  myOrders: Order[];
  loadingMyOrders: boolean;
  selectedCourse: number;
  setSelectedCourse: (course: number) => void;
  startCourse: (orderId: string, course: number) => Promise<void>;
  recalculateTotals: () => void;
  reorderItem: (item: OrderItem) => Promise<void>;
  repeatRound: () => Promise<void>;

  setCurrentOrder: (order: Order | null) => void;
  setCurrentOrderItems: (items: OrderItem[]) => void;
  createOrder: (sessionId: string, restaurantId: string) => Promise<void>;
  deleteOrderBySessionId: (sessionId: string) => Promise<void>;
  getOrderBySessionId: (id: string) => Promise<Order | null>;
  getOrderItemsByOrderId: (id: string) => Promise<OrderItem[]>;
  getOrderitemsBySessionId: (sessionId: string) => Promise<OrderItem[]>;
  fetchKitchenTasksForOrder: (orderId: string) => Promise<void>;
  addOrUpdateObject: (orderItem: MenuItem, selectedModifiers?: Modifier[]) => Promise<void>;
  updateQuantity: (item: OrderItem, action: 'increase' | 'decrease') => Promise<void>;
  handleRemoveItem: (item: OrderItem) => Promise<void>;
  confirmPayment: () => Promise<boolean>;
  subscribeToOrderItems: () => void;
  unsubscribeFromOrderItems: () => void;
  updateItemNote: (orderItemId: string, note: string) => Promise<void>;
  fetchSalesData: () => Promise<void>;
  setCash: (value: string) => void;
  setCard: (value: string) => void;
  setTipAmount: (amount: number) => void;
  payAllItems: (cash: number, card: number) => Promise<boolean>;
  payForItems: (itemIds: string[], cash: number, card: number) => Promise<boolean>;
  voidItem: (orderItemId: string, reason: string) => Promise<void>;
  compItem: (orderItemId: string, reason: string) => Promise<void>;
  resetOrder: () => void;
  fetchMyOrderHistory: (waiterId: string, startDate: string, endDate: string) => Promise<void>;
}

export const createOrderSlice: StateCreator<MenuState, [], [], OrderSlice> = (set, get) => ({
  currentOrder: null,
  loadingCurrentOrder: false,
  currentOrderItems: [],
  loadingCurrentOrderItems: false,
  totalOrdersPrice: 0,
  totalOrdersQty: 0,
  totalRemaining: 0,
  orderId: null,
  cash: "",
  card: "",
  tipAmount: 0,
  currentKitchenTasks: [],
  dashboardKitchenTasks: [],
  loadingCurrentKitchenTasks: false,
  orderItemsChannel: null,
  waiterName: null,
  salesData: { labels: [], datasets: [] },
  loadingChart: false,
  myOrders: [],
  loadingMyOrders: false,
  selectedCourse: 1,

  setCash: (value) => set({ cash: value }),
  setCard: (value) => set({ card: value }),
  setTipAmount: (amount) => set({ tipAmount: amount }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setCurrentOrderItems: (items) => set({ currentOrderItems: items }),

  startCourse: async (orderId, course) => {
    try {
      const { user } = useAuthStore.getState();
      const { selectedRestaurant } = useRestaurantStore.getState();
      const tableNumber = get().chosenTable || useTablesStore.getState().selectedSession?.table_number;

      await menuService.startCourse(orderId, course, selectedRestaurant?.id, user?.id, tableNumber);
      await get().getOrderItemsByOrderId(orderId.toString());
      Swal.fire("Course Fired!", `Course ${course} has been sent to the kitchen.`, "success");
    } catch (error) {
      handleError(error as Error);
    }
  },

  createOrder: async (sessionId, restaurantId) => {
    if (!sessionId || !restaurantId) return;
    try {
      const { data: sessionExists } = await supabase.from("table_sessions").select("id").eq("id", sessionId).maybeSingle();
      
      if (!sessionExists) {
        console.warn("⚠️ createOrder: Session ID not found in DB. Clearing stale session.");
        useTablesStore.getState().setSelectedSession(null);
        set({ chosenTableSession: null, chosenTable: null });
        return;
      }

      const existingOrder = await menuService.getOrderBySessionId(sessionId);
      if (existingOrder) {
        set({ currentOrder: existingOrder, orderId: existingOrder.id });
        return;
      }

      const data = await menuService.createOrder(sessionId, restaurantId);
      set({ currentOrder: data, orderId: data.id });
    } catch (error) {
      handleError(error as Error);
    }
  },

  deleteOrderBySessionId: async (sessionId) => {
    if (!sessionId) return;
    await supabase.from("orders").delete().eq("session_id", sessionId);
    set({ currentOrder: null });
  },

  getOrderBySessionId: async (id) => {
    set({ loadingCurrentOrder: true });
    try {
      const data = await menuService.getOrderBySessionId(id);
      set({ currentOrder: data, orderId: data?.id || null });
      return data;
    } catch (error) {
      set({ currentOrder: null });
      return null;
    } finally {
      set({ loadingCurrentOrder: false });
    }
  },

  getOrderItemsByOrderId: async (id) => {
    set({ loadingCurrentOrderItems: true });
    if (!id) {
      set({ loadingCurrentOrderItems: false });
      return [];
    }
    try {
      const data = await menuService.fetchOrderItemsByOrderId(id);
      const items = data || [];
      const activeItems = items.filter((item: OrderItem) => item.status !== 'cancelled');
      const total = activeItems.reduce((sum: number, item: OrderItem) => sum + (item.sum_price || 0), 0);
      const totalQty = activeItems.reduce((sum: number, item: OrderItem) => sum + (item.quantity || 0), 0);
      const remaining = activeItems
        .filter((item: OrderItem) => item.payment_status !== 'completed')
        .reduce((sum: number, item: OrderItem) => sum + (item.sum_price || 0), 0);
      
      const roundedTotal = Math.round(total * 100) / 100;
      const roundedRemaining = Math.round(remaining * 100) / 100;
      
      set({ 
        currentOrderItems: items,
        totalOrdersPrice: roundedTotal,
        totalOrdersQty: totalQty,
        totalRemaining: roundedRemaining
      });
      await menuService.updateOrderTotal(id, roundedTotal);
      return items;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      set({ loadingCurrentOrderItems: false });
      if (id) get().fetchKitchenTasksForOrder(id);
    }
  },

  fetchKitchenTasksForOrder: async (orderId) => {
    set({ loadingCurrentKitchenTasks: true });
    try {
      const data = await menuService.fetchKitchenTasks(orderId);
      set({ currentKitchenTasks: data || [] });
    } catch (e) {
      console.error(e);
    } finally {
      set({ loadingCurrentKitchenTasks: false });
    }
  },

  getOrderitemsBySessionId: async (sessionId) => {
    set({ loadingCurrentOrderItems: true });
    try {
      const data = await menuService.fetchOrderItemsBySessionId(sessionId);
      const items = data || [];
      const activeItems = items.filter((item: OrderItem) => item.status !== 'cancelled');
      const total = activeItems.reduce((sum: number, item: OrderItem) => sum + (item.sum_price || 0), 0);
      const totalQty = activeItems.reduce((sum: number, item: OrderItem) => sum + (item.quantity || 0), 0);
      
      set({ 
        currentOrderItems: items,
        totalOrdersPrice: total,
        totalOrdersQty: totalQty
      });
      return items;
    } finally {
      set({ loadingCurrentOrderItems: false });
    }
  },

  reorderItem: async (item) => {
    // 1. Find the menu item to get fresh data/modifiers
    const { menuItems } = get();
    let menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
    
    if (!menuItem) {
      // Reconstruct MenuItem from OrderItem if not in current list
      menuItem = {
        id: item.menu_item_id,
        name: item.item_name || item.name || "Unknown Item",
        price: item.unit_price,
        category_id: "", 
        type: (item.type || "food") as "food" | "drink",
        restaurant_id: useRestaurantStore.getState().selectedRestaurant?.id || "",
      };
    }

    try {
      await get().addOrUpdateObject(menuItem, item.selected_modifiers);
    } catch (error) {
      handleError(error as Error);
    }
  },

  repeatRound: async () => {
    const items = get().currentOrderItems.filter(i => i.status !== 'cancelled' && i.payment_status !== 'completed');
    if (items.length === 0) return;

    try {
      // We loop through items and re-add them
      // To avoid multiple notifications/swals, we could optimize, but addOrUpdateObject is sequential
      for (const item of items) {
        await get().reorderItem(item);
      }
      Swal.fire({
        title: "Round Repeated",
        text: "All active items have been duplicated.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      handleError(error as Error);
    }
  },

  recalculateTotals: () => {
    const items = get().currentOrderItems;
    const activeItems = items.filter((item: OrderItem) => item.status !== 'cancelled');
    const total = activeItems.reduce((sum: number, item: OrderItem) => sum + (item.sum_price || 0), 0);
    const totalQty = activeItems.reduce((sum: number, item: OrderItem) => sum + (item.quantity || 0), 0);
    const remaining = activeItems
      .filter((item: OrderItem) => item.payment_status !== 'completed')
      .reduce((sum: number, item: OrderItem) => sum + (item.sum_price || 0), 0);
    
    set({ 
      totalOrdersPrice: Math.round(total * 100) / 100,
      totalOrdersQty: totalQty,
      totalRemaining: Math.round(remaining * 100) / 100
    });
  },

  addOrUpdateObject: async (orderItem, selectedModifiers) => {
    let { currentOrder } = get();
    
    if (!currentOrder) {
      const { selectedSession } = useTablesStore.getState();
      const session = (get() as any).chosenTableSession || selectedSession;
      
      const sId = session?.id || session?.session_id;
      const rId = session?.restaurant_id || useRestaurantStore.getState().selectedRestaurant?.id;

      console.log("DEBUG: addOrUpdateObject - Session Check:", { session, sId, rId });

      if (sId && rId) {
        await get().createOrder(sId, rId);
        currentOrder = get().currentOrder;
      } else {
        console.error("DEBUG: Missing Session ID or Restaurant ID", { sId, rId });
      }
    }

    if (!orderItem || !currentOrder) {
        console.error("DEBUG: Missing required data", { orderItem, currentOrder });
        throw new Error("Missing required data (Order or Item)");
    }
    
    const modifierTotal = (selectedModifiers || []).reduce((sum, m) => sum + (m.price_adjustment || 0), 0);
    const unitPrice = orderItem.price + modifierTotal;

    let existingItem = null;
    if (!selectedModifiers || selectedModifiers.length === 0) {
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", currentOrder.id)
        .eq("menu_item_id", orderItem.id)
        .is('notes', null)
        .eq('status', 'pending')
        .eq('course', get().selectedCourse) // Only merge if same course
        .maybeSingle();
      existingItem = data;
    }

    let newQuantity = existingItem ? existingItem.quantity + 1 : 1;
    let newSum = unitPrice * newQuantity;

    const itemType = (orderItem?.type || "").toLowerCase();
    const isDrink = itemType === 'drink' || get().selectedCourse === 4;
    
    // Check if any item in the same course has already been started
    const isCourseAlreadyStarted = get().currentOrderItems.some(
      (item: OrderItem) => item.course === get().selectedCourse && item.is_started === true
    );

    // Check if this is the lowest course number (e.g. if we have course 2 but no course 1)
    // We filter for food items only to ignore drinks (course 4)
    const otherFoodItems = get().currentOrderItems.filter((i: OrderItem) => 
      (i.type === 'food' || i.course !== 4) && (i.id || i.order_item_id) !== existingItem?.id
    );
    
    let isLowestCourse = true;
    if (otherFoodItems.length > 0) {
      const minCourse = Math.min(...otherFoodItems.map((i: OrderItem) => i.course || 1));
      if (get().selectedCourse > minCourse) {
        isLowestCourse = false;
      }
    }

    const shouldStartNow = isDrink || get().selectedCourse === 1 || isCourseAlreadyStarted || isLowestCourse;

    // Optimistic Update
    const previousItems = [...get().currentOrderItems];
    const previousPrice = get().totalOrdersPrice;
    const previousQty = get().totalOrdersQty;
    const previousRemaining = get().totalRemaining;

    const tempId = `temp-${Date.now()}`;
    const newItem: OrderItem = {
      id: tempId,
      order_id: currentOrder.id,
      menu_item_id: orderItem.id,
      quantity: newQuantity,
      unit_price: unitPrice,
      sum_price: newSum,
      type: orderItem.type,
      status: "pending",
      course: get().selectedCourse,
      is_started: shouldStartNow,
      created_at: new Date().toISOString(),
      item_name: orderItem.name,
      selected_modifiers: selectedModifiers,
    };

    if (existingItem) {
      set({
        currentOrderItems: get().currentOrderItems.map(item => 
          (item.id === existingItem.id || item.order_item_id === existingItem.id) ? { ...item, quantity: newQuantity, sum_price: newSum } : item
        )
      });
    } else {
      set({ currentOrderItems: [...get().currentOrderItems, newItem] });
    }
    get().recalculateTotals();

    try {
      const data = await menuService.upsertOrderItem({
        ...(existingItem && { id: existingItem.id }),
        order_id: currentOrder.id,
        menu_item_id: orderItem.id,
        quantity: newQuantity,
        unit_price: unitPrice,
        sum_price: newSum,
        type: orderItem.type,
        status: "pending",
        course: get().selectedCourse,
        is_started: shouldStartNow,
        updated_at: new Date().toISOString(),
      }, selectedModifiers);

      if (data) {
        // Replace temp item with real data
        set({
          currentOrderItems: get().currentOrderItems.map(item => 
            item.id === tempId ? { ...item, id: data.id, order_item_id: data.id } : item
          )
        });

        if ((itemType === 'food' || itemType === 'drink') && shouldStartNow) {
          const { user } = useAuthStore.getState();
          const { selectedRestaurant } = useRestaurantStore.getState();
          const taskData: Partial<KitchenTask> = {
            order_id: currentOrder.id,
            order_item_id: data.id,
            menu_item_id: orderItem.id,
            status: "pending" as const,
            created_at: new Date().toISOString(),
          };
          
          await menuService.createKitchenTasks([taskData]);

          import("../../../services/notificationService").then(({ notificationService }) => {
            if (selectedRestaurant?.id) {
              const { selectedSession } = useTablesStore.getState() as any;
              const tableNum = (get() as any).chosenTable || selectedSession?.table_number || "?";
              notificationService.sendRoleNotification(selectedRestaurant.id, user?.id || "", {
                title: "New Order",
                message: `Table ${tableNum}: ${orderItem.name} (x1)`,
                priority: "high",
                roles: itemType === 'drink' ? ["barman", "admin", "owner"] : ["chef", "admin", "owner"]
              }).catch(e => console.error(e));
            }
          });
        }
      }
      // Re-sync with DB once to be sure
      get().getOrderItemsByOrderId(currentOrder.id);
    } catch (err) {
      console.error(err);
      // Rollback
      set({
        currentOrderItems: previousItems,
        totalOrdersPrice: previousPrice,
        totalOrdersQty: previousQty,
        totalRemaining: previousRemaining
      });
      handleError(err as Error);
    }
  },

  updateQuantity: async (item, action) => {
    const previousItems = [...get().currentOrderItems];
    const previousPrice = get().totalOrdersPrice;
    const previousQty = get().totalOrdersQty;
    const previousRemaining = get().totalRemaining;

    try {
      const itemType = (item.type || "").toLowerCase();
      let newQuantity = action === "increase" ? item.quantity + 1 : item.quantity - 1;
      if (newQuantity < 1) return;
      let newSum = item.unit_price * newQuantity;

      // Optimistic Update
      set({
        currentOrderItems: get().currentOrderItems.map(i => 
          (i.id === item.id || i.order_item_id === (item.order_item_id || item.id)) ? { ...i, quantity: newQuantity, sum_price: newSum } : i
        )
      });
      get().recalculateTotals();

      await menuService.upsertOrderItem({ id: item.order_item_id || item.id, quantity: newQuantity, sum_price: newSum });

      if ((itemType === 'food' || itemType === 'drink') && item.is_started !== false) {
        if (action === "increase") {
          await menuService.createKitchenTasks([{ 
            order_id: item.order_id, 
            order_item_id: (item.order_item_id || item.id) as string, 
            menu_item_id: item.menu_item_id, 
            status: "pending" as const, 
            created_at: new Date().toISOString() 
          }]);
        } else {
          const { data: tasks } = await supabase
            .from("kitchen_tasks")
            .select("id")
            .eq("order_item_id", item.order_item_id || item.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1);
          if (tasks?.length) await supabase.from("kitchen_tasks").delete().eq("id", tasks[0].id);
        }
      }
      // Final re-sync
      get().getOrderItemsByOrderId(item.order_id);
    } catch (error) {
      console.error(error);
      // Rollback
      set({
        currentOrderItems: previousItems,
        totalOrdersPrice: previousPrice,
        totalOrdersQty: previousQty,
        totalRemaining: previousRemaining
      });
      handleError(error as Error);
    }
  },

  handleRemoveItem: async (item) => {
    const previousItems = [...get().currentOrderItems];
    const previousPrice = get().totalOrdersPrice;
    const previousQty = get().totalOrdersQty;
    const previousRemaining = get().totalRemaining;

    try {
      const itemType = (item.type || "").toLowerCase();
      
      // Optimistic Update
      set({
        currentOrderItems: get().currentOrderItems.filter(i => (i.id || i.order_item_id) !== (item.id || item.order_item_id))
      });
      get().recalculateTotals();

      if (itemType === 'food' || itemType === 'drink') await menuService.deleteKitchenTasks((item.order_item_id || item.id) as string);
      await menuService.deleteOrderItem((item.order_item_id || item.id) as string);
      
      // Final re-sync
      get().getOrderItemsByOrderId(item.order_id);
    } catch (error) {
      console.error(error);
      // Rollback
      set({
        currentOrderItems: previousItems,
        totalOrdersPrice: previousPrice,
        totalOrdersQty: previousQty,
        totalRemaining: previousRemaining
      });
      handleError(error as Error);
    }
  },

  confirmPayment: async () => {
    const { cash, card, totalRemaining, tipAmount } = get();
    const cashVal = parseFloat(cash) || 0;
    const cardVal = parseFloat(card) || 0;
    const totalPaid = cashVal + cardVal;

    const roundedTotalPaid = Math.round(totalPaid * 100) / 100;
    const roundedRemaining = Math.round(totalRemaining * 100) / 100;
    const totalWithTip = Math.round((roundedRemaining + tipAmount) * 100) / 100;

    if (roundedTotalPaid < totalWithTip) {
      Swal.fire("INSUFFICIENT PAYMENT", `The total payment (including tip) is ${(totalWithTip - roundedTotalPaid).toFixed(2)} short.`, "error");
      return false;
    }

    const { isConfirmed } = await Swal.fire({
      title: "Confirm payment?",
      html: `<h6>Subtotal: ${roundedRemaining.toFixed(2)}</h6><h6>Tip: ${tipAmount.toFixed(2)}</h6><hr/><h6>Cash: ${cashVal.toFixed(2)}</h6> <h6>Card: ${cardVal.toFixed(2)}</h6><hr/><h3><strong>Total: ${totalPaid.toFixed(2)}</strong><h3>`,
      icon: "info",
      showCancelButton: true,
    });

    if (!isConfirmed) return false;

    const success = await get().payAllItems(cashVal, cardVal);
    return success;
  },

  updateItemNote: async (orderItemId, note) => {
    try {
      await menuService.updateItemNote(orderItemId, note);
      set({ 
        currentOrderItems: get().currentOrderItems.map((item: OrderItem) => item.order_item_id === orderItemId ? { ...item, notes: note } : item)
      });
    } catch (error) {
      handleError(error as Error);
    }
  },

  subscribeToOrderItems: () => {
    const restaurantId = useRestaurantStore.getState().selectedRestaurant?.id;
    if (!restaurantId) return;

    if (get().orderItemsChannel) supabase.removeChannel(get().orderItemsChannel!);

    const channel = supabase
      .channel(`kitchen-orders-${restaurantId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => {
        (get() as any).getActiveSessionByRestaurant?.();
        if ((get() as any).chosenTable) (get() as any).filterActiveSessionByTableNumber?.((get() as any).chosenTable);
        if (get().currentOrder?.id) get().getOrderItemsByOrderId(get().currentOrder!.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        const sid = (get() as any).chosenTableSession?.id || get().currentOrder?.session_id;
        if (sid) get().getOrderBySessionId(sid);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "kitchen_tasks" }, (payload: any) => {
        (get() as any).getActiveSessionByRestaurant?.();
        const cid = get().currentOrder?.id;
        if (cid && ((payload.new as any)?.order_id === cid || (payload.old as any)?.order_id === cid)) {
           get().fetchKitchenTasksForOrder(cid);
           get().getOrderItemsByOrderId(cid);
        }
      })
      .subscribe();

    set({ orderItemsChannel: channel });
  },

  unsubscribeFromOrderItems: () => {
    if (get().orderItemsChannel) {
      supabase.removeChannel(get().orderItemsChannel!);
      set({ orderItemsChannel: null });
    }
  },

  fetchSalesData: async () => {
    const orders = (get() as any).assignedTables || [];
    const salesByDay = orders.filter((o: Order) => o.order_total !== null).reduce((acc: any, o: Order) => {
      const day = new Date(o.opened_at).toLocaleDateString("en-US", { weekday: "long" });
      acc[day] = (acc[day] || 0) + Number(o.order_total);
      return acc;
    }, {});

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const data = days.map(day => ({ day, total: salesByDay[day] || 0 }));

    set({
      salesData: {
        labels: data.map(d => d.day),
        datasets: [{ label: "Sales Performance (Last 7 Days)", data: data.map(d => d.total), backgroundColor: "rgba(75, 192, 192, 0.6)", borderColor: "rgba(75, 192, 192, 1)", borderWidth: 1 }],
      },
      loadingChart: false,
    });
  },

  payForItems: async (itemIds, cashVal, cardVal) => {
    const { orderId, currentOrder, waiterName, getOrderItemsByOrderId, currentOrderItems } = get();
    const chosenTableNum = get().chosenTable || useTablesStore.getState().selectedSession?.table_number || "?";

    // Filter out items already completed, and ALREADY CANCELLED items
    const itemsToPay = (currentOrderItems || []).filter((item: OrderItem) => 
      itemIds.includes(item.id || (item.order_item_id as string)) && 
      item.payment_status !== 'completed' && 
      item.status !== 'cancelled'
    );
    
    const totalToPay = itemsToPay.reduce((sum: number, item: any) => sum + (item.sum_price || 0), 0);
    const totalPaid = cashVal + cardVal;
    const roundedTotalToPay = Math.round(totalToPay * 100) / 100;
    const roundedTotalPaid = Math.round(totalPaid * 100) / 100;
    
    if (roundedTotalPaid < roundedTotalToPay) {
      Swal.fire("INSUFFICIENT PAYMENT", `The payment is ${(roundedTotalToPay - roundedTotalPaid).toFixed(2)} short.`, "error");
      return false;
    }

    try {
      const { user } = useAuthStore.getState();
      const firstName = user?.user_metadata?.firstName || user?.user_metadata?.first_name || "";
      const lastName = user?.user_metadata?.lastName || user?.user_metadata?.last_name || "";
      const userName = (firstName + " " + lastName).trim() || user?.email || "Staff";
      const effectiveWaiterName = waiterName || userName;
      const oId = (orderId || currentOrder?.id) as string;
      const displayOrderId = (currentOrder as any)?.order_no || (currentOrder as any)?.order_id || String(oId).slice(-6).toUpperCase();

      await menuService.updateOrderItemPaymentStatus(itemIds, 'completed');
      await getOrderItemsByOrderId(oId);

      const { selectedRestaurant } = useRestaurantStore.getState();
      const paidItemsCount = itemsToPay.length;
      printReceipt(
        displayOrderId, 
        effectiveWaiterName, 
        chosenTableNum.toString(), 
        paidItemsCount, 
        totalToPay, 
        itemsToPay, 
        totalPaid.toFixed(2), 
        cashVal.toFixed(2), 
        cardVal.toFixed(2), 
        (totalPaid - totalToPay).toFixed(2),
        selectedRestaurant
      );
      
      const allItems = await getOrderItemsByOrderId(oId as string);
      const allPaid = allItems.every((item: OrderItem) => item.payment_status === 'completed');
      
      if (allPaid) {
        const { tipAmount } = get();
        await supabase.from("orders").update({ 
          status: "served",
          tip: tipAmount 
        }).eq("id", oId);
        const sId = currentOrder?.session_id;
        if (sId) {
          const session = await menuService.closeSession(sId);
          if (session?.table_id) await menuService.setTableAvailable(session.table_id);
        }
        Swal.fire("Success!", "Full payment completed and table closed.", "success");
        get().resetOrder();
        (get() as any).getAssignedTables?.();
      }
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    }
  },

  payAllItems: async (cashVal, cardVal) => {
    const allIds = (get().currentOrderItems || [])
      .filter((item: OrderItem) => item.payment_status !== 'completed' && item.status !== 'cancelled')
      .map((item: OrderItem) => (item.id || item.order_item_id) as string);
    return get().payForItems(allIds, cashVal, cardVal);
  },

  voidItem: async (orderItemId, reason) => {
    try {
      await menuService.voidOrderItem(orderItemId, reason);
      await menuService.deleteKitchenTasks(orderItemId);
      const orderId = get().currentOrder?.id;
      if (orderId) await get().getOrderItemsByOrderId(orderId);
    } catch (error) {
      handleError(error as Error);
    }
  },

  compItem: async (orderItemId, reason) => {
    try {
      const { user } = useAuthStore.getState();
      const { selectedRestaurant } = useRestaurantStore.getState();
      const tableNumber = (get() as any).chosenTable || (useTablesStore.getState() as any).selectedSession?.table_number;

      await menuService.compOrderItem(orderItemId, reason, selectedRestaurant?.id, user?.id, tableNumber);
      const orderId = get().currentOrder?.id;
      if (orderId) await get().getOrderItemsByOrderId(orderId);
    } catch (error) {
      handleError(error as Error);
    }
  },

  resetOrder: () => {
    set({
      currentOrder: null,
      currentOrderItems: [],
      orderId: null,
      totalOrdersPrice: 0,
      totalOrdersQty: 0,
      totalRemaining: 0,
      cash: "",
      card: "",
      tipAmount: 0,
      totalCashCardAmount: 0,
      currentKitchenTasks: [],
      chosenTableSession: null,
      chosenTable: null
    });
    useTablesStore.getState().setSelectedSession(null);
    get().resetStepper();
  },

  fetchMyOrderHistory: async (waiterId, startDate, endDate) => {
    set({ loadingMyOrders: true });
    try {
      const data = await menuService.fetchOrdersByWaiter(waiterId, startDate, endDate);
      set({ myOrders: data || [] });
    } catch (error) {
      handleError(error as Error);
    } finally {
      set({ loadingMyOrders: false });
    }
  }
});
