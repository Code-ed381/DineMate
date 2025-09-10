import { create } from "zustand";
import { supabase } from "./supabase";
import useAuthStore from "./authStore";
import Swal from "sweetalert2";
import { persist } from "zustand/middleware";

const useRestaurantStore = create(
    persist(
        (set, get) => ({
            restaurants: [],
            role: null,
            loading: true,
            selectedRestaurant: null,
    
            setLoading: (loading) => set({ loading: loading }),
    
            setSelectedRestaurant: (value) => set({ selectedRestaurant: value }),
    
            getRestaurants: async () => {
                try {
                    const { user } = useAuthStore.getState();
                    const userId = user.user.id;
                    
                    const { data, error } = await supabase
                        .from('restaurant_members')
                        .select('role, restaurants(*)')
                        .eq('user_id', userId)
                    if (error) throw error;
    
                    set({ restaurants: data });
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

                    console.log("restaurant", data);
    
                    set({ selectedRestaurant: data });
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
    
                    set({ selectedRestaurant: data });
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
    
                    set({ selectedRestaurant: data });
                } catch (error) {
                    Swal.fire('Error', 'Failed to update restaurant. Check your internet connection.', 'error');
                }
            },
    
            deleteRestaurant: async (id) => {
                try {
                    const { data, error } = await supabase
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
            }),
        }
    )
);

export default useRestaurantStore;