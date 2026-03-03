import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useRestaurantStore from "./restaurantStore";

export interface Subscription {
  id: string;
  restaurant_id: string;
  subscription_plan: string;
  status: string;
  billing_cycle: string;
  starts_at?: string;
  expires_at?: string;
  created_at: string;
  // Add other fields as needed
}

export interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  subscriptionPlan: string; // Current plan ID: free, basic, pro

  setSubscriptions: (subscriptions: Subscription[]) => void;
  setLoading: (loading: boolean) => void;
  fetchSubscriptions: () => Promise<void>;
  createSubscription: (restaurantId: string, plan: string, billingCycle: string) => Promise<void>;
  updateSubscription: (subscriptionId: string, updates: Partial<Subscription>) => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  
  // Derived state helper
  getCurrentSubscription: () => Subscription | null;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  loading: false,
  subscriptionPlan: "free",

  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setLoading: (loading) => set({ loading }),

  fetchSubscriptions: async () => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurant_id = selectedRestaurant?.id;

    if (!restaurant_id) {
      set({ subscriptions: [], subscriptionPlan: "free", loading: false });
      return;
    }

    set({ loading: true });

    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .eq("status", "active") // Only active ones for now
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      set({ loading: false });
      return;
    }

    const subs = (subscriptions as Subscription[]) || [];
    set({
      subscriptions: subs,
      subscriptionPlan: subs[0]?.subscription_plan || "free",
      loading: false,
    });
  },

  createSubscription: async (restaurantId, plan, billingCycle) => {
    set({ loading: true });
    try {
      const { error } = await supabase.from("subscriptions").insert({
        restaurant_id: restaurantId,
        subscription_plan: plan,
        billing_cycle: billingCycle,
        status: "active",
        starts_at: new Date().toISOString(),
      });

      if (error) throw error;
      await get().fetchSubscriptions();
    } catch (err) {
      console.error("Error creating subscription:", err);
    } finally {
      set({ loading: false });
    }
  },

  updateSubscription: async (subscriptionId, updates) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("id", subscriptionId);

      if (error) throw error;
      await get().fetchSubscriptions();
    } catch (err) {
      console.error("Error updating subscription:", err);
    } finally {
      set({ loading: false });
    }
  },

  cancelSubscription: async (subscriptionId) => {
    await get().updateSubscription(subscriptionId, { status: "cancelled" });
  },

  getCurrentSubscription: () => {
    const { subscriptions } = get();
    return subscriptions[0] || null;
  }
}));
