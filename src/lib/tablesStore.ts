import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import { handleError } from "../components/Error";
import useMenuStore from "./menuStore";
import useRestaurantStore from "./restaurantStore";
import useAuthStore from "./authStore";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface RestaurantTable {
  id: string;
  table_number: number;
  table_no?: string;
  status: 'available' | 'occupied' | 'reserved' | 'unavailable';
  restaurant_id: string;
  capacity?: number;
  assign?: string | null;
  x_position?: number;
  y_position?: number;
  rotation?: number;
  shape?: 'square' | 'circle';
}

export interface TableSession {
  id: string;
  session_id?: string;
  table_id: string;
  waiter_id: string;
  restaurant_id: string;
  status: string;
  opened_at: string;
  closed_at?: string;
  table_number?: string | number;
}

export interface TableState {
  open: boolean;
  tables: RestaurantTable[];
  table: any;
  loadingTables: boolean;
  tablesLoaded: boolean;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
    id: number;
    autoHideDuration?: number;
  };
  chosenTableSession: any[];
  chosenTableOrderItems: any[];
  loadingActiveSessionByTableNumber: boolean;
  activeSeesionByTableNumberLoaded: boolean;
  tablesChannel: RealtimeChannel | null;
  selectedTable: Partial<RestaurantTable> | null;
  selectedSession: any | null;
  sessions: any[];
  loadingSessions: boolean;
  sessionsLoaded: boolean;
  sessionsOverview: any[];
  loadingSessionsOverview: boolean;
  sessionsOverviewLoaded: boolean;
  serviceRequests: any[];
  loadingServiceRequests: boolean;

  setTable: (table: any) => void;
  setSelectedTable: (table: Partial<RestaurantTable>) => void;
  setSelectedSession: (session: any) => void;
  setOpen: (open: boolean) => void;
  getTables: () => Promise<void>;
  subscribeToTables: () => void;
  unsubscribeFromTables: () => void;
  handleCloseTableBtn: (tableSession: any) => Promise<void>;
  handleClose: () => void;
  setSnackbar: (snackbar: TableState['snackbar']) => void;
  handleStatusChange: (table: RestaurantTable) => Promise<{ message: string } | undefined>;
  cancelReservation: (table: RestaurantTable, action: 'cancelled' | 'closed') => Promise<void>;
  getSession: (table_id: string, waiter_id: string, restaurant_id: string) => Promise<any>;
  getSessions: () => Promise<void>;
  getSessionsOverview: () => Promise<void>;
  getSessionOverview: (table_id: string, waiter_id: string, restaurant_id: string) => Promise<any>;
  startSession: (table_id: string, waiter_id: string, restaurant_id: string) => Promise<void>;
  endSession: (table_id: string, waiter_id: string, restaurant_id: string) => Promise<void>;
  getServiceRequests: () => Promise<void>;
  resolveServiceRequest: (requestId: string) => Promise<void>;
  updateTablePosition: (tableId: string, x: number, y: number, rotation?: number) => Promise<void>;
  handleRemoveItem: (itemId: any) => Promise<void>;
  transferTable: (sessionId: string, sourceTableId: string, destTableId: string) => Promise<void>;
  getTablesOverview: () => void; // Internal helper
}

