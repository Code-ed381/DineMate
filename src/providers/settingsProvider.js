import { createContext, useContext, useEffect } from "react";
import {useSettingsStore} from "../lib/settingsStore";
import useRestaurantStore from "../lib/restaurantStore";

// Create context
const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { selectedRestaurant } = useRestaurantStore();
  const restaurantId = selectedRestaurant?.restaurants?.id;
  const { fetchSettings, settings, updateSetting, getSetting } =
    useSettingsStore();

  useEffect(() => {
    if (restaurantId) fetchSettings(restaurantId);
  }, [restaurantId, fetchSettings]);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSetting, getSetting, restaurantId }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for consuming context
export const useSettings = () => useContext(SettingsContext);
