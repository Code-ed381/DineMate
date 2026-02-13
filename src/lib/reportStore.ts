import { create } from 'zustand';
import { supabase } from './supabase';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

import { formatCurrency } from '../utils/currency';

interface Order {
  id: string;
  created_at: string;
  waiter: any;
  card: number;
  cash: number;
  balance: number;
  total: number;
}

interface PreprocessedOrder {
  id: string;
  created_at: string;
  waiter: string;
  card: number;
  cash: number;
  balance: number;
  total: number;
}

interface ReportState {
  orders: PreprocessedOrder[];
  filteredOrders: PreprocessedOrder[];
  waiters: any[];
  cash: string | number;
  balance: string | number;
  card: string | number;
  total: string | number;
  overallCash: string | number;
  overallBalance: string | number;
  overallCard: string | number;
  overallTotal: string | number;
  loading: boolean;
  isFiltered: boolean;

  formatNumber: (number: number) => string;
  handleError: (error: any) => void;
  preprocessOrders: (orders: Order[]) => PreprocessedOrder[];
  getOrdersNow: () => Promise<void>;
  getWaiters: () => Promise<void>;
  filterOrders: (fromDate: string | null, toDate: string | null, waiterId: string | null) => void;
  clearFilters: () => void;
}

const useReportStore = create<ReportState>((set, get) => ({
  orders: [],
  filteredOrders: [],
  waiters: [],
  cash: 0,
  balance: 0,
  card: 0,
  total: 0,
  overallCash: 0,
  overallBalance: 0,
  overallCard: 0,
  overallTotal: 0,
  loading: true,
  isFiltered: false,

  formatNumber: (number) => {
    return formatCurrency(number);
  },

  handleError: (error) => {
    Swal.fire({ title: "Failed", text: error.message, icon: "error" });
  },

  preprocessOrders: (orders) => {
    return orders.map(order => ({
      id: order.id,
      created_at: dayjs(order.created_at).format('DD MMM YYYY, HH:mm'),
      waiter: order.waiter ? order.waiter.first_name : 'N/A',
      card: order.card,
      cash: order.cash,
      balance: order.balance,
      total: order.total,
    }));
  },

  getOrdersNow: async () => {
    try {
      let { data: orders, error } = await supabase
        .from('orders')
        .select(`*, waiter(*)`)
        .order('id', { ascending: false });

      if (error) throw error;

      const orderData = (orders as Order[]) || [];
      const cash = orderData.reduce((acc, cur) => acc + (parseFloat(cur.cash as any) || 0), 0).toFixed(2);
      const card = orderData.reduce((acc, cur) => acc + (parseFloat(cur.card as any) || 0), 0).toFixed(2);
      const total = orderData.reduce((acc, cur) => acc + (parseFloat(cur.total as any) || 0), 0).toFixed(2);
      const balance = orderData.reduce((acc, cur) => acc + (parseFloat(cur.balance as any) || 0), 0).toFixed(2);

      const preprocessed = get().preprocessOrders(orderData);

      set({
        balance,
        cash,
        card,
        total,
        overallBalance: balance,
        overallCash: cash,
        overallCard: card,
        overallTotal: total,
        orders: preprocessed,
        filteredOrders: preprocessed,
        loading: false,
      });
    } catch (error) {
      get().handleError(error);
    }
  },

  getWaiters: async () => {
    try {
      let { data: waiters, error } = await supabase.from('employees').select('*');
      if (error) throw error;
      set({ waiters: waiters || [] });
    } catch (error) {
      get().handleError(error);
    }
  },

  filterOrders: (fromDate, toDate, waiterId) => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      console.error('The "To" date cannot be earlier than the "From" date.');
      return;
    }

    const { orders } = get();
    const start = fromDate ? new Date(fromDate) : null;
    const end = toDate ? new Date(toDate) : null;

    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    const newFilteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const isWithinDateRange = (!start || orderDate >= start) && (!end || orderDate <= end);
      const isWaiterMatch = !waiterId || (order.waiter === waiterId);
      return isWithinDateRange && isWaiterMatch;
    });

    const cash = newFilteredOrders.reduce((acc, cur) => acc + (parseFloat(cur.cash as any) || 0), 0).toFixed(2);
    const card = newFilteredOrders.reduce((acc, cur) => acc + (parseFloat(cur.card as any) || 0), 0).toFixed(2);
    const total = newFilteredOrders.reduce((acc, cur) => acc + (parseFloat(cur.total as any) || 0), 0).toFixed(2);
    const balance = newFilteredOrders.reduce((acc, cur) => acc + (parseFloat(cur.balance as any) || 0), 0).toFixed(2);

    set({
      filteredOrders: newFilteredOrders,
      balance,
      cash,
      card,
      total,
      isFiltered: true,
    });
  },

  clearFilters: () => {
    const { orders, overallCash, overallCard, overallTotal, overallBalance } = get();

    set({
      filteredOrders: orders,
      balance: overallBalance,
      cash: overallCash,
      card: overallCard,
      total: overallTotal,
      isFiltered: false,
    });
  },
}));

export default useReportStore;
