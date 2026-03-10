import { create } from 'zustand';
import { supabase } from './supabase';
import Swal from 'sweetalert2';
import { toE164 } from '../utils/phoneValidation';
import useRestaurantStore from './restaurantStore';
import { useAuditStore } from './auditStore';

interface Employee {
    member_id: string;
    id: string;
    name: string;
    position: string;
    role: string;
    status: string;
    avatar_url?: string;
    created_at: string;
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
    addEmployee: (data: { firstName: string, lastName: string, email: string, phone: string, role: string, avatarUrl: string }) => Promise<void>;
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
        const roleState = useRestaurantStore.getState().role;
        if (roleState !== "owner" && roleState !== "admin") {
            Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
            return;
        }
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

    addEmployee: async ({ firstName, lastName, email, phone, role, avatarUrl }) => {
        const roleState = useRestaurantStore.getState().role;
        if (roleState !== "owner" && roleState !== "admin") {
            Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
            return;
        }
        try {
            // ─── Subscription limit check ───
            const { useSubscriptionStore } = await import('./subscriptionStore');
            const { getPlanById } = await import('../config/plans');
            const subPlan = useSubscriptionStore.getState().subscriptionPlan || 'free';
            const plan = getPlanById(subPlan);
            const currentCount = get().employees.length;
            if (plan.limits.maxEmployees !== 9999 && currentCount >= plan.limits.maxEmployees) {
              Swal.fire("Limit Reached", `Your ${plan.name} plan allows up to ${plan.limits.maxEmployees} employees. Please upgrade to add more.`, "warning");
              return;
            }

            const normalizedPhone = phone ? toE164(phone) : '';
            // 1. Invite user via email using backend Edge Function
            const selectedRestaurant = useRestaurantStore.getState().selectedRestaurant;
            if (!selectedRestaurant?.id) throw new Error("No restaurant selected");

            const { data: authData, error: authError } = await supabase.functions.invoke("admin-actions", {
                body: {
                    action: "invite-user",
                    restaurantId: selectedRestaurant.id,
                    email: email,
                    metadata: {
                        firstName: firstName,
                        lastName: lastName,
                        phone: normalizedPhone,
                        profileAvatar: avatarUrl,
                        role: 'employee'
                    }
                }
            });

            if (authError || !authData?.success) throw new Error(authError?.message || "Failed to invite user");
            
            const user = authData.data.user;
            if (!user) throw new Error("Failed to retrieve invited user details");

            // 2. Add to restaurant_members
            if (!selectedRestaurant?.id) throw new Error("No restaurant selected");

            const { error: memberError } = await supabase
                .from('restaurant_members')
                .insert([{
                    user_id: user.id,
                    restaurant_id: selectedRestaurant.id,
                    role: role,
                    status: 'pending',
                    first_name: firstName,
                    last_name: lastName,
                    phone: normalizedPhone,
                    email: email
                }]);

            if (memberError) {
                console.error("Member creation failed:", memberError);
                throw memberError;    
            }

            await get().fetchEmployees();
            
            // Audit Log
            await useAuditStore.getState().logAction({
                action: 'create_employee',
                entity_type: 'employee',
                entity_id: authData.user.id,
                details: { name: `${firstName} ${lastName}`, role, email }
            });

            Swal.fire('Success', `Invite sent to ${email}`, 'success');

        } catch (error: any) {
            console.error(error);
            throw new Error(error.message || 'Failed to add employee');
        }
    },

    handleEditStart: (id, row) => {
        set({ editingRow: id, rowData: { ...row } });
    },

