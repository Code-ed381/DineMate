import { create } from 'zustand';
import { supabase } from './supabase';
import { handleError } from '../components/Error';
import useMenuStore from './menuStore';
import useRestaurantStore from './restaurantStore';
import useAuthStore from './authStore';

const useTablesStore = create((set, get) => ({
  open: false,
  tables: [],
  loadingTables: false,
  tablesLoaded: false,
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },
  chosenTableSession: [],
  chosenTableOrderItems: [],
  loadingActiveSessionByTableNumber: false,
  activeSeesionByTableNumberLoaded: false,

  // Close modals
  handleClose: () => {
    set({ open: false });
  },

  // Set snackbar
  setSnackbar: (snackbar) => {
    set({ snackbar });
  },

  // Fetch tables  with session and table overview
  getTablesOverview: async () => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    set({ loadingTables: true });

    try {
      const { data, error } = await supabase
        .from("waiter_tables_overview")
        .select("*")
        .eq("restaurant_id", selectedRestaurant.restaurants.id)
        .or(
          `effective_status.eq.available,waiter_id.eq.${
            useAuthStore.getState().user.user.id
          }`
        )
        .order("table_number", { ascending: true });

      if (error) throw error;

      set({ tables: data || [], tablesLoaded: true });
    } catch (error) {
      handleError(error);
    } finally {
      set({ loadingTables: false });
    }
  },

  // Change table status and handle actions
  handleStatusChange: async (table, status) => {
    if (status === "reserve table") {
      const { error: tablesError } = await supabase
        .from("restaurant_tables")
        .update({ status: "reserved" })
        .eq("id", table.table_id)
        .eq(
          "restaurant_id",
          useRestaurantStore.getState().selectedRestaurant.restaurants.id
        )
        .select();

      if (tablesError) throw tablesError;

      get().getTablesOverview();
      set({ openAvailable: false });

      return { message: "reserved" };
    }
    if (status === "cancel reservation") {
      const { error: tablesError } = await supabase
        .from("restaurant_tables")
        .update({ status: "available" })
        .eq("id", table.table_id)
        .eq(
          "restaurant_id",
          useRestaurantStore.getState().selectedRestaurant.restaurants.id
        )
        .select();

      if (tablesError) throw tablesError;

      get().getTablesOverview();
      set({ openAvailable: false });

      return { message: "cancelled" };
    }
    if (status === "start ordering") {
      const { data: session, error: sessionError } = await supabase
        .from("table_sessions")
        .insert([
          {
            table_id: table.table_id,
            restaurant_id:
              useRestaurantStore.getState().selectedRestaurant.restaurants.id,
            waiter_id: useAuthStore.getState().user.user.id,
            opened_at: new Date(),
            status: "open",
          },
        ])
        .select();

      if (sessionError) throw sessionError;

      console.log(session);

      const { error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            restaurant_id:
              useRestaurantStore.getState().selectedRestaurant.restaurants.id,
            total: 0,
            session_id: session[0].id,
            status: "pending",
          },
        ])
        .select();

      if (orderError) throw orderError;

      const { error: tablesError } = await supabase
        .from("restaurant_tables")
        .update({ status: "occupied" })
        .eq("id", table.table_id)
        .eq(
          "restaurant_id",
          useRestaurantStore.getState().selectedRestaurant.restaurants.id
        )
        .select();

      if (tablesError) throw tablesError;

      useMenuStore.getState().setChosenTable(table);

      get().getTablesOverview();

      return { message: "ordering" };
    }
    if (status === "view order") {
      get().filterActiveSessionByTableNumber(table.table_number);

      set({ open: true });

      return { message: "viewing" };
    }
  },

  // filter active session by table number
  filterActiveSessionByTableNumber: async (tableNumber) => {
    set({
      loadingActiveSessionByTableNumber: true,
    });
    try {
      let { data: waiter_orders_overview, error } = await supabase
        .from("waiter_orders_overview")
        .select(`*`)
        .eq("table_number", tableNumber)
        .maybeSingle();

      if (error) throw error;

      console.log(waiter_orders_overview);

      set({
        chosenTableSession: waiter_orders_overview,
        chosenTableOrderItems: waiter_orders_overview?.order_items,
        activeSessionByTableNumberLoaded: true,
      });
    } catch (error) {
      handleError(error);
    } finally {
      set({
        loadingActiveSessionByTableNumber: false,
      });
    }
  },

  // Function to delete an order item
  handleRemoveItem: async (itemId) => {
    try {
      const { chosenTableOrderItems } = get();

      // Step 1: Remove item from selectedTableOrders state
      const updatedOrders = chosenTableOrderItems.filter(
        (order) => order.id !== itemId?.id
      );
      const totalQuantity = updatedOrders.reduce(
        (acc, cur) => acc + cur.quantity,
        0
      );
      const total = updatedOrders.reduce((acc, cur) => acc + cur.total, 0);

      set({
        chosenTableOrderItems: updatedOrders,
        // totalOrdersQty: totalQuantity,
        // totalOrdersPrice: total.toFixed(2),
      });

      // Step 3: Update Supabase
      const { error: ordersItemsError } = await supabase
        .from("ordersItems")
        .delete()
        .eq("id", itemId?.id); // Delete the specific item by ID

      if (ordersItemsError) {
        handleError(ordersItemsError);
      }


      const { error: ordersError } = await supabase
        .from("orders")
        .update({ total: total })
        .eq("id", itemId?.order_id)
        .select();
      
      if (ordersError) {
        handleError(ordersError);
      }
          
    } catch (error) {
      handleError(error);
    }
  },
}));

export default useTablesStore;
