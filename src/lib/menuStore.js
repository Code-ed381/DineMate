import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useRestaurantStore from '../lib/restaurantStore';
import useAuthStore from '../lib/authStore';
import { supabase } from './supabase';
import { handleError } from '../components/Error';
import Swal from 'sweetalert2';
import { printReceipt } from "../components/PrintWindow";
import { database_logs } from './logActivities';

// Create the menu store with zustand
const useMenuStore = create(
  persist(
    (set, get) => ({
      activeSessionByRestaurant: [],
      assignedTablesLoaded: false,
      tableSelected: false,
      assignedTables: [],
      chosenTable: null, // State to track the selected table
      drinks: [],
      originalDrinks: [], // State to store the original drinks data
      meals: [],
      orderTime: null,
      originalMeals: [], // State to store the original meals data
      drinksLoaded: false,
      mealsLoaded: false,
      mealsBackgroundColor: "#fff",
      mealsColor: "#000",
      drinksBackgroundColor: "#fff",
      drinksColor: "#000",
      filteredMeals: [], // State for filtered meals
      filteredDrinks: [], // State for filtered drinks
      showSearch: false, // State to track visibility of search
      showFilter: false, // State to track visibility of category filters
      orders: [], // State to store orders
      orderId: null, // State to store order ID
      waiterName: null, // State to store waiter name
      orderItems: [], // State to store orders
      originalOrders: [], // State to store orders
      orderLoaded: false, // State to track if orders are loaded
      totalOrdersQty: 0,
      totalOrdersPrice: 0,
      orderItemsLoaded: false, // State to track loading status
      activeStep: 0, // State to track the current step
      steps: ["Select Menu Items", "Pay & Check Out"], // Stepper steps
      proceedToCheckOut: false, // State to track if checkout is in progress
      proceedToPrint: false, // State to track if print is in progress
      cash: "", // State to store cash input
      card: "", // State to store card input
      totalCashCardAmount: 0, // State to store total cash and card amount
      selectedTableOrders: [], // State to store selected table orders
      noTablesFound: false, // State to track if no tables are found
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

      setAssignedTables: (table) => set({ assignedTables: table }),

      subscribeToSessions: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;
        const { user } = useAuthStore.getState();
        const userId = user?.user?.id;

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
            (payload) => {
              console.log("Session update:", payload);
              get().getActiveSessionByRestaurant();
            }
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "order_items",
              // filter: `restaurant_id=eq.${restaurantId}`,
            },
            (payload) => {
              console.log("Order item update:", payload);
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

      // Fetch categories
      fetchCategories: async () => {
        set({ loadingCategories: true });
        try {
          const { data, error } = await supabase
            .from("menu_categories")
            .select("*")
            .eq(
              "restaurant_id",
              useRestaurantStore.getState().selectedRestaurant.restaurants.id
            );
          if (error) throw error;
          set({ categories: data });
        } catch (error) {
          Swal.fire("Error", "Failed to fetch categories.", "error");
        } finally {
          set({ loadingCategories: false });
        }
      },

      // Fetch menu items
      fetchMenuItems: async () => {
        set({ loadingMenuItems: true });
        try {
          const restaurantId =
            useRestaurantStore.getState().selectedRestaurant?.restaurants?.id;
          if (!restaurantId) throw new Error("No restaurant selected");

          const { data, error } = await supabase
            .from("menu_items_with_category")
            .select("*")
            .eq("restaurant_id", restaurantId);

          if (error) throw error;
          console.log(data);
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
          }); // 👈 fallback
        } finally {
          set({ loadingMenuItems: false });
        }
      },

      setTableSelected: () => {
        set({ tableSelected: false });
      },

      // Confirm payment function
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

        const cashValue = parseFloat(cash) || 0; // Convert cash to a number
        const cardValue = parseFloat(card) || 0; // Convert card to a number
        const totalPaid = cashValue + cardValue; // Calculate total paid
        const change = totalPaid - totalOrdersPrice; // Calculate change
        const changeValue = parseFloat(change) || 0;

        try {
          if (cashValue === 0 && cardValue === 0) {
            Swal.fire({
              title: `NO AMOUNT ENTERED`,
              text: `Please enter an amount in cash, card or both.`,
              icon: "error",
            });
            resetStepper(); // Reset stepper if no payment is entered
            return;
          }

          if (totalPaid < totalOrdersPrice) {
            Swal.fire({
              title: `INSUFFICIENT PAYMENT`,
              text: `The total payment is ${
                totalOrdersPrice - totalPaid
              } short.`,
              icon: "error",
            });
            resetStepper(); // Reset stepper if no payment is entered
            return;
          }

          resetStepper(); // Reset stepper after payment confirmation

          Swal.fire({
            title: "Confirm amounts!",
            html: `<h6>Cash: ${cashValue.toFixed(
              2
            )}</h6> <h6>Card: ${cardValue.toFixed(
              2
            )}</h6> <h6>Change: ${changeValue.toFixed(
              2
            )}</h6><hr/><h3><strong>Total: ${totalPaid.toFixed(
              2
            )}</strong><h3><hr/>`,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, confirmed!",
          }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
              // First: update the orders table
              const { error: OrderItemError } = await supabase
                .from("orders")
                .update({
                  cash: cashValue.toFixed(2) || 0,
                  card: cardValue.toFixed(2) || 0,
                  balance: changeValue.toFixed(2) || 0,
                  total: totalOrdersPrice,
                  status: "served",
                  printed: true,
                })
                .eq("id", orderId)
                .select();

              if (OrderItemError) {
                Swal.fire({
                  title: "Order Update Failed",
                  text: OrderItemError.message,
                  icon: "error",
                });
                return; // ⛔ Stop here if updating orders fails
              }

              // ✅ Only update tables if orders update was successful
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
                orderId,
                waiterName,
                chosenTable,
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

              database_logs(waiterName, "PAYMENT_CONFIRMED", details);

              // 🔄 Reset state
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
        } catch (error) {
          handleError(error); // Handle error if payment confirmation fails

          database_logs(waiterName, "PAYMENT_FAILED", error);
        }
      },

      // Action to move to the next step
      handleNext: async () => {
        if (get().activeStep === 1) {
          // Confirm payment before moving to the next step
          await get().confirmPayment();
        }
        set((state) => ({
          activeStep: state.activeStep + 1,
          proceedToCheckOut: true, // Set checkout state when moving to the next step
        }));
      },

      // Action to move to the previous step
      handleBack: () => {
        set((state) => ({
          activeStep: state.activeStep - 1,
          proceedToCheckOut: false, // Reset checkout state when going back
        }));
      },

      // Action to reset the stepper
      resetStepper: () => {
        set(() => ({
          activeStep: 0,
        }));
      },

      // Function to format cash input
      formatCashInput: (amount) => {
        // Ensure the input is a string
        const numericValue = String(amount).replace(/[^0-9.]/g, ""); // Allow only numbers and a single decimal point
        // If the input is empty, return an empty string
        if (numericValue === "") return "";
        // Convert to a number and format it to two decimal places
        const formattedValue = parseFloat(numericValue).toFixed(2);
        return formattedValue;
      },

      // Fetch orders from the database
      getOrders: async () => {
        try {
          const { data, error } = await supabase
            .from("waiter_orders_overview")
            .select("*")
            .or(`session_status.eq.open,session_status.eq.billed`) // Fetch open and billed orders
            .order("id", { ascending: true }); // Order by id in ascending order
          if (error) throw error;
          set({ orders: data, originalOrders: data, orderLoaded: true });
        } catch (error) {
          // Handle the error using the error handler
          handleError(error);
        }
      },

      // Fliter meals by category
      filterMealsByCategory: (category, color, backgroundColor) => {
        const { originalMeals } = get(); // Access the meals & originalMeals state using get()

        if (category === "fetch_all") {
          set({
            meals: originalMeals,
            mealsBackgroundColor: backgroundColor,
            mealsColor: color,
            searchMealValue: "",
          });
        } else {
          const filteredMeals = originalMeals.filter(
            (meal) => meal.category.toLowerCase() === category.toLowerCase()
          );
          set({
            meals: filteredMeals,
            mealsBackgroundColor: backgroundColor,
            mealsColor: color,
            searchMealValue: "",
          });
        }
      },

      // Filter drinks by category
      filterDrinksByCategory: (category, color, backgroundColor) => {
        const { originalDrinks } = get(); // Access the drinks state using get()

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
              drink.category &&
              drink.category.toLowerCase() === category.toLowerCase()
          );
          set({
            drinks: filteredDrinks,
            drinksBackgroundColor: backgroundColor,
            drinksColor: color,
            searchDrinkValue: "",
          });
        }
      },

      // Set the selected table
      setChosenTable: async (table) => {
        const { chosenTable, resetStepper, filterActiveSessionByTableNumber } =
          get(); // Access the current chosen table, original orders, and resetStepper

        // Check if the table is already selected
        if (chosenTable === table.table_number) {
          // Unselect the table and reset the state
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
          resetStepper(); // Reset the stepper
          return; // Exit the function
        }

        // If a new table is selected
        set({
          chosenTable: table.table_number,
          tableSelected: true,
          proceedToCheckOut: false,
          table: table,
        }); // Set the chosen table and reset checkout state
        resetStepper(); // Reset the stepper when a new table is chosen

        await filterActiveSessionByTableNumber(table.table_number);
      },

      // Function to update the printed status in the state and database
      updateSessionStatus: async (status) => {
        const { chosenTableSession } = get();
        const { data, error } = await supabase
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

      // Function to update the printed status in the state and database
      handlePrintBill: async () => {},

      // Function to add or update an order item
      addOrUpdateObject: async (orderItem) => {
        const { chosenTableSession, chosenTableOrderItems } = get();

        const match = chosenTableOrderItems.find(
          (item) => item.menu_item_id === orderItem.id
        );

        if (match) {
          console.log(match);

          let orderTotal = chosenTableSession.order_total;
          const newQuantity = match.quantity + 1;
          orderTotal += match.price;

          const { data, error } = await supabase
            .from("order_items")
            .update({
              quantity: newQuantity,
            })
            .eq("id", match.id)
            .select();

          if (error) {
            handleError(error);
          }

          const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .update({ total: orderTotal })
            .eq("id", chosenTableSession?.order_id)
            .select();

          if (ordersError) {
            handleError(ordersError);
          }

          // get().getActiveSessionByRestaurant();
          get().filterActiveSessionByTableNumber(get().chosenTable);
        } else {
          const { data, error } = await supabase
            .from("order_items")
            .insert([
              {
                order_id: chosenTableSession?.order_id,
                menu_item_id: orderItem.id,
                quantity: 1,
                price: orderItem.price,
                type: orderItem.type,
              },
            ])
            .select();

          if (error) {
            handleError(error);
          }

          const { data: orders, error: ordersError } = await supabase.rpc(
            "increment_total",
            {
              session_id: chosenTableSession?.session_id,
              amount: orderItem.price,
            }
          );

          if (ordersError) {
            handleError(ordersError);
          }

          // get().getActiveSessionByRestaurant();
          get().filterActiveSessionByTableNumber(get().chosenTable);
        }

        // Find existing item index in the selected table orders
        // const existingIndex = orderItems.findIndex((item) => {
        //   return isDrink
        //     ? item.drinks && item.drinks.id === Number(orderItem.id)
        //     : item.menuItems && item.menuItems.id === Number(orderItem.id);
        // });

        // if (existingIndex !== -1) {
        //   // If the item already exists, update its quantity and total
        //   const updatedItems = [...orderItems];
        //   updatedItems[existingIndex].quantity += 1;
        //   updatedItems[existingIndex].total =
        //     updatedItems[existingIndex].quantity *
        //     (isDrink
        //       ? updatedItems[existingIndex].drinks.price
        //       : updatedItems[existingIndex].menuItems.price);

        //   // Update state
        //   const totalQuantity = updatedItems.reduce(
        //     (acc, cur) => acc + cur.quantity,
        //     0
        //   );
        //   const totalPrice = updatedItems.reduce((acc, cur) => acc + cur.total, 0);

        //   set({
        //     orderItems: updatedItems,
        //     totalOrdersQty: totalQuantity,
        //     totalOrdersPrice: totalPrice.toFixed(2),
        //   });

        //   // Update Supabase
        //   const { error } = await supabase
        //     .from("ordersItems")
        //     .update({
        //       quantity: updatedItems[existingIndex].quantity,
        //       total: updatedItems[existingIndex].total.toFixed(2),
        //     })
        //     .eq("id", updatedItems[existingIndex].id)
        //     .select();

        //   if (error) {
        //     handleError(error);
        //   }
        // } else {
        //   // If the item does not exist, create a new one
        //   const { data: lastItem, error: fetchError } = await supabase
        //     .from("ordersItems")
        //     .select("id")
        //     .order("id", { ascending: false })
        //     .limit(1)
        //     .single();

        //   if (fetchError) {
        //     handleError(fetchError);
        //     return;
        //   }

        //   const nextId = lastItem ? lastItem.id + 1 : 1;

        //   const newItem = {
        //     id: nextId,
        //     created_at: new Date().toISOString(),
        //     ...(isDrink ? { drinks: orderItem } : { menuItems: orderItem }),
        //     order_no: orderId,
        //     quantity: 1,
        //     total: orderItem.price,
        //     type: orderItem.type,
        //   };

        //   const updatedItems = [...orderItems, newItem];
        //   const totalQuantity = updatedItems.reduce(
        //     (acc, cur) => acc + cur.quantity,
        //     0
        //   );
        //   const totalPrice = updatedItems.reduce((acc, cur) => acc + cur.total, 0);

        //   set({
        //     orderItems: updatedItems,
        //     totalOrdersQty: totalQuantity,
        //     totalOrdersPrice: totalPrice.toFixed(2),
        //   });

        //   // Add new item to Supabase
        //   const { error } = await supabase
        //     .from("ordersItems")
        //     .insert({
        //       ...(isDrink ? { drinks: orderItem.id } : { item: orderItem.id }), // Replace key names as per schema
        //       order_no: orderId,
        //       quantity: newItem.quantity,
        //       total: newItem.total,
        //       type: orderItem.type,
        //     })
        //     .select();

        //   if (error) {
        //     handleError(error);
        //   }
        // }
      },

      // Function to delete an order item
      handleRemoveItem: async (item) => {
        const { chosenTableOrderItems, chosenTableSession } = get();
        try {
          const item_total = item?.quantity * item?.price;

          let order_total = chosenTableSession?.order_total;

          order_total -= item_total;

          console.log(order_total);

          // Step 1: Remove item from selectedTableOrders state
          const updatedOrders = chosenTableOrderItems.filter(
            (order) => order.id !== item?.id
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
            .from("order_items")
            .delete()
            .eq("id", item?.id); // Delete the specific item by ID

          if (ordersItemsError) {
            handleError(ordersItemsError);
          }

          const { error: ordersError } = await supabase
            .from("orders")
            .update({ total: order_total })
            .eq("id", chosenTableSession?.order_id)
            .select();

          if (ordersError) {
            handleError(ordersError);
          }

          get().filterActiveSessionByTableNumber(get().chosenTable);
        } catch (error) {
          handleError(error);
        }
      },

      // Check if a table is selected
      isSelectedTable: (table) => get().chosenTable === table.table_number,

      // Function to get active session by restaurant & waiter
      getActiveSessionByRestaurant: async () => {
        set({
          loadingActiveSessionByRestaurant: true,
        });
        try {
          let { data: waiter_orders_overview, error } = await supabase
            .from("waiter_orders_overview")
            .select("*")
            .eq(
              "restaurant_id",
              useRestaurantStore?.getState()?.selectedRestaurant?.restaurants
                ?.id
            )
            .eq("waiter_id", useAuthStore?.getState()?.user?.user?.id);

          if (error) throw error;

          console.log("waiter_orders_overview", waiter_orders_overview);

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

          console.log(waiter_orders_overview.order_items);

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

      setSelectedCategory: (category) => {
        set({ selectedCategory: category.name });

        get().filterMenuItemsByCategory();
      },

      // Check if a category is selected
      isSelectedCategory: (category) =>
        get().selectedCategory === category.name,

      // Function to filter menu items by category
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

          // Filter valid orders (order_total not null)
          const validOrders = orders.filter(
            (order) => order.order_total !== null
          );

          // Group by day of the week
          const salesByDay = validOrders.reduce((acc, order) => {
            const dayOfWeek = new Date(order.opened_at).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
              }
            );
            acc[dayOfWeek] = (acc[dayOfWeek] || 0) + Number(order.order_total);
            return acc;
          }, {});

          // Ensure all 7 days are present
          const daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          const salesDataArray = daysOfWeek?.map((day) => ({
            day,
            total: salesByDay[day] || 0,
          }));

          console.log("salesDataArray", salesDataArray);

          // Shape for Chart.js Bar
          set({
            salesData: {
              labels: salesDataArray?.map((d) => d.day),
              datasets: [
                {
                  label: "Sales Performance (Last 7 Days)",
                  data: salesDataArray?.map((d) => d.total),
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