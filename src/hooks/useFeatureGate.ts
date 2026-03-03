import { useSubscription } from "../providers/subscriptionProvider";
import { getPlanById } from "../config/plans";

export const useFeatureGate = () => {
    const { subscriptionPlan } = useSubscription();
    // Fallback to free if no plan found
    const plan = getPlanById(subscriptionPlan || 'free');

    const canUseFeature = (featureName: string): boolean => {
        const feature = plan.features.find(f => f.text.toLowerCase().includes(featureName.toLowerCase()));
        return feature?.included ?? false;
    };

    const isLimitReached = (limitType: 'maxEmployees' | 'maxTables' | 'maxMenuItems', currentCount: number): boolean => {
        const limit = plan.limits[limitType];
        return currentCount >= limit;
    };

    const getRemaining = (limitType: 'maxEmployees' | 'maxTables' | 'maxMenuItems', currentCount: number): number => {
        const limit = plan.limits[limitType];
        if (limit === 9999) return 9999; // Unlimited
        return Math.max(0, limit - currentCount);
    };

    return {
        plan,
        canUseFeature,
        isLimitReached,
        getRemaining,
    };
};
