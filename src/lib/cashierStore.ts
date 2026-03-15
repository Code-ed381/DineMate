import { create } from "zustand";
import { persist } from "zustand/middleware";
import useRestaurantStore from "./restaurantStore";
import { supabase } from "./supabase";
import { handleError } from "../components/Error";
import Swal from "sweetalert2";
import { menuService } from "../services/menuService";
import useAuthStore from "./authStore";

interface CashierSession {
  session_id: string;
  order_id: string;
  table_id: string;
  restaurant_id: string;
  table_number: number | string;
  order_total: number;
  session_status: string;
  is_otc_order?: boolean;
  waiter_id?: string;
  waiter_name?: string;
  closed_at?: string;
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
  historyFilters: {
    startDate: string;
    endDate: string;
    searchQuery: string;
  };
  isFetchingHistory: boolean;

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
  setHistoryFilters: (filters: Partial<{ startDate: string; endDate: string; searchQuery: string }>) => void;
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
      historyFilters: {
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        searchQuery: "",
      },
      isFetchingHistory: false,

      setHistoryFilters: (filters) => {
        set((state) => ({
          historyFilters: { ...state.historyFilters, ...filters }
        }));
        get().fetchReportSessions();
      },

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
            (payload: any) => {
              get().getActiveSessionByRestaurant(true);
              
              const { selectedSession } = get();
              
              // Handle DELETE or status change to close
              const isDelete = payload.eventType === 'DELETE';
              const isClosed = payload.new && payload.new.status === "close";
              const targetId = isDelete ? payload.old.id : payload.new.id;

              if (targetId === selectedSession?.session_id && (isDelete || isClosed)) {
                set({ selectedSession: null, selectedOrderItems: [] });
              }
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
            (payload: any) => {
              get().getActiveSessionByRestaurant(true);

              const { selectedSession } = get();
              // If the currently selected order was deleted, clear it
              if (payload.eventType === 'DELETE' && payload.old.id === selectedSession?.order_id) {
                set({ selectedSession: null, selectedOrderItems: [] });
                return;
              }

              // If the order total changed (e.g. item deleted/added elsewhere), refresh items
              if (payload.eventType === 'UPDATE' && selectedSession && payload.new.id === selectedSession.order_id) {
                get().handleFetchOrderItems(selectedSession.order_id);
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "order_items",
            },
            (payload: any) => {
              const { selectedSession } = get();
              if (!selectedSession) return;

              // Check if the modified order_item belongs to the active session's order
              const orderId = payload.new?.order_id || payload.old?.order_id;
              if (orderId && String(orderId) === String(selectedSession.order_id)) {
                get().handleFetchOrderItems(selectedSession.order_id);
              }
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
          return;
        }

        if (!isBackground) {
          set({ loadingActiveSessionByRestaurant: true });
        }

        try {
          let { data: cashier_orders_overview, error } = await supabase
            .from("cashier_orders_overview")
            .select("*")
            .eq("restaurant_id", selectedRestaurantId)
            .order("order_id", { ascending: true });

          if (error) throw error;

          const rawSessions = cashier_orders_overview || [];
          const orderIds = rawSessions.map((s: any) => s.order_id).filter(Boolean);
          const sessionIds = rawSessions.map((s: any) => s.session_id).filter(Boolean);

          let orderDataMap: Record<string, { total: number, payment_method: string, discount: number }> = {};
          let sessionDataMap: Record<string, { waiter_id: string, closed_at: string }> = {};

          if (orderIds.length > 0 || sessionIds.length > 0) {
            const [ordersRes, sessionsRes] = await Promise.all([
              orderIds.length > 0 
                ? supabase.from("orders").select("id, total, payment_method, discount").in("id", orderIds)
                : Promise.resolve({ data: null, error: null }),
              sessionIds.length > 0
                ? supabase.from("table_sessions").select("id, waiter_id, closed_at").in("id", sessionIds)
                : Promise.resolve({ data: null, error: null })
            ]);

            if (ordersRes.data) {
              ordersRes.data.forEach((order: any) => {
                orderDataMap[order.id] = { 
                  total: parseFloat(order.total) || 0,
                  payment_method: order.payment_method,
                  discount: parseFloat(order.discount) || 0
                };
              });
            }

            if (sessionsRes.data) {
              sessionsRes.data.forEach((sess: any) => {
                sessionDataMap[sess.id] = { 
                  waiter_id: sess.waiter_id,
                  closed_at: sess.closed_at
                };
              });
            }
          }

          const sessions = rawSessions.map((session: any) => {
            const orderData = orderDataMap[session.order_id];
            const sessionData = sessionDataMap[session.session_id];
            
            // Determine if this is an OTC order (no table_id or table_number is null/undefined)
            const isOTCOrder = !session.table_id || !session.table_number || session.table_number === null;
            const tableDisplay = isOTCOrder ? "OTC" : session.table_number;
            
            return { 
              ...session, 
              // Prefer actual total from orders table, fallback to view
              order_total: orderData ? orderData.total : (session.order_total || 0),
              // Prefer payment_method from orders table
              payment_method: orderData ? orderData.payment_method : session.payment_method,
              discount: orderData ? orderData.discount : 0,
              // Add waiter_id for notifications
              waiter_id: sessionData ? sessionData.waiter_id : session.waiter_id,
              closed_at: sessionData ? sessionData.closed_at : session.closed_at,
              // Override table number display for OTC orders
              table_number: tableDisplay,
              is_otc_order: isOTCOrder
            };
          }) as CashierSession[];

          const activeSessions = sessions.filter(
            (session) => session.session_status !== "close"
          );

          const closedSessions = sessions.filter(
            (session) => session.session_status === "close"
          ).sort((a, b) => {
            const dateA = a.closed_at ? new Date(a.closed_at).getTime() : 0;
            const dateB = b.closed_at ? new Date(b.closed_at).getTime() : 0;
            return dateB - dateA;
          });

          set({
            allSessions: sessions,
            activeSessions: activeSessions,
            closedSessions: closedSessions,
            activeSeesionByRestaurantLoaded: true,
          });
        } catch (error) {
          handleError(error as Error);
          set({ activeSeesionByRestaurantLoaded: true });
        } finally {
          set({
            loadingActiveSessionByRestaurant: false,
          });
        }
      },

      handleFetchOrderItems: async (orderId: string) => {
        set({ loadingOrderItems: true });
        try {
          // 1. Fetch order items
          const { data: orderItems, error: itemsError } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", orderId);

          if (itemsError) throw itemsError;

          // 2. Fetch menu items for names/images
          const menuItemIds = Array.from(new Set((orderItems || []).map((i: any) => i.menu_item_id).filter(Boolean)));
          let menuItemsMap: Record<string, any> = {};
          
          if (menuItemIds.length > 0) {
            const { data: menuItems } = await supabase
              .from("menu_items")
              .select("id, name, image_url")
              .in("id", menuItemIds);
            
            menuItems?.forEach(mi => {
              menuItemsMap[mi.id] = mi;
            });
          }

          // 3. Fetch waiter info gracefully (might fail due to permissions)
          const waiterIds = Array.from(new Set((orderItems || []).map((i: any) => i.prepared_by).filter(Boolean)));
          let waitersMap: Record<string, any> = {};
          
          if (waiterIds.length > 0) {
            try {
              const { data: waiters } = await supabase
                .from("restaurant_members_with_users")
                .select("user_id, first_name, last_name, avatar_url")
                .in("user_id", waiterIds);
              
              waiters?.forEach(w => {
                waitersMap[w.user_id] = w;
              });
            } catch (e) {
            }
          }

          // 4. Manual Join
          const items = (orderItems || []).map((oi: any) => {
            const menuItem = menuItemsMap[oi.menu_item_id];
            const waiter = waitersMap[oi.prepared_by];
            return {
              ...oi,
              order_item_id: oi.id, // Ensure compatibility with UI expecting order_item_id
              menu_item_name: menuItem?.name || "Unknown Item",
              menu_item_image_url: menuItem?.image_url,
              item_name: menuItem?.name,
              waiter_first_name: waiter?.first_name || "System",
              waiter_last_name: waiter?.last_name || "",
              waiter_avatar_url: waiter?.avatar_url
            };
          });

          set({ selectedOrderItems: items });


          return items;
        } catch (error) {
          handleError(error as Error);
          return [];
        } finally {
          set({ loadingOrderItems: false });
        }
      },

      processPayment: async (sessionId: string, orderId: string, tableId: string) => {
        const role = useRestaurantStore.getState().role;
        if (role !== "owner" && role !== "admin" && role !== "cashier") {
          Swal.fire("Unauthorized", "You don't have permission to process payments.", "error");
          return;
        }
        
        const { paymentMethod, selectedOrderItems, discount, cashAmount, cardAmount, momoAmount } = get();
        
        // CHECK FOR UNSERVED ITEMS (Only for Waiter Orders)
        const selectedSession = get().selectedSession;
        if (selectedSession && !selectedSession.is_otc_order) {
          try {
            const hasUnserved = await menuService.hasUnservedItems(sessionId);
            if (hasUnserved) {
              Swal.fire({
                icon: "warning",
                title: "Unserved Items",
                text: "This table has items that haven't been served yet. Please ensure all items are served before processing payment.",
              });
              return;
            }
          } catch (err) {
          }
        }

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
          // Declare here for unified use
          const { selectedRestaurant } = useRestaurantStore.getState();
          const { currentMember } = (await import("./authStore")).default.getState();

          const { error: sessionError } = await supabase
            .from("table_sessions")
            .update({ status: "close", closed_at: new Date().toISOString(), payment_method: paymentMethod })
            .eq("id", sessionId);

          if (sessionError) throw sessionError;

          const { error: orderError } = await supabase
            .from("orders")
            .update({ 
              status: "served",
              total: finalTotal,
              payment_method: paymentMethod,
              discount: discountPercent,
              amount_cash: parseFloat(cashAmount) || 0,
              amount_card: parseFloat(cardAmount) || 0,
          amount_momo: parseFloat(momoAmount) || 0
            })
            .eq("id", orderId);

          if (orderError) throw orderError;
          
          // Bidirectional Notification: Cashier -> Staff
          // We capture these values BEFORE the potentially clearing set state
          let targetWaiterId = selectedSession?.waiter_id;
          const targetTableNumber = selectedSession?.table_number || "OTC";
          const targetOrderId = selectedSession?.order_id || orderId;

          // Robust fallback: If waiterId is missing in state, fetch it directly from DB
          if (!targetWaiterId) {
            console.log("🔍 Fetching waiter_id from DB for session:", sessionId);
            const { data: sessionData } = await supabase
              .from("table_sessions")
              .select("waiter_id")
              .eq("id", sessionId)
              .single();
            if (sessionData?.waiter_id) {
              targetWaiterId = sessionData.waiter_id;
              console.log("✅ Recovered waiter_id from DB:", targetWaiterId);
            }
          }

          if (targetWaiterId) {
            console.log(`🔔 Notifying staff (${targetWaiterId}) about finalized table: ${targetTableNumber}`);
            menuService.notifySessionUpdate(
              selectedRestaurant?.id || "",
              useAuthStore.getState().user?.id || currentMember?.user_id || currentMember?.id || "",
              sessionId,
              "CASHIER_FINALIZED",
              { 
                orderId: targetOrderId, 
                tableNumber: targetTableNumber,
                waiterId: targetWaiterId
              }
            ).catch(e => console.error("Session notification error:", e));
          } else {
            console.warn("⚠️ No waiter_id found for session even after DB lookup, staff notification skipped.");
          }

          // 🆕 Record the payment in the ledger
          const { error: paymentError } = await supabase
            .from("payments")
            .insert({
              payment_type: "order",
              order_id: parseInt(orderId),
              restaurant_id: selectedRestaurant?.id,
              cashier_id: currentMember?.user_id || currentMember?.id,
              amount: finalTotal,
              method: paymentMethod,
              status: "completed",
              reference: null // Order payments usually don't have a transaction reference unless digital
            });

          if (paymentError) {
          }

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
          // CHECK FOR UNSERVED ITEMS (Only for Waiter Orders)
          if (selectedSession && !selectedSession.is_otc_order) {
            const hasUnserved = await menuService.hasUnservedItems(selectedSession.session_id);
            if (hasUnserved) {
              Swal.fire({
                icon: "warning",
                title: "Unserved Items",
                text: "This table has items that haven't been served yet. Please ensure all items are served before printing the bill.",
              });
              return;
            }
          }

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

        set({ isFetchingHistory: true });

        try {
          const { startDate, endDate, searchQuery } = get().historyFilters;
          
          let query = supabase
            .from("cashier_orders_overview")
            .select("*")
            .eq("restaurant_id", selectedRestaurantId)
            .eq("session_status", "close");

          if (startDate) {
            query = query.gte("closed_at", `${startDate}T00:00:00`);
          }
          if (endDate) {
            query = query.lte("closed_at", `${endDate}T23:59:59`);
          }

          // Sort by closure date (most recent first)
          query = query.order("closed_at", { ascending: false });

          const { data: rawSessions, error } = await query;

          if (error) throw error;

          let filteredSessions = rawSessions || [];

          // Client-side search for better flexibility with Order ID and Table
          if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filteredSessions = filteredSessions.filter((s: any) => 
              s.order_id?.toString().toLowerCase().includes(lowerQuery) ||
              s.table_number?.toString().toLowerCase().includes(lowerQuery)
            );
          }

          const orderIds = filteredSessions.map((s: any) => s.order_id).filter(Boolean);

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

          const sessions = filteredSessions.map((session: any) => {
            const orderData = orderDataMap[session.order_id];
            
            const isOTCOrder = !session.table_id || !session.table_number || session.table_number === null;
            const tableDisplay = isOTCOrder ? "OTC" : session.table_number;
            
            return { 
              ...session, 
              order_total: orderData ? orderData.total : (session.order_total || 0),
              payment_method: orderData ? orderData.payment_method : session.payment_method,
              discount: orderData ? orderData.discount : 0,
              // Override table number display for OTC orders
              table_number: tableDisplay,
              is_otc_order: isOTCOrder
            };
          });

          set({
            closedSessions: sessions,
            activeSeesionByRestaurantLoaded: true,
          });
        } catch (error) {
          handleError(error as Error);
          set({ closedSessions: [], activeSeesionByRestaurantLoaded: true });
        } finally {
          set({ isFetchingHistory: false });
        }
      },