    handleChangeEmployeeAvatar: (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                set({ rowData: { ...get().rowData, avatar_url: event.target?.result as string } });
            };
            reader.readAsDataURL(file);
        }
    },

    handleEditRole: async (employee) => {
        const roleState = useRestaurantStore.getState().role;
        if (roleState !== "owner" && roleState !== "admin") {
            Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
            return;
        }
        const { value: role } = await Swal.fire({
            title: `Update role of ${employee.name}`,
            input: "select",
            inputOptions: {
                admin: "Admin",
                waiter: "Waiter",
                bartender: "Bartender",
                chef: "Chef",
                cashier: "Cashier"
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
                // Use member_id if available, or fetch by user_id/restaurant_id combo if needed
                // The employee object from view usually has member_id
                const idToUpdate = employee.member_id || employee.id;

                const { error } = await supabase
                    .from('restaurant_members')
                    .update({ role: role })
                    .eq('member_id', idToUpdate);
                if (error) throw error;

                await get().fetchEmployees();

                // Audit Log
                await useAuditStore.getState().logAction({
                    action: 'update_employee_role',
                    entity_type: 'employee',
                    entity_id: idToUpdate,
                    details: { old_role: employee.role, new_role: role, employee_name: employee.name }
                });

                Swal.fire('Success', 'Employee role updated successfully!', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to update employee role.', 'error');
            }
        }
    },

    handleUpdateStatus: async (member) => {
        const roleState = useRestaurantStore.getState().role;
        if (roleState !== "owner" && roleState !== "admin") {
            Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
            return;
        }
        const newStatus = member.status === 'active' ? 'suspended' : 'active';
        const title = member.status === 'active' 
            ? `Are you sure you want to suspend ${member.name}?`
            : `Are you sure you want to activate ${member.name}?`;

        Swal.fire({
            title: title,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: member.status === 'active' ? "Yes, suspend!" : "Yes, activate!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { error } = await supabase
                        .from('restaurant_members')
                        .update({ status: newStatus })
                        .eq('member_id', member.member_id);
                    if (error) throw error;
        
                    await get().fetchEmployees();
                    
                    // Audit Log
                    await useAuditStore.getState().logAction({
                        action: 'update_employee_status',
                        entity_type: 'employee',
                        entity_id: member.member_id,
                        details: { status: newStatus, employee_name: member.name }
                    });
                    
                    Swal.fire({
                      title: newStatus === 'active' ? "Activated!" : "Suspended!",
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
        const roleState = useRestaurantStore.getState().role;
        if (roleState !== "owner" && roleState !== "admin") {
            Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
            return;
        }
        const { rowData } = get();
        try {
            const { error } = await supabase
                .from('restaurant_members')
                .update({
                    // name: rowData.name, // Name is usually computed/in auth, but if members table has it:
                    status: rowData.status,
                    // image: rowData.image || '', // Image is usually in auth or a separate bucket url column
                    // password removal
                })
                .eq('member_id', id); // Use member_id

            if (error) throw error;

            set((state) => ({
                employees: state.employees.map((row) => (row.member_id === id ? { ...row, ...rowData } as Employee : row)),
                editingRow: null,
                rowData: {},
            }));
            Swal.fire('Success', 'Employee updated successfully!', 'success');
        } catch (error) {
            Swal.fire('Error', 'Failed to update employee.', 'error');
        }
    },

    handleDelete: async (employee) => {
        const roleState = useRestaurantStore.getState().role;
        if (roleState !== "owner" && roleState !== "admin") {
            Swal.fire("Unauthorized", "You don't have permission to perform this action.", "error");
            return;
        }
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
                    // Delete from restaurant_members
                    const idToDelete = employee.member_id || employee.id;
                    const { error } = await supabase.from('restaurant_members').delete().eq('user_id', idToDelete);
                    if (error) throw error;

                    // Optionally delete from auth users if we created it? 
                    // Usually we might want to keep the user but remove access. 
                    // The current requirement is just to make the delete button work.

                    await get().fetchEmployees();

                    // Audit Log
                    await useAuditStore.getState().logAction({
                         action: 'delete_employee',
                         entity_type: 'employee',
                         entity_id: idToDelete,
                         details: { employee_name: employee.name }
                    });

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
