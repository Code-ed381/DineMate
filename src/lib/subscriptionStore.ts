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
  subscriptionPlan: string;
  subscriptionStatus: "active" | "pending" | "none";

  setSubscriptions: (subscriptions: Subscription[]) => void;
  setLoading: (loading: boolean) => void;
  fetchSubscriptions: () => Promise<void>;
  createSubscription: (restaurantId: string, plan: string, billingCycle: string) => Promise<void>;
  updateSubscription: (subscriptionId: string, updates: Partial<Subscription>) => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  downgradeToFree: () => Promise<void>;
  
  // Derived state helper
  getCurrentSubscription: () => Subscription | null;
  subscribeToSubscription: () => void;
  unsubscribeFromSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  loading: false,
  subscriptionPlan: "free",
  subscriptionStatus: "none",

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
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      set({ loading: false });
      return;
    }

    const subs = (subscriptions as Subscription[]) || [];
    const currentSub = subs[0];
    set({
      subscriptions: subs,
      subscriptionPlan: currentSub?.subscription_plan || "free",
      subscriptionStatus: currentSub ? (currentSub.status as any) : "none",
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

  downgradeToFree: async () => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.id;
    if (!restaurantId) return;

    set({ loading: true });
    try {
      const activeSub = get().subscriptions.find(s => s.status === "active");
      
      if (activeSub) {
        const { error } = await supabase
          .from("subscriptions")
          .update({
            subscription_plan: "free",
            billing_cycle: "monthly",
            price: 0, 
            status: "active"
          })
          .eq("id", activeSub.id);

        if (error) throw error;
      } else {
        // Fallback: If no active subscription exists, create one
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        if (userId) {
          const { error } = await supabase.from("subscriptions").insert({
            restaurant_id: restaurantId,
            user_id: userId,
            subscription_plan: "free",
            billing_cycle: "monthly",
            status: "active",
            starts_at: new Date().toISOString(),
            paystack_reference: `free_fallback_${Date.now()}`
          });
          if (error) throw error;
        }
      }

      await get().fetchSubscriptions();
    } catch (err) {
      console.error("Error downgrading to free:", err);
    } finally {
      set({ loading: false });
    }
  },

  getCurrentSubscription: () => {
    const { subscriptions } = get();
    return subscriptions[0] || null;
  },

  subscribeToSubscription: () => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    if (!selectedRestaurant?.id) return;

    const channel = supabase
      .channel(`subscription_changes_${selectedRestaurant.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `restaurant_id=eq.${selectedRestaurant.id}`,
        },
        () => {
          get().fetchSubscriptions();
        }
      )
      .subscribe();

    (window as any).subscriptionChannel = channel;
  },

  unsubscribeFromSubscription: () => {
    if ((window as any).subscriptionChannel) {
      supabase.removeChannel((window as any).subscriptionChannel);
      (window as any).subscriptionChannel = null;
    }
  },
}));
