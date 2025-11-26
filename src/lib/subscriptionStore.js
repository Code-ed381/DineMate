import { create } from "zustand";
import { supabase } from "../lib/supabase.js";
import useRestaurantStore from "./restaurantStore";

export const useSubscriptionStore = create((set, get) => ({
  subscriptions: [], // Array of subscriptions
  loading: false, // Loading state
  subscriptionPlan: null,

  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setLoading: (loading) => set({ loading }),

  fetchSubscriptions: async () => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurant_id = selectedRestaurant?.restaurants?.id;

    set({ loading: true });

    let { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("restaurant_id", restaurant_id);

    if (error) {
      console.error("Error fetching subscriptions:", error);
      set({ loading: false });
      return;
    }

    set({ subscriptionPlan: subscriptions[0]?.subscription_plan });
    set({ subscriptions, loading: false });
  },
  createSubscription: () => {},
  updateSubscription: () => {},
  deleteSubscription: () => {},
}));
