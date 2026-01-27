import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useSettingsStore } from "../lib/settingsStore";
import useRestaurantStore from "../lib/restaurantStore";
import { RestaurantMember, Restaurant } from "../lib/restaurantStore";

interface SettingsContextType {
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => Promise<void>;
  getSetting: (key: string) => any;
  restaurantId: string | undefined;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { selectedRestaurant } = useRestaurantStore();
  const restaurantId = selectedRestaurant?.id;
  const { fetchSettings, settings, updateSetting, getSetting } = useSettingsStore();

  useEffect(() => {
    if (restaurantId) fetchSettings(restaurantId);
  }, [restaurantId, fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings: settings || {}, updateSetting, getSetting, restaurantId }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within a SettingsProvider");
  return context;
};
