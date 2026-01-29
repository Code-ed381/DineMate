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
  selectedOrderItems: any[];
  loadingOrderItems: boolean;
  discount: string;
  proceedToPayment: boolean;
  isProcessingPayment: boolean;
  detailedOrderItems: any[];
  loadingDetailedOrderItems: boolean;
  sessionsChannel: any | null;

  setProceedToPayment: (value: boolean) => void;
  setSelected: (value: string) => void;
  setPaymentMethod: (method: string) => void;
  setCashAmount: (amount: string) => void;
  setCardAmount: (amount: string) => void;
  setMomoAmount: (amount: string) => void;
  setSelectedSession: (session: CashierSession | null) => void;
  setDiscount: (discount: string) => void;
  subscribeToSessions: () => void;
  unsubscribeFromSessions: () => void;
  getActiveSessionByRestaurant: (isBackground?: boolean) => Promise<void>;
  processPayment: (sessionId: string, orderId: string, tableId: string) => Promise<void>;
  handlePrintBill: () => Promise<void>;
  handleFetchOrderItems: (orderId: string) => Promise<any[]>;
  formatCashInput: (amount: string | number) => string;
  fetchReportSessions: () => Promise<void>;
  fetchDetailedReportItems: (options?: { startDate?: string; endDate?: string }) => Promise<void>;
}

