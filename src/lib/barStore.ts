import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import { handleError } from "../components/Error";
import Swal from "sweetalert2";
import useRestaurantStore from "./restaurantStore";
import useAuthStore from "./authStore";
import { RealtimeChannel } from "@supabase/supabase-js";

interface BarTask {
  task_id: string;
  menu_item_name: string;
  task_number: number;
  order_item_quantity: number;
  task_status: string;
  order_item_id: string;
  order_id: string;
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
  pendingOrdersLoading: boolean;
  readyOrders: BarTask[];
  readyOrdersLoading: boolean;
  servedOrders: BarTask[];
  servedOrdersLoading: boolean;
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  tabs: Tab[];
  activeTab: number;
  orderItemsChannel: RealtimeChannel | null;

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
  handleFetchOrderItems: () => Promise<void>;
  handleFetchPendingOrders: () => Promise<void>;
  handleFetchReadyOrders: () => Promise<void>;
  handleFetchServedOrders: () => Promise<void>;
  handleUpdateOrderItemStatus: (drink: BarTask) => Promise<void>;
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
      pendingOrdersLoading: false,
      readyOrders: [],
      readyOrdersLoading: false,
      servedOrders: [],
      servedOrdersLoading: false,
      categories: [],
      selectedCategory: "all",
      searchQuery: "",
      tabs: [],
      activeTab: 0,
      orderItemsChannel: null,

      setIsLoadingItems: (value) => set({ loadingItems: value }),
      setItems: (value) => set({ items: value }),
      setBarOptionSelected: (value) => set({ barOptionSelected: value }),
      setSelectedCategory: (value) => set({ selectedCategory: value }),
      setSearchQuery: (value) => set({ searchQuery: value }),
      setActiveTab: (index) => set({ activeTab: index }),

      subscribeToOrderItems: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;

        if (!restaurantId) return;

        const oldChannel = get().orderItemsChannel;
        if (oldChannel) supabase.removeChannel(oldChannel);

        const channel = supabase
          .channel(`bar-tasks-${restaurantId}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "kitchen_tasks" },
            () => {
              get().handleFetchPendingOrders();
              get().handleFetchReadyOrders();
              get().handleFetchServedOrders();
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
        const restaurantId = selectedRestaurant?.restaurants?.id;
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

      handleFetchOrderItems: async () => {
        set({ orderItemsLoading: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;
        try {
          const { data, error } = await supabase
            .from("kitchen_tasks_full")
            .select("*")
            .eq("item_type", "drink")
            .eq("restaurant_id", restaurantId)
            .order("task_created_at", { ascending: false });

          if (error) handleError(error);
          set({ orderItems: (data as BarTask[]) || [], orderItemsLoading: false });
        } catch (error) {
          console.error("Error fetching order items:", error);
          set({ orderItemsLoading: false });
        }
      },

      handleFetchPendingOrders: async () => {
        set({ pendingOrdersLoading: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;
        try {
          const { data, error } = await supabase
            .from("kitchen_tasks_full")
            .select("*")
            .eq("item_type", "drink")
            .eq("task_status", "pending")
            .eq("restaurant_id", restaurantId)
            .order("task_created_at", { ascending: false });

          if (error) handleError(error);
          set({ pendingOrders: (data as BarTask[]) || [], pendingOrdersLoading: false });
        } catch (error) {
          console.error("Error fetching pending orders:", error);
          set({ pendingOrdersLoading: false });
        }
      },

      handleFetchReadyOrders: async () => {
        set({ readyOrdersLoading: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;
        try {
          const { data, error } = await supabase
            .from("kitchen_tasks_full")
            .select("*")
            .eq("task_status", "ready")
            .eq("item_type", "drink")
            .eq("restaurant_id", restaurantId)
            .order("task_created_at", { ascending: false });

          if (error) handleError(error);
          set({ readyOrders: (data as BarTask[]) || [], readyOrdersLoading: false });
        } catch (error) {
          console.error("Error fetching ready orders:", error);
          set({ readyOrdersLoading: false });
        }
      },

      handleFetchServedOrders: async () => {
        set({ servedOrdersLoading: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;
        try {
          const { data, error } = await supabase
            .from("kitchen_tasks_full")
            .select("*")
            .eq("task_status", "served")
            .eq("item_type", "drink")
            .eq("restaurant_id", restaurantId)
            .order("task_created_at", { ascending: false });

          if (error) handleError(error);
          set({ servedOrders: (data as BarTask[]) || [], servedOrdersLoading: false });
        } catch (error) {
          console.error("Error fetching served orders:", error);
          set({ servedOrdersLoading: false });
        }
      },

      handleUpdateOrderItemStatus: async (drink) => {
        const { user } = useAuthStore.getState();
        const userId = user?.user?.id;

        if (drink.task_status === "pending") {
          try {
            Swal.fire({
              title: `Start preparing "${drink.menu_item_name}"?`,
              html: `Task ${drink.task_number} of ${drink.order_item_quantity}<br/>Automatically marking as preparing in <b>5</b>s...`,
              icon: "warning",
              timer: 5000,
              timerProgressBar: true,
            }).then(async (result) => {
              if (result.dismiss === Swal.DismissReason.timer || result.isConfirmed) {
                const { error } = await supabase
                  .from("kitchen_tasks")
                  .update({
                    status: "preparing",
                    updated_at: new Date(),
                    prepared_by: userId,
                  })
                  .eq("id", drink.task_id);
                if (error) handleError(error);
                get().handleFetchPendingOrders();
              }
            });
          } catch (error) {
            console.error("Error updating task status:", error);
          }
        } else if (drink.task_status === "preparing") {
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
                    updated_at: new Date(),
                    completed_at: new Date(),
                  })
                  .eq("id", drink.task_id);
                if (error) handleError(error);
                get().handleFetchPendingOrders();
                get().handleFetchReadyOrders();
              }
            });
          } catch (error) {
            console.error("Error updating task status:", error);
          }
        } else if (drink.task_status === "ready") {
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
                  .update({ status: "served", updated_at: new Date() })
                  .eq("id", drink.task_id);
                if (error) handleError(error);
                get().handleFetchReadyOrders();
                get().handleFetchServedOrders();
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
      }),
    }
  )
);

export default useBarStore;
