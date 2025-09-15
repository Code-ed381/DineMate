import { create } from 'zustand';
import { supabase } from './supabase';
import Swal from 'sweetalert2';
import { handleError } from '../components/Error';
import useMenuStore from './menuStore';
import useRestaurantStore from './restaurantStore';
import useAuthStore from './authStore';


const useTableManagementStore = create((set, get) => ({
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

  // Set assign employee
  setAssignEmployee: (employee) => set({ assignEmployee: employee }),

  // Get employee
  getEmployee: async () => {
    let employeeStringified = localStorage.getItem("employee");
    const employeeParsed = JSON.parse(employeeStringified);
    set({ employee: employeeParsed[0] });
  },

  // Get employees
  getEmployees: async () => {
    try {
      let { data: employees, error } = await supabase
        .from("employees")
        .select("*");
      if (error) throw error;
      set({ employees });
    } catch (error) {
      handleError(error);
    }
  },

  // Set total quantity
  setTotalQty: (qty) => set({ totalQty: qty }),

  // Set total price
  setTotalPrice: (price) => set({ totalPrice: price }),

  // Set order
  setOrder: (order) => set({ order: order }),

  // Set items loading
  setItemsLoading: (loading) => set({ itemsLoading: loading }),

  // Preprocess tables
  preprocessTables: (tables) => {
    return tables.map((table) => ({
      ...table,
      waiterName:
        table.assign && table.assign.name ? table.assign.name : "Unknown",
    }));
  },

  // Fetch tables
  getTables: async () => {
    try {
      set({ loading: true });
      const { employee } = get();
      let query = supabase
        .from("restaurant_tables_with_session")
        .select("*")
        .eq(
          "restaurant_id",
          useRestaurantStore.getState().selectedRestaurant.restaurants.id
        )
        .order("table_number", { ascending: true });

      // Filter tables by waiter
      if (employee.role === "waiter") {
        query = query.or(`assign.eq.${employee.id},status.eq.available`);
      }

      let { data: tables, error } = await query;

      if (error) throw error;

      set({ tables: get().preprocessTables(tables), loading: false });
    } catch (error) {
      handleError(error);
      set({ loading: false });
    }
  },

  // Add a new table
  addTable: async (table_number, status, capacity, location, notes) => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    // Validate locally first
    if (!table_number || isNaN(Number(table_number))) {
      Swal.fire("Error", "Please enter a valid table number.", "error");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("restaurant_tables")
        .insert([
          {
            restaurant_id: selectedRestaurant.restaurants.id,
            table_number,
            status,
            capacity,
            location,
            description: notes,
          },
        ])
        .select();

      if (error) {
        // Handle unique constraint (duplicate table_no)
        if (error.code === "23505") {
          Swal.fire("Error", "Table number already exists.", "error");
        } else {
          Swal.fire("Error", error.message || "Failed to add table.", "error");
        }
        return;
      }

      // Success
      set((state) => ({
        tables: [...state.tables, ...data],
        table_number: "",
        status: "",
      }));
      Swal.fire({
        title: "Success",
        text: "Table added successfully!",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      Swal.fire("Error", err.message || "Unexpected error.", "error");
    }
  },

  // Start editing a table
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

  // Save edited table
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
          row.id === id ? { ...row, ...rowData } : row
        ),
        editingRow: null,
        rowData: {},
      }));
      Swal.fire("Success", "Table updated successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to update table.", "error");
    }
  },

  // Delete a table
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

  // Assign a table to a waiter
  handleStatusChange: async (table, status) => {
    if (status === "reserve table") {
      const { error: tablesError } = await supabase
        .from("restaurant_tables")
        .update({ status: "reserved" })
        .eq("id", table.table_id)
        .eq("restaurant_id", useRestaurantStore.getState().selectedRestaurant.restaurants.id)
        .select();

      if (tablesError) throw tablesError;

      get().getTablesOverview();
      set({ openAvailable: false });

      return { message: "reserved"};
    }
    if (status === "cancel reservation") {
      const { error: tablesError } = await supabase
        .from("restaurant_tables")
        .update({ status: "available" })
        .eq("id", table.table_id)
        .eq(
          "restaurant_id",
          useRestaurantStore.getState().selectedRestaurant.restaurants.id
        )
        .select();

      if (tablesError) throw tablesError;

      get().getTablesOverview();
      set({ openAvailable: false });

      return { message: "cancelled"};
    }
    if (status === "start ordering") {
      const { data: session, error: sessionError } = await supabase
        .from("table_sessions")
        .insert([{
          table_id: table.table_id,
          restaurant_id: useRestaurantStore.getState().selectedRestaurant.restaurants.id,
          waiter_id: useAuthStore.getState().user.user.id,
          opened_at: new Date(),
          status: "open"
        }])
        .select();
      
      if (sessionError) throw sessionError;

      console.log(session);


      const { error: orderError } = await supabase
        .from("orders")
        .insert([{
          restaurant_id: useRestaurantStore.getState().selectedRestaurant.restaurants.id,
          total: 0,
          session_id: session[0].id,
          status: "pending"
        }])
        .select();
          

      if (orderError) throw orderError;

      const { error: tablesError } = await supabase
        .from("restaurant_tables")
        .update({ status: "occupied" })
        .eq("id", table.table_id)
        .eq(
          "restaurant_id",
          useRestaurantStore.getState().selectedRestaurant.restaurants.id
        )
        .select();

      if (tablesError) throw tablesError;

      useMenuStore.getState().setChosenTable(table);

      get().getTablesOverview();

      return { message: "ordering"};
    }
    if (status === "view order") { 
      set({ open: true });

      return { message: "viewing"};
    }
  },

  // Assign a table to an admin
  handleAssignAdmin: async (e) => {
    const { selectedTable } = get();
    try {
      const { error: tablesError } = await supabase
        .from("restaurant_tables")
        .update({ status: "occupied", assign: e.target.value })
        .eq("table_number", selectedTable.table_number)
        .select();

      if (tablesError) throw tablesError;

      const { error: ordersError } = await supabase
        .from("orders")
        .insert([{ table: selectedTable.id, waiter: e.target.value }])
        .select();

      if (ordersError) throw ordersError;

      get().getTablesOverview();
      set({ openAvailable: false });
      Swal.fire({ showConfirmButton: false, icon: "success", timer: 2000 });
    } catch (error) {
      handleError(error);
    }
  },

  // Reset a table
  handleResetTable: async (table) => {
    // Access setTableSelected from menuStore
    const setTableSelected = useMenuStore.getState().setTableSelected;

    try {
      await supabase.from("orders").delete().eq("table", table.id);
      await supabase
        .from("restaurant_tables")
        .update({ status: "available", assign: null })
        .eq("id", table.id)
        .select();
      get().getTables();
      set({ open: false });
      setTableSelected();
      Swal.fire({ showConfirmButton: false, icon: "success", timer: 2000 });
    } catch (error) {
      handleError(error);
    }
  },

  // Open an occupied table
  handleOpenOccupied: async (item, employee) => {
    set({ selectedTable: item, open: true, itemsLoading: true });

    let { data: orders, error } = await supabase
      .from("orders")
      .select(`*, waiter(*)`)
      .eq("table", item.id)
      .eq("status", "pending");

    if (employee.status === "waiter") {
      orders = orders.filter((order) => order.waiter.id === employee.id);
    }

    if (orders.length === 0 && employee.status === "waiter") {
      set({ open: false });
      Swal.fire({
        title: "Access Denied",
        text: "You cannot open orders assigned to other waiters.",
        icon: "error",
      });
      return;
    }

    set({ order: orders[0] });

    if (error) {
      console.log(error);
    } else {
      if (orders.length === 0) {
        set({ items: [], itemsLoading: false });
      } else {
        let { data: ordersItems, error } = await supabase
          .from("ordersItems")
          .select(
            `*, menuItems(*), drinks(*), orders!inner(*, waiter(*), table(*))`
          )
          .eq("order_no", orders[0].id);

        if (error) handleError(error);

        set({ items: ordersItems, itemsLoading: false });

        const totalQuantity = ordersItems.reduce(
          (acc, cur) => acc + cur.quantity,
          0
        );
        const total = ordersItems.reduce((acc, cur) => acc + cur.total, 0);
        set({ totalQty: totalQuantity, totalPrice: total });
      }
    }
  },

  // Close modals
  handleClose: () => {
    set({ open: false });
  },

  // Close available modal
  handleCloseAvailable: () => {
    set({ openAvailable: false });
  },

  // Fetch tables  with session and table overview
  getTablesOverview: async () => {
    const { selectedRestaurant } = useRestaurantStore.getState();

    try {
      const { data, error } = await supabase
        .from("waiter_tables_overview")
        .select("*")
        .eq("restaurant_id", useRestaurantStore.getState().selectedRestaurant.restaurants.id)
        .or(`effective_status.eq.available,waiter_id.eq.${useAuthStore.getState().user.user.id}`)
        .order("table_number", { ascending: true });

      if (error) throw error;

      console.log(data);
      set({ tables: data });
    } catch (error) {
      handleError(error);
    }
  },

  // Set tables
  setTables: (tables) => {
    set({ tables });
  },

  // Set snackbar
  setSnackbar: (snackbar) => {
    set({ snackbar });
  },
}));

export default useTableManagementStore;
