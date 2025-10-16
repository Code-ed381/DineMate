import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import { handleError } from "../components/Error";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import useRestaurantStore from "./restaurantStore";
import useAuthStore from "./authStore";

const useBarStore = create(
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
      completedOrders: [],
      categories: [],
      selectedCategory: "all",
      searchQuery: "",
      tabs: [],
      activeTab: 0,

      setIsLoadingItems: (value) => set({ loadingItems: value }),
      setItems: (value) => set({ items: value }),
      setBarOptionSelected: (value) => set({ barOptionSelected: value }),
      setSelectedCategory: (value) => set({ selectedCategory: value }),
      setSearchQuery: (value) => set({ searchQuery: value }),
      setActiveTab: (index) => set({ activeTab: index }),
      
      setTabs: (updater) => set((state) => ({tabs: typeof updater === "function" ? updater(state.tabs) : updater})),
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

          const categories = Array.from(
            new Map(data.map((item) => [item.category_id, item.category_name]))
          ).map(([id, name]) => ({ id, name }));

          console.log("Categories:", categories);

          set({ items: data, categories, loadingItems: false });
        } catch (error) {
          console.error("Error fetching order items:", error);
          set({ loadingItems: false });
        }
      },

      handleFetchOrderItems: async () => {
        set({ orderItemsLoading: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;

        const { user } = useAuthStore.getState();
        const userId = user?.user.id;

        try {
          const { data, error } = await supabase
            .from("order_items_full")
            .select("*")
            .eq("item_type", "drink")
            .eq("restaurant_id", restaurantId)
            .order("opened_at", { ascending: false });

          if (error) handleError(error);

          console.log("Order Items:", data);

          set({ orderItems: data, orderItemsLoading: false });
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
            .from("order_items_full")
            .select("*")
            .eq("item_type", "drink")
            .neq("item_status", "ready")
            .neq("item_status", "served")
            .neq("item_status", "cancelled")
            .eq("restaurant_id", restaurantId)
            .order("opened_at", { ascending: false });

          if (error) handleError(error);

          set({ pendingOrders: data, pendingOrdersLoading: false });
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
            .from("order_items_full")
            .select("*")
            .eq("item_status", "ready")
            .eq("item_type", "drink")
            .eq("restaurant_id", restaurantId)
            .order("opened_at", { ascending: false });

          if (error) handleError(error);

          set({ readyOrders: data, readyOrdersLoading: false });
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
            .from("order_items_full")
            .select("*")
            .eq("item_status", "served")
            .eq("item_type", "drink")
            .eq("restaurant_id", restaurantId)
            .order("opened_at", { ascending: false });

          if (error) handleError(error);

          set({ servedOrders: data, servedOrdersLoading: false });
        } catch (error) {
          console.error("Error fetching served orders:", error);
          set({ servedOrdersLoading: false });
        }
      },

      handleUpdateOrderItemStatus: async (drink) => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;

        const { user } = useAuthStore.getState();
        const userId = user?.user?.id;

        if (drink.item_status === "pending") {
          try {
            Swal.fire({
              title: `Start cooking "${drink.menu_item_name}"?`,
              html: "Automatically marking as preparing in <b>5</b>s...",
              icon: "warning",
              showCancelButton: false,
              showDenyButton: true,
              showConfirmButton: true,
              confirmButtonText: "Stop Cooking",
              denyButtonText: "Remove Item",
              confirmButtonColor: "#3085d6",
              denyButtonColor: "#d33",
              timer: 5000,
              timerProgressBar: true,
              didOpen: () => {
                const b = Swal.getHtmlContainer().querySelector("b");
                const timerInterval = setInterval(() => {
                  b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                }, 500);
                Swal.willClose = () => clearInterval(timerInterval);
              },
            }).then(async (result) => {
              if (result.dismiss === Swal.DismissReason.timer) {
                // ⏱ auto-update to preparing
                const { error } = await supabase
                  .from("order_items")
                  .update({
                    status: "preparing",
                    updated_at: new Date(),
                    prepared_by: userId,
                  })
                  .eq("id", drink.order_item_id);
                if (error) handleError(error);
                get().handleFetchPendingOrders();
              } else if (result.isConfirmed) {
                // 🙅 Undo → cancel immediately, stop auto-update
                Swal.close();
                Swal.fire({
                  icon: "info",
                  title: "Action cancelled",
                  text: `${drink.menu_item_name} is still pending.`,
                  timer: 1500,
                });
              } else if (result.isDenied) {
                // 🗑 Remove order item
                const { error } = await supabase
                  .from("order_items")
                  .delete()
                  .eq("id", drink?.order_item_id);
                if (error) handleError(error);
                Swal.fire({
                  title: "Deleted!",
                  text: `${drink?.menu_item_name} has been deleted.`,
                  icon: "success",
                });
                get().handleFetchPreparingOrders();
                get().handleFetchReadyOrders();
              }
            });
          } catch (error) {
            console.error("Error updating order item status:", error);
          }
        } else if (drink.item_status === "preparing") {
          try {
            Swal.fire({
              title: `Mark "${drink?.menu_item_name}" as ready?`,
              html: "Automatically marking as ready in <b>5</b>s...",
              icon: "warning",
              showCancelButton: true,
              showConfirmButton: false,
              cancelButtonColor: "#d33",
              timer: 5000,
              timerProgressBar: true,
              didOpen: () => {
                const b = Swal.getHtmlContainer().querySelector("b");
                const timerInterval = setInterval(() => {
                  b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                }, 500);
                Swal.willClose = () => clearInterval(timerInterval);
              },
            }).then(async (result) => {
              if (result.dismiss === Swal.DismissReason.timer) {
                // ⏱ auto-update to ready
                const { error } = await supabase
                  .from("order_items")
                  .update({ status: "ready", updated_at: new Date() })
                  .eq("id", drink.order_item_id);
                if (error) handleError(error);
                get().handleFetchPendingOrders();
                get().handleFetchReadyOrders();
              } else if (result.isConfirmed) {
                // 🙅 Cancel → stop countdown, keep preparing
                Swal.close();
                Swal.fire({
                  icon: "info",
                  title: "Action cancelled",
                  text: `${drink.menu_item_name} is still preparing.`,
                  timer: 1500,
                });
              }
            });
          } catch (error) {
            console.error("Error updating order item status:", error);
          }
        } else if (drink.item_status === "ready") {
          // Countdown Swal
          let timerInterval;
          Swal.fire({
            title: "Mark as Served?",
            html: "This drink will auto-update in <b></b> seconds.",
            icon: "info",
            timer: 5000, // 5 sec countdown
            timerProgressBar: true,
            showCancelButton: true,
            confirmButtonText: "Yes, Serve",
            cancelButtonText: "Cancel",
            didOpen: () => {
              const b = Swal.getHtmlContainer().querySelector("b");
              timerInterval = setInterval(() => {
                b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
              }, 100);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          }).then(async (result) => {
            // ✅ If confirmed OR auto-dismissed by timer
            if (
              result.isConfirmed ||
              result.dismiss === Swal.DismissReason.timer
            ) {
              try {
                const { error } = await supabase
                  .from("order_items")
                  .update({ status: "served", updated_at: new Date() })
                  .eq("id", drink.order_item_id);

                if (error) handleError(error);

                // 🔄 Re-fetch updated items
                get().handleFetchReadyOrders();
                get().handleFetchServedOrders();
              } catch (error) {
                console.error("Error updating order item status:", error);
              }
            }
          });
        }
      },

      // handleFetchItemCategories: async () => {
      //     const { selectedRestaurant } = useRestaurantStore.getState();
      //     const restaurantId = selectedRestaurant?.restaurants?.id;
      //     try {
      //         const { data, error } = await supabase
      //             .from("menu_categories")
      //             .select("id, name")
      //             .eq("restaurant_id", restaurantId)
      //             .eq("type", "drink");

      //         if (error) handleError(error);

      //         set({ categories: data });
      //     } catch (error) {
      //         console.error("Error fetching item categories:", error);
      //     }
      // },

      // handleFetchCategoryItems: async (category_id) => {
      //     try {
      //         const { data, error } = await supabase
      //             .from("menu_items")
      //             .select("id, name, price, image_url")
      //             .eq("category_id", category_id);

      //         if (error) handleError(error);

      //         set({ categoryItems: data });
      //     } catch (error) {
      //         console.error("Error fetching category items:", error);
      //     }
      // }
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
