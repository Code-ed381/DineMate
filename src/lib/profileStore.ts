import { create } from 'zustand';
import useAuthStore from './authStore';

interface ProfileState {
    profile: any;
    loading: boolean;
    name: string;
    position: string;
    editingRow: any;
    rowData: any;
    getProfile: () => Promise<void>;
}

const useProfileStore = create<ProfileState>((set) => ({
    profile: null,
    loading: true,
    name: '',
    position: '',
    editingRow: null,
    rowData: {},

    getProfile: async () => {
        set({ loading: true });
        
        // Try to get employee data from localStorage first
        const employeeData = localStorage.getItem('employee');
        if (employeeData) {
            const user = JSON.parse(employeeData);
            const data = Array.isArray(user) ? user[0] : user;
            set({ 
                profile: {
                    ...data,
                    first_name: data.first_name || data.name, // Handle different employee field naming
                }, 
                loading: false 
            });
            return;
        }

        // Fallback to Supabase auth user
        const { user } = useAuthStore.getState();
        if (user) {
            set({
                profile: {
                    id: user.id,
                    email: user.email,
                    first_name: user.user_metadata?.firstName || "",
                    last_name: user.user_metadata?.lastName || "",
                    phone: user.user_metadata?.phone || "",
                    avatar_url: user.user_metadata?.profileAvatar || "",
                    role: "Owner", // Default role for authenticated users
                },
                loading: false
            });
            return;
        }

        set({ profile: null, loading: false });
    },
}));

export default useProfileStore;
