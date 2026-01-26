import { create } from "zustand";
import { supabase } from "./supabase";
import useRestaurantStore from "./restaurantStore";

interface SettingsState {
  settings: Record<string, any>;
  loading: boolean;
  viewMode: string;
  setViewMode: (viewMode: string) => void;
  fetchSettings: (restaurantId: string) => Promise<void>;
  updateSetting: (key: string, value: any) => Promise<void>;
  getSetting: (key: string) => any;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  loading: false,
  viewMode: "grid",
  setViewMode: (viewMode) => set({ viewMode }),

  fetchSettings: async (restaurantId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("restaurant_settings")
      .select("*")
      .eq("restaurant_id", restaurantId);

    if (error) {
        console.error(error);
        set({ loading: false });
    } else {
      const map = Object.fromEntries((data || []).map((s) => [s.key, s.value]));
      set({ settings: map });
      
      const defaultView = map?.general?.default_view || "grid";
      set({ viewMode: defaultView, loading: false });
    }
  },

  updateSetting: async (key, value) => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;
    if (!restaurantId) return;

    const { error } = await supabase.from("restaurant_settings").upsert(
      { restaurant_id: restaurantId, key, value },
      { onConflict: ["restaurant_id", "key"] }
    );

    if (error) console.error(error);
    else {
      set((state) => ({
        settings: { ...state.settings, [key]: value },
      }));
    }
  },

  getSetting: (key) => {
    return get().settings[key];
  },
}));
