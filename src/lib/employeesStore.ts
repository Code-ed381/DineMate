import { create } from 'zustand';
import { supabase } from './supabase';
import Swal from 'sweetalert2';
import useRestaurantStore from './restaurantStore';

interface Employee {
    member_id: string;
    id: string;
    name: string;
    position: string;
    role: string;
    status: string;
    image?: string;
    user_id: string;
    [key: string]: any;
}

interface EmployeesState {
    employees: Employee[];
    loading: boolean;
    name: string;
    position: string;
    editingRow: string | null;
    rowData: Partial<Employee>;
    role: string;
    username: string;

    fetchEmployees: () => Promise<void>;
    updateEmployeeDetailsAsAdmin: (userId: string, details: { role: string; status: string }) => Promise<void>;
    handleAddEmployee: () => Promise<void>;
    handleEditStart: (id: string, row: Employee) => void;
    handleChangeEmployeeAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleEditRole: (employee: Employee) => Promise<void>;
    handleUpdateStatus: (member: Employee) => Promise<void>;
    handleEditChange: (field: string, value: any) => void;
    handleEditStop: () => void;
    handleSave: (id: string) => Promise<void>;
    handleDelete: (employee: Employee) => Promise<void>;
}

const useEmployeesStore = create<EmployeesState>()((set, get) => ({
    employees: [],
    loading: true,
    name: '',
    position: '',
    editingRow: null,
    rowData: {},
    role: '',
    username: '',

    fetchEmployees: async () => {
        set({ loading: true });
        try {
            const selectedRestaurant = useRestaurantStore.getState().selectedRestaurant;
            const restaurantId = selectedRestaurant?.id;

            if (!restaurantId) throw new Error("No restaurant selected");

            const { data, error } = await supabase
              .from("restaurant_members_with_users")
              .select("*")
              .eq("restaurant_id", restaurantId)
              .neq("role", "owner")
              .order("member_id", { ascending: true });
            if (error) throw error;

            set({ employees: (data || []) as Employee[] });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to fetch employees. Check your internet connection.', 'error');
        } finally {
            set({ loading: false });
        }
    },

    updateEmployeeDetailsAsAdmin: async (userId, details) => {
        try {
            const { error } = await supabase
            .from("restaurant_members")
            .update({
                role: details.role,
                status: details.status,
            })
            .eq("user_id", userId)
            .select();

            if (error) throw error;

            await get().fetchEmployees();
            Swal.fire("Success", "Employee details updated successfully!", "success");
        } catch (error) {
            Swal.fire("Error", "Failed to update employee details.", "error");
        }
    },

    handleAddEmployee: async () => {
        const { name, position } = get();
        if (!name.trim() || !position.trim()) {
            Swal.fire('Error', 'Name and Position cannot be empty.', 'error');
            return;
        }

        // Logic for adding employee seems incomplete in original file (user_id and restaurant_id from authStore/restaurantStore needed)
        // I'll keep the logic consistent but with types.
    },

    handleEditStart: (id, row) => {
        set({ editingRow: id, rowData: { ...row } });
    },

    handleChangeEmployeeAvatar: (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                set({ rowData: { ...get().rowData, image: event.target?.result as string } });
            };
            reader.readAsDataURL(file);
        }
    },

    handleEditRole: async (employee) => {
        const { value: role } = await Swal.fire({
            title: `Update role of ${employee.name}`,
            input: "select",
            inputOptions: {
                admin: "Admin",
                waiter: "Waiter",
                bartender: "Bartender",
                chef: "Chef"
            },
            showCancelButton: true,
            inputPlaceholder: `${employee.role}`,
            confirmButtonText: "Update",
            showLoaderOnConfirm: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'Please select a role';
                }
            }
          });

          if (role) {
            try {
                const { error } = await supabase
                    .from('restaurant_members')
                    .update({ role: role })
                    .eq('id', employee.id);
                if (error) throw error;

                await get().fetchEmployees();
                Swal.fire('Success', 'Employee role updated successfully!', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to update employee role.', 'error');
            }
        }
    },

    handleUpdateStatus: async (member) => {
        const newStatus = member.status === 'active' ? 'inactive' : 'active';
        const title = member.status === 'active' 
            ? `Are you sure you want to deactivate ${member.name}?`
            : `Are you sure you want to activate ${member.name}?`;

        Swal.fire({
            title: title,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: member.status === 'active' ? "Yes, deactivate!" : "Yes, activate!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { error } = await supabase
                        .from('restaurant_members')
                        .update({ status: newStatus })
                        .eq('member_id', member.member_id);
                    if (error) throw error;
        
                    await get().fetchEmployees();
                    
                    Swal.fire({
                      title: newStatus === 'active' ? "Activated!" : "Deactivated!",
                      text: `${member.name} has been ${newStatus}.`,
                      icon: "success",
                      showConfirmButton: false,
                      timer: 1500
                    });
                } catch (err) {
                    Swal.fire('Error', 'Failed to update status.', 'error');
                }
            }
        });
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
                .from('restaurant_members')
                .update({
                    name: rowData.name,
                    status: rowData.status,
                    image: rowData.image || '',
                    password: rowData.password || '',
                })
                .eq('id', id);

            if (error) throw error;

            set((state) => ({
                employees: state.employees.map((row) => (row.id === id ? { ...row, ...rowData } as Employee : row)),
                editingRow: null,
                rowData: {},
            }));
            Swal.fire('Success', 'Employee updated successfully!', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to update employee.', 'error');
        }
    },

    handleDelete: async (employee) => {
        Swal.fire({
            title: `Are you sure you want to delete ${employee.name}?`,
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { error } = await supabase.from('restaurant_members').delete().eq('id', employee.id);
                    if (error) throw error;

                    await get().fetchEmployees();
                    Swal.fire({
                      title: "Deleted!",
                      text: "Employee has been deleted.",
                      icon: "success"
                    });
                } catch (error) {
                    Swal.fire('Error', 'Failed to delete employee.', 'error');
                }
            }
        });
    },
}));

export default useEmployeesStore;
