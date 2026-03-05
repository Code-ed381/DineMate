import { useSubscription } from "../providers/subscriptionProvider";
import { getPlanById, PlanLimit } from "../config/plans";

export const useFeatureGate = () => {
    const { subscriptionPlan } = useSubscription();
    // Fallback to free if no plan found
    const plan = getPlanById(subscriptionPlan || 'free');

    const canUseFeature = (featureName: string): boolean => {
        const feature = plan.features.find(f => f.text.toLowerCase().includes(featureName.toLowerCase()));
        return feature?.included ?? false;
    };

    const canAccess = (feature: keyof PlanLimit): boolean => {
        const value = plan.limits[feature];
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value > 0;
        return false;
    };

    const isLimitReached = (limitType: keyof PlanLimit, currentCount: number): boolean => {
        const limit = plan.limits[limitType];
        if (typeof limit !== 'number') return false;
        return currentCount >= limit;
    };

    const getRemaining = (limitType: keyof PlanLimit, currentCount: number): number => {
        const limit = plan.limits[limitType];
        if (typeof limit !== 'number') return 0;
        if (limit === 9999) return 9999; // Unlimited
        return Math.max(0, limit - currentCount);
    };

    return {
        plan,
        canUseFeature,
        canAccess,
        isLimitReached,
        getRemaining,
    };
};
