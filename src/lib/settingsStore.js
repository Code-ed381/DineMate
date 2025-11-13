import { create } from "zustand";
import { supabase } from "./supabase";
import useRestaurantStore from "./restaurantStore";

export const useSettingsStore = create((set, get) => ({
  settings: {}, // { general: {...}, employee_permissions: {...} }
  loading: false,
  viewMode: "grid",
  setViewMode: (viewMode) => set({ viewMode }),

  fetchSettings: async (restaurantId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("restaurant_settings")
      .select("*")
      .eq("restaurant_id", restaurantId);

    if (error) console.error(error);
    else {
      const map = Object.fromEntries(data.map((s) => [s.key, s.value]));
      set({ settings: map });
    }

    const defaultView = get().settings?.general?.default_view;

    set({ viewMode: defaultView });
    set({ loading: false });
  },

  updateSetting: async (key, value) => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;
    const { error } = await supabase.from("restaurant_settings").upsert(
      { restaurant_id: restaurantId, key, value },
      { onConflict: ["restaurant_id", "key"] } // important!
    );

    if (error) console.error(error);
    else {
      // Update only the specific key
      set((state) => ({
        settings: { ...state.settings, [key]: value },
      }));
    }
  },

  getSetting: (key) => {
    return get().settings[key];
  },
}));
