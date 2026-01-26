import { create } from "zustand";
import { supabase } from "./supabase";
import useAuthStore from "./authStore";
import Swal from "sweetalert2";
import { persist } from "zustand/middleware";

export interface Restaurant {
    id: string;
    name: string;
    ownerId: string;
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
    created_at?: string;
}

export interface RestaurantMember {
    role: string;
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
    createRestaurant: (restaurant: Partial<Restaurant>) => Promise<void>;
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
                        .select('role, restaurants(*)')
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
                        .select('role, restaurants(*)')
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
                    const { data, error } = await supabase
                        .from('restaurants')
                        .insert([restaurant])
                        .single();
                    if (error) throw error;
    
                    set({ selectedRestaurant: data as Restaurant });
                } catch (error) {
                    Swal.fire('Error', 'Failed to create restaurant. Check your internet connection.', 'error');
                }
            },
    
            updateRestaurant: async (id, restaurant) => {
                try {
                    const { data, error } = await supabase
                        .from('restaurants')
                        .update(restaurant)
                        .eq('id', id)
                        .single();
                    if (error) throw error;
    
                    set({ selectedRestaurant: data as Restaurant });
                } catch (error) {
                    Swal.fire('Error', 'Failed to update restaurant. Check your internet connection.', 'error');
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
