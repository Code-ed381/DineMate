import { create } from 'zustand';
import { supabase } from './supabase';
import { handleError } from '../components/Error';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import useRestaurantStore from './restaurantStore';
import useAuthStore from './authStore';

// Create the kitchen store with zustand
const useKitchenStore = create((set, get) => ({
    loadingPending: false,
    loadingPreparing: false,
    loadingReady: false,
    loadingServed: false,
    itemsLoading: false,
    preparingMeals: [],
    pendingMeals: [],
    readyMeals: [],
    servedMeals: [],
    orderItems: [],

    setIsPreparing: (value) => set({ is_preparing: value }),
    setIsCompleted: (value) => set({ is_completed: value }),
    setIsServed: (value) => set({ is_served: value }),
    setIsCancelled: (value) => set({ is_cancelled: value }),
    setFetchMealsByUser: (value) => set({ fetchMealsByUser: value }),
    
    handleFetchOrderItems: async() => {
        set({ itemsLoading: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;
        const { user } = useAuthStore.getState();
        const userId = user?.user.id;
      
        try {
          const { data, error } = await supabase
            .from("order_items_full")
            .select("*")
            .eq("item_type", "food")
            .eq("restaurant_id", restaurantId)
            .eq("prepared_by_uuid", userId);
        
          if (error) handleError(error);

          console.log(data);

          set({ itemsLoading: false, orderItems: data });
        } catch (error) {
          console.error("Error fetching order items:", error);
          set({ itemsLoading: false });
        }
    },

    handleFetchPendingMeals: async() => {
        set({ loadingPending: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;
        try {
          const { data, error } = await supabase
            .from("order_items_full")
              .select("*")
              .eq("item_type", "food")
              .neq("item_status", "ready")
              .neq("item_status", "served")
              .neq("item_status", "cancelled")
              .eq("restaurant_id", restaurantId);

          if (error) handleError(error);

          set({ pendingMeals: data, loadingPending: false });
        } catch (error) {
            console.error("Error fetching pending order items:", error);
            set({ loadingPending: false });
        }
    },

    handleFetchPreparingMeals: async() => {
        set({ loadingPreparing: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;
        try {
            const { data, error } = await supabase
            .from('order_items_full')
            .select("*")
            .eq('item_type', 'food')
            .eq('item_status', 'preparing')
            .eq('restaurant_id', restaurantId)
            .order('item_created_at', { ascending: false });
            
            if (error) handleError(error);

            set({ preparingMeals: data, loadingPreparing: false });
        } catch (error) {
            console.error("Error fetching preparing order items:", error);
            set({ loadingPreparing: false });
        }
    },

    handleFetchReadyMeals: async() => {
        set({ loadingReady: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;
        try {
            const { data: orderItems, error } = await supabase
              .from("order_items_full")
              .select("*")
              .eq("item_type", "food")
              .eq("item_status", "ready")
              .eq(
                "restaurant_id",
                restaurantId
              )
              .order("item_created_at", { ascending: false });
            
            if (error) handleError(error);

            set({ readyMeals: orderItems, loadingReady: false });
        } catch (error) {
            console.error("Error fetching order items:", error);
            set({ loadingReady: false });
        }
    },

    handleFetchServedMeals: async() => {
        const fromTime = dayjs().subtract(24, 'hour').toISOString();

        set({ loadingServed: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;
        try {
            const { data: orderItems, error } = await supabase
              .from("order_items_full")
              .select("*")
              .eq("item_type", "food")
              .eq("item_status", "served")
              .eq("restaurant_id", restaurantId)
              .gte("item_created_at", fromTime) // Filter last 24 hours
              .order("item_created_at", { ascending: false });

            if (error) handleError(error);

            set({ servedMeals: orderItems, loadingServed: false });
        } catch (error) {
            console.error("Error fetching order items:", error);
            set({ loadingServed: false });
        }
    },

    handleUpdateOrderItemStatus: async (dish) => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;

        const { user } = useAuthStore.getState();
        const userId = user?.user?.id;

        console.log("userId", userId);
        if (dish.item_status === "pending") {
            try {
                Swal.fire({
                  title: `Start cooking "${dish.menu_item_name}"?`,
                  text: "Click on item when ready",
                  icon: "warning",
                  showCancelButton: true,
                  showDenyButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#ccc9c8",
                  denyButtonColor: "#d33",
                  confirmButtonText: "Yes, start cooking!",
                  denyButtonText: `Remove order item`,
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    // If the dish is pending, we can directly update it
                    const { error } = await supabase
                      .from("order_items")
                      .update({
                        status: "preparing",
                        updated_at: new Date(),
                        prepared_by: userId,
                      })
                      .eq("id", dish.order_item_id);

                    if (error) handleError(error);

                    Swal.fire({
                      icon: "success",
                      title: `${dish.menu_item_name} cooking started`,
                      text: "Click on item when ready",
                      timer: 1500,
                    });

                    // ✅ Re-fetch updated items after successful update
                    get().handleFetchPendingMeals();
                  }

                  if (result.isDenied) {
                    Swal.fire({
                      title: `Remove ${dish?.menu_item_name} from order #${dish?.order_id}?`,
                      text: "You won't be able to revert this!",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#3085d6",    
                      cancelButtonColor: "#d33",
                      confirmButtonText: "Yes",
                    }).then(async (deleteConfirm) => {
                      if (deleteConfirm.isConfirmed) {
                        const { error } = await supabase
                          .from("order_items")
                          .delete()
                          .eq("id", dish?.order_item_id);

                        if (error) handleError(error);

                        Swal.fire({
                          title: "Deleted!",
                          text: `${dish?.menu_item_name} has been deleted.`,
                          icon: "success",
                        });

                        // Re-fetch updated items
                        // get().handleFetchReadyMeals();
                        get().handleFetchPendingMeals();
                      }
                    });
                  }
                });


            } catch (error) {
                console.error("Error updating order item status:", error);
            }
        } else if (dish.item_status === "preparing") {
            try {
                Swal.fire({
                    title: `Mark "${dish?.menu_item_name}" as ready?`,
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes"
                }).then(async (result) => {
                if (result.isConfirmed) {
                    const { error } = await supabase
                    .from('order_items')
                    .update({ status: 'ready', updated_at: new Date() })
                    .eq('id', dish.order_item_id);
                    
                    if (error) handleError(error);

                    // ✅ Re-fetch updated items after successful update
                    get().handleFetchReadyMeals();
                    get().handleFetchPendingMeals();
                }
                });
            } catch (error) {
                console.error("Error updating order item status:", error);
            }
        } else if (dish.item_status === "ready") {
            try {
                // If the dish is pending, we can directly update it
                const { error } = await supabase
                  .from("order_items")
                  .update({ status: "served", updated_at: new Date() })
                  .eq("id", dish.order_item_id);

                if (error) handleError(error);

                // ✅ Re-fetch updated items after successful update
                get().handleFetchReadyMeals();
                get().handleFetchServedMeals();
            } catch (error) {
                console.error("Error updating order item status:", error);
            }
        }

    },

    // handleFetchOrderItems: async () => {
    //     let { data: order_items, error } = await supabase
    //     .from("order_items")
    //     .select("*")
    //     .eq("type", "food")
    //     .order("created_at", { ascending: false });

    //     if (error) handleError(error);

    //     set({ orderItems: order_items });
    // },

    resetKitchenState: () => set({
        is_preparing: false,
        is_completed: false,
        is_cooking: false,
        is_served: false,
        is_cancelled: false,
    }),
}));

export default useKitchenStore;