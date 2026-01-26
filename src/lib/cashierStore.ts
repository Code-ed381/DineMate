import { create } from "zustand";
import { persist } from "zustand/middleware";
import useRestaurantStore from "./restaurantStore";
import { supabase } from "./supabase";
import { handleError } from "../components/Error";

interface CashierSession {
  session_id: string;
  order_id: string;
  table_id: string;
  restaurant_id: string;
  table_number: number | string;
  order_total: number;
  session_status: string;
  [key: string]: any;
}

interface CashierState {
  selected: string;
  cashAmount: string;
  cardAmount: string;
  momoAmount: string;
  paymentMethod: string;
  activeSessions: CashierSession[];
  closedSessions: CashierSession[];
  allSessions: CashierSession[];
  loadingActiveSessionByRestaurant: boolean;
  activeSeesionByRestaurantLoaded: boolean;
  selectedSession: CashierSession | null;
  proceedToPayment: boolean;
  sessionsChannel: any | null;

  setProceedToPayment: (value: boolean) => void;
  setSelected: (value: string) => void;
  setPaymentMethod: (method: string) => void;
  setCashAmount: (amount: string) => void;
  setCardAmount: (amount: string) => void;
  setMomoAmount: (amount: string) => void;
  setSelectedSession: (session: CashierSession | null) => void;
  subscribeToSessions: () => void;
  unsubscribeFromSessions: () => void;
  getActiveSessionByRestaurant: () => Promise<void>;
  processPayment: (sessionId: string, orderId: string, tableId: string) => Promise<void>;
  handlePrintBill: () => Promise<void>;
}

const useCashierStore = create<CashierState>()(
  persist(
    (set, get) => ({
      selected: "active",
      cashAmount: "",
      cardAmount: "",
      momoAmount: "",
      paymentMethod: "cash",
      activeSessions: [],
      closedSessions: [],
      allSessions: [],
      loadingActiveSessionByRestaurant: false,
      activeSeesionByRestaurantLoaded: false,
      selectedSession: null,
      proceedToPayment: false,
      sessionsChannel: null,

      setProceedToPayment: (value: boolean) => {
        set({ proceedToPayment: value });
      },

      setSelected: (value: string) => {
        set({ selected: value });
      },

      setPaymentMethod: (method: string) => {
        set({ paymentMethod: method });
      },

      setCashAmount: (amount: string) => {
        set({ cashAmount: amount });
      },

      setCardAmount: (amount: string) => {
        set({ cardAmount: amount });
      },

      setMomoAmount: (amount: string) => {
        set({ momoAmount: amount });
      },

      setSelectedSession: (session: CashierSession | null) => {
        set({ selectedSession: session });
      },

      subscribeToSessions: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant && ('restaurants' in selectedRestaurant 
          ? selectedRestaurant.restaurants.id 
          : (selectedRestaurant as any).id);

        if (!restaurantId) return;

        const oldChannel = get().sessionsChannel;
        if (oldChannel) {
          supabase.removeChannel(oldChannel);
        }

        const channel = supabase
          .channel(`cashier-sessions-${restaurantId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "table_sessions",
              filter: `restaurant_id=eq.${restaurantId}`,
            },
            () => {
              get().getActiveSessionByRestaurant();
            }
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "orders",
              filter: `restaurant_id=eq.${restaurantId}`,
            },
            () => {
              get().getActiveSessionByRestaurant();
            }
          )
          .subscribe();

        set({ sessionsChannel: channel });
      },

      unsubscribeFromSessions: () => {
        const channel = get().sessionsChannel;
        if (channel) {
          supabase.removeChannel(channel);
          set({ sessionsChannel: null });
        }
      },

      getActiveSessionByRestaurant: async () => {
        const selectedRestaurant = useRestaurantStore.getState().selectedRestaurant;
        const selectedRestaurantId = selectedRestaurant && ('restaurants' in selectedRestaurant 
          ? selectedRestaurant.restaurants.id 
          : (selectedRestaurant as any).id);

        if (!selectedRestaurantId) {
          console.error("No restaurant selected");
          return;
        }

        set({ loadingActiveSessionByRestaurant: true });

        try {
          let { data: cashier_orders_overview, error } = await supabase
            .from("cashier_orders_overview")
            .select("*")
            .eq("restaurant_id", selectedRestaurantId);

          if (error) throw error;

          const sessions = (cashier_orders_overview || []) as CashierSession[];

          const activeSessions = sessions.filter(
            (session) => session.session_status !== "close"
          );

          const closedSessions = sessions.filter(
            (session) => session.session_status === "close"
          );

          set({
            allSessions: sessions,
            activeSessions: activeSessions,
            closedSessions: closedSessions,
            activeSeesionByRestaurantLoaded: true,
          });
        } catch (error) {
          console.error(error);
          handleError(error as Error);
        } finally {
          set({
            loadingActiveSessionByRestaurant: false,
          });
        }
      },

      processPayment: async (sessionId: string, orderId: string, tableId: string) => {
        try {
          const { error: sessionError } = await supabase
            .from("table_sessions")
            .update({ status: "close", closed_at: new Date() })
            .eq("id", sessionId);

          if (sessionError) throw sessionError;

          const { error: orderError } = await supabase
            .from("orders")
            .update({ status: "served" })
            .eq("id", orderId);

          if (orderError) throw orderError;

          const { error: tableError } = await supabase
            .from("restaurant_tables")
            .update({ status: "available" })
            .eq("id", tableId);

          if (tableError) throw tableError;

          set({
            selectedSession: null,
            cashAmount: "",
            cardAmount: "",
            momoAmount: "",
            paymentMethod: "cash",
          });

          await get().getActiveSessionByRestaurant();
        } catch (err) {
          handleError(err as Error);
        }
      },

      handlePrintBill: async () => {
        const selectedSession = get().selectedSession;
        if (!selectedSession) return;

        try {
          const { error } = await supabase
            .from("table_sessions")
            .update({ status: "billed" })
            .eq("id", selectedSession.session_id);

          if (error) throw error;

          await get().getActiveSessionByRestaurant();
        } catch (err) {
          handleError(err as Error);
        }
      },
    }),
    {
      name: "cashierStore",
      partialize: (state) => ({
        activeSessions: state.activeSessions,
        selectedSession: state.selectedSession,
      }),
    }
  )
);

export default useCashierStore;
