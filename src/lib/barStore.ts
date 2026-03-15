import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import { handleError } from "../components/Error";
import Swal from "sweetalert2";
import useRestaurantStore from "./restaurantStore";
import useAuthStore from "./authStore";
import { RealtimeChannel } from "@supabase/supabase-js";
import dayjs from "dayjs";

/**
 * Helper to check if ALL sibling tasks for an order_item have reached a target status (or beyond)
 * status order: pending < preparing < ready < served
 */
async function shouldSyncOrderItemStatus(orderItemId: string, targetStatus: string): Promise<boolean> {
  const statusOrder = ["pending", "preparing", "ready", "served"];
  const targetIdx = statusOrder.indexOf(targetStatus);
  
  const { data: siblings } = await supabase
    .from("kitchen_tasks")
    .select("status")
    .eq("order_item_id", orderItemId);
    
  if (!siblings || siblings.length === 0) return true;
  
  // ALL siblings must be at targetStatus or beyond
  return siblings.every(s => statusOrder.indexOf(s.status) >= targetIdx);
}

interface BarTask {
  kitchen_task_id: string; // Changed from task_id
  menu_item_id: string;
  menu_item_name: string;
  task_number: number;
  quantity: number; // Changed from order_item_quantity
  status: string; // Individual task status (pending, preparing, etc)
  order_item_status: string; // Parent order_item status
  order_item_id: string;
  order_id: string;
  table_number: string;
  waiter_id: string;
  waiter_first_name?: string;
  waiter_last_name?: string;
  waiter_avatar?: string;
  menu_item_preparation_time?: number;
  task_created_at: string;
  task_updated_at?: string;
  task_completed_at?: string;
  order_item_updated_at?: string;
  updated_at?: string;
  completed_at?: string;
  menu_item_image_url?: string;
  notes?: string; // Add notes field
  modifier_names?: { name: string }[];
  recipe?: string | null;
}

interface BarMenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category_id: string;
  category_name: string;
  restaurant_id: string;
  type: string;
  description?: string;
  preparation_time?: number;
  stock_count?: number | null;
  recipe?: string | null;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface Tab {
  id: number;
  name: string;
  cart: CartItem[];
  db_session_id?: string;
  db_order_id?: string;
}

interface Category {
  id: string;
  name: string;
}

interface BarState {
  loadingItems: boolean;
  items: BarMenuItem[];
  barOptionSelected: string;
  orderItemsLoading: boolean;
  orderItems: BarTask[];
  pendingOrders: BarTask[];
  preparingOrders: BarTask[];
  readyOrders: BarTask[];
  servedOrders: BarTask[];
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  tabs: Tab[];
  activeTab: string | number;
  orderItemsChannel: RealtimeChannel | null;
  dailyDrinkTasks: BarTask[];
  loadingDailyTasks: boolean;
  dailyOTCDrinks: any[];
  loadingDailyOTCDrinks: boolean;
  activeStep: number;
  cash: string;
  card: string;
  isProcessingPayment: boolean;

  setIsLoadingItems: (value: boolean) => void;
  setItems: (value: BarMenuItem[]) => void;
  setBarOptionSelected: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setActiveTab: (id: string | number) => void;
  subscribeToOrderItems: () => void;
  unsubscribeFromOrderItems: () => void;
  setTabs: (updater: any) => void;
  getActiveCart: () => CartItem[];
  getTotal: () => number;
  addNewTab: () => Promise<void>;
  addToCart: (drink: any) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  handleFetchItems: () => Promise<void>;
  handleFetchOrderItems: (options?: { silent?: boolean }) => Promise<void>;
  handleFetchDailyDrinkTasks: (options?: { silent?: boolean }) => Promise<void>;
  handleFetchDailyOTCDrinks: (options?: { silent?: boolean }) => Promise<void>;
  handleUpdateOrderItemStatus: (drink: BarTask) => Promise<void>;
  setActiveStep: (step: number) => void;
  setCash: (value: string) => void;
  setCard: (value: string) => void;
  formatCashInput: (amount: string | number) => string;
  completeOTCPayment: () => Promise<boolean>;
  resetBarState: () => void;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  isCreatingTab: boolean;
  recentOTCOrders: any[];
  tip: string;
  setTip: (value: string) => void;
  handleVoidOTCOrder: (orderId: string) => Promise<void>;
  handleRemoveTab: (tabId: string | number) => Promise<boolean>;
  syncTabsWithDB: () => Promise<void>;
  taxAmount: string;
}

