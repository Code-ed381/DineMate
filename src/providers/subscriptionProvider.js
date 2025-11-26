import { createContext, useContext, useEffect } from "react";
import {useSubscriptionStore} from "../lib/subscriptionStore.js";

// Create context
const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
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

// Custom hook for consuming context
export const useSubscription = () => useContext(SubscriptionContext);
