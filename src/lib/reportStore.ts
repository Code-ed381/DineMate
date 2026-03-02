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
  waiter_id: string; // Add waiter_id for filtering
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
  getOrdersNow: (restaurantId: string, startDate?: string, endDate?: string) => Promise<void>;
  getWaiters: (restaurantId: string) => Promise<void>;
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
      waiter: order.waiter ? order.waiter.first_name : 'N/A', // Display name
      waiter_id: order.waiter ? order.waiter.user_id : '',    // ID for filtering
      card: order.card,
      cash: order.cash,
      balance: order.balance,
      total: order.total,
    }));
  },

  getOrdersNow: async (restaurantId: string, startDate?: string, endDate?: string) => {
    try {
      set({ loading: true });
      
      // Query the cashier_orders_overview view which contains full order data
      // including waiter info, payment method, and order totals.
      // The raw `orders` table only has: id, created_at, restaurant_id, session_id, status, total
      let query = supabase
        .from('cashier_orders_overview')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (startDate) {
        query = query.gte('opened_at', startDate);
      }
      if (endDate) {
        const endDateTime = dayjs(endDate).endOf('day').toISOString();
        query = query.lte('opened_at', endDateTime);
      }

      const { data: rows, error } = await query;

      if (error) throw error;

      // Map the view's columns to our Order interface
      const orderData: Order[] = (rows || []).map((row: any) => ({
        id: row.order_id,
        created_at: row.opened_at || row.created_at,
        waiter: { 
          first_name: row.waiter_first_name || 'Unknown', 
          last_name: row.waiter_last_name || '',
          user_id: row.waiter_id 
        },
        card: row.payment_method === 'card' ? (row.order_total || 0) : 0,
        cash: row.payment_method === 'cash' ? (row.order_total || 0) : 0,
        balance: 0,
        total: row.order_total || 0,
      }));

      const cash = orderData.reduce((acc, cur) => acc + (Number(cur.cash) || 0), 0).toFixed(2);
      const card = orderData.reduce((acc, cur) => acc + (Number(cur.card) || 0), 0).toFixed(2);
      const total = orderData.reduce((acc, cur) => acc + (Number(cur.total) || 0), 0).toFixed(2);
      const balance = orderData.reduce((acc, cur) => acc + (Number(cur.balance) || 0), 0).toFixed(2);

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
    } catch (error: any) {
      set({ loading: false });
      get().handleError(error);
    }
  },

  getWaiters: async (restaurantId: string) => {
    try {
      // Fetch distinct waiters from the orders view for this restaurant
      const { data: waiters, error } = await supabase
        .from('restaurant_members_with_users')
        .select('user_id, first_name, last_name, role')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      set({ waiters: waiters || [] });
    } catch (error) {
      get().handleError(error);
    }
  },

  filterOrders: (fromDate, toDate, waiterId) => {
    // Client-side filtering for quick interactions on the fetched dataset
    // Note: Main filtering should be done via getOrdersNow for large datasets
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      console.error('The "To" date cannot be earlier than the "From" date.');
      return;
    }

    const { orders } = get();
    // ... existing client-side logic ...
    const start = fromDate ? new Date(fromDate) : null;
    const end = toDate ? new Date(toDate) : null;

    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    const newFilteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at); // created_at is preprocessed to string, might need parsing
      // Note: preprocessOrders converts created_at to 'DD MMM YYYY, HH:mm' which is hard to parse back safely.
      // Better to filter on original data or ensure format is proper.
      // For now, let's assume standard filtering logic or just rely on server fetch.
      
      // Since we reformatted the date string in pre-processing, Date(order.created_at) might be invalid in some browsers.
      // However, usually we should filter on the raw objects if possible.
      // Given the current implementation stores preprocessed orders, we accept this might be flaky client-side
      // but we strongly encourage server-side filtering via getOrdersNow.
      
      return true; // Placeholder: relying on server filtering mostly.
    });
    
    // Re-implementing filter logic based on the string format provided by preprocessOrders
    // 'DD MMM YYYY, HH:mm'
    
    const parseDate = (dateStr: string) => dayjs(dateStr, 'DD MMM YYYY, HH:mm').toDate();

    const actualFiltered = orders.filter(order => {
        const orderDate = parseDate(order.created_at);
        const isWithinDateRange = (!start || orderDate >= start) && (!end || orderDate <= end);
        const isWaiterMatch = !waiterId || (order.waiter_id === waiterId);
        return isWithinDateRange && isWaiterMatch; 
    });

    // ... calculation logic ...
    
    // For this refactor, we are mostly moving to server-side. 
    // I will keep the existing calculation logic structure but update the filtering execution.
    
    const cash = actualFiltered.reduce((acc, cur) => acc + (parseFloat(cur.cash as any) || 0), 0).toFixed(2);
    const card = actualFiltered.reduce((acc, cur) => acc + (parseFloat(cur.card as any) || 0), 0).toFixed(2);
    const total = actualFiltered.reduce((acc, cur) => acc + (parseFloat(cur.total as any) || 0), 0).toFixed(2);
    const balance = actualFiltered.reduce((acc, cur) => acc + (parseFloat(cur.balance as any) || 0), 0).toFixed(2);

    set({
      filteredOrders: actualFiltered,
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
