import { create } from 'zustand';
import { supabase } from './supabase';
import { handleError } from '../components/Error';
import useAuthStore from './authStore';

interface DashboardState {
    user: any;
    loadingCards: boolean;
    loadingChart: boolean;
    totalNumberOfOrders: number;
    totalAmount: number;
    orderItems: any[];
    order: any[];
    pendingOrders: any[];
    servedOrders: any[];
    cashPaid: number;
    cardPaid: number;
    openAvailable: boolean;
    open: boolean;
    loadingPendingOrders: boolean;
    loadingServedOrders: boolean;
    salesData: any;
    itemsLoading: boolean;
    totalQty: number;
    totalPrice: number;

    setOpenAvailable: (open: boolean) => void;
    setOpen: (open: boolean) => void;
    setItemsLoading: (loading: boolean) => void;
    setOrder: (order: any[]) => void;
    setTotalPrice: (price: number) => void;
    setTotalQty: (qty: number) => void;
    handleClose: () => void;
    handleCloseAvailable: () => void;
    fetchUser: () => void;
    fetchOrders: () => Promise<void>;
    fetchSalesData: () => Promise<void>;
    handleFetchOrderItemsByOrderId: (orderId: string) => Promise<any[]>;
}

const useDashboardStore = create<DashboardState>((set, get) => ({
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

    fetchUser: () => {
        const { user } = useAuthStore.getState();
        if (user) set({ user });
    },

    fetchOrders: async () => {
        const { user } = useAuthStore.getState();
        if (!user) {
            console.error("User is not set. Please call fetchUser first.");
            return;
        }

        try {
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select(`*, table(table_no)`)
                .eq('waiter', user.user.id)
                .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 1)).toISOString());

            if (ordersError) throw ordersError;

            set({
                totalNumberOfOrders: orders?.length || 0,
                pendingOrders: orders?.filter((order: any) => order.status === 'pending') || [],
                servedOrders: orders?.filter((order: any) => order.status === 'served') || [],
                loadingPendingOrders: false,
                loadingServedOrders: false,
                totalAmount: orders?.reduce((acc: number, order: any) => acc + (order.total || 0), 0) || 0,
                cashPaid: orders?.reduce((acc: number, order: any) => acc + (order.cash || 0), 0) || 0,
                cardPaid: orders?.reduce((acc: number, order: any) => acc + (order.card || 0), 0) || 0,
                loadingCards: false
            });
        } catch (error) {
            handleError(error);
        }
    },

    fetchSalesData: async () => {
        const { user } = useAuthStore.getState();
        if (!user) {
            console.error("User is not set. Please call fetchUser first.");
            return;
        }

        try {
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .eq('waiter', user.user.id)
                .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString());

            if (error) throw error;

            const validOrders = (orders || []).filter((order: any) => order.total !== null);
            const salesByDay = validOrders.reduce((acc: any, order: any) => {
                const dayOfWeek = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long' });
                acc[dayOfWeek] = (acc[dayOfWeek] || 0) + order.total;
                return acc;
            }, {});

            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const salesData = daysOfWeek.map(day => ({
                day,
                total: salesByDay[day] || 0,
            }));

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
            });
        } catch (error) {
            handleError(error);
        }
    },

    handleFetchOrderItemsByOrderId: async (orderId) => {
        set({ itemsLoading: true, open: true });
        try {
            const { data: orderItems, error } = await supabase
                .from('ordersItems')
                .select(`*, menuItems(*), drinks(*), orders!inner(*)`)
                .eq('order_no', orderId);

            if (error) throw error;

            const totalQuantity = (orderItems || []).reduce((acc: number, cur: any) => acc + cur.quantity, 0);
            const total = (orderItems || []).reduce((acc: number, cur: any) => acc + cur.total, 0);

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select(`*, waiter(*), table(*)`)
                .eq('id', orderId)
                .single();

            if (orderError) throw orderError;

            set({ totalQty: totalQuantity, totalPrice: total, orderItems: orderItems || [], itemsLoading: false, order: [order] });
            return orderItems || [];
        } catch (error) {
            handleError(error);
            return [];
        }
    },
}));

export default useDashboardStore;
