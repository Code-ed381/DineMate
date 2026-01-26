import { create } from 'zustand';
import { supabase } from './supabase';
import Swal from 'sweetalert2';
import { handleError } from '../components/Error';
import useRestaurantStore from './restaurantStore';
import useAuthStore from './authStore';

interface ActionResponse {
    message: string;
}

interface Table {
    id: string;
    table_id?: string;
    table_number: number | string;
    status: string;
    capacity: number;
    location: string;
    description: string;
    [key: string]: any;
}

interface TableManagementState {
  open: boolean;
  openAvailable: boolean;
  tables: Table[];
  loading: boolean;
  table_no: string;
  status: string;
  items: any[];
  editingRow: string | null;
  rowData: Partial<Table>;
  itemsLoading: boolean;
  employee: any[];
  employees: any[];
  assignEmployee: number;
  order: any[];
  totalQty: number;
  totalPrice: number;
  tableOverview: any[];
  snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning" | "error";
  };
  loadingTables: boolean;
  tablesLoaded: boolean;

  setTotalQty: (qty: number) => void;
  setTotalPrice: (price: number) => void;
  setOrder: (order: any[]) => void;
  preprocessTables: (tables: any[]) => any[];
  addTable: (table_number: string, status: string, capacity: number, location: string, notes: string) => Promise<void>;
  handleEditStart: (id: string, row: Table) => void;
  handleEditChange: (field: string, value: any) => void;
  handleEditStop: () => void;
  handleSave: (id: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleStatusChange: (table: any, status: string) => Promise<ActionResponse | undefined>;
  handleAssignAdmin: (e: any) => Promise<void>;
  handleResetTable: (table: any) => Promise<void>;
  handleOpenOccupied: (item: any, employee: any) => Promise<void>;
  handleClose: () => void;
  handleCloseAvailable: () => void;
  getTablesOverview: () => Promise<void>;
  setSnackbar: (snackbar: any) => void;
}

const useTableManagementStore = create<TableManagementState>()((set, get) => ({
  open: false,
  openAvailable: false,
  tables: [],
  loading: true,
  table_no: "",
  status: "",
  items: [],
  editingRow: null,
  rowData: {},
  itemsLoading: true,
  employee: [],
  employees: [],
  assignEmployee: 0,
  order: [],
  totalQty: 0,
  totalPrice: 0,
  tableOverview: [],
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },
  loadingTables: false,
  tablesLoaded: false,

  setTotalQty: (qty) => set({ totalQty: qty }),

  setTotalPrice: (price) => set({ totalPrice: price }),

  setOrder: (order) => set({ order: order }),

  preprocessTables: (tables) => {
    return tables.map((table) => ({
      ...table,
      waiterName:
        table.assign && table.assign.name ? table.assign.name : "Unknown",
    }));
  },

  addTable: async (table_number, status, capacity, location, notes) => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant && ('restaurants' in selectedRestaurant ? selectedRestaurant.restaurants.id : selectedRestaurant.id);
    if (!restaurantId) return;

    if (!table_number || isNaN(Number(table_number))) {
      Swal.fire("Error", "Please enter a valid table number.", "error");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("restaurant_tables")
        .insert([
          {
            restaurant_id: restaurantId,
            table_number,
            status,
            capacity,
            location,
            description: notes,
          },
        ])
        .select();

      if (error) {
        if (error.code === "23505") {
          Swal.fire("Error", "Table number already exists.", "error");
        } else {
          Swal.fire("Error", error.message || "Failed to add table.", "error");
        }
        return;
      }

      set((state) => ({
        tables: [...state.tables, ...(data || []) as Table[]],
        table_no: "",
        status: "",
      }));
      Swal.fire({
        title: "Success",
        text: "Table added successfully!",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err: any) {
      Swal.fire("Error", err.message || "Unexpected error.", "error");
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

  handleSave: async (id) => {
    const { rowData } = get();
    try {
      const { error } = await supabase
        .from("restaurant_tables")
        .update({
          table_number: rowData.table_number,
          status: rowData.status,
          capacity: rowData.capacity,
          location: rowData.location,
          description: rowData.description,
        })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        tables: state.tables.map((row) =>
          row.id === id ? { ...row, ...rowData } as Table : row
        ),
        editingRow: null,
        rowData: {},
      }));
      Swal.fire("Success", "Table updated successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to update table.", "error");
    }
  },

  handleDelete: async (id) => {
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
            .from("restaurant_tables")
            .delete()
            .eq("id", id);
          if (error) throw error;

          set((state) => ({
            tables: state.tables.filter((row) => row.id !== id),
          }));
          Swal.fire("Deleted!", "Table has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete table.", "error");
        }
      }
    });
  },

  handleStatusChange: async (table, status) => {
    const selectedRestaurant = useRestaurantStore.getState().selectedRestaurant;
    const restaurantId = selectedRestaurant && ('restaurants' in selectedRestaurant ? selectedRestaurant.restaurants.id : selectedRestaurant.id);
    if (!restaurantId) return;

    if (status === "reserve table") {
      const { error } = await supabase
        .from("restaurant_tables")
        .update({ status: "reserved" })
        .eq("id", table.table_id)
        .eq("restaurant_id", restaurantId);

      if (error) throw error;
      await get().getTablesOverview();
      set({ openAvailable: false });
      return { message: "reserved"};
    }
    if (status === "cancel reservation") {
      const { error } = await supabase
        .from("restaurant_tables")
        .update({ status: "available" })
        .eq("id", table.table_id)
        .eq("restaurant_id", restaurantId);

      if (error) throw error;
      await get().getTablesOverview();
      set({ openAvailable: false });
      return { message: "cancelled"};
    }
    // Other logic for start ordering etc. would go here
  },

  handleAssignAdmin: async () => {
    // Logic for assigning admin
  },

  handleResetTable: async (table) => {
    try {
      await supabase.from("orders").delete().eq("table", table.id);
      await supabase
        .from("restaurant_tables")
        .update({ status: "available", assign: null })
        .eq("id", table.id);
      await get().getTablesOverview();
      set({ open: false });
      Swal.fire({ showConfirmButton: false, icon: "success", timer: 2000 });
    } catch (error) {
      handleError(error as Error);
    }
  },

  handleOpenOccupied: async (item) => {
    set({ open: true, itemsLoading: true });
    // Fetch items logic...
  },

  handleClose: () => {
    set({ open: false });
  },

  handleCloseAvailable: () => {
    set({ openAvailable: false });
  },

  getTablesOverview: async () => {
    const selectedRestaurant = useRestaurantStore.getState().selectedRestaurant;
    const restaurantId = selectedRestaurant && ('restaurants' in selectedRestaurant ? selectedRestaurant.restaurants.id : selectedRestaurant.id);
    if (!restaurantId) return;

    set({ loadingTables: true });

    try {
      const { data, error } = await supabase
        .from("waiter_tables_overview")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("table_number", { ascending: true });

      if (error) throw error;

      set({ tables: (data || []) as Table[], tablesLoaded: true });
    } catch (error) {
      handleError(error as Error);
    }
    finally {
      set({ loadingTables: false });
    }
  },

  setSnackbar: (snackbar) => {
    set({ snackbar });
  },
}));

export default useTableManagementStore;
