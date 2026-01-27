import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useRestaurantStore from "./restaurantStore";

interface Subscription {
  id: string;
  restaurant_id: string;
  subscription_plan: string;
  status: string;
  // Add other fields as needed
}

interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  subscriptionPlan: string | null;

  setSubscriptions: (subscriptions: Subscription[]) => void;
  setLoading: (loading: boolean) => void;
  fetchSubscriptions: () => Promise<void>;
  createSubscription: () => void;
  updateSubscription: () => void;
  deleteSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  loading: false,
  subscriptionPlan: null,

  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setLoading: (loading) => set({ loading }),

  fetchSubscriptions: async () => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurant_id = selectedRestaurant?.id;

    if (!restaurant_id) return;

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

    const subs = (subscriptions as Subscription[]) || [];
    set({ subscriptionPlan: subs[0]?.subscription_plan || null });
    set({ subscriptions: subs, loading: false });
  },
  createSubscription: () => {},
  updateSubscription: () => {},
  deleteSubscription: () => {},
}));
