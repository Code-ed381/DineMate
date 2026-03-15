import { create } from "zustand";
import { supabase } from "./supabase";
import dayjs from "dayjs";

interface AnalyticsState {
  kpis: {
    revenue: { current: number; previous: number; change: number };
    orders: { current: number; previous: number; change: number };
    avgOrderValue: { current: number; previous: number; change: number };
  };
  revenueData: any[];
  categoryData: any[];
  staffPerformance: any[];
  topItems: any[];
  paymentAnalysis: { cash: number; card: number; online: number; momo: number; total: number };
  peakHours: { hour: string; orders: number; revenue: number }[];
  loading: boolean;
  hasFetched: boolean;
  fetchDashboardData: (restaurantId: string, timeRange: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  kpis: {
    revenue: { current: 0, previous: 0, change: 0 },
    orders: { current: 0, previous: 0, change: 0 },
    avgOrderValue: { current: 0, previous: 0, change: 0 },
  },
  revenueData: [],
  categoryData: [],
  staffPerformance: [],
  topItems: [],
  paymentAnalysis: { cash: 0, card: 0, online: 0, momo: 0, total: 0 },
  peakHours: [],
  loading: false,
  hasFetched: false,

  fetchDashboardData: async (restaurantId, timeRange) => {
    const { hasFetched } = get();
    // Only show loading spinner on the very first fetch
    if (!hasFetched) {
      set({ loading: true });
    }
    try {
      const now = dayjs();
      let startOfCurrent: dayjs.Dayjs;
      let startOfPrevious: dayjs.Dayjs;
      let interval: "hour" | "day" | "week";

      switch (timeRange) {
        case "today":
          startOfCurrent = now.startOf("day");
          startOfPrevious = now.subtract(1, "day").startOf("day");
          interval = "hour";
          break;
        case "yesterday":
          startOfCurrent = now.subtract(1, "day").startOf("day");
          startOfPrevious = now.subtract(2, "days").startOf("day");
          interval = "hour";
          break;
        case "week":
          startOfCurrent = now.subtract(7, "days").startOf("day");
          startOfPrevious = now.subtract(14, "days").startOf("day");
          interval = "day";
          break;
        case "month":
          startOfCurrent = now.subtract(30, "days").startOf("day");
          startOfPrevious = now.subtract(60, "days").startOf("day");
          interval = "day";
          break;
        case "year":
          startOfCurrent = now.startOf("year");
          startOfPrevious = now.subtract(1, "year").startOf("year");
          interval = "week";
          break;
        default:
          startOfCurrent = now.startOf("day");
          startOfPrevious = now.subtract(1, "day").startOf("day");
          interval = "hour";
      }

      // Use cashier_orders_overview view — the raw `orders` table only has
      // id, created_at, restaurant_id, session_id, status, total.
      // The view provides: waiter_id, waiter_first_name, waiter_last_name,
      // payment_method, order_total, opened_at, order_id, etc.
      const { data: currentRows, error: currentError } = await supabase
        .from("cashier_orders_overview")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .gte("opened_at", startOfCurrent.toISOString());

      if (currentError) throw currentError;

      const { data: previousRows, error: previousError } = await supabase
        .from("cashier_orders_overview")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .gte("opened_at", startOfPrevious.toISOString())
        .lt("opened_at", startOfCurrent.toISOString());

      if (previousError) throw previousError;

      const currentOrders = currentRows || [];
      const previousOrders = previousRows || [];

      // KPI Calculations — use order_total from the view
      const currentRev = currentOrders.reduce((sum, o: any) => sum + (o.order_total || 0), 0);
      const previousRev = previousOrders.reduce((sum, o: any) => sum + (o.order_total || 0), 0);
      const revChange = previousRev === 0 ? 0 : ((currentRev - previousRev) / previousRev) * 100;

      const currentOrdersCount = currentOrders.length;
      const previousOrdersCount = previousOrders.length;
      const ordersChange = previousOrdersCount === 0 ? 0 : ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100;

      const currentAvg = currentOrdersCount === 0 ? 0 : currentRev / currentOrdersCount;
      const previousAvg = previousOrdersCount === 0 ? 0 : previousRev / previousOrdersCount;
      const avgChange = previousAvg === 0 ? 0 : ((currentAvg - previousAvg) / previousAvg) * 100;

      // 2. Revenue Chart Data — use opened_at for time bucketing
      const chartDataMap: Record<string, any> = {};
      currentOrders.forEach((order: any) => {
        const date = dayjs(order.opened_at);
        const key = interval === "hour" ? date.format("ha") : date.format("MMM DD");
        if (!chartDataMap[key]) {
          chartDataMap[key] = { time: key, revenue: 0, orders: 0, customers: 0 };
        }
        chartDataMap[key].revenue += order.order_total || 0;
        chartDataMap[key].orders += 1;
        chartDataMap[key].customers += 1; 
      });

      const revenueData = Object.values(chartDataMap);

      // 3. Top Items & Category Data — use order_id from the view
      const orderIds = currentOrders.map((o: any) => o.order_id).filter(Boolean);
      let topItems: any[] = [];
      let categoryData: any[] = [];

      if (orderIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select(`
            id,
            sum_price,
            quantity,
            menu_item_id,
            menu_items (
              name,
              menu_categories (
                name
              )
            )
          `)
          .in("order_id", orderIds);

        if (itemsError) throw itemsError;

        const itemAggregation: Record<string, any> = {};
        const catAggregation: Record<string, any> = {};

        (items || []).forEach((item: any) => {
          const name = item.menu_items?.name || "Unknown";
          const category = item.menu_items?.menu_categories?.name || "Other";
          
          if (!itemAggregation[name]) {
            itemAggregation[name] = { name, sold: 0, revenue: 0 };
          }
          itemAggregation[name].sold += item.quantity || 1;
          itemAggregation[name].revenue += parseFloat(item.sum_price) || 0;

          if (!catAggregation[category]) {
            catAggregation[category] = { name: category, value: 0 };
          }
          catAggregation[category].value += 1;
        });

        topItems = Object.values(itemAggregation)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        const totalItems = (items || []).length;
        categoryData = Object.values(catAggregation).map((cat: any) => ({
          ...cat,
          value: Math.round((cat.value / totalItems) * 100),
        }));
      }

      // 4. Staff Performance — waiter info comes directly from the view
      const staffAggregation: Record<string, any> = {};

      currentOrders.forEach((order: any) => {
        const waiterId = order.waiter_id;
        if (!waiterId) return;
        const name = order.waiter_first_name 
          ? `${order.waiter_first_name} ${order.waiter_last_name || ''}`.trim()
          : "Unknown Staff";
        
        if (!staffAggregation[waiterId]) {
          staffAggregation[waiterId] = { 
            name, 
            orders: 0, 
            revenue: 0, 
          };
        }
        staffAggregation[waiterId].orders += 1;
        staffAggregation[waiterId].revenue += order.order_total || 0;
      });

      const staffPerformance = Object.values(staffAggregation)
        .sort((a, b) => b.revenue - a.revenue);

      set({
        kpis: {
          revenue: { current: currentRev, previous: previousRev, change: revChange },
          orders: { current: currentOrdersCount, previous: previousOrdersCount, change: ordersChange },
          avgOrderValue: { current: currentAvg, previous: previousAvg, change: avgChange },
        },
        revenueData,
        topItems,
        categoryData,
        staffPerformance,
        paymentAnalysis: currentOrders.reduce((acc: any, o: any) => {
            const total = parseFloat(o.order_total) || 0;
            const method = (o.payment_method || '').toLowerCase();
            
            const cashVal = parseFloat(o.amount_cash) || 0;
            const cardVal = parseFloat(o.amount_card) || 0;
            const momoVal = parseFloat(o.amount_momo) || 0;

            if (cashVal > 0 || cardVal > 0 || momoVal > 0) {
                acc.cash += cashVal;
                acc.card += cardVal;
                acc.momo += momoVal;
            } else {
                // Fallback for older records or single-method payments without explicit breakdown columns populated
                if (method === 'cash') acc.cash += total;
                else if (method === 'card') acc.card += total;
                else if (method === 'online') acc.online += total;
                else if (method === 'momo') acc.momo += total;
                else if (method === 'card+cash' || method === 'cash+card') {
                    acc.cash += total / 2;
                    acc.card += total / 2;
                }
            }
            return acc;
        }, { cash: 0, card: 0, online: 0, momo: 0, total: currentRev }),
        peakHours: Object.values(
            currentOrders.reduce((acc: any, order: any) => {
                const date = dayjs(order.opened_at);
                const hourIndex = date.hour(); // 0-23
                const label = date.format("h A"); // "2 PM"
                
                if (!acc[hourIndex]) acc[hourIndex] = { hour: label, orders: 0, revenue: 0, index: hourIndex };
                acc[hourIndex].orders += 1;
                acc[hourIndex].revenue += order.order_total || 0;
                return acc;
            }, {})
        ).sort((a: any, b: any) => a.index - b.index) as any[],
        loading: false,
        hasFetched: true,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      set({ loading: false });
    }
  },
}));
