import { create } from "zustand";
import { supabase } from "./supabase";
import useAuthStore from "./authStore";
import Swal from "sweetalert2";
import { persist } from "zustand/middleware";

export interface Restaurant {
    id: string;
    name: string;
    owner_id: string;
    description?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    zip_code?: string;
    country: string;
    phone_number: string;
    email: string;
    website?: string;
    logo?: string;
    business_certificate_url?: string;
    created_at?: string;
}

export interface RestaurantMember {
    role: string;
    status: string;
    restaurants: Restaurant;
}

export interface RestaurantState {
    restaurants: RestaurantMember[];
    role: string | null;
    loading: boolean;
    selectedRestaurant: Restaurant | null;
    setLoading: (loading: boolean) => void;
    setSelectedRestaurant: (value: Restaurant | null) => void;
    setRole: (role: string | null) => void;
    getRestaurants: () => Promise<void>;
    getRestaurantById: (id: string) => Promise<void>;
    createRestaurant: (restaurant: Partial<Restaurant>) => Promise<string | null>;
    updateRestaurant: (id: string, restaurant: Partial<Restaurant>) => Promise<void>;
    deleteRestaurant: (id: string) => Promise<void>;
}

const useRestaurantStore = create<RestaurantState>()(
    persist(
        (set, get) => ({
            restaurants: [],
            role: null,
            loading: true,
            selectedRestaurant: null,
    
            setLoading: (loading) => set({ loading: loading }),
    
            setSelectedRestaurant: (value) => set({ selectedRestaurant: value }),

            setRole: (role) => set({ role: role }),
    
            getRestaurants: async () => {
                try {
                    const { user } = useAuthStore.getState();
                    const userId = user?.id;

                    if (!userId) {
                        console.warn("No user ID found in authStore");
                        return;
                    }
                    
                    const { data, error } = await supabase
                        .from('restaurant_members')
                        .select('role, status, restaurants(*)')
                        .eq('user_id', userId) as { data: RestaurantMember[] | null, error: any };
                    
                    if (error) throw error;
    
                    set({ restaurants: data || [] });
                } catch (error) {
                    Swal.fire('Error', 'Failed to fetch restaurant. Check your internet connection.', 'error');
                } finally {
                    set({ loading: false });
                }
            },
    
            getRestaurantById: async (id) => {
                try {
                    const { data, error } = await supabase
                        .from('restaurant_members')
                        .select('role, status, restaurants(*)')
                        .eq('restaurant_id', id)
                        .single();
                    if (error) throw error;
    
                    set({ 
                        selectedRestaurant: (data.restaurants as any) as Restaurant,
                        role: data.role
                    });
                } catch (error) {
                    Swal.fire('Error', 'Failed to fetch restaurant. Check your internet connection.', 'error');
                }
            },
    
            createRestaurant: async (restaurant) => {
                try {
                    const { user } = useAuthStore.getState();
                    if (!user) throw new Error("Authentication required");

                    // 1. Insert Restaurant
                    const { data: newRestaurant, error: resError } = await supabase
                        .from('restaurants')
                        .insert([{ ...restaurant, owner_id: user.id }])
                        .select()
                        .single();
                    if (resError) throw resError;

                    // 2. Create Owner Membership
                    const { error: memberError } = await supabase
                        .from('restaurant_members')
                        .insert([{
                            restaurant_id: newRestaurant.id,
                            user_id: user.id,
                            role: 'owner',
                            status: 'active'
                        }]);
                    if (memberError) throw memberError;
    
                    // Refresh restaurant list
                    await get().getRestaurants();
                    set({ selectedRestaurant: newRestaurant as Restaurant, role: 'owner' });
                    return newRestaurant.id;
                } catch (error: any) {
                    console.error("Create restaurant failed:", error);
                    Swal.fire('Error', error.message || 'Failed to create restaurant.', 'error');
                    return null;
                }
            },
    
            updateRestaurant: async (id, restaurant) => {
                try {
                    const { data, error } = await supabase
                        .from('restaurants')
                        .update(restaurant)
                        .eq('id', id)
                        .select()
                        .single();
                    if (error) throw error;
    
                    set({ selectedRestaurant: data as Restaurant });
                } catch (error) {
                    Swal.fire('Error', 'Failed to update restaurant. Check your internet connection.', 'error');
                    throw error;
                }
            },
    
            deleteRestaurant: async (id) => {
                try {
                    const { error } = await supabase
                        .from('restaurants')
                        .delete()
                        .eq('id', id)
                        .single();
                    if (error) throw error;
    
                    set({ selectedRestaurant: null });
                } catch (error) {
                    Swal.fire('Error', 'Failed to delete restaurant. Check your internet connection.', 'error');
                }
            },
        }),
        {
            name: 'restaurant-store',
            partialize: (state) => ({
                restaurants: state.restaurants,
                selectedRestaurant: state.selectedRestaurant,
                role: state.role,
            }),
        }
    )
);

export default useRestaurantStore;
