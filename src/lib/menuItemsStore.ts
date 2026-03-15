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

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  selectedTags: string[];
  allTags: string[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;

  setSelectedCategory: (category: string) => void;
  isSelectedCategory: (category: string) => boolean;
  filterMenuItems: () => void;
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

  addMenuItem: (item: any, imageFile?: File) => Promise<void>;
  updateMenuItem: (id: string, item: any, imageFile?: File) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;

  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
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
  searchQuery: "",
  selectedTags: [],
  allTags: [],

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterMenuItems();
  },

  toggleTag: (tag) => {
    const { selectedTags } = get();
    if (selectedTags.includes(tag)) {
      set({ selectedTags: selectedTags.filter((t) => t !== tag) });
    } else {
      set({ selectedTags: [...selectedTags, tag] });
    }
    get().filterMenuItems();
  },

  clearTags: () => {
    set({ selectedTags: [] });
    get().filterMenuItems();
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().filterMenuItems();
  },

  isSelectedCategory: (category) => {
    const { selectedCategory } = get();
    return (selectedCategory || "").toLowerCase() === (category || "").toLowerCase();
  },

  filterMenuItems: () => {
    const { selectedCategory, searchQuery, menuItems, selectedTags } = get();
    let filtered = menuItems;

    // Filter by Category
    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => (item.category_name || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((item) =>
        (item.tags || []).some((tag: string) =>
          selectedTags.some((st) => st.toLowerCase() === tag.toLowerCase())
        )
      );
    }

    // Filter by Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.name || item.item_name || "").toLowerCase().includes(query) ||
        (item.description || "").toLowerCase().includes(query) ||
        (item.category_name || "").toLowerCase().includes(query) ||
        (item.tags || []).some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    set({ filteredMenuItems: filtered });
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
        .eq("restaurant_id", restaurantId)
        .order('name', { ascending: true });

      if (error) throw error;
      const items = (data || []) as MenuItem[];

      // Extract all unique tags
      const allTags = Array.from(
        new Set(items.flatMap((item: MenuItem) => item.tags || []))
      ).sort();

      set({ menuItems: items, allTags });
      get().filterMenuItems(); // Apply existing filters to new data
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
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
    const { name, description, price, category } = get();
    if (!name || !description || !price || !category) {
      Swal.fire("Error", "Please fill in all fields for the meal.", "error");
      return;
    }

    // ─── Subscription limit check ───
    const { useSubscriptionStore } = await import('./subscriptionStore');
    const { getPlanById } = await import('../config/plans');
    const subPlan = useSubscriptionStore.getState().subscriptionPlan || 'free';
    const planLimits = getPlanById(subPlan);
    const totalItems = get().menuItems.length;
    if (planLimits.limits.maxMenuItems !== 9999 && totalItems >= planLimits.limits.maxMenuItems) {
      Swal.fire("Limit Reached", `Your ${planLimits.name} plan allows up to ${planLimits.limits.maxMenuItems} menu items. Please upgrade to add more.`, "warning");
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
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
    const { drink, price, categoryDrinks } = get();
    if (!drink || !price || !categoryDrinks) {
      Swal.fire("Error", "Please fill in all fields for the drink.", "error");
      return;
    }

    // ─── Subscription limit check ───
    const { useSubscriptionStore } = await import('./subscriptionStore');
    const { getPlanById } = await import('../config/plans');
    const subPlan = useSubscriptionStore.getState().subscriptionPlan || 'free';
    const planLimits = getPlanById(subPlan);
    const totalItems = get().menuItems.length;
    if (planLimits.limits.maxMenuItems !== 9999 && totalItems >= planLimits.limits.maxMenuItems) {
      Swal.fire("Limit Reached", `Your ${planLimits.name} plan allows up to ${planLimits.limits.maxMenuItems} menu items. Please upgrade to add more.`, "warning");
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
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
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
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
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
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
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
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
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

  addMenuItem: async (item, imageFile) => {
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
    try {
      const restaurantId = useRestaurantStore.getState().selectedRestaurant?.id;
      if (!restaurantId) throw new Error("No restaurant selected");

      // ─── Subscription limit check ───
      const { useSubscriptionStore } = await import('./subscriptionStore');
      const { getPlanById } = await import('../config/plans');
      const subPlan = useSubscriptionStore.getState().subscriptionPlan || 'free';
      const planLimits = getPlanById(subPlan);
      const totalItems = get().menuItems.length;
      if (planLimits.limits.maxMenuItems !== 9999 && totalItems >= planLimits.limits.maxMenuItems) {
        Swal.fire("Limit Reached", `Your ${planLimits.name} plan allows up to ${planLimits.limits.maxMenuItems} menu items. Please upgrade to add more.`, "warning");
        return;
      }

      let finalImageUrl = item.image_url || "";

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${restaurantId}-${Date.now()}.${fileExt}`;
        const filePath = `items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("menu")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("menu")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("menu_items").insert([{
        restaurant_id: restaurantId,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category_id: item.category_id,
        available: item.available === "true" || item.available === true,
        type: item.type || "food",
        image_url: finalImageUrl,
        tags: item.tags || []
      }]);

      if (error) throw error;

      Swal.fire("Success", "Item added successfully!", "success");
      await get().fetchMenuItems();

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to add menu item.", "error");
    }
  },

  updateMenuItem: async (id, item, imageFile) => {
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
    try {
      let finalImageUrl = item.image_url;

      if (imageFile) {
        const restaurantId = useRestaurantStore.getState().selectedRestaurant?.id;
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${restaurantId}-${Date.now()}.${fileExt}`;
        const filePath = `items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("menu")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("menu")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const updatePayload: any = {
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category_id: item.category_id,
        available: item.available === "true" || item.available === true,
        type: item.type,
        tags: item.tags || []
      };

      if (finalImageUrl) {
        updatePayload.image_url = finalImageUrl;
      }

      const { error } = await supabase
        .from("menu_items")
        .update(updatePayload)
        .eq("id", id);

      if (error) throw error;

      Swal.fire("Success", "Item updated successfully!", "success");
      await get().fetchMenuItems();

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to update menu item.", "error");
    }
  },

  deleteMenuItem: async (id) => {
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
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
          const { error } = await supabase.from("menu_items").delete().eq("id", id);
          if (error) throw error;

          Swal.fire("Deleted!", "Item has been deleted.", "success");
          await get().fetchMenuItems();
        } catch (error) {
          console.error(error);
          Swal.fire("Error", "Failed to delete item.", "error");
        }
      }
    });
  },

  addCategory: async (name) => {
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
    try {
      const restaurantId = useRestaurantStore.getState().selectedRestaurant?.id;
      if (!restaurantId) throw new Error("No restaurant selected");

      const { error } = await supabase.from("menu_categories").insert([{
        name,
        restaurant_id: restaurantId,
      }]);
      if (error) throw error;

      Swal.fire("Success", "Category added successfully!", "success");
      await get().fetchCategories();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to add category.", "error");
    }
  },

  updateCategory: async (id, name) => {
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
    try {
      const { error } = await supabase
        .from("menu_categories")
        .update({ name })
        .eq("id", id);
      if (error) throw error;

      Swal.fire("Success", "Category updated!", "success");
      await get().fetchCategories();
      await get().fetchMenuItems();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update category.", "error");
    }
  },

  deleteCategory: async (id) => {
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
      return;
    }
    Swal.fire({
      title: "Are you sure?",
      text: "All items in this category will become uncategorized.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase.from("menu_categories").delete().eq("id", id);
          if (error) throw error;

          Swal.fire("Deleted!", "Category has been deleted.", "success");
          await get().fetchCategories();
          await get().fetchMenuItems();
        } catch (error) {
          console.error(error);
          Swal.fire("Error", "Failed to delete category.", "error");
        }
      }
    });
  },
}));

export default useMenuItemsStore;
