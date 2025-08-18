import { create } from 'zustand';
import { supabase } from './supabase';
import { handleError } from '../components/Error';

// Create the menu store with zustand
const useDashboardStore = create((set, get) => ({
    user: null,
    loadingCards: true,
    loadingChart: true,
    totalNumberOfOrders: 0,
    totalAmount: 0,
    orderItems: [],
    order: [],
    pendingOrders: [],
    servedOrders: [],
    cashPaid: 0,
    cardPaid: 0,
    openAvailable: false,
    open: false,
    loadingPendingOrders: true,
    loadingServedOrders: true,
    salesData: null,
    itemsLoading: true,
    totalQty: 0,
    totalPrice: 0,

    setOpenAvailable: (open) => set({ openAvailable: open }),
    
    setOpen: (open) => set({ open: open }),

    setItemsLoading: (loading) => set({ itemsLoading: loading }),

    setOrder: (order) => set({ order: order }),

    setTotalPrice: (price) => set({ totalPrice: price }),

    setTotalQty: (qty) => set({ totalQty: qty }),

    handleClose: () => {
        set({ open: false, itemsLoading: true });
    },

    handleCloseAvailable: () => {
        set({ openAvailable: false });
    },

    fetchUser: ()=> {
        const fetched_user = JSON.parse(localStorage.getItem('employee'))[0];
        set({ user: fetched_user });
    },

    fetchOrders: async ()=> {
        const { user } = get(); // Access the user from the state

        if (!user) {
            console.error("User is not set. Please call fetchUser first.");
            return;
        }

        try {
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select(`*, table(table_no)`)
                .eq('waiter', user.id)
                .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 1)).toISOString());
    
            if (ordersError) throw ordersError;
    
            set({
                totalNumberOfOrders: orders.length,
                pendingOrders: orders.filter((order) => order.status === 'pending'),
                servedOrders: orders.filter((order) => order.status ==='served'),
                loadingPendingOrders: false,
                loadingServedOrders: false,
                totalAmount: orders.reduce((acc, order) => acc + order.total, 0),
                cashPaid: orders.reduce((acc, order) => acc + (order.cash || 0), 0),
                cardPaid: orders.reduce((acc, order) => acc + (order.card || 0), 0),
                loadingCards: false
            })
        } catch (error) {
            handleError(error)
        }
    },

    fetchSalesData: async ()=> {
        const { user } = get(); // Access the user from the state

        if (!user) {
            console.error("User is not set. Please call fetchUser first.");
            return;
        }

        try {
            const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('waiter', user.id)
            .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString());
    
            if (error) throw error;

            // Filter out invalid orders (where totals are null)
            const validOrders = orders.filter(order => order.total !== null);

            // Group orders by day of the week
            const salesByDay = validOrders.reduce((acc, order) => {
                const dayOfWeek = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long' });
                acc[dayOfWeek] = (acc[dayOfWeek] || 0) + order.total;
                return acc;
            }, {});

            // Ensure all days of the week are represented
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const salesData = daysOfWeek.map(day => ({
                day,
                total: salesByDay[day] || 0, // Use 0 if no sales for the day
            }));

            // Prepare chart data
            set({
                salesData: {
                    labels: salesData.map(data => data.day),
                    datasets: [
                        {
                            label: 'Sales Performance (Last 7 Days)',
                            data: salesData.map(data => data.total),
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                    ],
                },
                loadingChart: false,
            })
    
        } catch (error) {
            handleError(error)
        }

    },

    handleFetchOrderItemsByOrderId: async (orderId) => {
        set ({ itemsLoading: true, open: true });
        try {
            const { data: orderItems, error } = await supabase
            .from('ordersItems')
            .select(`*, menuItems(*), drinks(*), orders!inner(*)`)
            .eq('order_no', orderId);

            if (error) throw error;

            const totalQuantity = orderItems.reduce((acc, cur) => acc + cur.quantity, 0);
            const total = orderItems.reduce((acc, cur) => acc + cur.total, 0);

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select(`*, waiter(*), table(*)`)
                .eq('id', orderId)
                .single();

            if (orderError) throw orderError;

            set({ totalQty: totalQuantity, totalPrice: total, orderItems, itemsLoading: false, order });
        } catch (error) {
            handleError(error);
            return [];
        }
    },
}));

export default useDashboardStore;