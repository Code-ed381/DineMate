import { create } from "zustand";
import { persist } from "zustand/middleware";
import useRestaurantStore from "../lib/restaurantStore";
import useAuthStore from "../lib/authStore";
import useTablesStore from "../lib/tablesStore";
import { supabase } from "./supabase";
import { handleError } from "../components/Error";
import Swal from "sweetalert2";
import { printReceipt } from "../components/PrintWindow";
import { database_logs } from "./logActivities";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  category_name?: string;
  type: 'food' | 'drink';
  image_url?: string;
  restaurant_id: string;
}

export interface Category {
  id: string;
  name: string;
  restaurant_id: string;
  image_url?: string;
}

export interface Order {
  id: string;
  session_id: string;
  restaurant_id: string;
  cash?: number;
  card?: number;
  balance?: number;
  total?: number;
  status: string;
  printed: boolean;
  opened_at: string;
  order_total?: number; // From view
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  sum_price: number;
  type: string;
  status: string;
  prepared_by?: string;
  updated_at: string;
  order_item_id?: string; // From view
  session_id?: string; // From view
}

export interface SalesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface MenuState {
  activeSessionByRestaurant: any[];
  assignedTablesLoaded: boolean;
  tableSelected: boolean;
  assignedTables: any[];
  chosenTable: any | null;
  drinks: MenuItem[];
  originalDrinks: MenuItem[];
  meals: MenuItem[];
  orderTime: any;
  originalMeals: MenuItem[];
  drinksLoaded: boolean;
  mealsLoaded: boolean;
  mealsBackgroundColor: string;
  mealsColor: string;
  drinksBackgroundColor: string;
  drinksColor: string;
  filteredMeals: MenuItem[];
  filteredDrinks: MenuItem[];
  showSearch: boolean;
  showFilter: boolean;
  orders: any[];
  orderId: string | null;
  waiterName: string | null;
  orderItems: OrderItem[];
  originalOrders: any[];
  orderLoaded: boolean;
  totalOrdersQty: number;
  totalOrdersPrice: number;
  orderItemsLoaded: boolean;
  activeStep: number;
  steps: string[];
  proceedToCheckOut: boolean;
  proceedToPrint: boolean;
  cash: string;
  card: string;
  totalCashCardAmount: number;
  selectedTableOrders: any[];
  noTablesFound: boolean;
  bill_printed: boolean;
  searchMealValue: string;
  searchDrinkValue: string;
  selectedCategory: string;
  menuItems: MenuItem[];
  filteredMenuItems: MenuItem[];
  originalMenuItems: MenuItem[];
  menuItemsLoaded: boolean;
  loadingMenuItems: boolean;
  categories: Category[];
  loadingCategories: boolean;
  chosenTableSession: any;
  chosenTableOrderItems: any[];
  loadingActiveSessionByTableNumber: boolean;
  loadingActiveSessionByRestaurant: boolean;
  activeSeesionByTableNumberLoaded: boolean;
  activeSeesionByRestaurantLoaded: boolean;
  salesData: SalesData;
  loadingChart: boolean;
  sessionsChannel: RealtimeChannel | null;
  orderItemsChannel?: RealtimeChannel | null;
  currentOrder: any;
  loadingCurrentOrder: boolean;
  currentOrderItems: any[];
  loadingCurrentOrderItems: boolean;
  table?: any;

  setCurrentOrder: (order: any) => void;
  setCurrentOrderItems: (items: any[]) => void;
  createOrder: (session_id: string, restaurant_id: string) => Promise<void>;
  deleteOrderBySessionId: (session_id: string) => Promise<void>;
  getOrderBySessionId: (id: string) => Promise<any>;
  getOrderItemsByOrderId: (id: string) => Promise<any[]>;
  getOrderitemsBySessionId: (sessionId: string) => Promise<any[]>;
  setAssignedTables: (table: any[]) => void;
  subscribeToSessions: () => void;
  unsubscribeFromSessions: () => void;
  subscribeToOrderItems: () => void;
  unsubscribeFromOrderItems: () => void;
  fetchCategories: () => Promise<void>;
  fetchMenuItems: () => Promise<void>;
  setTableSelected: () => void;
  confirmPayment: () => Promise<void>;
  handleNext: () => Promise<void>;
  handleBack: () => void;
  resetStepper: () => void;
  formatCashInput: (amount: string | number) => string;
  getOrders: () => Promise<void>;
  filterMealsByCategory: (category: string, color: string, backgroundColor: string) => void;
  filterDrinksByCategory: (category: string, color: string, backgroundColor: string) => void;
  setChosenTable: (table: any) => Promise<void>;
  updateSessionStatus: (status: string) => Promise<void>;
  handlePrintBill: () => Promise<void>;
  addOrUpdateObject: (orderItem: MenuItem) => Promise<void>;
  updateQuantity: (item: any, action: 'increase' | 'decrease') => Promise<void>;
  handleRemoveItem: (item: any) => Promise<void>;
  isSelectedTable: (table: any) => boolean;
  getActiveSessionByRestaurant: () => Promise<void>;
  filterActiveSessionByTableNumber: (tableNumber: any) => Promise<void>;
  setSelectedCategory: (category: Category) => void;
  isSelectedCategory: (category: Category) => boolean;
  filterMenuItemsByCategory: () => void;
  setFilteredMenuItems: (menuItems: MenuItem[]) => void;
  fetchSalesData: () => Promise<void>;
  setCash: (value: string) => void;
  setCard: (value: string) => void;
  // Internal helper functions or state
  getAssigendTables: () => void; // Typo in original code
}

