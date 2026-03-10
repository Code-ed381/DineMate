import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useSubscriptionStore } from "../lib/subscriptionStore";

import useRestaurantStore from "../lib/restaurantStore";

interface SubscriptionContextType {
  subscriptions: any[];
  loading: boolean;
  subscriptionPlan: string | null;
  subscriptionStatus: "active" | "pending" | "none";
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { subscriptions, loading, fetchSubscriptions, subscriptionPlan, subscriptionStatus, subscribeToSubscription, unsubscribeFromSubscription } = useSubscriptionStore();
    const { selectedRestaurant } = useRestaurantStore();

    useEffect(() => {
        fetchSubscriptions();
        subscribeToSubscription();
        return () => unsubscribeFromSubscription();
    }, [fetchSubscriptions, selectedRestaurant?.id, subscribeToSubscription, unsubscribeFromSubscription]);

    return (
        <SubscriptionContext.Provider value={{ subscriptions, loading, subscriptionPlan, subscriptionStatus }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) throw new Error("useSubscription must be used within a SubscriptionProvider");
    return context;
};