const useBarStore = create<BarState>()(
  persist(
    (set, get) => ({
      loadingItems: false,
      items: [],
      barOptionSelected: "dine_in",
      orderItemsLoading: false,
      orderItems: [],
      pendingOrders: [],
      preparingOrders: [],
      readyOrders: [],
      servedOrders: [],
      categories: [],
      selectedCategory: "all",
      searchQuery: "",
      tabs: [],
      activeTab: 0,
      orderItemsChannel: null,
      dailyDrinkTasks: [],
      loadingDailyTasks: false,
      dailyOTCDrinks: [],
      loadingDailyOTCDrinks: false,
      activeStep: 0,
      cash: "",
      card: "",
      tip: "",
      taxAmount: "0",
      isProcessingPayment: false,
      recentOTCOrders: [],

      setIsLoadingItems: (value) => set({ loadingItems: value }),
      setItems: (value) => set({ items: value }),
      setBarOptionSelected: (value) => set({ barOptionSelected: value }),
      setSelectedCategory: (value) => set({ selectedCategory: value }),
      setSearchQuery: (value) => set({ searchQuery: value }),
      setActiveStep: (step) => set({ activeStep: step }),
      setCash: (value) => set({ cash: value }),
      setCard: (value) => set({ card: value }),
      setTip: (value) => set({ tip: value }),

      formatCashInput: (amount) => {
        const numericValue = String(amount).replace(/[^0-9.]/g, "");
        if (numericValue === "") return "";
        const formattedValue = parseFloat(numericValue).toFixed(2);
        return formattedValue;
      },

      completeOTCPayment: async () => {
        const role = useRestaurantStore.getState().role;
        if (role !== "owner" && role !== "admin" && role !== "cashier" && role !== "bartender") {
          Swal.fire("Unauthorized", "You don't have permission to process payments.", "error");
          return false;
        }

        const { tabs, activeTab, cash, card, getTotal } = get();
        const activeTabObj = tabs.find(t => String(t.id) === String(activeTab));
        if (!activeTabObj || activeTabObj.cart.length === 0) return false;

        const { selectedRestaurant } = useRestaurantStore.getState();
        const { user } = useAuthStore.getState();
        const restaurantId = selectedRestaurant?.id;
        const userId = user?.id;

        if (!restaurantId || !userId) {
          Swal.fire("Error", "Missing restaurant or user information", "error");
          return false;
        }

        const total = getTotal();
        const cashValue = parseFloat(cash) || 0;
        const cardValue = parseFloat(card) || 0;

        if (cashValue + cardValue < total) {
          Swal.fire("Error", "Insufficient payment amount", "error");
          return false;
        }

        set({ isProcessingPayment: true });

        try {
          // 1. Use the existing session and order
          if (!activeTabObj.db_session_id || !activeTabObj.db_order_id) {
            throw new Error("Missing database records for this tab");
          }

          const sessionId = activeTabObj.db_session_id;
          const orderId = activeTabObj.db_order_id;

          // Finalize session
          const { error: sessionError } = await supabase
            .from("table_sessions")
            .update({
              status: "close",
              closed_at: new Date().toISOString(),
              payment_method: cashValue >= total ? "cash" : "card", // Simplified
            })
            .eq("id", sessionId);

          if (sessionError) throw sessionError;

          const tipValue = parseFloat(get().tip) || 0;
          const taxAmount = parseFloat(get().taxAmount) || 0;

          // 2. Finalize Order
          const { error: orderError } = await supabase
            .from("orders")
            .update({
              total: total + taxAmount,
              tip: tipValue,
              status: "served",
              payment_method: cashValue >= total ? "cash" : "card",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

          if (orderError) throw orderError;

          // Bidirectional Notification: Staff -> Cashier
          // (Bartender just finalized an OTC order)
          try {
            const { menuService } = await import("../services/menuService");
            menuService.notifySessionUpdate(
              restaurantId,
              userId,
              sessionId,
              "STAFF_CLOSED",
              { 
                orderId: orderId, 
                tableNumber: "OTC" 
              }
            ).catch(e => console.error("Session notification error:", e));
          } catch (e) {}

          // 🆕 Record the OTC payment in the unified ledger
          const { error: paymentError } = await supabase
            .from("payments")
            .insert({
              payment_type: "order",
              order_id: orderId,
              restaurant_id: restaurantId,
              cashier_id: userId, // Bartender acting as cashier
              amount: total + taxAmount,
              method: cashValue >= total ? "cash" : "card",
              status: "completed",
              reference: null
            });

          if (paymentError) {
             console.error("Bar OTC Ledger recording failed:", paymentError);
          }

          // 3. Mark all Order Items as "served"
          const { error: itemsError } = await supabase
            .from("order_items")
            .update({
              status: "served",
              completed_at: new Date().toISOString(),
            })
            .eq("order_id", orderId);

          if (itemsError) throw itemsError;

          // 4. Update Stock (Task 4.1)
          for (const item of activeTabObj.cart) {
            await supabase.rpc('decrement_stock', { item_id: item.id, amount: item.qty });
          }

          // 5. Success - Clear the tab and reset state
          Swal.fire({
            title: "Payment Successful",
            text: "Order has been processed and completed.",
            icon: "success",
          });

          const { tabs, activeTab } = get();
          const newTabs = tabs.filter((t) => String(t.id) !== String(activeTab));
          
          set((state) => ({
            tabs: newTabs,
            activeTab: newTabs.length > 0 ? newTabs[0].id : 0,
            activeStep: 0,
            cash: "",
            card: "",
            tip: "",
            recentOTCOrders: [{ id: orderId, items: activeTabObj.cart, total: total + taxAmount }, ...state.recentOTCOrders].slice(0, 10),
          }));

          return true;
        } catch (error: any) {
          console.error("Payment error:", error);
          Swal.fire("Error", error.message || "Failed to process payment", "error");
          return false;
        } finally {
          set({ isProcessingPayment: false });
        }
      },

      subscribeToOrderItems: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;

        if (!restaurantId) return;

        const oldChannel = get().orderItemsChannel;
        if (oldChannel) supabase.removeChannel(oldChannel);

        const channel = supabase
          .channel(`bar-tasks-${restaurantId}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "kitchen_tasks" },
            () => {
              get().handleFetchOrderItems({ silent: true });
              get().handleFetchDailyDrinkTasks({ silent: true });
            }
          )
          .on(
            "postgres_changes",
            { 
              event: "UPDATE", 
              schema: "public", 
              table: "table_sessions",
              filter: `restaurant_id=eq.${restaurantId}`
            },
            (payload) => {
              // If a session is closed (e.g. by cashier), remove from local tabs
              if (payload.new.status !== "open") {
                set((state) => {
                  const newTabs = state.tabs.filter(tab => tab.db_session_id !== payload.new.id);
                  let newActiveTab = state.activeTab;
                  
                  // If the active tab was removed, switch to the first one available
                  const wasActive = state.tabs.find(t => t.id === state.activeTab)?.db_session_id === payload.new.id;
                  if (wasActive) {
                    newActiveTab = newTabs.length > 0 ? newTabs[0].id : 0;
                  }
                  
                  return {
                    tabs: newTabs,
                    activeTab: newActiveTab
                  };
                });
              }
            }
          )
          .subscribe();

        set({ orderItemsChannel: channel });
      },

      unsubscribeFromOrderItems: () => {
        const channel = get().orderItemsChannel;
        if (channel) {
          supabase.removeChannel(channel);
          set({ orderItemsChannel: null });
        }
      },

      setTabs: (updater) =>
        set((state) => ({
          tabs: typeof updater === "function" ? updater(state.tabs) : updater,
        })),

      setActiveTab: (id) => set({ activeTab: id, activeStep: 0 }),

      getActiveCart: () => {
        const { tabs, activeTab } = get();
        const tab = tabs.find(t => String(t.id) === String(activeTab));
        return tab?.cart || [];
      },

      getTotal: () => {
        const cart = get().getActiveCart();
        return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      },

      isCreatingTab: false,
      addNewTab: async () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const { user } = useAuthStore.getState();
        const restaurantId = selectedRestaurant?.id;
        const userId = user?.id;

        if (!restaurantId || !userId) return;

        set({ isCreatingTab: true });
        try {
          // 1. Create a "walk-in" session in DB (status open)
          const { data: session, error: sessionError } = await supabase
            .from("table_sessions")
            .insert({
              restaurant_id: restaurantId,
              waiter_id: userId,
              status: "open",
            })
            .select()
            .single();

          if (sessionError) throw sessionError;

          // 2. Create Order in DB (linked to session)
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
              session_id: session.id,
              restaurant_id: restaurantId,
              total: 0,
              status: "pending",
            })
            .select()
            .single();

          if (orderError) throw orderError;

          set((state) => {
            const newTab: Tab = {
              id: Date.now(),
              name: `Customer ${state.tabs.length + 1}`,
              cart: [],
              db_session_id: session.id,
              db_order_id: order.id,
            };
            return {
              tabs: [...state.tabs, newTab],
              activeTab: newTab.id,
            };
          });
        } catch (error) {
          console.error("Error creating new OTC tab in DB:", error);
          handleError(error as Error);
        } finally {
          set({ isCreatingTab: false });
        }
      },

      addToCart: async (drink) => {
        const { tabs, activeTab } = get();
        const tab = tabs.find(t => String(t.id) === String(activeTab));
        if (!tab || !tab.db_order_id) return;

        // 1. Update Local State
        set((state) => ({
          tabs: state.tabs.map((t) =>
            String(t.id) === String(activeTab)
              ? {
                  ...t,
                  cart: t.cart.some((item) => item.id === drink.id)
                    ? t.cart.map((item) =>
                        item.id === drink.id
                          ? { ...item, qty: item.qty + 1 }
                          : item
                      )
                    : [...t.cart, { ...drink, qty: 1 }],
                }
              : t
          ),
        }));

        // 2. Sync to DB
        try {
          const { tabs, activeTab } = get();
          const updatedTab = tabs.find(t => String(t.id) === String(activeTab));
          if (!updatedTab) return;
          const drinkInCart = updatedTab.cart.find((i: any) => i.id === drink.id);
          if (!drinkInCart) return;

          // Update/Insert order item record
          const { error: itemError } = await supabase
            .from("order_items")
            .upsert({
              order_id: tab.db_order_id,
              menu_item_id: drink.id,
              quantity: drinkInCart.qty,
              unit_price: drink.price,
              sum_price: drink.price * drinkInCart.qty,
              status: "pending",
              type: "drink",
            }, { onConflict: "order_id,menu_item_id" });

          if (itemError) throw itemError;

          // Update order total
          await supabase
            .from("orders")
            .update({ total: get().getTotal() })
            .eq("id", tab.db_order_id);
        } catch (error) {
          console.error("Error syncing cart to DB:", error);
        }
      },

      removeFromCart: async (id) => {
        const { tabs, activeTab } = get();
        const tab = tabs.find(t => String(t.id) === String(activeTab));
        if (!tab || !tab.db_order_id) return;

        // 1. Update Local
        set((state) => ({
          tabs: state.tabs.map((t) =>
            String(t.id) === String(activeTab)
              ? { ...t, cart: t.cart.filter((item) => item.id !== id) }
              : t
          ),
        }));

        // 2. Sync to DB
        try {
          await supabase
            .from("order_items")
            .delete()
            .eq("order_id", tab.db_order_id)
            .eq("menu_item_id", id);

          await supabase
            .from("orders")
            .update({ total: get().getTotal() })
            .eq("id", tab.db_order_id);
        } catch (error) {
          console.error("Error removing item from DB:", error);
        }
      },

      handleFetchItems: async () => {
        set({ loadingItems: true });
        get().syncTabsWithDB(); // Sync local tabs with actual DB status
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;
        try {
          const { data, error } = await supabase
            .from("menu_items_with_category")
            .select("*")
            .eq("type", "drink")
            .eq("restaurant_id", restaurantId);

          if (error) handleError(error);
          
          const itemsData = (data as BarMenuItem[]) || [];

          const categories: Category[] = Array.from(
            new Map(itemsData.map((item) => [item.category_id, item.category_name]))
          ).map(([id, name]) => ({ id: id as string, name: name as string }));

          set({ items: itemsData, categories, loadingItems: false });
        } catch (error) {
          console.error("Error fetching order items:", error);
          set({ loadingItems: false });
        }
      },

      handleFetchOrderItems: async (options = {}) => {
        if (!options.silent) set({ orderItemsLoading: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;
        try {
          const fromTime = dayjs().subtract(24, "hour").toISOString();
          const { data, error } = await supabase
            .from("kitchen_tasks_full")
            .select("*")
            .ilike("item_type", "drink")
            .eq("menu_item_restaurant_id", restaurantId)
            .gte("task_created_at", fromTime)
            .order("task_created_at", { ascending: true }); // Better for FIFO queue

          if (error) handleError(error);
          
          const tasks = (data as BarTask[]) || [];
          
          // --- Waiter Resolution Logic ---
          const tasksMissingWaiter = tasks.filter(t => !t.waiter_id && t.order_id);
          const missingOrderIds = Array.from(new Set(tasksMissingWaiter.map(t => t.order_id)));
          let resolvedWaitersByOrder: Record<string, string> = {};

          if (missingOrderIds.length > 0) {
              const { data: orders } = await supabase.from("orders").select("id, session_id").in("id", missingOrderIds);
              const sessionIds = Array.from(new Set((orders || []).map((o: any) => o.session_id).filter(Boolean)));
              if (sessionIds.length > 0) {
                  const { data: sessions } = await supabase.from("table_sessions").select("id, waiter_id").in("id", sessionIds);
                  const sessionWaiterMap: Record<string, string> = {};
                  sessions?.forEach((s: any) => { if (s.waiter_id) sessionWaiterMap[s.id] = s.waiter_id; });
                  orders?.forEach((o: any) => { if (sessionWaiterMap[o.session_id]) resolvedWaitersByOrder[o.id] = sessionWaiterMap[o.session_id]; });
              }
          }

          const allWaiterIds = new Set<string>();
          tasks.forEach(t => {
              if (t.waiter_id) allWaiterIds.add(t.waiter_id);
              else if (resolvedWaitersByOrder[t.order_id]) allWaiterIds.add(resolvedWaitersByOrder[t.order_id]);
          });
          
          let waiterMap: Record<string, any> = {};
          const uniqueWaiterIds = Array.from(allWaiterIds);
          if (uniqueWaiterIds.length > 0) {
            const { data: waiters } = await supabase.from("users_secure_view").select(`
              id,
              raw_user_meta_data->>'firstName' as camel_first,
              raw_user_meta_data->>'lastName' as camel_last,
              raw_user_meta_data->>'first_name' as snake_first,
              raw_user_meta_data->>'last_name' as snake_last,
              raw_user_meta_data->>'avatarUrl' as avatar
            `).in("id", uniqueWaiterIds);
            waiters?.forEach((w: any) => {
               waiterMap[w.id] = { 
                 first_name: w.camel_first || w.snake_first, 
                 last_name: w.camel_last || w.snake_last, 
                 avatar: w.avatar 
               };
            });
          }

          // --- Modifier Fetching (Task 2.4) ---
          const orderItemIds = Array.from(new Set(tasks.map(t => t.order_item_id)));
          let modMap: Record<string, { name: string }[]> = {};
          
          if (orderItemIds.length > 0) {
            const { data: modsData } = await supabase
              .from("order_item_modifiers")
              .select("order_item_id, name")
              .in("order_item_id", orderItemIds);
            
            modsData?.forEach(m => {
              if (!modMap[m.order_item_id]) modMap[m.order_item_id] = [];
              modMap[m.order_item_id].push({ name: m.name });
            });
          }

          const correctedTasks = tasks.map(task => {
            const finalWaiterId = task.waiter_id || resolvedWaitersByOrder[task.order_id];
            const waiter = waiterMap[finalWaiterId] || {};
            return { 
              ...task, 
              waiter_id: finalWaiterId,
              waiter_first_name: waiter.first_name || task.waiter_first_name || (finalWaiterId ? "Unknown Name" : "Unknown"),
              waiter_last_name: waiter.last_name || task.waiter_last_name || "",
              waiter_avatar: waiter.avatar || task.waiter_avatar,
              modifier_names: modMap[task.order_item_id] || [],
              updated_at: task.task_updated_at || task.order_item_updated_at,
              completed_at: task.task_completed_at,
            };
          });

          const taskCounts: Record<string, number> = {};
          const tasksWithNumbers = correctedTasks.map(task => {
            const id = task.order_item_id;
            taskCounts[id] = (taskCounts[id] || 0) + 1;
            return {
              ...task,
              task_number: taskCounts[id]
            };
          });

          set({ 
            orderItems: tasksWithNumbers, 
            pendingOrders: tasksWithNumbers.filter(t => (t.status || t.order_item_status)?.toLowerCase() === 'pending'),
            preparingOrders: tasksWithNumbers.filter(t => (t.status || t.order_item_status)?.toLowerCase() === 'preparing'),
            readyOrders: tasksWithNumbers.filter(t => (t.status || t.order_item_status)?.toLowerCase() === 'ready'),
            servedOrders: tasksWithNumbers.filter(t => (t.status || t.order_item_status)?.toLowerCase() === 'served'),
            orderItemsLoading: false 
          });
        } catch (error) {
          console.error("Error fetching order items:", error);
          set({ orderItemsLoading: false });
        }
      },


      handleFetchDailyDrinkTasks: async (options = {}) => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;
        if (!restaurantId) return;

        if (!options.silent) set({ loadingDailyTasks: true });
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const { data, error } = await supabase
            .from("kitchen_tasks_full")
            .select("*")
            .ilike("item_type", "drink")
            .eq("menu_item_restaurant_id", restaurantId)
            .gte("task_created_at", today.toISOString());

          if (error) throw error;
          const mapped = (data || []).map((t: any) => ({
            ...t,
            updated_at: t.task_updated_at || t.order_item_updated_at,
            completed_at: t.task_completed_at
          }));
          set({ dailyDrinkTasks: mapped as BarTask[], loadingDailyTasks: false });
        } catch (error) {
          console.error("Error fetching daily drink tasks:", error);
          set({ loadingDailyTasks: false });
        }
      },

      handleFetchDailyOTCDrinks: async (options = {}) => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;
        if (!restaurantId) return;

        if (!options.silent) set({ loadingDailyOTCDrinks: true });
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // 1. Fetch OTC sessions (where table_id is null)
          const { data: otcSessions, error: sessionError } = await supabase
            .from("table_sessions")
            .select("id")
            .eq("restaurant_id", restaurantId)
            .is("table_id", null)
            .gte("created_at", today.toISOString());

          if (sessionError) throw sessionError;

          const sessionIds = otcSessions?.map((s: any) => s.id) || [];

          if (sessionIds.length === 0) {
            set({ dailyOTCDrinks: [], loadingDailyOTCDrinks: false });
            return;
          }

          // 2. Fetch order items for these sessions
          const { data, error } = await supabase
            .from("order_items_full")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .eq("type", "drink")
            .in("session_id", sessionIds)
            .gte("order_item_created_at", today.toISOString());

          if (error) throw error;
          set({ dailyOTCDrinks: data || [], loadingDailyOTCDrinks: false });
        } catch (error) {
          console.error("Error fetching daily OTC drinks:", error);
          set({ loadingDailyOTCDrinks: false });
        }
      },

      handleUpdateOrderItemStatus: async (drink) => {
        const { user } = useAuthStore.getState();
        const userId = user?.id;

        if (drink.order_item_status === "pending") {
          try {
            Swal.fire({
              title: `Start preparing "${drink.menu_item_name}"?`,
              html: `Task ${drink.task_number} of ${drink.quantity}<br/>Automatically marking as preparing in <b>5</b>s...`,
              icon: "warning",
              showCancelButton: true,
              showDenyButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#ccc9c8",
              denyButtonColor: "#d33",
              confirmButtonText: "Yes, start preparing!",
              denyButtonText: "Remove task",
              timer: 5000,
              timerProgressBar: true,
            }).then(async (result) => {
              if (result.dismiss === Swal.DismissReason.timer || result.isConfirmed) {
                const { error } = await supabase
                  .from("kitchen_tasks")
                  .update({
                    status: "preparing",
                    updated_at: new Date().toISOString(),
                    prepared_by: userId,
                  })
                  .eq("id", drink.kitchen_task_id);
                if (error) handleError(error);

                // Only update parent order_item status if all siblings are at least 'preparing'
                if (await shouldSyncOrderItemStatus(drink.order_item_id, "preparing")) {
                  await supabase
                    .from("order_items")
                    .update({
                      status: "preparing",
                      updated_at: new Date().toISOString(),
                      prepared_by: userId,
                    })
                    .eq("id", drink.order_item_id);
                }

                get().handleFetchOrderItems({ silent: true });
              }

              if (result.isDenied) {
                Swal.fire({
                  title: "Remove this task?",
                  text: "You won't be able to revert this!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, remove it",
                }).then(async (deleteConfirm) => {
                  if (deleteConfirm.isConfirmed) {
                    const { error } = await supabase
                      .from("kitchen_tasks")
                      .delete()
                      .eq("id", drink.kitchen_task_id);

                    if (error) handleError(error);

                    Swal.fire({
                      title: "Deleted!",
                      text: "Task has been removed.",
                      icon: "success",
                    });

                    get().handleFetchOrderItems({ silent: true });
                  }
                });
              }
            });
          } catch (error) {
            console.error("Error updating task status:", error);
          }
        } else if (drink.order_item_status?.toLowerCase() === "preparing") {
          try {
            Swal.fire({
              title: `Mark "${drink?.menu_item_name}" as ready?`,
              html: `Task ${drink.task_number}<br/>Automatically marking as ready in <b>5</b>s...`,
              icon: "warning",
              timer: 5000,
              timerProgressBar: true,
            }).then(async (result) => {
              if (result.dismiss === Swal.DismissReason.timer || result.isConfirmed) {
                const { error } = await supabase
                  .from("kitchen_tasks")
                  .update({
                    status: "ready",
                    updated_at: new Date().toISOString(),
                    completed_at: new Date().toISOString(),
                  })
                  .eq("id", drink.kitchen_task_id);
                if (error) handleError(error);

                // Only update parent order_item status if all siblings are at least 'ready'
                if (await shouldSyncOrderItemStatus(drink.order_item_id, "ready")) {
                  await supabase
                    .from("order_items")
                    .update({
                      status: "ready",
                      updated_at: new Date().toISOString(),
                      completed_at: new Date().toISOString(),
                    })
                    .eq("id", drink.order_item_id);
                }

                get().handleFetchOrderItems({ silent: true });

                // Send notification to the waiter (Task 2.1)
                const { selectedRestaurant } = useRestaurantStore.getState();
                const { user: currentUser } = useAuthStore.getState();

                import("../services/notificationService").then(async ({ notificationService }) => {
                  let targetWaiterId = drink.waiter_id;

                  // Fallback: Fetch waiter_id via orders -> table_sessions if missing
                  if (!targetWaiterId) {
                    const { data: orderData } = await supabase
                      .from("orders")
                      .select("session_id")
                      .eq("id", drink.order_id)
                      .maybeSingle();

                    if (orderData?.session_id) {
                      const { data: sessionData } = await supabase
                        .from("table_sessions")
                        .select("waiter_id")
                        .eq("id", orderData.session_id)
                        .maybeSingle();

                      if (sessionData?.waiter_id) {
                        targetWaiterId = sessionData.waiter_id;
                      }
                    }
                  }

                  if (targetWaiterId && selectedRestaurant?.id) {
                    await notificationService.sendUserNotification(
                      selectedRestaurant.id,
                      currentUser?.id || "",
                      {
                        title: "Drink Ready",
                        message: `Table ${drink.table_number}: ${drink.menu_item_name} is ready for pickup`,
                        priority: "high",
                        userIds: [targetWaiterId],
                      }
                    );
                  }
                });
              }
            });
          } catch (error) {
            console.error("Error updating task status:", error);
          }
        } else if (drink.order_item_status?.toLowerCase() === "ready") {
          Swal.fire({
            title: "Mark as Served?",
            html: `Task ${drink.task_number}<br/>This drink will auto-update in <b>5</b> seconds.`,
            icon: "info",
            timer: 5000,
            timerProgressBar: true,
          }).then(async (result) => {
            if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
              try {
                const { error } = await supabase
                  .from("kitchen_tasks")
                  .update({ 
                    status: "served", 
                    updated_at: new Date().toISOString(),
                    completed_at: new Date().toISOString()
                  })
                  .eq("id", drink.kitchen_task_id);
                if (error) handleError(error);

                // Only update parent order_item status if all siblings are 'served'
                if (await shouldSyncOrderItemStatus(drink.order_item_id, "served")) {
                  await supabase
                    .from("order_items")
                    .update({ status: "served", updated_at: new Date().toISOString() })
                    .eq("id", drink.order_item_id);
                }
                
                // Update Stock (Task 4.1)
                if (drink.menu_item_id) {
                  await supabase.rpc('decrement_stock', { item_id: drink.menu_item_id, amount: 1 });
                }

                get().handleFetchOrderItems({ silent: true });
              } catch (error) {
                console.error("Error updating task status:", error);
              }
            }
          });
        }
      },

      resetBarState: () => {
        const channel = get().orderItemsChannel;
        if (channel) {
          supabase.removeChannel(channel);
        }
        set({
          loadingItems: false,
          items: [],
          barOptionSelected: "dine_in",
          orderItemsLoading: false,
          orderItems: [],
          pendingOrders: [],
          preparingOrders: [],
          readyOrders: [],
          servedOrders: [],
          categories: [],
          selectedCategory: "all",
          searchQuery: "",
          tabs: [],
          activeTab: 0,
          orderItemsChannel: null,
          dailyDrinkTasks: [],
          loadingDailyTasks: false,
          dailyOTCDrinks: [],
          loadingDailyOTCDrinks: false,
          activeStep: 0,
          cash: "",
          card: "",
          isProcessingPayment: false,
        });
      },

      updateQuantity: async (id, delta) => {
        const { tabs, activeTab } = get();
        const tab = tabs.find(t => String(t.id) === String(activeTab));
        if (!tab || !tab.db_order_id) return;

        // 1. Update Local
        set((state) => {
          const activeTabId = state.activeTab;
          const newTabs = state.tabs.map((t) => {
            if (String(t.id) === String(activeTabId)) {
                const activeCart = [...t.cart];
                const itemIndex = activeCart.findIndex((i: any) => i.id === id);
                if (itemIndex > -1) {
                    const newQty = activeCart[itemIndex].qty + delta;
                    if (newQty > 0) {
                        activeCart[itemIndex] = { ...activeCart[itemIndex], qty: newQty };
                    } else {
                        activeCart.splice(itemIndex, 1);
                    }
                }
                return { ...t, cart: activeCart };
            }
            return t;
          });

          return { tabs: newTabs };
        });

        // 2. Sync to DB
        try {
          const { tabs, activeTab } = get();
          const updatedTab = tabs.find(t => String(t.id) === String(activeTab));
          if (!updatedTab) return;
          const drinkInCart = updatedTab.cart.find((i: any) => i.id === id);

          if (drinkInCart) {
            await supabase
              .from("order_items")
              .upsert({
                order_id: tab.db_order_id,
                menu_item_id: id,
                quantity: drinkInCart.qty,
                sum_price: drinkInCart.price * drinkInCart.qty,
              }, { onConflict: "order_id,menu_item_id" });
          } else {
            // Item was removed
            await supabase
              .from("order_items")
              .delete()
              .eq("order_id", tab.db_order_id)
              .eq("menu_item_id", id);
          }

          await supabase
            .from("orders")
            .update({ total: get().getTotal() })
            .eq("id", tab.db_order_id);
        } catch (error) {
          console.error("Error updating quantity in DB:", error);
        }
      },

      handleVoidOTCOrder: async (orderId) => {
        const result = await Swal.fire({
          title: "Void this order?",
          text: "This will mark the order as voided. This cannot be undone.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          confirmButtonText: "Yes, void it",
          input: "password",
          inputLabel: "Manager PIN",
          inputPlaceholder: "Enter manager PIN to authorize",
        });

        if (result.isConfirmed) {
          const { error } = await supabase
            .from("orders")
            .update({ status: "voided", updated_at: new Date().toISOString() })
            .eq("id", orderId);

          if (error) {
            handleError(error);
            return;
          }

          Swal.fire("Voided!", "The order has been voided.", "success");
          set((state) => ({
            recentOTCOrders: state.recentOTCOrders.filter((o) => o.id !== orderId),
          }));
        }
      },

      handleRemoveTab: async (tabId) => {
        const { tabs, activeTab } = get();
        const tabToRemove = tabs.find(t => String(t.id) === String(tabId));
        
        if (!tabToRemove) return false;

        // If it has a database session/order, delete them (since items must be 0)
        if (tabToRemove.db_session_id || tabToRemove.db_order_id) {
          try {
            // Delete order first (child) then session
            if (tabToRemove.db_order_id) {
              await supabase.from("orders").delete().eq("id", tabToRemove.db_order_id);
            }
            if (tabToRemove.db_session_id) {
              await supabase.from("table_sessions").delete().eq("id", tabToRemove.db_session_id);
            }
          } catch (error) {
            console.error("Cleanup failed during tab removal:", error);
          }
        }

        const newTabs = tabs.filter((tab) => String(tab.id) !== String(tabId));
        let newActiveTab = activeTab;
        
        // If the removed tab was the active one, pick a new one
        if (String(activeTab) === String(tabId)) {
          newActiveTab = newTabs.length > 0 ? newTabs[0].id : 0;
        }

        set({
          tabs: newTabs,
          activeTab: newActiveTab
        });

        return true;
      },

      syncTabsWithDB: async () => {
        const { tabs, activeTab } = get();
        const tabsWithDB = tabs.filter(t => t.db_session_id);
        if (tabsWithDB.length === 0) return;

        const sessionIds = tabsWithDB.map(t => t.db_session_id);
        
        try {
          const { data: activeSessions, error } = await supabase
            .from("table_sessions")
            .select("id, status")
            .in("id", sessionIds);

          if (error) throw error;

          const activeSessionIds = new Set(
            (activeSessions || [])
              .filter(s => s.status === "open")
              .map(s => s.id)
          );

          const newTabs = tabs.filter(t => !t.db_session_id || activeSessionIds.has(t.db_session_id));
          
          if (newTabs.length !== tabs.length) {
            console.log("🔄 Syncing local tabs with DB status (removing closed/stale tabs)");
            let newActiveTab = activeTab;
            if (!newTabs.some(t => String(t.id) === String(activeTab))) {
              newActiveTab = newTabs.length > 0 ? newTabs[0].id : 0;
            }
            set({ tabs: newTabs, activeTab: newActiveTab });
          }
        } catch (error) {
          console.error("Error syncing tabs with DB:", error);
        }
      },
    }),
    {
      name: "bar-storage",
      partialize: (state) => ({
        tabs: state.tabs,
        activeTab: state.activeTab,
        barOptionSelected: state.barOptionSelected,
        selectedCategory: state.selectedCategory,
        searchQuery: state.searchQuery,
        activeStep: state.activeStep,
        cash: state.cash,
        card: state.card,
      }),
    }
  )
);

export default useBarStore;