const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      activeSessionByRestaurant: [],
      assignedTablesLoaded: false,
      tableSelected: false,
      assignedTables: [],
      chosenTable: null,
      drinks: [],
      originalDrinks: [],
      meals: [],
      orderTime: null,
      originalMeals: [],
      drinksLoaded: false,
      mealsLoaded: false,
      mealsBackgroundColor: "#fff",
      mealsColor: "#000",
      drinksBackgroundColor: "#fff",
      drinksColor: "#000",
      filteredMeals: [],
      filteredDrinks: [],
      showSearch: false,
      showFilter: false,
      orders: [],
      orderId: null,
      waiterName: null,
      orderItems: [],
      originalOrders: [],
      orderLoaded: false,
      totalOrdersQty: 0,
      totalOrdersPrice: 0,
      orderItemsLoaded: false,
      activeStep: 0,
      steps: ["Select Menu Items", "Pay & Check Out"],
      proceedToCheckOut: false,
      proceedToPrint: false,
      cash: "",
      card: "",
      totalCashCardAmount: 0,
      selectedTableOrders: [],
      noTablesFound: false,
      bill_printed: false,
      searchMealValue: "",
      searchDrinkValue: "",
      selectedCategory: "",
      menuItems: [],
      filteredMenuItems: [],
      originalMenuItems: [],
      menuItemsLoaded: false,
      loadingMenuItems: false,
      categories: [],
      loadingCategories: false,
      chosenTableSession: [],
      chosenTableOrderItems: [],
      loadingActiveSessionByTableNumber: false,
      loadingActiveSessionByRestaurant: false,
      activeSeesionByTableNumberLoaded: false,
      activeSeesionByRestaurantLoaded: false,
      salesData: {
        labels: [],
        datasets: [],
      },
      loadingChart: false,
      sessionsChannel: null,
      currentOrder: {},
      loadingCurrentOrder: false,
      currentOrderItems: [],
      loadingCurrentOrderItems: false,

      setCash: (value) => set({ cash: value }),
      setCard: (value) => set({ card: value }),

      setCurrentOrder: (order) => set({ currentOrder: order }),
      setCurrentOrderItems: (items) => set({ currentOrderItems: items }),
      createOrder: async (session_id, restaurant_id) => {
        if (!session_id || !restaurant_id) {
          console.error("Session ID or Restaurant ID is missing");
          return;
        }

        const { data, error } = await supabase
          .from("orders")
          .insert([
            {
              session_id: session_id,
              restaurant_id: restaurant_id,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        set({ currentOrder: data });
      },

      deleteOrderBySessionId: async (session_id) => {
        if (!session_id) {
          console.error("Session ID is missing");
          return;
        }

        const { error } = await supabase
          .from("orders")
          .delete()
          .eq("session_id", session_id);

        if (error) throw error;

        set({ currentOrder: {} });
      },

      getOrderBySessionId: async (id) => {
        set({ loadingCurrentOrder: true });
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("session_id", id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching order:", error);
            set({ currentOrder: null });
            return null;
          }

          const orderData = data || null;
          set({ currentOrder: orderData });
          return orderData;
        } catch (error) {
          console.error("Unexpected error in getOrderBySessionId:", error);
          set({ currentOrder: null });
          return null;
        } finally {
          set({ loadingCurrentOrder: false });
        }
      },

      getOrderItemsByOrderId: async (id) => {
        set({ loadingCurrentOrderItems: true, currentOrderItems: [] });
        if (!id) {
          console.error("Order ID is missing");
          set({ loadingCurrentOrderItems: false });
          return [];
        }
        try {
          const { data, error } = await supabase
            .from("order_items_full")
            .select("*")
            .eq("order_id", id);

          if (error) throw error;

          set({ currentOrderItems: data || [] });

          const total = (data || []).reduce((sum, item) => sum + (item.sum_price || 0), 0);
          set({ totalOrdersPrice: total });

          return data || [];
        } catch (error) {
          console.error("Error fetching order items:", error);
          return [];
        } finally {
          set({ loadingCurrentOrderItems: false });
        }
      },

      getOrderitemsBySessionId: async (sessionId) => {
        set({ loadingCurrentOrderItems: true, currentOrderItems: [] });
        if (!sessionId) {
          console.error("Session ID is missing");
          set({ loadingCurrentOrderItems: false });
          return [];
        }
        try {
          const { data, error } = await supabase
            .from("order_items_full")
            .select("*")
            .eq("session_id", sessionId);

          if (error) throw error;

          set({ currentOrderItems: data || [] });

          const total = (data || []).reduce((sum, item) => sum + (item.sum_price || 0), 0);
          set({ totalOrdersPrice: total });

          return data || [];
        } catch (error) {
          console.error("Error fetching order items:", error);
          return [];
        } finally {
          set({ loadingCurrentOrderItems: false });
        }
      },

      setAssignedTables: (table) => set({ assignedTables: table }),

      subscribeToSessions: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = (selectedRestaurant as any)?.restaurants?.id;
        const { user } = useAuthStore.getState();
        const userId = user?.id;

        if (!restaurantId || !userId) return;

        const oldChannel = get().sessionsChannel;
        if (oldChannel) {
          supabase.removeChannel(oldChannel);
        }

        const channel = supabase
          .channel(`waiter-sessions-${userId}`)
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
              table: "order_items",
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

      subscribeToOrderItems: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = (selectedRestaurant as any)?.restaurants?.id;
        const { setSnackbar } = useTablesStore.getState() as any;

        if (!restaurantId) {
          console.warn("No restaurant selected for subscription");
          return;
        }

        const oldChannel = get().orderItemsChannel;
        if (oldChannel) {
          supabase.removeChannel(oldChannel);
        }

        const channel = supabase
          .channel(`kitchen-orders-${restaurantId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "order_items",
            },
            (payload) => {
              setSnackbar({
                open: true,
                autoHideDuration: 8000,
                message: "Kitchen order change detected.",
                severity: "info",
              });

              get().getActiveSessionByRestaurant();
              get().filterActiveSessionByTableNumber(get().chosenTable);
            }
          )
          .subscribe();

        set({ orderItemsChannel: channel });
      },

      unsubscribeFromOrderItems: () => {
        const channel = (get() as any).orderItemsChannel;
        if (channel) {
          supabase.removeChannel(channel);
          set({ orderItemsChannel: null });
        }
      },

      fetchCategories: async () => {
        set({ loadingCategories: true });
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = (selectedRestaurant as any)?.restaurants?.id;
        try {
          const { data, error } = await supabase
            .from("menu_categories")
            .select("*")
            .eq("restaurant_id", restaurantId);
          if (error) throw error;
          set({ categories: data || [] });
        } catch (error) {
          Swal.fire("Error", "Failed to fetch categories.", "error");
        } finally {
          set({ loadingCategories: false });
        }
      },

      fetchMenuItems: async () => {
        set({ loadingMenuItems: true });
        try {
          const restaurantId =
            (useRestaurantStore.getState().selectedRestaurant as any)?.restaurants?.id;
          if (!restaurantId) throw new Error("No restaurant selected");

          const { data, error } = await supabase
            .from("menu_items_with_category")
            .select("*")
            .eq("restaurant_id", restaurantId);

          if (error) throw error;
          set({
            menuItems: data || [],
            filteredMenuItems: data || [],
            menuItemsLoaded: true,
            originalMenuItems: data || [],
          });
        } catch (error) {
          console.error(error);
          Swal.fire("Error", "Failed to fetch menu items.", "error");
          set({
            menuItems: [],
            filteredMenuItems: [],
            menuItemsLoaded: false,
            originalMenuItems: [],
          });
        } finally {
          set({ loadingMenuItems: false });
        }
      },

      setTableSelected: () => {
        set({ tableSelected: false });
      },

      getAssigendTables: () => {
        get().getActiveSessionByRestaurant();
      },

      confirmPayment: async () => {
        const {
          cash,
          card,
          totalOrdersPrice,
          totalOrdersQty,
          orderId,
          waiterName,
          chosenTable,
          orderItems,
          getAssigendTables,
          resetStepper,
        } = get();

        const cashValue = parseFloat(cash) || 0;
        const cardValue = parseFloat(card) || 0;
        const totalPaid = cashValue + cardValue;
        const change = totalPaid - totalOrdersPrice;
        const changeValue = parseFloat(change.toFixed(2)) || 0;

        try {
          if (cashValue === 0 && cardValue === 0) {
            Swal.fire({
              title: `NO AMOUNT ENTERED`,
              text: `Please enter an amount in cash, card or both.`,
              icon: "error",
            });
            resetStepper();
            return;
          }

          if (totalPaid < totalOrdersPrice) {
            Swal.fire({
              title: `INSUFFICIENT PAYMENT`,
              text: `The total payment is ${(totalOrdersPrice - totalPaid).toFixed(2)} short.`,
              icon: "error",
            });
            resetStepper();
            return;
          }

          resetStepper();

          Swal.fire({
            title: "Confirm amounts!",
            html: `<h6>Cash: ${cashValue.toFixed(2)}</h6> <h6>Card: ${cardValue.toFixed(2)}</h6> <h6>Change: ${changeValue.toFixed(2)}</h6><hr/><h3><strong>Total: ${totalPaid.toFixed(2)}</strong><h3><hr/>`,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, confirmed!",
          }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
              const { error: OrderUpdateError } = await supabase
                .from("orders")
                .update({
                  cash: cashValue.toFixed(2),
                  card: cardValue.toFixed(2),
                  balance: changeValue.toFixed(2),
                  total: totalOrdersPrice,
                  status: "served",
                  printed: true,
                })
                .eq("id", orderId)
                .select();

              if (OrderUpdateError) {
                Swal.fire({
                  title: "Order Update Failed",
                  text: OrderUpdateError.message,
                  icon: "error",
                });
                return;
              }

              const { error: tableError } = await supabase
                .from("tables")
                .update({
                  status: "available",
                  assign: null,
                })
                .eq("table_no", chosenTable)
                .select();

              if (tableError) throw tableError;

              printReceipt(
                orderId!,
                waiterName!,
                chosenTable!,
                totalOrdersQty,
                totalOrdersPrice,
                orderItems,
                totalPaid.toFixed(2),
                cashValue.toFixed(2),
                cardValue.toFixed(2),
                changeValue.toFixed(2)
              );

              Swal.fire({
                title: "Payment Successful!",
                text: "Receipt is being printed.",
                icon: "success",
              });

              const details = {
                "Order ID": orderId,
                "Total Amount": totalOrdersPrice,
                "Amount Paid": totalPaid,
                "Cash Paid": cashValue,
                "Card Paid": cardValue,
                Change: changeValue,
              };

              database_logs(waiterName!, "PAYMENT_CONFIRMED", details);

              set({
                cash: "",
                card: "",
                totalCashCardAmount: 0,
                totalOrdersPrice: 0,
                totalOrdersQty: 0,
                orderItems: [],
                proceedToPrint: true,
                originalOrders: [],
                orders: [],
                orderId: null,
                waiterName: null,
                tableSelected: false,
                selectedTableOrders: [],
                chosenTable: null,
              });

              getAssigendTables();
            } catch (error) {
              handleError(error);
            }
          });
        } catch (error: any) {
          handleError(error);
          database_logs(waiterName!, "PAYMENT_FAILED", error);
        }
      },

      handleNext: async () => {
        if (get().activeStep === 1) {
          await get().confirmPayment();
        }
        set((state) => ({
          activeStep: state.activeStep + 1,
          proceedToCheckOut: true,
        }));
      },

      handleBack: () => {
        set((state) => ({
          activeStep: state.activeStep - 1,
          proceedToCheckOut: false,
        }));
      },

      resetStepper: () => {
        set(() => ({
          activeStep: 0,
        }));
      },

      formatCashInput: (amount) => {
        const numericValue = String(amount).replace(/[^0-9.]/g, "");
        if (numericValue === "") return "";
        const formattedValue = parseFloat(numericValue).toFixed(2);
        return formattedValue;
      },

      getOrders: async () => {
        try {
          const { data, error } = await supabase
            .from("waiter_orders_overview")
            .select("*")
            .or(`session_status.eq.open,session_status.eq.billed`)
            .order("id", { ascending: true });
          if (error) throw error;
          set({ orders: data || [], originalOrders: data || [], orderLoaded: true });
        } catch (error) {
          handleError(error);
        }
      },

      filterMealsByCategory: (category, color, backgroundColor) => {
        const { originalMeals } = get();

        if (category === "fetch_all") {
          set({
            meals: originalMeals,
            mealsBackgroundColor: backgroundColor,
            mealsColor: color,
            searchMealValue: "",
          });
        } else {
          const filteredMeals = originalMeals.filter(
            (meal) => meal.category_name?.toLowerCase() === category.toLowerCase()
          );
          set({
            meals: filteredMeals,
            mealsBackgroundColor: backgroundColor,
            mealsColor: color,
            searchMealValue: "",
          });
        }
      },

      filterDrinksByCategory: (category, color, backgroundColor) => {
        const { originalDrinks } = get();

        if (category === "fetch_all") {
          set({
            drinks: originalDrinks,
            drinksBackgroundColor: backgroundColor,
            drinksColor: color,
            searchDrinkValue: "",
          });
        } else {
          const filteredDrinks = originalDrinks.filter(
            (drink) =>
              drink.category_name &&
              drink.category_name.toLowerCase() === category.toLowerCase()
          );
          set({
            drinks: filteredDrinks,
            drinksBackgroundColor: backgroundColor,
            drinksColor: color,
            searchDrinkValue: "",
          });
        }
      },

      setChosenTable: async (table) => {
        const { chosenTable, resetStepper, filterActiveSessionByTableNumber } =
          get();

        if (chosenTable === table.table_number) {
          set({
            chosenTable: null,
            tableSelected: false,
            proceedToCheckOut: false,
            orderItems: [],
            totalOrdersQty: 0,
            totalOrdersPrice: 0,
            orderItemsLoaded: false,
            waiterName: null,
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
        const { chosenTableSession } = get();
        const { error } = await supabase
          .from("table_sessions")
          .update({ status })
          .eq("table_id", chosenTableSession.table_id)
          .eq("restaurant_id", chosenTableSession.restaurant_id)
          .select();

        if (error) {
          handleError(error);
        }

        get().filterActiveSessionByTableNumber(get().chosenTable);
      },

      handlePrintBill: async () => {},

      addOrUpdateObject: async (orderItem) => {
        const { selectedSession } = useTablesStore.getState() as any;
        const { currentOrder } = get();

        if (!orderItem || !selectedSession || !currentOrder) {
          throw new Error("Missing required data");
        }

        const { data: existingItem, error: fetchError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", currentOrder.id)
          .eq("menu_item_id", orderItem.id)
          .limit(1)
          .maybeSingle();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error checking existing item:', fetchError);
          return;
        }

        let newQuantity = 1;
        let newPrice = orderItem.price || 0;

        if (existingItem) {
          newQuantity = existingItem.quantity + 1;
          newPrice = existingItem.sum_price + orderItem.price;
        }

        const { data, error } = await supabase
          .from("order_items")
          .upsert({
            ...(existingItem && { id: existingItem.id }),
            order_id: currentOrder.id,
            menu_item_id: orderItem.id,
            quantity: newQuantity,
            unit_price: orderItem.price,
            sum_price: newPrice,
            type: orderItem.type,
            status: "pending",
            prepared_by: null,
            updated_at: new Date().toISOString(),
          })
          .select()
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (orderItem?.type === 'food') {
          const { error: kitchenTaskError } = await supabase
            .from("kitchen_tasks")
            .insert([
              {
                order_id: currentOrder.id,
                order_item_id: data.id,
                menu_item_id: orderItem.id,
                created_at: new Date().toISOString(),
              },
            ])
            .select()
            .limit(1)
            .single();

          if (kitchenTaskError) throw kitchenTaskError;
        }
        get().getOrderItemsByOrderId(currentOrder.id);
      },

      updateQuantity: async (item, action) => {
        try {
          let newQuantity;
          let new_sum_price;
          if(action === "increase") {
            newQuantity = item.quantity + 1;
            new_sum_price = item.unit_price * newQuantity;
          } else if(action === "decrease") {
            newQuantity = item.quantity - 1;
            if (newQuantity < 1) return; // Prevent 0 or negative
            new_sum_price = item.unit_price * newQuantity;
          } else {
            console.warn('Invalid action for quantity update');
            return;
          }
          const { error } = await supabase
            .from("order_items")
            .update({ quantity: newQuantity, sum_price: new_sum_price })
            .eq("id", item.order_item_id)
            .select()
            .single();

          if (error) throw error;

          get().getOrderItemsByOrderId(get().currentOrderItems[0]?.order_id);
        } catch (error) {
          console.error("Error updating quantity:", error);
          handleError(error);
        }
      },

      handleRemoveItem: async (item) => {
        try{
          const updatedOrders = get().currentOrderItems.filter(
            (order) => order.order_item_id !== item?.order_item_id
          );
          const total = get().totalOrdersPrice - item.sum_price;

          set({
            currentOrderItems: updatedOrders,
            totalOrdersPrice: total,
          }); 

          const { error: ordersItemsError } = await supabase
            .from("order_items")
            .delete()
            .eq("id", item?.order_item_id);

          if (ordersItemsError) {
            handleError(ordersItemsError);
          }

          const { error: ordersError } = await supabase
            .from("orders")
            .update({ total: total })
            .eq("id", get().currentOrderItems[0]?.order_id)
            .select();

          if (ordersError) {
            handleError(ordersError);
          }

          get().filterActiveSessionByTableNumber(get().chosenTable);
        } catch (error) {
          handleError(error);
        }
      },

      isSelectedTable: (table) => get().chosenTable === table.table_number,

      getActiveSessionByRestaurant: async () => {
        set({
          loadingActiveSessionByRestaurant: true,
        });
        try {
          const restaurantId = (useRestaurantStore?.getState()?.selectedRestaurant as any)?.restaurants?.id;
          const userId = useAuthStore?.getState()?.user?.id;

          if (!restaurantId || !userId) return;

          let { data: waiter_orders_overview, error } = await supabase
            .from("waiter_orders_overview")
            .select("*")
            .eq("restaurant_id", restaurantId)
            .eq("waiter_id", userId);

          if (error) throw error;

          set({
            assignedTablesLoaded: true,
            assignedTables: waiter_orders_overview || [],
            activeSeesionByRestaurantLoaded: true,
          });
        } catch (error) {
          handleError(error);
        } finally {
          set({
            loadingActiveSessionByRestaurant: false,
          });
        }
      },

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

          set({
            chosenTableSession: waiter_orders_overview,
            chosenTableOrderItems: waiter_orders_overview?.order_items || [],
            activeSeesionByTableNumberLoaded: true,
          });
        } catch (error) {
          handleError(error);
        } finally {
          set({
            loadingActiveSessionByTableNumber: false,
          });
        }
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category.name });
        get().filterMenuItemsByCategory();
      },

      isSelectedCategory: (category) =>
        get().selectedCategory === category.name,

      filterMenuItemsByCategory: () => {
        const { selectedCategory, menuItems } = get();

        if (!selectedCategory) return;
        set({
          filteredMenuItems: menuItems.filter(
            (item) =>
              item.category_name?.toLowerCase() ===
              selectedCategory.toLowerCase()
          ),
        });
      },

      setFilteredMenuItems: (menuItems) => {
        set({ filteredMenuItems: menuItems });
      },

      fetchSalesData: async () => {
        const user = useAuthStore.getState().user;

        if (!user) {
          console.error("User is not set. Please call fetchUser first.");
          return;
        }

        try {
          const orders = get().assignedTables;

          const validOrders = orders.filter(
            (order) => order.order_total !== null
          );

          const salesByDay = validOrders.reduce((acc: any, order) => {
            const dayOfWeek = new Date(order.opened_at).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
              }
            );
            acc[dayOfWeek] = (acc[dayOfWeek] || 0) + Number(order.order_total);
            return acc;
          }, {});

          const daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          const salesDataArray = daysOfWeek.map((day) => ({
            day,
            total: salesByDay[day] || 0,
          }));

          set({
            salesData: {
              labels: salesDataArray.map((d) => d.day),
              datasets: [
                {
                  label: "Sales Performance (Last 7 Days)",
                  data: salesDataArray.map((d) => d.total),
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
              ],
            },
            loadingChart: false,
          });
        } catch (error) {
          handleError(error);
        }
      },
    }),
    {
      name: "menuStore",
      version: 1,
      partialize: (state) => ({
        assignedTables: state.assignedTables,
        chosenTable: state.chosenTable,
        chosenTableOrderItems: state.chosenTableOrderItems,
        chosenTableSession: state.chosenTableSession,
      }),
    }
  )
);

export default useMenuStore;
