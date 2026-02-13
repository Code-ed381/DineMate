import { create } from "zustand";
import { supabase } from "./supabase";
import useAuthStore from "./authStore";
import useRestaurantStore from "./restaurantStore";
import { handleError } from "../components/Error";

export interface WaiterMetrics {
  totalTables: number;
  totalRevenue: number;
  avgSessionDuration: number; // in minutes
  avgGuestCallResponse: number; // in minutes
  dailyStats: {
    date: string;
    revenue: number;
    tables: number;
  }[];
  recentPerformance: {
    period: string;
    revenue: number;
    efficiency: number; // tables per hour
  }[];
}

interface MetricsState {
  metrics: WaiterMetrics | null;
  loading: boolean;
  fetchWaiterMetrics: (startDate?: string, endDate?: string) => Promise<void>;
}

const useMetricsStore = create<MetricsState>((set, get) => ({
  metrics: null,
  loading: false,

  fetchWaiterMetrics: async (startDate, endDate) => {
    set({ loading: true });
    try {
      const { user } = useAuthStore.getState();
      const { selectedRestaurant } = useRestaurantStore.getState();
      if (!user || !selectedRestaurant) return;

      const userId = user.id;
      const restaurantId = selectedRestaurant.id;

      // 1. Fetch historical sessions for this waiter
      let sessionsQuery = supabase
        .from("table_session_summary")
        .select(`
          session_id,
          opened_at,
          closed_at,
          status,
          total_amount
        `)
        .eq("waiter_id", userId)
        .eq("restaurant_id", restaurantId);

      if (startDate) sessionsQuery = sessionsQuery.gte("opened_at", startDate);
      if (endDate) sessionsQuery = sessionsQuery.lte("opened_at", endDate);

      const { data: sessions, error: sessionsError } = await sessionsQuery;
      if (sessionsError) throw sessionsError;

      // 2. Fetch service requests response times
      let requestsQuery = supabase
        .from("service_requests")
        .select("created_at, resolved_at")
        .eq("restaurant_id", restaurantId)
        .eq("status", "resolved")
        .not("resolved_at", "is", null);
      
      // Note: We don't have a direct 'waiter_id' on service_requests usually, 
      // but in some systems the waiter who resolves it is tracked. 
      // For now, we take general restaurant performance or link via table sessions if needed.
      // Usually, service requests are for the assigned waiter.
      
      const { data: requests, error: requestsError } = await requestsQuery;
      if (requestsError) throw requestsError;

      // --- Calculations ---
      
      let totalRevenue = 0;
      let totalDuration = 0;
      let closedSessionCount = 0;
      const dailyMap: Record<string, { revenue: number, tables: number }> = {};

      sessions?.forEach(s => {
        const orderTotal = s.total_amount || 0;
        totalRevenue += orderTotal;

        const dateKey = new Date(s.opened_at).toISOString().split('T')[0];
        if (!dailyMap[dateKey]) dailyMap[dateKey] = { revenue: 0, tables: 0 };
        dailyMap[dateKey].revenue += orderTotal;
        dailyMap[dateKey].tables += 1;

        if (s.closed_at) {
          const duration = (new Date(s.closed_at).getTime() - new Date(s.opened_at).getTime()) / (1000 * 60);
          totalDuration += duration;
          closedSessionCount++;
        }
      });

      let totalResponseTime = 0;
      requests?.forEach(r => {
        const responseTime = (new Date(r.resolved_at!).getTime() - new Date(r.created_at).getTime()) / (1000 * 60);
        totalResponseTime += responseTime;
      });

      const metrics: WaiterMetrics = {
        totalTables: sessions?.length || 0,
        totalRevenue,
        avgSessionDuration: closedSessionCount > 0 ? totalDuration / closedSessionCount : 0,
        avgGuestCallResponse: requests && requests.length > 0 ? totalResponseTime / requests.length : 0,
        dailyStats: Object.entries(dailyMap).map(([date, stats]) => ({
          date,
          ...stats
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        recentPerformance: [] // Can be calculated based on weeks
      };

      set({ metrics, loading: false });
    } catch (error) {
      console.error("Error fetching metrics:", error);
      handleError(error as Error);
      set({ loading: false });
    }
  },
}));

export default useMetricsStore;
