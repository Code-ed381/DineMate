import { create } from 'zustand';
import useRestaurantStore from '../lib/restaurantStore';
import useAuthStore from '../lib/authStore';
import { supabase } from './supabase';
import { handleError } from '../components/Error';
import Swal from 'sweetalert2';
import { printReceipt } from "../components/PrintWindow";
import { database_logs } from './logActivities';

// Create the menu store with zustand
const useMenuStore = create((set, get) => ({
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

  setBillPrinted: (value) => set({ bill_printed: value }),

  setTableSelected: () => {
    set({ tableSelected: false });
  },

  // Set cash value
  setCash: (value) => {
    if (/^\d{0,10}(\.\d{0,2})?$/.test(value)) {
      // Regex to allow only numbers and up to 2 decimal places
      set({ cash: value });
    }
  },

  // Set card value
  setCard: (value) => {
    if (/^\d{0,10}(\.\d{0,2})?$/.test(value)) {
      // Regex to allow only numbers and up to 2 decimal places
      set({ card: value });
    }
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
          text: `The total payment is ${totalOrdersPrice - totalPaid} short.`,
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
        .from("orders")
        .select(`*, waiter(*), table(*)`)
        .eq("status", "pending") // Fetch only pending orders
        .order("id", { ascending: true }); // Order by id in ascending order
      if (error) throw error;
      set({ orders: data, originalOrders: data, orderLoaded: true });
    } catch (error) {
      // Handle the error using the error handler
      handleError(error);
    }
  },

  // Fetch drinks from the database
  getDrinks: async () => {
    try {
      const { data, error } = await supabase.from("drinks").select("*");
      if (error) throw error;
      set({ drinks: data, originalDrinks: data, drinksLoaded: true });
    } catch (error) {
      // Handle the error using the error handler
      handleError(error);
    }
  },

  // Fetch meals from the database
  getMeals: async () => {
    try {
      const { data, error } = await supabase.from("menuItems").select("*");
      if (error) throw error;
      set({ meals: data, originalMeals: data, mealsLoaded: true }); // Store both original and filtered meals
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

  // Search Meals
  searchMeals: (searchTerm) => {
    const { originalMeals } = get(); // Always use originalMeals to filter from full dataset

    if (searchTerm === "") {
      set({
        meals: originalMeals,
        searchMealValue: searchTerm,
        mealsBackgroundColor: "#fff",
      }); // Reset to original meals if search is empty
    } else {
      const filtered = originalMeals.filter((meal) => {
        const values = Object.values(meal);
        return values.some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      set({
        meals: filtered,
        searchMealValue: searchTerm,
        mealsBackgroundColor: "#fff",
        mealsColor: "#00000",
      });
    }
  },

  // Search drinks
  searchDrinks: (searchTerm) => {
    const { originalDrinks } = get(); // Access the drinks state

    if (searchTerm === "") {
      set({
        drinks: originalDrinks,
        searchDrinkValue: searchTerm,
        drinksBackgroundColor: "#fff",
      }); // Reset to original drinks if search is empty
    } else {
      const filtered = originalDrinks.filter((drink) => {
        const values = Object.values(drink);
        return values.some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      set({
        drinks: filtered,
        searchDrinkValue: searchTerm,
        drinksBackgroundColor: "#fff",
        drinksColor: "#00000",
      });
    }
  },

  // Toggle the search visibility
  toggleSearchVisibility: () => {
    set((state) => {
      return { showSearch: !state.showSearch };
    });
  },

  // Toggle the filter visibility
  toggleFilterVisibility: () => {
    set((state) => {
      return { showFilter: !state.showFilter };
    });
  },

  // Fetch assigned tables
  getAssigendTables: async () => {
    const stringifiedUser = localStorage.getItem("employee");
    const user = stringifiedUser ? JSON.parse(stringifiedUser) : null;
    if (!user) {
      console.error("User not found in local storage");
      return;
    }
    const { id } = user[0];

    try {
      const { data, error } = await supabase
        .from("tables")
        .select(
          `
                    *,
                    assign!inner(id, name)
                `
        ) // Use `!inner` to join and filter the `assign` relationship
        .eq("status", "occupied")
        .eq("assign.id", id); // Filter by assign.id matching the user id
      if (error) throw error;

      // Check if any tables were found
      if (data.length === 0) {
        // No tables found
        set({
          assignedTables: [],
          assignedTablesLoaded: true,
          noTablesFound: true,
          tableSelected: false,
        });
      } else {
        // Tables found
        set({
          assignedTables: data,
          assignedTablesLoaded: true,
          noTablesFound: false,
        });
      }
    } catch (error) {
      // Handle the error using the error handler
      handleError(error);
    }
  },

  // Set the selected table
  setChosenTable: async (table) => {
    const { chosenTable, originalOrders, resetStepper } = get(); // Access the current chosen table, original orders, and resetStepper

    // Check if the table is already selected
    if (chosenTable === table.table_no) {
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
      });
      resetStepper(); // Reset the stepper
      return; // Exit the function
    }

    // If a new table is selected
    set({
      chosenTable: table.table_no,
      tableSelected: true,
      proceedToCheckOut: false,
    }); // Set the chosen table and reset checkout state
    resetStepper(); // Reset the stepper when a new table is chosen

    // Filter orders based on the selected table
    const filteredOrders = originalOrders.filter(
      (order) => order.table?.id === Number(table.id)
    );

    if (filteredOrders.length > 0) {
      try {
        const { data: orderItems, error: itemsError } = await supabase
          .from("ordersItems")
          .select(`*, menuItems(*), drinks(*), orders(*, waiter(*), table(*))`)
          .eq("order_no", filteredOrders[0].id); // Fetch order items for the selected table

        if (itemsError) throw itemsError; // Handle error if fetching order items fails
        const totalOrdersQty = orderItems.reduce(
          (acc, item) => acc + item.quantity,
          0
        ); // Calculate total quantity
        const totalOrdersPrice = orderItems.reduce(
          (acc, item) => acc + item.total,
          0
        ); // Calculate total price

        // Update the state with order items and totals
        set({
          orderItems: orderItems,
          totalOrdersQty,
          totalOrdersPrice,
          orderTime: filteredOrders[0].created_at,
          orderItemsLoaded: true,
          waiterName: filteredOrders[0].waiter.name, // Set the waiter name from the first order
          orderId: filteredOrders[0].id, // Set the order ID from the first order
          bill_printed: filteredOrders[0].bill_printed,
        });
      } catch (error) {
        // Handle the error using the error handler
        handleError(error);
      }
    } else {
      set({
        orders: [], // Reset orders if no orders found for the selected table
        totalOrdersQty: 0,
        totalOrdersPrice: 0,
      });
    }
  },

  // Function to update the printed status in the state and database
  updatePrintedStatus: async (orderId) => {
    const { orderItems } = get(); // Access the order items state

    // Update locally in selectedTableOrders
    const updatedOrders = orderItems.map((item) => ({
      ...item,
      orders: {
        ...item.orders,
        printed: true, // Update the printed status
      },
    }));
    set({ orderItems: updatedOrders });

    // Update Supabase for all matching orders
    const { error } = await supabase
      .from("orders")
      .update({ printed: true })
      .eq("id", orderId)
      .select();
    if (error) {
      handleError(error); // Handle error if updating Supabase fails
    }
  },

  // Function to update the printed status in the state and database
  updatePrintedBillStatus: async (orderId) => {
    const { orderItems } = get(); // Access the order items state

    // Update locally in selectedTableOrders
    const updatedOrders = orderItems.map((item) => ({
      ...item,
      orders: {
        ...item.orders,
        printed: true, // Update the printed status
        bill_printed: true,
      },
    }));
    set({ orderItems: updatedOrders });

    // Update Supabase for all matching orders
    const { error } = await supabase
      .from("orders")
      .update({ printed: true, bill_printed: true })
      .eq("id", orderId)
      .select();
    if (error) {
      handleError(error); // Handle error if updating Supabase fails
    }
  },

  // Function to add or update an order item
  addOrUpdateObject: async (orderItem) => {
    const { orderItems, orderId, bill_printed, setBillPrinted } = get();
    const isDrink = orderItem.type === "drink";

    if (bill_printed === true) {
      // Update locally in selectedTableOrders
      const updatedOrders = orderItems.map((item) => ({
        ...item,
        orders: {
          ...item.orders,
          bill_printed: false,
        },
      }));
      set({ orderItems: updatedOrders });

      // Update Supabase for all matching orders
      const { error } = await supabase
        .from("orders")
        .update({ bill_printed: false })
        .eq("id", orderId)
        .select();
      if (error) {
        handleError(error); // Handle error if updating Supabase fails
      }

      setBillPrinted(false);
    }

    // Find existing item index in the selected table orders
    const existingIndex = orderItems.findIndex((item) => {
      return isDrink
        ? item.drinks && item.drinks.id === Number(orderItem.id)
        : item.menuItems && item.menuItems.id === Number(orderItem.id);
    });

    if (existingIndex !== -1) {
      // If the item already exists, update its quantity and total
      const updatedItems = [...orderItems];
      updatedItems[existingIndex].quantity += 1;
      updatedItems[existingIndex].total =
        updatedItems[existingIndex].quantity *
        (isDrink
          ? updatedItems[existingIndex].drinks.price
          : updatedItems[existingIndex].menuItems.price);

      // Update state
      const totalQuantity = updatedItems.reduce(
        (acc, cur) => acc + cur.quantity,
        0
      );
      const totalPrice = updatedItems.reduce((acc, cur) => acc + cur.total, 0);

      set({
        orderItems: updatedItems,
        totalOrdersQty: totalQuantity,
        totalOrdersPrice: totalPrice.toFixed(2),
      });

      // Update Supabase
      const { error } = await supabase
        .from("ordersItems")
        .update({
          quantity: updatedItems[existingIndex].quantity,
          total: updatedItems[existingIndex].total.toFixed(2),
        })
        .eq("id", updatedItems[existingIndex].id)
        .select();

      if (error) {
        handleError(error);
      }
    } else {
      // If the item does not exist, create a new one
      const { data: lastItem, error: fetchError } = await supabase
        .from("ordersItems")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        handleError(fetchError);
        return;
      }

      const nextId = lastItem ? lastItem.id + 1 : 1;

      const newItem = {
        id: nextId,
        created_at: new Date().toISOString(),
        ...(isDrink ? { drinks: orderItem } : { menuItems: orderItem }),
        order_no: orderId,
        quantity: 1,
        total: orderItem.price,
        type: orderItem.type,
      };

      const updatedItems = [...orderItems, newItem];
      const totalQuantity = updatedItems.reduce(
        (acc, cur) => acc + cur.quantity,
        0
      );
      const totalPrice = updatedItems.reduce((acc, cur) => acc + cur.total, 0);

      set({
        orderItems: updatedItems,
        totalOrdersQty: totalQuantity,
        totalOrdersPrice: totalPrice.toFixed(2),
      });

      // Add new item to Supabase
      const { error } = await supabase
        .from("ordersItems")
        .insert({
          ...(isDrink ? { drinks: orderItem.id } : { item: orderItem.id }), // Replace key names as per schema
          order_no: orderId,
          quantity: newItem.quantity,
          total: newItem.total,
          type: orderItem.type,
        })
        .select();

      if (error) {
        handleError(error);
      }
    }
  },

  // Function to delete an order item
  handleRemoveItem: async (itemId) => {
    try {
      const { orderItems } = get();

      // Step 1: Remove item from selectedTableOrders state
      const updatedOrders = orderItems.filter(
        (order) => order.id !== itemId?.id
      );
      const totalQuantity = updatedOrders.reduce(
        (acc, cur) => acc + cur.quantity,
        0
      );
      const total = updatedOrders.reduce((acc, cur) => acc + cur.total, 0);

      set({
        orderItems: updatedOrders,
        totalOrdersQty: totalQuantity,
        totalOrdersPrice: total.toFixed(2),
      });

      // Step 3: Update Supabase
      const { error } = await supabase
        .from("ordersItems")
        .delete()
        .eq("id", itemId?.id); // Delete the specific item by ID

      if (error) {
        handleError(error);
      }
    } catch (error) {
      handleError(error);
    }
  },

  // Check if a table is selected
  isSelectedTable: (table) => get().chosenTable === table.table_no,

  // Function to get active session by restaurant
  getActiveSessionByRestaurant: async () => {
    try {
      let { data: waiter_orders_overview, error } = await supabase
        .from("waiter_orders_overview")
        .select("*")
        .eq(
          "restaurant_id",
          useRestaurantStore?.getState()?.selectedRestaurant?.restaurants?.id
        )
        .eq("waiter_id", useAuthStore?.getState()?.user?.user?.id);

      if (error) throw error;

      console.log(waiter_orders_overview);

      set({
        assignedTablesLoaded: true,
        assignedTables: waiter_orders_overview,
      });
    } catch (error) {
      handleError(error);
    }
    },
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  // Check if a category is selected
  isSelectedCategory: (category) => get().selectedCategory === category,
}));

export default useMenuStore;