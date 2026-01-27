import { create } from 'zustand';
import { supabase } from './supabase';
import Swal from 'sweetalert2';
import useRestaurantStore from './restaurantStore';

interface MenuItem {
  id: string;
  item_name: string;
  name?: string;
  description: string;
  price: number | string;
  category: string;
  category_name?: string;
  [key: string]: any;
}

interface MenuItemsState {
  meals: MenuItem[];
  drinks: MenuItem[];
  filteredMeals: MenuItem[];
  filteredDrinks: MenuItem[];
  name: string;
  description: string;
  price: string;
  category: string;
  drink: string;
  categoryDrinks: string;
  editingRow: string | null;
  rowData: Partial<MenuItem>;
  loadingMeals: boolean;
  loadingDrinks: boolean;
  loadingCategories: boolean;
  categories: any[];
  menuItems: MenuItem[];
  filteredMenuItems: MenuItem[];
  loadingMenuItems: boolean;
  selectedCategory: string;

  setSelectedCategory: (category: string) => void;
  isSelectedCategory: (category: string) => boolean;
  filterMenuItemsByCategory: () => void;
  fetchCategories: () => Promise<void>;
  fetchMenuItems: () => Promise<void>;
  fetchMeals: () => Promise<void>;
  fetchDrinks: () => Promise<void>;
  handleAddMeal: () => Promise<void>;
  handleAddDrink: () => Promise<void>;
  handleEditStart: (id: string, row: MenuItem) => void;
  handleEditChange: (field: string, value: any) => void;
  handleEditStop: () => void;
  handleSaveMeal: (id: string) => Promise<void>;
  handleSaveDrink: (id: string) => Promise<void>;
  handleDeleteMeal: (id: string) => Promise<void>;
  handleDeleteDrink: (id: string) => Promise<void>;
}

const useMenuItemsStore = create<MenuItemsState>()((set, get) => ({
  meals: [],
  drinks: [],
  filteredMeals: [],
  filteredDrinks: [],
  name: "",
  description: "",
  price: "",
  category: "",
  drink: "",
  categoryDrinks: "",
  editingRow: null,
  rowData: {},
  loadingMeals: true,
  loadingDrinks: true,
  loadingCategories: true,
  categories: [],
  menuItems: [],
  filteredMenuItems: [],
  loadingMenuItems: true,
  selectedCategory: "",

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().filterMenuItemsByCategory();
  },

  isSelectedCategory: (category) => get().selectedCategory === category?.toLowerCase(),

  filterMenuItemsByCategory: () => {
    const { selectedCategory, menuItems } = get();
    if (!selectedCategory) return;
    set({ filteredMenuItems: menuItems.filter((item) => item.category_name?.toLowerCase() === selectedCategory.toLowerCase()) });
  },

  fetchCategories: async () => {
    set({ loadingCategories: true });
    try {
      const selectedRestaurant = useRestaurantStore.getState().selectedRestaurant;
      const restaurantId = selectedRestaurant?.id;

      if (!restaurantId) throw new Error("No restaurant selected");

      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId);
      if (error) throw error;
      set({ categories: data || [] });
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

      const { data, error } = await supabase
        .from("menu_items_with_category")
        .select("*")
        .eq("restaurant_id", restaurantId);

      if (error) throw error;
      const items = (data || []) as MenuItem[];
      set({ menuItems: items, filteredMenuItems: items });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch menu items.", "error");
      set({ menuItems: [], filteredMenuItems: [] });
    } finally {
      set({ loadingMenuItems: false });
    }
  },

  fetchMeals: async () => {
    set({ loadingMeals: true });
    try {
      const { data, error } = await supabase.from("menu_items").select("*");
      if (error) throw error;
      const meals = (data || []) as MenuItem[];
      set({ meals, filteredMeals: meals });
    } catch (error) {
      Swal.fire("Error", "Failed to fetch meals.", "error");
    } finally {
      set({ loadingMeals: false });
    }
  },

  fetchDrinks: async () => {
    set({ loadingDrinks: true });
    try {
      const { data, error } = await supabase.from("drinks").select("*");
      if (error) throw error;
      const drinks = (data || []) as MenuItem[];
      set({ drinks, filteredDrinks: drinks });
    } catch (error) {
      Swal.fire("Error", "Failed to fetch drinks.", "error");
    } finally {
      set({ loadingDrinks: false });
    }
  },

  handleAddMeal: async () => {
    const { name, description, price, category } = get();
    if (!name || !description || !price || !category) {
      Swal.fire("Error", "Please fill in all fields for the meal.", "error");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("menu_items")
        .insert([{ item_name: name, description, price, category }])
        .select();
      if (error) throw error;

      Swal.fire("Success", "Meal added successfully!", "success");
      const newMeals = [...get().meals, ...(data || [])] as MenuItem[];
      set({
        meals: newMeals,
        filteredMeals: newMeals,
        name: "",
        description: "",
        price: "",
        category: "",
      });
    } catch (error) {
      Swal.fire("Error", "Failed to add meal.", "error");
    }
  },

  handleAddDrink: async () => {
    const { drink, price, categoryDrinks } = get();
    if (!drink || !price || !categoryDrinks) {
      Swal.fire("Error", "Please fill in all fields for the drink.", "error");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("drinks")
        .insert([{ name: drink, price, category: categoryDrinks }])
        .select();
      if (error) throw error;

      Swal.fire("Success", "Drink added successfully!", "success");
      const newDrinks = [...get().drinks, ...(data || [])] as MenuItem[];
      set({
        drinks: newDrinks,
        filteredDrinks: newDrinks,
        drink: "",
        price: "",
        categoryDrinks: "",
      });
    } catch (error) {
      Swal.fire("Error", "Failed to add drink.", "error");
    }
  },

  handleEditStart: (id, row) => {
    set({ editingRow: id, rowData: { ...row } });
  },

  handleEditChange: (field, value) => {
    set((state) => ({ rowData: { ...state.rowData, [field]: value } }));
  },

  handleEditStop: () => {
    set({ editingRow: null, rowData: {} });
  },

  handleSaveMeal: async (id) => {
    const { rowData } = get();
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({
          item_name: rowData.item_name,
          description: rowData.description,
          price: rowData.price,
          category: rowData.category,
        })
        .eq("id", id);

      if (error) throw error;

      await get().fetchMenuItems(); // Refresh both lists
      set({
        editingRow: null,
        rowData: {},
      });
      Swal.fire("Success", "Meal updated successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to update meal.", "error");
    }
  },

  handleSaveDrink: async (id) => {
    const { rowData } = get();
    try {
      const { error } = await supabase
        .from("drinks")
        .update({
          name: rowData.name,
          price: rowData.price,
          category: rowData.category,
        })
        .eq("id", id);

      if (error) throw error;

      await get().fetchDrinks();
      set({
        editingRow: null,
        rowData: {},
      });
      Swal.fire("Success", "Drink updated successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to update drink.", "error");
    }
  },

  handleDeleteMeal: async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase
            .from("menu_items")
            .delete()
            .eq("id", id);
          if (error) throw error;

          await get().fetchMenuItems();
          Swal.fire("Deleted!", "Meal has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete meal.", "error");
        }
      }
    });
  },

  handleDeleteDrink: async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase.from("drinks").delete().eq("id", id);
          if (error) throw error;

          await get().fetchDrinks();
          Swal.fire("Deleted!", "Drink has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete drink.", "error");
        }
      }
    });
  },
}));

export default useMenuItemsStore;
