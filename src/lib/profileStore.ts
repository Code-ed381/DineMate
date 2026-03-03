import { create } from 'zustand';
import useAuthStore from './authStore';
import { supabase } from './supabase';
import useRestaurantStore from './restaurantStore';

interface ProfileState {
    profile: any;
    loading: boolean;
    name: string;
    position: string;
    editingRow: any;
    rowData: any;
    getProfile: () => Promise<void>;
    updateProfile: (updatedData: any) => Promise<void>;
}

const useProfileStore = create<ProfileState>((set, get) => ({
    profile: null,
    loading: true,
    name: '',
    position: '',
    editingRow: null,
    rowData: {},

    getProfile: async () => {
        set({ loading: true });
        
        const { user } = useAuthStore.getState();
        if (!user) {
            set({ profile: null, loading: false });
            return;
        }

        try {
            // Fetch role from restaurant_members
            const { selectedRestaurant } = useRestaurantStore.getState();

            // Fetch personal details from users view
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', user.id)
                .eq('restaurant_id', selectedRestaurant?.id)
                .single();

            const { data: memberData, error: memberError } = await supabase
                .from('restaurant_members')
                .select('role')
                .eq('user_id', user.id)
                .eq('restaurant_id', selectedRestaurant?.id)
                .maybeSingle();

            if (userError && userError.code !== 'PGRST116') { // Ignore "not found" if we have auth metadata
                console.error("User view fetch error:", userError);
            }

            if (memberError && memberError.code !== 'PGRST116') { // Ignore "not found" if we have auth metadata
                console.error("User view fetch error:", memberError);
            }

            set({
                profile: {
                    id: user.id,
                    email: user.email,
                    first_name: userData?.first_name || user.user_metadata?.firstName || user.user_metadata?.first_name || "",
                    last_name: userData?.last_name || user.user_metadata?.lastName || user.user_metadata?.last_name || "",
                    phone: userData?.phone || user.user_metadata?.phone || user.user_metadata?.phone_number || "",
                    avatar_url: userData?.avatar_url || user.user_metadata?.profileAvatar || user.user_metadata?.avatar || "",
                    role: memberData?.role || "Staff",
                },
                loading: false
            });
        } catch (error) {
            console.error("Error fetching profile from views:", error);
            // Fallback to auth metadata
            set({
                profile: {
                    id: user.id,
                    email: user.email,
                    first_name: user.user_metadata?.firstName || "",
                    last_name: user.user_metadata?.lastName || "",
                    phone: user.user_metadata?.phone || "",
                    avatar_url: user.user_metadata?.profileAvatar || "",
                    role: "Staff",
                },
                loading: false
            });
        }
    },

    updateProfile: async (updatedData: any) => {
        set({ loading: true });
        
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    firstName: updatedData.first_name,
                    lastName: updatedData.last_name,
                    phone: updatedData.phone,
                    profileAvatar: updatedData.avatar_url
                }
            });

            if (error) throw error;

            // Update local store state
            set({
                profile: {
                    ...get().profile,
                    ...updatedData
                },
                loading: false
            });
        } catch (error) {
            console.error("Failed to update profile via Supabase Auth", error);
            set({ loading: false });
            throw error;
        }
    },
}));

export default useProfileStore;
