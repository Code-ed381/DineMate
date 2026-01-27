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
  waiter_first_name?: string;
  waiter_last_name?: string;
  waiter_avatar?: string;
  menu_item_preparation_time?: number; // Added to support SLA
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
    const restaurantId = selectedRestaurant?.id;

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
    const restaurantId = selectedRestaurant?.id;

    try {
      const { data, error } = await supabase
        .from("kitchen_tasks_full")
        .select("*")
        .ilike("item_type", "food")
        .eq("menu_item_restaurant_id", restaurantId);

      if (error) handleError(error);

      const tasks = (data as KitchenTask[]) || [];
      
      // 1. Identify tasks with missing waiter_id
      const tasksMissingWaiter = tasks.filter(t => !t.waiter_id && t.order_id);
      const missingOrderIds = Array.from(new Set(tasksMissingWaiter.map(t => t.order_id)));
      
      let resolvedWaitersByOrder: Record<string, string> = {};

      // 2. Resolve missing waiters via Orders -> Sessions -> Waiter
      if (missingOrderIds.length > 0) {
          const { data: orders } = await supabase
            .from("orders")
            .select("id, session_id")
            .in("id", missingOrderIds);
            
          const sessionIds = Array.from(new Set((orders || []).map((o: any) => o.session_id).filter(Boolean)));
          
          if (sessionIds.length > 0) {
              const { data: sessions } = await supabase
                .from("table_sessions")
                .select("id, waiter_id")
                .in("id", sessionIds);
                
              const sessionWaiterMap: Record<string, string> = {};
              sessions?.forEach((s: any) => {
                  if (s.waiter_id) sessionWaiterMap[s.id] = s.waiter_id;
              });
              
              orders?.forEach((o: any) => {
                  if (sessionWaiterMap[o.session_id]) {
                      resolvedWaitersByOrder[o.id] = sessionWaiterMap[o.session_id];
                  }
              });
          }
      }

      // 3. Collect ALL waiter IDs (existing + newly resolved)
      const allWaiterIds = new Set<string>();
      tasks.forEach(t => {
          if (t.waiter_id) allWaiterIds.add(t.waiter_id);
          else if (resolvedWaitersByOrder[t.order_id]) allWaiterIds.add(resolvedWaitersByOrder[t.order_id]);
      });
      
      const uniqueWaiterIds = Array.from(allWaiterIds);
      
      // 4. Fetch User Details
      let waiterMap: Record<string, any> = {};
      
      if (uniqueWaiterIds.length > 0) {
        const { data: waiters } = await supabase
          .from("users")
          .select("user_id, first_name, last_name, avatar_url") 
          .in("user_id", uniqueWaiterIds);
          
        if (waiters) {
          waiters.forEach((w: any) => {
             waiterMap[w.user_id] = {
               first_name: w.first_name,
               last_name: w.last_name,
               avatar: w.avatar_url 
             };
          });
        }
      }

      // 5. Map attributes to tasks
      const correctedTasks = tasks.map(task => {
        const finalWaiterId = task.waiter_id || resolvedWaitersByOrder[task.order_id];
        const waiter = waiterMap[finalWaiterId] || {};
        
        return { 
          ...task, 
          quantity: 1,
          waiter_id: finalWaiterId || task.waiter_id, // Update the ID if we resolved it
          waiter_first_name: waiter.first_name || (finalWaiterId ? "Unknown Name" : "Unknown"),
          waiter_last_name: waiter.last_name || "",
          waiter_avatar: waiter.avatar
        };
      });

      set({ itemsLoading: false, orderItems: correctedTasks });
    } catch (error) {
      console.error("Error fetching order items:", error);
      set({ itemsLoading: false });
    }
  },

  handleFetchPendingMeals: async () => {
    set({ loadingPending: true });
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.id;

    try {
      const { data, error } = await supabase
        .from("kitchen_tasks_full")
        .select("*")
        .or(`order_item_status.eq.pending,order_item_status.eq.preparing`)
        .eq("menu_item_restaurant_id", restaurantId)
        .order("task_created_at", { ascending: true });

      if (error) throw error;

      const tasks = (data as KitchenTask[]) || [];
      const correctedTasks = tasks.map(task => ({ ...task, quantity: 1 }));
      set({ pendingMeals: correctedTasks, loadingPending: false });
    } catch (error) {
      console.error("Error fetching pending and preparing tasks:", error);
      set({ loadingPending: false });
    }
  },

  handleFetchPreparingMeals: async () => {
    set({ loadingPreparing: true });
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.id;

    try {
      const { data, error } = await supabase
        .from("kitchen_tasks_full")
        .select("*")
        .eq("order_item_status", "preparing")
        .eq("menu_item_restaurant_id", restaurantId)
        .order("task_created_at", { ascending: true });

      if (error) throw error;

      const tasks = (data as KitchenTask[]) || [];
      const correctedTasks = tasks.map(task => ({ ...task, quantity: 1 }));
      set({ preparingMeals: correctedTasks, loadingPreparing: false });
    } catch (error) {
      console.error("Error fetching preparing tasks:", error);
      set({ loadingPreparing: false });
    }
  },

  handleFetchReadyMeals: async () => {
    set({ loadingReady: true });
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.id;

    try {
      const { data, error } = await supabase
        .from("kitchen_tasks_full")
        .select("*")
        .eq("order_item_status", "ready")
        .eq("menu_item_restaurant_id", restaurantId)
        .order("task_created_at", { ascending: true });

      if (error) throw error;

      const tasks = (data as KitchenTask[]) || [];
      const correctedTasks = tasks.map(task => ({ ...task, quantity: 1 }));
      set({ readyMeals: correctedTasks, loadingReady: false });
    } catch (error) {
      console.error("Error fetching ready tasks:", error);
      set({ loadingReady: false });
    }
  },

  handleFetchServedMeals: async () => {
    const fromTime = dayjs().subtract(24, "hour").toISOString();
    set({ loadingServed: true });
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.id;

    try {
      const { data, error } = await supabase
        .from("kitchen_tasks_full")
        .select("*")
        .eq("order_item_status", "served")
        .eq("menu_item_restaurant_id", restaurantId)
        .gte("task_created_at", fromTime)
        .order("task_created_at", { ascending: true });

      if (error) throw error;

      const tasks = (data as KitchenTask[]) || [];
      const correctedTasks = tasks.map(task => ({ ...task, quantity: 1 }));
      set({ servedMeals: correctedTasks, loadingServed: false });
    } catch (error) {
      console.error("Error fetching served tasks:", error);
      set({ loadingServed: false });
    }
  },

  handleUpdateOrderItemStatus: async (task) => {
    const { user } = useAuthStore.getState();
    const userId = user?.id;
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
              .from("kitchen_tasks")
              .update({
                status: "preparing",
                updated_at: new_date,
                prepared_by: userId,
              })
              .eq("id", task.kitchen_task_id);
            if (error) handleError(error);

            // Also update the order_item status so waiters can't modify it
            await supabase
              .from("order_items")
              .update({
                status: "preparing",
                updated_at: new_date,
                prepared_by: userId,
              })
              .eq("id", task.order_item_id);

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
        handleError(error as Error);
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
              .from("kitchen_tasks")
              .update({
                status: "ready",
                updated_at: new Date(),
              })
              .eq("id", task.kitchen_task_id);

            if (error) handleError(error as Error);

            // Send notification to the waiter
            const { selectedRestaurant } = useRestaurantStore.getState();
            const { user } = useAuthStore.getState();
            
            console.log('👨‍🍳 Kitchen Task Ready. Preparing to notify waiter...', {
                taskId: task.kitchen_task_id,
                waiterId: task.waiter_id,
                restaurantId: selectedRestaurant?.id
            });

            import("../services/notificationService").then(async ({ notificationService }) => {
                 let targetWaiterId = task.waiter_id;

                 // Fallback: Fetch waiter_id via orders -> table_sessions if missing
                 if (!targetWaiterId) {
                     console.log('🔍 Waiter ID missing in task. Starting 2-step lookup...', task.order_id);
                     
                     // Step 1: Get session_id from order
                     const { data: orderData, error: orderError } = await supabase
                         .from("orders")
                         .select("session_id")
                         .eq("id", task.order_id)
                         .maybeSingle();
                     
                     if (orderData?.session_id) {
                         // Step 2: Get waiter_id from session
                         const { data: sessionData, error: sessionError } = await supabase
                             .from("table_sessions")
                             .select("waiter_id")
                             .eq("id", orderData.session_id)
                             .maybeSingle();

                         if (sessionData && !sessionError) {
                             targetWaiterId = sessionData.waiter_id;
                             console.log('✅ Fetched waiter ID from session:', targetWaiterId);
                         } else {
                             console.error('❌ Failed to fetch session:', sessionError);
                         }
                     } else {
                         console.error('❌ Failed to fetch order session:', orderError);
                     }
                 }

                 if (targetWaiterId && selectedRestaurant?.id) {
                     console.log(`🚀 Sending notification to waiter: ${targetWaiterId}`);
                     const result = await notificationService.sendUserNotification(selectedRestaurant.id, user?.id || "", {
                         title: "Order Ready",
                         message: `Table ${task.table_number}: ${task.menu_item_name} (x${task.quantity}) is Ready`,
                         priority: "high",
                         userIds: [targetWaiterId]
                     });
                     console.log('✅ Notification Service Result:', result);
                 } else {
                     console.warn('⚠️ Cannot send notification: Missing waiter_id or restaurant_id', {
                        waiterId: targetWaiterId,
                        restaurantId: selectedRestaurant?.id
                     });
                 }
            });

            get().handleFetchPendingMeals();
            get().handleFetchReadyMeals();
          }
        });
      } catch (error) {
        console.error("Error updating task:", error);
        handleError(error as Error);
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
              .from("kitchen_tasks")
              .update({
                status: "served",
                updated_at: new Date(),
                completed_at: new Date(),
              })
              .eq("id", task.kitchen_task_id);
            if (error) handleError(error as Error);
            get().handleFetchReadyMeals();
            get().handleFetchServedMeals();
          }
        });
      } catch (error) {
        console.error("Error updating task:", error);
        handleError(error as Error);
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
