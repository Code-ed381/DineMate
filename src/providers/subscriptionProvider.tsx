import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useSubscriptionStore } from "../lib/subscriptionStore";

interface SubscriptionContextType {
  subscriptions: any[];
  loading: boolean;
  subscriptionPlan: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { subscriptions, loading, fetchSubscriptions, subscriptionPlan } = useSubscriptionStore();

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    return (
        <SubscriptionContext.Provider value={{ subscriptions, loading, subscriptionPlan }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) throw new Error("useSubscription must be used within a SubscriptionProvider");
    return context;
};