const useTablesStore = create<TableState>()(
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
        id: Date.now(),
      },
      chosenTableSession: [],
      chosenTableOrderItems: [],
      loadingActiveSessionByTableNumber: false,
      activeSeesionByTableNumberLoaded: false,
      tablesChannel: null,
      selectedTable: null,
      selectedSession: null,
      sessions: [],
      loadingSessions: false,
      sessionsLoaded: false,
      sessionsOverview: [],
      loadingSessionsOverview: false,
      sessionsOverviewLoaded: false,
      serviceRequests: [],
      loadingServiceRequests: false,

      setTable: (table) => {
        set({ table });
      },

      setSelectedTable: (table) => {
        set({ selectedTable: table });
      },

      setSelectedSession: (session) => {
        set({ selectedSession: session });
      },

      setOpen: (open) => {
        set({ open });
      },

      getTablesOverview: () => {
        get().getTables();
        get().getSessionsOverview();
        get().getServiceRequests();
      },

      getTables: async () => {
        set({ loadingTables: true, tablesLoaded: false });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;

        if (!restaurantId) {
          console.warn("getTables: No restaurantId found", selectedRestaurant);
          return;
        }

        try {
          const { data, error } = await supabase
            .from("restaurant_tables")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .order("table_number", { ascending: true });

          if (error) throw error;

          set({ tables: (data as RestaurantTable[]) || [], tablesLoaded: true });
        } catch (error) {
          handleError(error as Error);
        } finally {
          set({ loadingTables: false });
        }
      },

      subscribeToTables: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;

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
            () => {
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
            () => {
              get().getTablesOverview();
            }
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "service_requests",
              filter: `restaurant_id=eq.${restaurantId}`,
            },
            () => {
              get().getServiceRequests();
              set({ snackbar: { open: true, message: "New Service Request!", severity: "info", id: Date.now() }});
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

      handleCloseTableBtn: async (tableSession) => {
        const {
          getActiveSessionByRestaurant,
          setTableSelected,
          setAssignedTables,
        } = useMenuStore.getState();

        const { selectedRestaurant } = useRestaurantStore.getState() as any;
        
        const { error: ordersError } = await supabase
          .from("orders")
          .delete()
          .eq("session_id", tableSession?.session_id)
          .eq("restaurant_id", selectedRestaurant?.id);

        if (ordersError) throw ordersError;

        const { error: tableSessionError } = await supabase
          .from("table_sessions")
          .delete()
          .eq("id", tableSession.session_id)
          .eq("restaurant_id", selectedRestaurant?.id);

        if (tableSessionError) throw tableSessionError;

        const { error: tablesError } = await supabase
          .from("restaurant_tables")
          .update({ status: "available" })
          .eq("id", tableSession.table_id)
          .eq("restaurant_id", selectedRestaurant?.id);

        if (tablesError) throw tablesError;

        get().getTablesOverview();
        getActiveSessionByRestaurant();
        set({
          open: false,
          table: {},
          chosenTableSession: [],
          chosenTableOrderItems: [],
        });
        setTableSelected();
        setAssignedTables([]);
      },

      handleClose: () => {
        set({ open: false });
      },

      setSnackbar: (snackbar) => {
        set({ snackbar });
      },

      handleStatusChange: async (table) => {
        set({
          selectedTable: table,
        });
        const restaurantId =
          useRestaurantStore.getState().selectedRestaurant?.id;
        const waiterId = useAuthStore.getState().user?.id;

        if (!restaurantId || !waiterId) {
          console.log("No restaurantId or waiterId");
          return;
        }

        await get().getSessionOverview(
          table.id,
          waiterId,
          restaurantId
        );

        let message = "";

        switch (table?.status) {
          case "available":
            const { error: availableError } = await supabase
              .from("restaurant_tables")
              .update({ status: "reserved" })
              .eq("id", table.id)
              .eq("restaurant_id", restaurantId);

            if (availableError) throw availableError;

            set((state) => ({
              tables: state.tables.map((t) =>
                t.id === table.id ? { ...t, status: "reserved" } as RestaurantTable : t
              ),
            }));

            message = "reserved";
            break;
          case "occupied":
            const { getOrderitemsBySessionId, setCurrentOrderItems } =
              useMenuStore.getState();
            const { user } = useAuthStore.getState();
            const userId = user?.id;
            const selectedSession = get().selectedSession;

            if (!userId || !selectedSession) {
              console.log("No userId or selectedSession");
              return;
            }

            get().setOpen(true);

            const orderItems = await getOrderitemsBySessionId(selectedSession.session_id);
            setCurrentOrderItems(orderItems);

            message = "viewing"
            break;
          case "reserved":
            const { error: reservedError } = await supabase
              .from("restaurant_tables")
              .update({ status: "occupied" })
              .eq("id", table.id)
              .eq("restaurant_id", restaurantId);

            if (reservedError) throw reservedError;

            await get().startSession(table.id, waiterId, restaurantId);

            message = "occupied";
            break;
          case "unavailable":
            console.log("Unavailable");
            break;
          default:
            break;
        }

        return {
          message,
        };
      },

      cancelReservation: async (table, action) => {
        const { selectedRestaurant } = useRestaurantStore.getState() as any;
        const restaurantId = selectedRestaurant?.id;
        const waiterId = useAuthStore.getState().user?.id;

        if (!restaurantId || !waiterId || !table.id) {
          console.log("No restaurantId or waiterId or table id");
          return;
        }

        if (action === "closed") {
          await get().endSession(table.id, waiterId, restaurantId);
        }

        const { error: reservedError } = await supabase
          .from("restaurant_tables")
          .update({ status: "available" })
          .eq("id", table.id)
          .eq("restaurant_id", restaurantId);

        if (reservedError) throw reservedError;

        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === table.id ? { ...t, status: "available" } as RestaurantTable : t
          ),
        }));

        get().setSnackbar({
          open: true,
          message: `Table ${table.table_number} ${
            action === "cancelled" ? " reservation cancelled" : "closed"
          }`,
          severity: "success",
          id: Date.now()
        });

        set({ open: false });
      },

      getSession: async (table_id, waiter_id, restaurant_id) => {
        if (!table_id || !waiter_id || !restaurant_id) return null;
        
        const { data: tableSession, error: tableSessionError } = await supabase
          .from("table_sessions")
          .select()
          .eq("table_id", table_id)
          .eq("waiter_id", waiter_id)
          .eq("restaurant_id", restaurant_id)
          .in("status", ["open", "billed"])
          .limit(1)
          .maybeSingle();

        if (tableSessionError) {
          if (tableSessionError.code === "PGRST116") return null;
          throw tableSessionError;
        }

        return tableSession;
      },

      getSessions: async () => {
        const { selectedRestaurant } = useRestaurantStore.getState() as any;
        const restaurantId = selectedRestaurant?.id;

        set({ loadingSessions: true });

        try {
          const { data, error } =
            await supabase
              .from("table_sessions")
              .select()
              .eq("restaurant_id", restaurantId);

          if (error) throw error;

          set({ sessions: data || [], sessionsLoaded: true });
        } catch (error) {
          throw error;
        } finally {
          set({ loadingSessions: false });
        }
      },

      getSessionsOverview: async () => {
        const { selectedRestaurant } = useRestaurantStore.getState() as any;
        const restaurantId = selectedRestaurant?.id;
        const waiterId = useAuthStore.getState().user?.id;

        set({ loadingSessionsOverview: true });

        if (!restaurantId || !waiterId) {
          set({ loadingSessionsOverview: false });
          return;
        }

        try {
          const { data, error } =
            await supabase
              .from("table_sessions_overview")
              .select("*")
              .eq("restaurant_id", restaurantId)
              .eq("waiter_id", waiterId);

          if (error) throw error;

          set({
            sessionsOverview: data || [],
            sessionsOverviewLoaded: true,
          });
        } catch (error) {
          throw error;
        } finally {
          set({ loadingSessionsOverview: false });
        }
      },

      getServiceRequests: async () => {
        const { selectedRestaurant } = useRestaurantStore.getState() as any;
        const restaurantId = selectedRestaurant?.id;
        if (!restaurantId) return;

        set({ loadingServiceRequests: true });
        try {
          const { data, error } = await supabase
            .from("service_requests")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .eq("status", "pending")
            .order("created_at", { ascending: false });

          if (error) throw error;
          set({ serviceRequests: data || [] });
        } catch (error) {
          console.error("Error fetching service requests:", error);
        } finally {
          set({ loadingServiceRequests: false });
        }
      },

      resolveServiceRequest: async (requestId) => {
        try {
          const { error } = await supabase
            .from("service_requests")
            .update({ status: "resolved", resolved_at: new Date().toISOString() })
            .eq("id", requestId);

          if (error) throw error;
          
          set((state) => ({
            serviceRequests: state.serviceRequests.filter((r) => r.id !== requestId)
          }));
        } catch (error) {
          handleError(error as Error);
        }
      },

      getSessionOverview: async (table_id, waiter_id, restaurant_id) => {
        if (!table_id || !waiter_id || !restaurant_id) return null;
        
        try {
          const { data: tableSession, error: tableSessionError } = await supabase
            .from("table_sessions_overview")
            .select()
            .eq("table_id", table_id)
            .eq("waiter_id", waiter_id)
            .eq("restaurant_id", restaurant_id)
            .neq("session_status", "close")
            .order("session_created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
  
          if (tableSessionError) throw tableSessionError;
  
          set({ selectedSession: tableSession });
  
          if (tableSession) {
            await useMenuStore
              .getState()
              .getOrderBySessionId(tableSession.session_id);
          }
          return tableSession;
        } catch (error) {
          return null;
        }
      },

      startSession: async (table_id, waiter_id, restaurant_id) => {
        if (!table_id || !waiter_id || !restaurant_id) return;
        
        const { createOrder } = useMenuStore.getState();
        const { data: tableSession, error: tableSessionError } = await supabase
          .from("table_sessions")
          .insert({
            table_id,
            waiter_id,
            restaurant_id,
          })
          .select()
          .maybeSingle();

        if (tableSessionError) throw tableSessionError;

        if (tableSession) {
          await get().getSessionOverview(table_id, waiter_id, restaurant_id);
          await createOrder(tableSession.id, restaurant_id);
        }
      },

      endSession: async (table_id, waiter_id, restaurant_id) => {
        const selected = get().selectedSession;
        if (!selected) return;

        const { deleteOrderBySessionId } = useMenuStore.getState();

        await deleteOrderBySessionId(selected.session_id);

        const { data: tableSession, error: tableSessionError } = await supabase
          .from("table_sessions")
          .delete()
          .eq("table_id", table_id)
          .eq("waiter_id", waiter_id)
          .eq("restaurant_id", restaurant_id)
          .select()
          .maybeSingle();

        if (tableSessionError) throw tableSessionError;

        set((state) => ({
          sessions: state.sessions.filter(
            (session) => session.table_id !== table_id
          ),
          sessionsOverview: state.sessionsOverview.filter(
            (session) => session.table_id !== table_id
          ),
          selectedTable:
            state.selectedTable?.id === table_id ? null : state.selectedTable,
          selectedSession:
            state.selectedSession?.session_id === tableSession?.id
              ? null
              : state.selectedSession,
        }));
      },

      handleRemoveItem: async (itemId) => {
        try {
          const { chosenTableOrderItems } = get();

          const updatedOrders = chosenTableOrderItems.filter(
            (order) => order.id !== itemId?.id
          );
          const total = updatedOrders.reduce((acc, cur) => acc + cur.total, 0);

          set({
            chosenTableOrderItems: updatedOrders,
          });

          const { error: ordersItemsError } = await supabase
            .from("ordersItems")
            .delete()
            .eq("id", itemId?.id);

          if (ordersItemsError) handleError(ordersItemsError);

          const { error: ordersError } = await supabase
            .from("orders")
            .update({ total: total })
            .eq("id", itemId?.order_id);

          if (ordersError) handleError(ordersError);
        } catch (error) {
          handleError(error as Error);
        }
      },

      updateTablePosition: async (tableId, x, y, rotation) => {
        const { error } = await supabase
          .from("restaurant_tables")
          .update({ 
            x_position: x, 
            y_position: y, 
            rotation: rotation ?? 0 
          })
          .eq("id", tableId);

        if (error) throw error;

        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId ? { ...t, x_position: x, y_position: y, rotation: rotation ?? t.rotation } : t
          ),
        }));
      },

      transferTable: async (sessionId, sourceTableId, destTableId) => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;

        if (!restaurantId) return;

        try {
          // 1. Update session's table_id
          const { error: sessionError } = await supabase
            .from("table_sessions")
            .update({ table_id: destTableId })
            .eq("id", sessionId);

          if (sessionError) throw sessionError;

          // 2. Set source table to available
          const { error: sourceError } = await supabase
            .from("restaurant_tables")
            .update({ status: "available" })
            .eq("id", sourceTableId);

          if (sourceError) throw sourceError;

          // 3. Set destination table to occupied
          const { error: destError } = await supabase
            .from("restaurant_tables")
            .update({ status: "occupied" })
            .eq("id", destTableId);

          if (destError) throw destError;

          // 4. Refresh local state
          get().getTablesOverview();
          get().getSessionsOverview();
          
          get().setSnackbar({
            open: true,
            message: "Table transferred successfully",
            severity: "success",
            id: Date.now()
          });
        } catch (error) {
          handleError(error as Error);
        }
      },
    }),
    {
      name: "tables",
      partialize: (state) => ({
        selectedTable: state.selectedTable,
        selectedSession: state.selectedSession,
        sessions: state.sessions,
        sessionsOverview: state.sessionsOverview,
      }),
      version: 1,
    }
  )
);

export default useTablesStore;
