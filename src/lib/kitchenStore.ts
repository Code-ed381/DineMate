import { create } from "zustand";
import { supabase } from "./supabase";
import { handleError } from "../components/Error";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import useRestaurantStore from "./restaurantStore";
import useAuthStore from "./authStore";
import { RealtimeChannel } from "@supabase/supabase-js";

interface KitchenTask {
  kitchen_task_id: string;
  order_item_id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  order_item_status: string;
  task_created_at: string;
  table_number: string;
  waiter_id: string;
}

interface KitchenState {
  loadingPending: boolean;
  loadingPreparing: boolean;
  loadingReady: boolean;
  loadingServed: boolean;
  itemsLoading: boolean;
  preparingMeals: KitchenTask[];
  pendingMeals: KitchenTask[];
  readyMeals: KitchenTask[];
  servedMeals: KitchenTask[];
  orderItems: KitchenTask[];
  orderItemsChannel: RealtimeChannel | null;
  is_preparing: boolean;
  is_completed: boolean;
  is_served: boolean;
  is_cancelled: boolean;
  fetchMealsByUser: boolean;

  setIsPreparing: (value: boolean) => void;
  setIsCompleted: (value: boolean) => void;
  setIsServed: (value: boolean) => void;
  setIsCancelled: (value: boolean) => void;
  setFetchMealsByUser: (value: boolean) => void;
  subscribeToOrderItems: () => void;
  unsubscribeFromOrderItems: () => void;
  handleFetchOrderItems: () => Promise<void>;
  handleFetchPendingMeals: () => Promise<void>;
  handleFetchPreparingMeals: () => Promise<void>;
  handleFetchReadyMeals: () => Promise<void>;
  handleFetchServedMeals: () => Promise<void>;
  handleUpdateOrderItemStatus: (task: KitchenTask) => Promise<void>;
  resetKitchenState: () => void;
}

