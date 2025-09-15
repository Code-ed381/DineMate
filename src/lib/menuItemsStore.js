import { create } from 'zustand';
import { supabase } from './supabase';
import Swal from 'sweetalert2';
import useRestaurantStore from './restaurantStore';

const useMenuItemsStore = create((set, get) => ({
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

  // Fetch categories
  fetchCategories: async () => {
    set({ loadingCategories: true });
    try {
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq(
          "restaurant_id",
          useRestaurantStore.getState().selectedRestaurant.restaurants.id
        );
      if (error) throw error;
      set({ categories: data });
    } catch (error) {
      Swal.fire("Error", "Failed to fetch categories.", "error");
    } finally {
      set({ loadingCategories: false });
    }
  },

  // Fetch menu items
  fetchMenuItems: async () => {
    set({ loadingMenuItems: true });
    try {
      const restaurantId =
        useRestaurantStore.getState().selectedRestaurant?.restaurants?.id;
      if (!restaurantId) throw new Error("No restaurant selected");

      const { data, error } = await supabase
        .from("menu_items_with_category")
        .select("*")
        .eq("restaurant_id", restaurantId);

      if (error) throw error;
      console.log(data);
      set({ menuItems: data || [], filteredMenuItems: data || [] });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch menu items.", "error");
      set({ menuItems: [], filteredMenuItems: [] }); // 👈 fallback
    } finally {
      set({ loadingMenuItems: false });
    }
  },

  // Fetch meals
  fetchMeals: async () => {
    set({ loadingMeals: true });
    try {
      const { data, error } = await supabase.from("menu_items").select("*");
      if (error) throw error;
      set({ meals: data, filteredMeals: data });
    } catch (error) {
      Swal.fire("Error", "Failed to fetch meals.", "error");
    } finally {
      set({ loadingMeals: false });
    }
  },

  // Fetch drinks
  fetchDrinks: async () => {
    set({ loadingDrinks: true });
    try {
      const { data, error } = await supabase.from("drinks").select("*");
      if (error) throw error;
      set({ drinks: data, filteredDrinks: data });
    } catch (error) {
      Swal.fire("Error", "Failed to fetch drinks.", "error");
    } finally {
      set({ loadingDrinks: false });
    }
  },

  // Add a new meal
  handleAddMeal: async () => {
    const { name, description, price, category } = get();
    if (!name || !description || !price || !category) {
      Swal.fire("Error", "Please fill in all fields for the meal.", "error");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("menuItems")
        .insert([{ item_name: name, description, price, category }])
        .select();
      if (error) throw error;

      Swal.fire("Success", "Meal added successfully!", "success");
      set((state) => ({
        meals: [...state.meals, ...data],
        filteredMeals: [...state.filteredMeals, ...data],
        name: "",
        description: "",
        price: "",
        category: "",
      }));
    } catch (error) {
      Swal.fire("Error", "Failed to add meal.", "error");
    }
  },

  // Add a new drink
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
      set((state) => ({
        drinks: [...state.drinks, ...data],
        filteredDrinks: [...state.filteredDrinks, ...data],
        drink: "",
        price: "",
        categoryDrinks: "",
      }));
    } catch (error) {
      Swal.fire("Error", "Failed to add drink.", "error");
    }
  },

  // Start editing an item
  handleEditStart: (id, row) => {
    set({ editingRow: id, rowData: { ...row } });
  },

  // Handle changes during editing
  handleEditChange: (field, value) => {
    set((state) => ({ rowData: { ...state.rowData, [field]: value } }));
  },

  // Stop editing
  handleEditStop: () => {
    set({ editingRow: null, rowData: {} });
  },

  // Save edited meal
  handleSaveMeal: async (id) => {
    const { rowData } = get();
    try {
      const { error } = await supabase
        .from("menuItems")
        .update({
          item_name: rowData.item_name,
          description: rowData.description,
          price: rowData.price,
          category: rowData.category,
        })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        meals: state.meals.map((row) =>
          row.id === id ? { ...row, ...rowData } : row
        ),
        filteredMeals: state.filteredMeals.map((row) =>
          row.id === id ? { ...row, ...rowData } : row
        ),
        editingRow: null,
        rowData: {},
      }));
      Swal.fire("Success", "Meal updated successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to update meal.", "error");
    }
  },

  // Save edited drink
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

      set((state) => ({
        drinks: state.drinks.map((row) =>
          row.id === id ? { ...row, ...rowData } : row
        ),
        filteredDrinks: state.filteredDrinks.map((row) =>
          row.id === id ? { ...row, ...rowData } : row
        ),
        editingRow: null,
        rowData: {},
      }));
      Swal.fire("Success", "Drink updated successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to update drink.", "error");
    }
  },

  // Delete a meal
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
            .from("menuItems")
            .delete()
            .eq("id", id);
          if (error) throw error;

          set((state) => ({
            meals: state.meals.filter((row) => row.id !== id),
            filteredMeals: state.filteredMeals.filter((row) => row.id !== id),
          }));
          Swal.fire("Deleted!", "Meal has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete meal.", "error");
        }
      }
    });
  },

  // Delete a drink
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

          set((state) => ({
            drinks: state.drinks.filter((row) => row.id !== id),
            filteredDrinks: state.filteredDrinks.filter((row) => row.id !== id),
          }));
          Swal.fire("Deleted!", "Drink has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete drink.", "error");
        }
      }
    });
  },
}));

export default useMenuItemsStore;
