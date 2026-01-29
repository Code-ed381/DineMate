import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import { handleError } from "../components/Error";
import Swal from "sweetalert2";
import useRestaurantStore from "./restaurantStore";
import useAuthStore from "./authStore";
import { RealtimeChannel } from "@supabase/supabase-js";

interface BarTask {
  kitchen_task_id: string; // Changed from task_id
  menu_item_name: string;
  task_number: number;
  quantity: number; // Changed from order_item_quantity
  order_item_status: string; // Changed from task_status
  order_item_id: string;
  order_id: string;
  table_number: string;
  waiter_id: string;
  waiter_first_name?: string;
  waiter_last_name?: string;
  waiter_avatar?: string;
  menu_item_preparation_time?: number;
  task_created_at: string;
  updated_at?: string;
  completed_at?: string;
  menu_item_image_url?: string;
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
}

interface Category {
  id: string;
  name: string;
}

interface BarState {
  loadingItems: boolean;
  items: any[];
  barOptionSelected: string;
  orderItemsLoading: boolean;
  orderItems: BarTask[];
  pendingOrders: BarTask[];
  readyOrders: BarTask[];
  servedOrders: BarTask[];
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  tabs: Tab[];
  activeTab: number;
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
  setItems: (value: any[]) => void;
  setBarOptionSelected: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setActiveTab: (index: number) => void;
  subscribeToOrderItems: () => void;
  unsubscribeFromOrderItems: () => void;
  setTabs: (updater: any) => void;
  getActiveCart: () => CartItem[];
  getTotal: () => number;
  addNewTab: () => void;
  addToCart: (drink: any) => void;
  removeFromCart: (id: string) => void;
  handleFetchItems: () => Promise<void>;
  handleFetchOrderItems: (options?: { silent?: boolean }) => Promise<void>;
  handleFetchPendingOrders: () => Promise<void>;
  handleFetchReadyOrders: () => Promise<void>;
  handleFetchServedOrders: () => Promise<void>;
  handleFetchDailyDrinkTasks: (options?: { silent?: boolean }) => Promise<void>;
  handleFetchDailyOTCDrinks: (options?: { silent?: boolean }) => Promise<void>;
  handleUpdateOrderItemStatus: (drink: BarTask) => Promise<void>;
  setActiveStep: (step: number) => void;
  setCash: (value: string) => void;
  setCard: (value: string) => void;
  formatCashInput: (amount: string | number) => string;
  completeOTCPayment: () => Promise<boolean>;
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

      setIsLoadingItems: (value) => set({ loadingItems: value }),
      setItems: (value) => set({ items: value }),
      setBarOptionSelected: (value) => set({ barOptionSelected: value }),
      setSelectedCategory: (value) => set({ selectedCategory: value }),
      setSearchQuery: (value) => set({ searchQuery: value }),
      setActiveTab: (index) => set({ activeTab: index }),
      setActiveStep: (step) => set({ activeStep: step }),
      setCash: (value) => set({ cash: value }),
      setCard: (value) => set({ card: value }),

      formatCashInput: (amount) => {
        const numericValue = String(amount).replace(/[^0-9.]/g, "");
        if (numericValue === "") return "";
        const formattedValue = parseFloat(numericValue).toFixed(2);
        return formattedValue;
      },

      completeOTCPayment: async () => {
        const { tabs, activeTab, cash, card, getTotal } = get();
        const activeTabObj = tabs[activeTab];
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
          // 1. Create a "walk-in" session if no table exists
          // For now, we'll try to insert without table_id if allowed, or we might need a dummy table
          const { data: session, error: sessionError } = await supabase
            .from("table_sessions")
            .insert({
              restaurant_id: restaurantId,
              waiter_id: userId,
              status: "close",
              closed_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (sessionError) throw sessionError;

          // 2. Create Order
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
              session_id: session.id,
              restaurant_id: restaurantId,
              total: total,
              status: "served",
            })
            .select()
            .single();

          if (orderError) throw orderError;

          // 3. Create Order Items
          const orderItemsData = activeTabObj.cart.map((item) => ({
            order_id: order.id,
            menu_item_id: item.id,
            quantity: item.qty,
            unit_price: item.price,
            sum_price: item.price * item.qty,
            status: "served",
            type: "drink",
            prepared_by: userId,  
            completed_at: new Date().toISOString(), 
            
          }));

          const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItemsData);

          if (itemsError) throw itemsError;

          // 4. Success - Clear the tab and reset state
          Swal.fire({
            title: "Payment Successful",
            text: "Order has been processed and completed.",
            icon: "success",
          });

