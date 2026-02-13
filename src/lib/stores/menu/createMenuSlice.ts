import { StateCreator } from "zustand";
import { MenuState, MenuItem, Category } from "../../../types/menu";
import { menuService } from "../../../services/menuService";
import useRestaurantStore from "../../../lib/restaurantStore";
import Swal from "sweetalert2";

export interface MenuSlice {
  menuItems: MenuItem[];
  filteredMenuItems: MenuItem[];
  originalMenuItems: MenuItem[];
  loadingMenuItems: boolean;
  menuItemsLoaded: boolean;
  categories: Category[];
  loadingCategories: boolean;
  selectedCategory: string;
  fetchCategories: () => Promise<void>;
  fetchMenuItems: () => Promise<void>;
  setSelectedCategory: (category: Category) => void;
  filterMenuItemsByCategory: () => void;
  setFilteredMenuItems: (menuItems: MenuItem[]) => void;
  isSelectedCategory: (category: Category) => boolean;
}

export const createMenuSlice: StateCreator<MenuState, [], [], MenuSlice> = (set, get) => ({
  menuItems: [],
  filteredMenuItems: [],
  originalMenuItems: [],
  loadingMenuItems: false,
  menuItemsLoaded: false,
  categories: [],
  loadingCategories: false,
  selectedCategory: "",

  fetchCategories: async () => {
    set({ loadingCategories: true });
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.id;
    if (!restaurantId) return;
    try {
      const data = await menuService.fetchCategories(restaurantId);
      set({ categories: data });
    } catch (error) {
      Swal.fire("Error", "Failed to fetch categories.", "error");
    } finally {
      set({ loadingCategories: false });
    }
  },

  fetchMenuItems: async () => {
    set({ loadingMenuItems: true });
    try {
      const restaurantId = useRestaurantStore.getState().selectedRestaurant?.id;
      if (!restaurantId) throw new Error("No restaurant selected");

      const data = await menuService.fetchMenuItems(restaurantId);
      set({
        menuItems: data,
        filteredMenuItems: data,
        menuItemsLoaded: true,
        originalMenuItems: data,
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch menu items.", "error");
      set({
        menuItems: [],
        filteredMenuItems: [],
        menuItemsLoaded: false,
        originalMenuItems: [],
      });
    } finally {
      set({ loadingMenuItems: false });
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category.name });
    get().filterMenuItemsByCategory();
  },

  isSelectedCategory: (category) => get().selectedCategory === category.name,

  filterMenuItemsByCategory: () => {
    const { selectedCategory, menuItems } = get();
    if (!selectedCategory) return;
    set({
      filteredMenuItems: menuItems.filter(
        (item) => item.category_name?.toLowerCase() === selectedCategory.toLowerCase()
      ),
    });
  },

  setFilteredMenuItems: (menuItems) => {
    set({ filteredMenuItems: menuItems });
  },
});
