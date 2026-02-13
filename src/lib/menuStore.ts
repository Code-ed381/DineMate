import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuState } from "../types/menu";
import { createMenuSlice } from "./stores/menu/createMenuSlice";
import { createOrderSlice } from "./stores/menu/createOrderSlice";
import { createTableSlice } from "./stores/menu/createTableSlice";
import { createUISlice } from "./stores/menu/createUISlice";

const useMenuStore = create<MenuState>()(
  persist(
    (set, get, api) => ({
      // Deprecated/Legacy fields that might be used in some places
      activeSessionByRestaurant: [],
      drinks: [],
      originalDrinks: [],
      meals: [],
      orderTime: null,
      originalMeals: [],
      drinksLoaded: false,
      mealsLoaded: false,
      mealsBackgroundColor: "#fff",
      mealsColor: "#000",
      drinksBackgroundColor: "#fff",
      drinksColor: "#000",
      filteredMeals: [],
      filteredDrinks: [],
      orders: [],
      originalOrders: [],
      orderLoaded: false,
      totalCashCardAmount: 0,
      selectedTableOrders: [],
      searchMealValue: "",
      searchDrinkValue: "",

      ...createMenuSlice(set, get, api),
      ...createOrderSlice(set, get, api),
      ...createTableSlice(set, get, api),
      ...createUISlice(set, get, api),

      filterMealsByCategory: (category: string, color: string, backgroundColor: string) => {
        // Legacy implementation for backward compatibility
      },
      filterDrinksByCategory: (category: string, color: string, backgroundColor: string) => {
        // Legacy implementation for backward compatibility
      },
      getOrders: async () => {},
      handlePrintBill: async () => {},
    } as any),
    {
      name: "menuStore",
      version: 2, // Increment version due to refactor
      partialize: (state) => ({
        assignedTables: state.assignedTables,
        chosenTable: state.chosenTable,
        chosenTableOrderItems: (state as any).chosenTableOrderItems,
        chosenTableSession: state.chosenTableSession,
        favoriteItemIds: state.favoriteItemIds,
      }),
    }
  )
);

export default useMenuStore;
export type { MenuState };
