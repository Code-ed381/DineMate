import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import { handleError } from '../components/Error';
import useMenuStore from './menuStore';
import useRestaurantStore from './restaurantStore';
import useAuthStore from './authStore';
import { createJSONStorage } from 'zustand/middleware';

const useTablesStore = create(
  persist(
    (set, get) => ({
      open: false,
      tables: [],
      table: {},
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
      tablesChannel: null,

      // Set table
      setTable: (table) => {
        set({ table });
      },

      // set open
      setOpen: (open) => {
        set({ open });
      },

      // ✅ Subscribe to table changes
      subscribeToTables: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;

        if (!restaurantId) return;

        const oldChannel = get().tablesChannel;
        if (oldChannel) {
          supabase.removeChannel(oldChannel);
        }

        const channel = supabase
          .channel(`tables-${restaurantId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "restaurant_tables",
              filter: `restaurant_id=eq.${restaurantId}`,
            },
            (payload) => {
              console.log("Table change:", payload);
              get().getTablesOverview();
            }
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "table_sessions",
              filter: `restaurant_id=eq.${restaurantId}`,
            },
            (payload) => {
              console.log("Table session change:", payload);
              get().getTablesOverview();
            }
          )
          .subscribe();

        set({ tablesChannel: channel });
      },

      unsubscribeFromTables: () => {
        const channel = get().tablesChannel;
        if (channel) {
          supabase.removeChannel(channel);
          set({ tablesChannel: null });
        }
      },

      // update table and delete order
      handleCloseTableBtn: async (tableSession) => {
        console.log("tableSession", tableSession);
        const {
          getActiveSessionByRestaurant,
          setTableSelected,
          setAssignedTables,
        } = useMenuStore.getState();

        const { selectedRestaurant } = useRestaurantStore.getState();
        // delete order
        const { error: ordersError } = await supabase
          .from("orders")
          .delete()
          .eq("session_id", tableSession?.session_id)
          .eq("restaurant_id", selectedRestaurant.restaurants.id)
          .select();

        if (ordersError) throw ordersError;

        // delete table session
        const { error: tableSessionError } = await supabase
          .from("table_sessions")
          .delete()
          .eq("id", tableSession.session_id)
          .eq("restaurant_id", selectedRestaurant.restaurants.id)
          .select();

        if (tableSessionError) throw tableSessionError;

        // update table status
        const { error: tablesError } = await supabase
          .from("restaurant_tables")
          .update({ status: "available" })
          .eq("id", tableSession.table_id)
          .eq("restaurant_id", selectedRestaurant.restaurants.id)
          .select();

        if (tablesError) throw tablesError;

        get().getTablesOverview();
        getActiveSessionByRestaurant();
        set({
          open: false,
          table: {},
          chosenTableSession: [],
          chosenTableOrderItems: [],
        });
        setTableSelected(false);
        setAssignedTables([]);
      },

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
        get().setTable(table);
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
                  useRestaurantStore.getState().selectedRestaurant.restaurants
                    .id,
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
                  useRestaurantStore.getState().selectedRestaurant.restaurants
                    .id,
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
          console.log("table", table);
          set({ open: true });

          return { message: "viewing" };
        }
      },

      // filter active session by table number
      filterActiveSessionByTableNumber: async (tableNumber) => {
        console.log("tableNumber", tableNumber);
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
    }),
    {
      name: "tables",
      partialize: (state) => ({
        table: state.table,
        tables: state.tables,
        open: state.open,
        snackbar: state.snackbar,
        chosenTableSession: state.chosenTableSession,
        chosenTableOrderItems: state.chosenTableOrderItems,
        loadingActiveSessionByTableNumber:
          state.loadingActiveSessionByTableNumber,
        activeSessionByTableNumberLoaded:
          state.activeSessionByTableNumberLoaded,
      }),
      version: 1,
    }
  )
);

export default useTablesStore;