      fetchDetailedReportItems: async (options = {}) => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.id;
        if (!restaurantId) return;

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
            throw orderError;
          }

          const orderIds = (orderOverview || []).map(o => o.order_id).filter(Boolean);

          if (orderIds.length === 0) {
            set({ detailedOrderItems: [], loadingDetailedOrderItems: false });
            return;
          }

          // STEP 2: Fetch items for those specific orders
          const { data: orderItems, error: itemsError } = await supabase
            .from("order_items")
            .select(`*`)
            .in("order_id", orderIds)
            .order("created_at", { ascending: false });
          
          if (itemsError) {
            throw itemsError;
          }

          // STEP 3: Fetch related menu items and waiter info
          const menuItemIds = Array.from(new Set((orderItems || []).map((i: any) => i.menu_item_id).filter(Boolean)));
          let menuItemsMap: Record<string, any> = {};
          if (menuItemIds.length > 0) {
            const { data: menuItems } = await supabase
              .from("menu_items")
              .select("id, name, image_url")
              .in("id", menuItemIds);
            menuItems?.forEach(mi => menuItemsMap[mi.id] = mi);
          }

          // Get order session IDs to fetch waiter information
          const itemOrderIds = Array.from(new Set((orderItems || []).map((i: any) => i.order_id).filter(Boolean)));
          let waiterMap: Record<string, any> = {};
          let preparerMap: Record<string, any> = {};
          
          if (itemOrderIds.length > 0) {
            // Fetch orders to get session information
            const { data: orders } = await supabase
              .from("orders")
              .select("id, session_id")
              .in("id", itemOrderIds);
            
            const sessionIds = Array.from(new Set((orders || []).map((o: any) => o.session_id).filter(Boolean)));
            
            if (sessionIds.length > 0) {
              // Fetch table sessions to get waiter IDs
              const { data: sessions } = await supabase
                .from("table_sessions")
                .select("id, waiter_id")
                .in("id", sessionIds);
              
              const waiterIds = Array.from(new Set((sessions || []).map((s: any) => s.waiter_id).filter(Boolean)));
              
              if (waiterIds.length > 0) {
                // Fetch waiter information from users_secure_view
                const { data: waiters } = await supabase
                  .from("users_secure_view")
                  .select("id, raw_user_meta_data")
                  .in("id", waiterIds);
                
                waiters?.forEach(w => waiterMap[w.id] = w);
                
                // Create session to waiter mapping
                const sessionToWaiterMap: Record<string, string> = {};
                sessions?.forEach(s => {
                  if (s.waiter_id) sessionToWaiterMap[s.id] = s.waiter_id;
                });
                
                // Create order to waiter mapping
                const orderToWaiterMap: Record<string, any> = {};
                orders?.forEach(o => {
                  const waiterId = sessionToWaiterMap[o.session_id];
                  if (waiterId && waiterMap[waiterId]) {
                    orderToWaiterMap[o.id] = waiterMap[waiterId];
                  }
                });
                
                // Store waiter info by order ID
                Object.assign(waiterMap, orderToWaiterMap);
              }
            }
          }
          
          // Fetch preparer information (who prepared the items)
          const preparerIds = Array.from(new Set((orderItems || []).map((i: any) => i.prepared_by).filter(Boolean)));
          if (preparerIds.length > 0) {
            const { data: preparers } = await supabase
              .from("users_secure_view")
              .select("id, raw_user_meta_data")
              .in("id", preparerIds);
            preparers?.forEach(p => preparerMap[p.id] = p);
          }


          // Process data to flatten it and ensure all expected fields exist for DataGrid
          const processedData = (orderItems as any[]).map(item => {
            const menuItem = menuItemsMap[item.menu_item_id];
            const waiter = waiterMap[item.order_id]; // Waiter is mapped by order_id
            const preparer = preparerMap[item.prepared_by]; // Preparer is mapped by user_id
            
            // Extract metadata from raw_user_meta_data
            const waiterMeta = waiter?.raw_user_meta_data || {};
            const preparerMeta = preparer?.raw_user_meta_data || {};
            
            return {
              ...item,
              order_item_id: item.id, // CRITICAL: Fix for DataGrid unique ID error
              item_name: menuItem?.name || "Unknown Item", 
              image_url: menuItem?.image_url,
              order_ref: item.order_id || "N/A",
              created_at: item.created_at,
              // Status and Pricing
              status: item.status || "ordered",
              sum_price: parseFloat(item.sum_price) || 0,
              // Waiter info (who took the order)
              waiter_first_name: waiterMeta.firstName || "System",
              waiter_last_name: waiterMeta.lastName || "",
              waiter_avatar: waiterMeta.avatarUrl,
              // Preparer info (who prepared the item)
              preparer_first_name: preparerMeta.firstName || (item.status === 'served' ? "Not assigned" : "In Progress"),
              preparer_last_name: preparerMeta.lastName || "",
              preparer_avatar: preparerMeta.avatarUrl,
            };
          });


          set({ detailedOrderItems: processedData, loadingDetailedOrderItems: false });
        } catch (error) {
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