          set((state) => ({
            tabs: state.tabs.filter((_, idx) => idx !== activeTab),
            activeTab: 0,
            activeStep: 0,
            cash: "",
            card: "",
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
              get().handleFetchOrderItems({ silent: true }); // Refresh the main list
              get().handleFetchPendingOrders();
              get().handleFetchReadyOrders();
              get().handleFetchServedOrders();
              get().handleFetchDailyDrinkTasks({ silent: true });
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

      getActiveCart: () => {
        const { tabs, activeTab } = get();
        return tabs[activeTab]?.cart || [];
      },

      getTotal: () => {
        const cart = get().getActiveCart();
        return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      },

      addNewTab: () =>
        set((state) => ({
          tabs: [
            ...state.tabs,
            {
              id: state.tabs.length + 1,
              name: `Customer ${state.tabs.length + 1}`,
              cart: [],
            },
          ],
          activeTab: state.tabs.length,
        })),

      addToCart: (drink) =>
        set((state) => ({
          tabs: state.tabs.map((tab, idx) =>
            idx === state.activeTab
              ? {
                  ...tab,
                  cart: tab.cart.some((item) => item.id === drink.id)
                    ? tab.cart.map((item) =>
                        item.id === drink.id
                          ? { ...item, qty: item.qty + 1 }
                          : item
                      )
                    : [...tab.cart, { ...drink, qty: 1 }],
                }
              : tab
          ),
        })),

      removeFromCart: (id) =>
        set((state) => ({
          tabs: state.tabs.map((tab, idx) =>
            idx === state.activeTab
              ? { ...tab, cart: tab.cart.filter((item) => item.id !== id) }
              : tab
          ),
        })),

      handleFetchItems: async () => {
        set({ loadingItems: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;
        try {
          const { data, error } = await supabase
            .from("menu_items_with_category")
            .select("*")
            .eq("type", "drink")
            .eq("restaurant_id", restaurantId);

          if (error) handleError(error);

          const categories: Category[] = Array.from(
            new Map((data || []).map((item: any) => [item.category_id, item.category_name]))
          ).map(([id, name]) => ({ id: id as string, name: name as string }));

          set({ items: data || [], categories, loadingItems: false });
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
          const { data, error } = await supabase
            .from("kitchen_tasks_full")
            .select("*")
            .ilike("item_type", "drink")
            .eq("menu_item_restaurant_id", restaurantId)
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
            const { data: waiters } = await supabase.from("users").select("user_id, first_name, last_name, avatar_url").in("user_id", uniqueWaiterIds);
            waiters?.forEach((w: any) => {
               waiterMap[w.user_id] = { first_name: w.first_name, last_name: w.last_name, avatar: w.avatar_url };
            });
          }

          const correctedTasks = tasks.map(task => {
            const finalWaiterId = task.waiter_id || resolvedWaitersByOrder[task.order_id];
            const waiter = waiterMap[finalWaiterId] || {};
            return { 
              ...task, 
              waiter_id: finalWaiterId,
              waiter_first_name: waiter.first_name || (finalWaiterId ? "Unknown Name" : "Unknown"),
              waiter_last_name: waiter.last_name || "",
              waiter_avatar: waiter.avatar
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
            pendingOrders: tasksWithNumbers.filter(t => t.order_item_status?.toLowerCase() === 'pending' || t.order_item_status?.toLowerCase() === 'preparing'),
            readyOrders: tasksWithNumbers.filter(t => t.order_item_status?.toLowerCase() === 'ready'),
            servedOrders: tasksWithNumbers.filter(t => t.order_item_status?.toLowerCase() === 'served'),
            orderItemsLoading: false 
          });
        } catch (error) {
          console.error("Error fetching order items:", error);
          set({ orderItemsLoading: false });
        }
      },

      handleFetchPendingOrders: async () => {
        get().handleFetchOrderItems();
      },

      handleFetchReadyOrders: async () => {
        get().handleFetchOrderItems();
      },

      handleFetchServedOrders: async () => {
        get().handleFetchOrderItems();
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
          set({ dailyDrinkTasks: (data as BarTask[]) || [], loadingDailyTasks: false });
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
          
          // Fetch order items that are direct OTC (session has no table)
          const { data, error } = await supabase
            .from("order_items_full")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .eq("item_type", "drink")
            .is("table_id", null) 
            .gte("created_at", today.toISOString());

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
                get().handleFetchOrderItems({ silent: true });
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
                get().handleFetchOrderItems({ silent: true });
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
                  .update({ status: "served", updated_at: new Date().toISOString() })
                  .eq("id", drink.kitchen_task_id);
                if (error) handleError(error);
                get().handleFetchOrderItems({ silent: true });
              } catch (error) {
                console.error("Error updating task status:", error);
              }
            }
          });
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