const useCashierStore = create<CashierState>()(
  persist(
    (set, get) => ({
      selected: "active",
      cashAmount: "",
      cardAmount: "",
      momoAmount: "",
      paymentMethod: "cash",
      discount: "0",
      activeSessions: [],
      closedSessions: [],
      allSessions: [],
      loadingActiveSessionByRestaurant: false,
      activeSeesionByRestaurantLoaded: false,
      selectedSession: null,
      selectedOrderItems: [],
      loadingOrderItems: false,
      proceedToPayment: false,
      isProcessingPayment: false,
      detailedOrderItems: [],
      loadingDetailedOrderItems: false,
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

      formatCashInput: (amount) => {
        if (amount === undefined || amount === null) return "0.00";
        const numericValue = String(amount).replace(/[^0-9.]/g, "");
        if (numericValue === "") return "0.00";
        const formattedValue = parseFloat(numericValue).toFixed(2);
        return formattedValue;
      },

      setSelectedSession: (session: CashierSession | null) => {
        set({ 
          selectedSession: session, 
          proceedToPayment: false, 
          discount: session?.discount?.toString() || "0",
          cashAmount: "",
          cardAmount: "",
          momoAmount: ""
        });
        if (session) {
          get().handleFetchOrderItems(session.order_id);
        } else {
          set({ selectedOrderItems: [] });
        }
      },

      setDiscount: (discount: string) => {
        set({ discount });
      },

      subscribeToSessions: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;

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
              get().getActiveSessionByRestaurant(true);
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
              get().getActiveSessionByRestaurant(true);
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

      getActiveSessionByRestaurant: async (isBackground: boolean = false) => {
        const selectedRestaurant = useRestaurantStore.getState().selectedRestaurant;
        const selectedRestaurantId = selectedRestaurant?.id;

        if (!selectedRestaurantId) {
          console.error("No restaurant selected");
          return;
        }

        if (!isBackground) {
          set({ loadingActiveSessionByRestaurant: true });
        }

        try {
          let { data: cashier_orders_overview, error } = await supabase
            .from("cashier_orders_overview")
            .select("*")
            .eq("restaurant_id", selectedRestaurantId);

          if (error) throw error;

          const rawSessions = cashier_orders_overview || [];
          const orderIds = rawSessions.map((s: any) => s.order_id).filter(Boolean);

          let orderDataMap: Record<string, { total: number, payment_method: string, discount: number }> = {};
          if (orderIds.length > 0) {
            // Fetch both total and payment_method from the orders table
            const { data: ordersData } = await supabase
              .from("orders")
              .select("id, total, payment_method, discount")
              .in("id", orderIds);

            if (ordersData) {
              ordersData.forEach((order: any) => {
                orderDataMap[order.id] = { 
                  total: parseFloat(order.total) || 0,
                  payment_method: order.payment_method,
                  discount: parseFloat(order.discount) || 0
                };
              });
            }
          }

          const sessions = rawSessions.map((session: any) => {
            const orderData = orderDataMap[session.order_id];
            return { 
              ...session, 
              // Prefer actual total from orders table, fallback to view
              order_total: orderData ? orderData.total : (session.order_total || 0),
              // Prefer payment_method from orders table
              payment_method: orderData ? orderData.payment_method : session.payment_method,
              discount: orderData ? orderData.discount : 0
            };
          }) as CashierSession[];

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

      handleFetchOrderItems: async (orderId: string) => {
        set({ loadingOrderItems: true });
        try {
          const { data, error } = await supabase
            .from("order_items_full")
            .select("*")
            .eq("order_id", orderId);

          if (error) throw error;
          const items = data || [];
          set({ selectedOrderItems: items });

          // Synchronize total to the database orders table, accounting for any existing discount
          const calculatedSubtotal = items.reduce(
            (sum: number, item: any) => sum + (parseFloat(item.sum_price) || 0), 
            0
          );
          const currentDiscount = get().selectedSession?.discount || 0;
          const finalTotal = calculatedSubtotal * (1 - (parseFloat(currentDiscount.toString()) || 0) / 100);
          
          await supabase.from("orders").update({ total: finalTotal }).eq("id", orderId);

          return items;
        } catch (error) {
          console.error("Error fetching order items:", error);
          handleError(error as Error);
          return [];
        } finally {
          set({ loadingOrderItems: false });
        }
      },

      processPayment: async (sessionId: string, orderId: string, tableId: string) => {
        const { paymentMethod, selectedOrderItems, discount } = get();
        set({ isProcessingPayment: true });

        const discountPercent = parseFloat(discount) || 0;
        // Calculate the actual total being paid
        const baseTotal = selectedOrderItems.reduce(
            (sum: number, item: any) => sum + (parseFloat(item.sum_price) || 0), 
            0
        );
        const discountAmount = (baseTotal * discountPercent) / 100;
        const finalTotal = Math.max(0, baseTotal - discountAmount);

        try {
          const { error: sessionError } = await supabase
            .from("table_sessions")
            .update({ status: "close", closed_at: new Date() })
            .eq("id", sessionId);

          if (sessionError) throw sessionError;

          const { error: orderError } = await supabase
            .from("orders")
            .update({ 
              status: "served",
              total: finalTotal,
              payment_method: paymentMethod,
              discount: discountPercent
            })
            .eq("id", orderId);

          if (orderError) throw orderError;

          // If tableId is null (like in OTC), skipping the table update
          if (tableId) {
            const { error: tableError } = await supabase
              .from("restaurant_tables")
              .update({ status: "available" })
              .eq("id", tableId);

            if (tableError) throw tableError;
          }

          set({
            selectedSession: null,
            selectedOrderItems: [],
            cashAmount: "",
            cardAmount: "",
            momoAmount: "",
            paymentMethod: "cash",
          });

          await get().getActiveSessionByRestaurant(true);
        } catch (err) {
          handleError(err as Error);
        } finally {
          set({ isProcessingPayment: false });
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

          await get().getActiveSessionByRestaurant(true);
        } catch (err) {
          handleError(err as Error);
        }
      },

      fetchReportSessions: async () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const selectedRestaurantId = selectedRestaurant?.id;

        if (!selectedRestaurantId) return;

        set({ loadingActiveSessionByRestaurant: true, activeSeesionByRestaurantLoaded: false });

        try {
          // Fetch the last 30 days of data for the report
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: rawSessions, error } = await supabase
            .from("cashier_orders_overview")
            .select("*")
            .eq("restaurant_id", selectedRestaurantId)
            .gte("opened_at", thirtyDaysAgo.toISOString())
            .order("opened_at", { ascending: false });

          if (error) throw error;

          const orderIds = (rawSessions || []).map((s: any) => s.order_id).filter(Boolean);

          let orderDataMap: Record<string, { total: number, payment_method: string, discount: number }> = {};
          if (orderIds.length > 0) {
            const { data: ordersData } = await supabase
              .from("orders")
              .select("id, total, payment_method, discount")
              .in("id", orderIds);

            if (ordersData) {
              ordersData.forEach((order: any) => {
                orderDataMap[order.id] = { 
                  total: parseFloat(order.total) || 0,
                  payment_method: order.payment_method,
                  discount: parseFloat(order.discount) || 0
                };
              });
            }
          }

          const sessions = (rawSessions || []).map((session: any) => {
            const orderData = orderDataMap[session.order_id];
            return { 
              ...session, 
              order_total: orderData ? orderData.total : (session.order_total || 0),
              payment_method: orderData ? orderData.payment_method : session.payment_method,
              discount: orderData ? orderData.discount : 0
            };
          });

          set({
            allSessions: sessions,
            activeSeesionByRestaurantLoaded: true,
          });
        } catch (error) {
          console.error("Error fetching report sessions:", error);
          handleError(error as Error);
          set({ allSessions: [], activeSeesionByRestaurantLoaded: true });
        } finally {
          set({ loadingActiveSessionByRestaurant: false });
        }
      },

      fetchDetailedReportItems: async (options = {}) => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;
        
        console.log("🔍 Detailed Report Fetch - Start", { restaurantId, options });
        
        if (!restaurantId) {
          console.error("❌ Detailed Report Fetch - No Restaurant ID");
          return;
        }

        set({ loadingDetailedOrderItems: true });

        try {
          // STEP 1: Get valid order IDs from the proven overview view
          // This ensures we only fetch items for orders that are actually visible in the restaurant
          let orderQuery = supabase
            .from("cashier_orders_overview")
            .select("order_id")
            .eq("restaurant_id", restaurantId);
          
          if (options.startDate) orderQuery = orderQuery.gte("opened_at", options.startDate);
          if (options.endDate) orderQuery = orderQuery.lte("opened_at", options.endDate);
          
          const { data: orderOverview, error: orderError } = await orderQuery;

          if (orderError) {
            console.error("❌ Detailed Report Fetch - Order Overview Error:", orderError);
            throw orderError;
          }

          const orderIds = (orderOverview || []).map(o => o.order_id).filter(Boolean);
          console.log(`📡 Detailed Report Fetch - Found ${orderIds.length} orders to fetch items for`);

          if (orderIds.length === 0) {
            console.warn("⚠️ Detailed Report Fetch - No orders found for the given criteria");
            set({ detailedOrderItems: [], loadingDetailedOrderItems: false });
            return;
          }

          // STEP 2: Fetch items for those specific orders
          const { data, error } = await supabase
            .from("order_items_full")
            .select(`*`)
            .in("order_id", orderIds)
            .order("order_item_created_at", { ascending: false });
          
          if (error) {
            console.error("❌ Detailed Report Fetch - Items Error:", error);
            throw error;
          }

          console.log(`✅ Detailed Report Fetch - Data Received (${data?.length || 0} items)`);

          // Process data to flatten it and ensure all expected fields exist for DataGrid
          const processedData = (data as any[]).map(item => ({
            ...item,
            item_name: item.menu_item_name || item.item_name || "Unknown Item", 
            image_url: item.menu_item_image_url || item.image_url,
            order_ref: item.order_ref || item.order_id || "N/A",
            // Map created_at to the correct timestamp
            created_at: item.order_item_created_at || item.created_at,
            // Waiter info
            waiter_first_name: item.waiter_first_name || "System",
            waiter_last_name: item.waiter_last_name || "",
            waiter_avatar_url: item.waiter_avatar_url || item.waiter_avatar,
            // Preparer info
            preparer_first_name: item.prepared_by_first_name || (item.order_item_status === 'served' ? "Ready" : "In Progress"),
            preparer_last_name: item.prepared_by_last_name || "",
            preparer_avatar_url: item.prepared_by_avatar || item.preparer_avatar,
            // Status and Pricing
            status: item.order_item_status || item.status || "ordered",
            sum_price: parseFloat(item.sum_price) || 0,
            discount: parseFloat(item.discount) || 0
          }));

          console.log("📊 Detailed Report Fetch - Processed Data:", processedData);

          set({ detailedOrderItems: processedData, loadingDetailedOrderItems: false });
        } catch (error) {
          console.error("❌ Detailed Report Fetch - Catch Error:", error);
          set({ loadingDetailedOrderItems: false, detailedOrderItems: [] });
        }
      },
    }),
    {
      name: "cashierStore",
      partialize: (state) => ({
        // No longer persisting selectedSession or activeSessions to ensure a clean state on reload
      }),
    }
  )
);

export default useCashierStore;
