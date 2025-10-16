import { create } from "zustand";
import { persist } from "zustand/middleware";
import useRestaurantStore from "./restaurantStore";
import { supabase } from "./supabase";
import { handleError } from "../components/Error";
import Swal from "sweetalert2";
import ReactDOM from "react-dom";
import { Typography, Box } from "@mui/material";

const useCashierStore = create(
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
      
    
      // Function to handle proceed to payment
      setProceedToPayment: (value) => {
        set({ proceedToPayment: value });
      },
      
      // Function to handle select
      setSelected: (value) => {
        set({ selected: value });
      },

      // Function to handle payment method change
      setPaymentMethod: (method) => {
        set({ paymentMethod: method });
      },

      // Function to handle cash amount change
      setCashAmount: (amount) => {
        set({ cashAmount: amount });
      },

      // Function to handle card amount change
      setCardAmount: (amount) => {
        set({ cardAmount: amount });
      },

      // Function to handle momo amount change
      setMomoAmount: (amount) => {
        set({ momoAmount: amount });
      },

      // Function to handle select session
      setSelectedSession: (session) => {
        set({ selectedSession: session });
      },

      // Function to get active session by restaurant
      getActiveSessionByRestaurant: async () => {
        const selectedRestaurantId =
          useRestaurantStore.getState().selectedRestaurant?.restaurants?.id;

        console.log("selectedRestaurantId", selectedRestaurantId);
        if (!selectedRestaurantId) {
          console.error("No restaurant selected");
          return;
        }

        set({ loadingActiveSessionByRestaurant: true });

        try {
          let { data: cashier_orders_overview, error } = await supabase
            .from("cashier_orders_overview")
            .select("*")
            .eq("restaurant_id", selectedRestaurantId)

            if (error) throw error;
            
            const activeSessions = cashier_orders_overview.filter(
              session => session.session_status !== "close"
            );

            const closedSessions = cashier_orders_overview.filter(
              session => session.session_status === "close"
            );

          console.log("activeSessions", activeSessions);
          console.log("closedSessions", closedSessions);

          set({
            allSessions: cashier_orders_overview || [],
            activeSessions: activeSessions || [],
            closedSessions: closedSessions || [],
            activeSeesionByRestaurantLoaded: true,
          });
        } catch (error) {
          console.error(error);
          handleError(error);
        } finally {
          set({
            loadingActiveSessionByRestaurant: false,
          });
        }
      },
      
      // Function to handle payment
      handlePayment: async () => {
        const selectedSession = get().selectedSession;
        const paymentMethod = get().paymentMethod;
        const cashAmount = Number(get().cashAmount);
        const cardAmount = Number(get().cardAmount);
        const momoAmount = Number(get().momoAmount);
          
        if (paymentMethod === "cash") {
            if(cashAmount <= 0 ) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Please enter cash amount",
                });
                return;
            }
            else if(cashAmount < selectedSession.order_total) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Cash amount is less than order total",
                });
                return;
            }
            else if (cashAmount >= selectedSession.order_total) {
                Swal.fire({
                  title: `Total Amount: ${selectedSession.order_total.toFixed(2)}`,
                  html: '<div id="swal-content"></div>', // placeholder div
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, confirm",
                  didOpen: () => {
                    ReactDOM.render(
                        <Box variant="h6" color="text.secondary">
                            <Typography variant="h6" color="text.secondary">Cash Paid: {cashAmount.toFixed(2)}</Typography>
                            <Typography variant="h6" color="text.secondary">Change: {(cashAmount - selectedSession.order_total).toFixed(2)}</Typography>
                        </Box>,
                      document.getElementById("swal-content")
                    );
                  },
                }).then(async (result) => {
                  if (result.isConfirmed) {
                    const { data: session, error: sessionError } = await supabase
                    .from('table_sessions')
                    .update({ status: 'close', closed_at: new Date() })
                    .eq('id', selectedSession.session_id)
                    .select()

                    if(sessionError) throw sessionError;

                    console.log("session", session);

                    const { data: order, error: orderError } = await supabase
                    .from('orders')
                    .update({ status: 'served' })
                    .eq('id', selectedSession.order_id)
                    .select()

                    if (orderError) throw orderError;
                      
                    const { data: table, error: tableError } = await supabase
                    .from("restaurant_tables")
                    .update({ status: "available" })
                    .eq("id", selectedSession.table_id)
                    .select();

                    if (tableError) throw tableError;

                    console.log("table", table);

                    Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Payment made successfully",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                      
                    set({ selectedSession: null });
                    set({ cashAmount: "" });
                    set({ cardAmount: "" });
                    set({ momoAmount: "" });
                    set({ paymentMethod: "cash" });

                    get().getActiveSessionByRestaurant();
          
                  }
                });
            }
            

        }
      },
      
      // FUnction to handle print bill
      handlePrintBill: async () => {
        const selectedSession = get().selectedSession;
        
        const { data, error } = await supabase
        .from('table_sessions')
        .update({ status: 'billed' })
        .eq('id', selectedSession.session_id)
        .select()
          
        if(error) throw error;

        console.log("data", data);

        Swal.fire({
            icon: "success",
            title: "Success",
            text: "Bill printed successfully",
            showConfirmButton: false,
            timer: 1500,
        });

        get().getActiveSessionByRestaurant();
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