const useKitchenStore = create<KitchenState>((set, get) => ({
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
  orderItemsChannel: null,
  is_preparing: false,
  is_completed: false,
  is_served: false,
  is_cancelled: false,
  fetchMealsByUser: false,

  setIsPreparing: (value) => set({ is_preparing: value }),
  setIsCompleted: (value) => set({ is_completed: value }),
  setIsServed: (value) => set({ is_served: value }),
  setIsCancelled: (value) => set({ is_cancelled: value }),
  setFetchMealsByUser: (value) => set({ fetchMealsByUser: value }),

  subscribeToOrderItems: () => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;

    if (!restaurantId) {
      console.warn("No restaurant selected for subscription");
      return;
    }

    const oldChannel = get().orderItemsChannel;
    if (oldChannel) {
      supabase.removeChannel(oldChannel);
    }

    const channel = supabase
      .channel(`kitchen-tasks-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kitchen_tasks",
        },
        () => {
          get().handleFetchPendingMeals();
          get().handleFetchPreparingMeals();
          get().handleFetchReadyMeals();
          get().handleFetchServedMeals();
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

  handleFetchOrderItems: async () => {
    set({ itemsLoading: true });
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;

    try {
      const { data, error } = await supabase
        .from("kitchen_tasks_full")
        .select("*")
        .eq("item_type", "food")
        .eq("menu_item_restaurant_id", restaurantId);

      if (error) handleError(error);

      set({ itemsLoading: false, orderItems: (data as KitchenTask[]) || [] });
    } catch (error) {
      console.error("Error fetching order items:", error);
      set({ itemsLoading: false });
    }
  },

  handleFetchPendingMeals: async () => {
    set({ loadingPending: true });
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;

    try {
      const { data, error } = await supabase
        .from("kitchen_tasks_full")
        .select("*")
        .or(`order_item_status.eq.pending,order_item_status.eq.preparing`)
        .eq("menu_item_restaurant_id", restaurantId)
        .order("order_item_status", { ascending: true })
        .order("task_created_at", { ascending: false });

      if (error) throw error;

      set({ pendingMeals: (data as KitchenTask[]) || [], loadingPending: false });
    } catch (error) {
      console.error("Error fetching pending and preparing tasks:", error);
      set({ loadingPending: false });
    }
  },

  handleFetchPreparingMeals: async () => {
    set({ loadingPreparing: true });
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;

    try {
      const { data, error } = await supabase
        .from("kitchen_tasks_full")
        .select("*")
        .eq("order_item_status", "preparing")
        .eq("menu_item_restaurant_id", restaurantId)
        .order("task_created_at", { ascending: false });

      if (error) throw error;

      set({ preparingMeals: (data as KitchenTask[]) || [], loadingPreparing: false });
    } catch (error) {
      console.error("Error fetching preparing tasks:", error);
      set({ loadingPreparing: false });
    }
  },

  handleFetchReadyMeals: async () => {
    set({ loadingReady: true });
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;

    try {
      const { data, error } = await supabase
        .from("kitchen_tasks_full")
        .select("*")
        .eq("order_item_status", "ready")
        .eq("menu_item_restaurant_id", restaurantId)
        .order("task_created_at", { ascending: false });

      if (error) throw error;

      set({ readyMeals: (data as KitchenTask[]) || [], loadingReady: false });
    } catch (error) {
      console.error("Error fetching ready tasks:", error);
      set({ loadingReady: false });
    }
  },

  handleFetchServedMeals: async () => {
    const fromTime = dayjs().subtract(24, "hour").toISOString();
    set({ loadingServed: true });
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;

    try {
      const { data, error } = await supabase
        .from("kitchen_tasks_full")
        .select("*")
        .eq("order_item_status", "served")
        .eq("menu_item_restaurant_id", restaurantId)
        .gte("task_created_at", fromTime)
        .order("task_created_at", { ascending: false });

      if (error) throw error;

      set({ servedMeals: (data as KitchenTask[]) || [], loadingServed: false });
    } catch (error) {
      console.error("Error fetching served tasks:", error);
      set({ loadingServed: false });
    }
  },

  handleUpdateOrderItemStatus: async (task) => {
    const { user } = useAuthStore.getState();
    const userId = user?.user?.id;
    const new_date = dayjs().toISOString();

    if (task.order_item_status === "pending") {
      try {
        Swal.fire({
          title: `Start cooking "${task.menu_item_name}"?`,
          text: `Preparing 1 of ${task.quantity} items for table ${task.table_number} - Order: ${task.order_id}`,
          icon: "warning",
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#ccc9c8",
          denyButtonColor: "#d33",
          confirmButtonText: "Yes, start cooking!",
          denyButtonText: "Remove task",
          timer: 5000,
          timerProgressBar: true,
        }).then(async (result) => {
          if (result.dismiss === Swal.DismissReason.timer || result.isConfirmed) {
            const { error } = await supabase
              .from("order_items")
              .update({
                status: "preparing",
                updated_at: new_date,
                prepared_by: userId,
              })
              .eq("id", task.order_item_id)
              .eq("menu_item_id", task.menu_item_id);
            if (error) handleError(error);
            get().handleFetchPendingMeals();
          }

          if (result.isDenied) {
            Swal.fire({
              title: `Remove this task?`,
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
                  .eq("id", task.kitchen_task_id);

                if (error) throw error;

                Swal.fire({
                  title: "Deleted!",
                  text: "Task has been removed.",
                  icon: "success",
                });

                get().handleFetchPendingMeals();
              }
            });
          }
        });
      } catch (error) {
        console.error("Error updating task:", error);
        handleError(error);
      }
    } else if (task.order_item_status === "preparing") {
      try {
        Swal.fire({
          title: `Mark "${task.menu_item_name}" as ready?`,
          text: `Task 1 of ${task.quantity}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, it's ready!",
          timer: 5000,
          timerProgressBar: true,
        }).then(async (result) => {
          if (result.dismiss === Swal.DismissReason.timer || result.isConfirmed) {
            const { error } = await supabase
              .from("order_items")
              .update({
                status: "ready",
                updated_at: new Date(),
              })
              .eq("id", task.order_item_id)
              .eq("menu_item_id", task.menu_item_id);
            if (error) handleError(error);
            get().handleFetchPendingMeals();
            get().handleFetchReadyMeals();
          }
        });
      } catch (error) {
        console.error("Error updating task:", error);
        handleError(error);
      }
    } else if (task.order_item_status === "ready") {
      if (!task?.kitchen_task_id) {
        console.error("Invalid task data");
        return;
      }
      try {
        Swal.fire({
          title: `Serving "${task.menu_item_name}"`,
          text: `Task 1 of ${task.quantity}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, serve it!",
          timer: 5000,
          timerProgressBar: true,
        }).then(async (result) => {
          if (result.dismiss === Swal.DismissReason.timer || result.isConfirmed) {
            const { error } = await supabase
              .from("order_items")
              .update({
                status: "served",
                updated_at: new Date(),
                completed_at: new Date(),
              })
              .eq("id", task?.order_item_id)
              .eq("menu_item_id", task?.menu_item_id);
            if (error) handleError(error);
            get().handleFetchReadyMeals();
            get().handleFetchServedMeals();
          }
        });
      } catch (error) {
        console.error("Error updating task:", error);
        handleError(error);
      }
    }
  },

  resetKitchenState: () =>
    set({
      is_preparing: false,
      is_completed: false,
      is_served: false,
      is_cancelled: false,
    }),
}));

export default useKitchenStore;
