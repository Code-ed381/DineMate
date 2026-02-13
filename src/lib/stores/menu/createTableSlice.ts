import { StateCreator } from "zustand";
import { MenuState, TableSession, RestaurantTable, Order } from "../../../types/menu";
import { supabase } from "../../../lib/supabase";
import useRestaurantStore from "../../../lib/restaurantStore";
import useAuthStore from "../../../lib/authStore";
import { handleError } from "../../../components/Error";
import useTablesStore from "../../../lib/tablesStore";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface TableSlice {
  assignedTables: Order[];
  assignedTablesLoaded: boolean;
  tableSelected: boolean;
  chosenTable: string | number | null;
  chosenTableSession: TableSession | null;
  loadingActiveSessionByRestaurant: boolean;
  activeSeesionByRestaurantLoaded: boolean;
  loadingActiveSessionByTableNumber: boolean;
  activeSeesionByTableNumberLoaded: boolean;
  sessionsChannel: RealtimeChannel | null;
  table?: RestaurantTable | null;
  noTablesFound: boolean;

  setAssignedTables: (tables: Order[]) => void;
  getAssignedTables: () => void;
  getActiveSessionByRestaurant: () => Promise<void>;
  filterActiveSessionByTableNumber: (tableNumber: string | number) => Promise<void>;
  setChosenTable: (table: RestaurantTable) => Promise<void>;
  updateSessionStatus: (status: string) => Promise<void>;
  subscribeToSessions: () => void;
  unsubscribeFromSessions: () => void;
  isSelectedTable: (table: RestaurantTable) => boolean;
}

export const createTableSlice: StateCreator<MenuState, [], [], TableSlice> = (set, get) => ({
  assignedTables: [],
  assignedTablesLoaded: false,
  tableSelected: false,
  chosenTable: null,
  chosenTableSession: null,
  loadingActiveSessionByRestaurant: false,
  activeSeesionByRestaurantLoaded: false,
  loadingActiveSessionByTableNumber: false,
  activeSeesionByTableNumberLoaded: false,
  sessionsChannel: null,
  noTablesFound: false,

  setAssignedTables: (tables) => set({ assignedTables: tables }),

  getAssignedTables: () => {
    get().getActiveSessionByRestaurant();
    useTablesStore.getState().getSessionsOverview();
  },

  getActiveSessionByRestaurant: async () => {
    set({ loadingActiveSessionByRestaurant: true });
    try {
      const restaurantId = useRestaurantStore.getState().selectedRestaurant?.id;
      const userId = useAuthStore.getState().user?.id;
      if (!restaurantId || !userId) return;

      const { data, error } = await supabase
        .from("waiter_orders_overview")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("waiter_id", userId);

      if (error) throw error;

      set({
        assignedTablesLoaded: true,
        assignedTables: (data || []).map((s: any) => ({ ...s, table_number: s.table_number?.toString() } as unknown as Order)).filter((s: any) => s.session_status !== "close"),
        activeSeesionByRestaurantLoaded: true,
      });
    } catch (error) {
      handleError(error as Error);
    } finally {
      set({ loadingActiveSessionByRestaurant: false });
    }
  },

  filterActiveSessionByTableNumber: async (tableNumber) => {
    if (tableNumber === null || tableNumber === undefined) return;
    set({ loadingActiveSessionByTableNumber: true });
    try {
      const { data, error } = await supabase
        .from("waiter_orders_overview")
        .select("*")
        .eq("table_number", tableNumber)
        .maybeSingle();

      if (error) throw error;

      set({
        chosenTableSession: data,
        chosenTableOrderItems: data?.order_items || [],
        activeSeesionByTableNumberLoaded: true,
      });
    } catch (error) {
      handleError(error as Error);
    } finally {
      set({ loadingActiveSessionByTableNumber: false });
    }
  },

  setChosenTable: async (table) => {
    const { chosenTable, resetStepper, filterActiveSessionByTableNumber } = get();

    if (chosenTable === table.table_number) {
      set({
        chosenTable: null,
        chosenTableSession: null,
        tableSelected: false,
        proceedToCheckOut: false,
        orderId: null,
        table: null,
      });
      resetStepper();
      return;
    }

    set({
      chosenTable: table.table_number,
      tableSelected: true,
      proceedToCheckOut: false,
      table: table,
    });
    resetStepper();
    await filterActiveSessionByTableNumber(table.table_number);
  },

  updateSessionStatus: async (status) => {
    const { chosenTableSession, currentOrder, chosenTable } = get();
    const tablesStore = useTablesStore.getState();
    const selectedSession = tablesStore.selectedSession;

    const potentialIds = [
      chosenTableSession?.session_id,
      currentOrder?.session_id,
      selectedSession?.session_id,
      selectedSession?.id
    ].filter(id => id && id !== "undefined");

    const sessionId = potentialIds[0];

    if (!sessionId) {
      const tableId = chosenTableSession?.table_id || selectedSession?.table_id;
      const restaurantId = chosenTableSession?.restaurant_id || selectedSession?.restaurant_id;

      if (tableId && restaurantId) {
        const { error } = await supabase
          .from("table_sessions")
          .update({ status })
          .eq("table_id", tableId)
          .eq("restaurant_id", restaurantId);
        if (error) handleError(error as Error);
        
        const tableNum = chosenTable || chosenTableSession?.table_number || selectedSession?.table_number;
        if (tableNum) await get().filterActiveSessionByTableNumber(tableNum);
        return;
      }
      return;
    }

    const { error } = await supabase.from("table_sessions").update({ status }).eq("id", sessionId);
    if (error) {
      handleError(error as Error);
      return;
    }

    if (chosenTableSession?.session_id === sessionId) {
      set({ chosenTableSession: { ...chosenTableSession!, session_status: status } });
    }

    const refreshTableNum = chosenTable || chosenTableSession?.table_number || selectedSession?.table_number;
    if (refreshTableNum) await get().filterActiveSessionByTableNumber(refreshTableNum);
  },

  subscribeToSessions: () => {
    const restaurantId = useRestaurantStore.getState().selectedRestaurant?.id;
    const userId = useAuthStore.getState().user?.id;
    if (!restaurantId || !userId) return;

    if (get().sessionsChannel) supabase.removeChannel(get().sessionsChannel!);

    const channel = supabase
      .channel(`waiter-sessions-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "table_sessions", filter: `restaurant_id=eq.${restaurantId}` }, () => get().getActiveSessionByRestaurant())
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => get().getActiveSessionByRestaurant())
      .subscribe();

    set({ sessionsChannel: channel });
  },

  unsubscribeFromSessions: () => {
    if (get().sessionsChannel) {
      supabase.removeChannel(get().sessionsChannel!);
      set({ sessionsChannel: null });
    }
  },

  isSelectedTable: (table) => get().chosenTable === table.table_number,
});
