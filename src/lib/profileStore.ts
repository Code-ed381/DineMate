import { create } from 'zustand';

interface ProfileState {
    profile: any;
    loading: boolean;
    name: string;
    position: string;
    editingRow: any;
    rowData: any;
    getProfile: () => Promise<void>;
}

const useProfileStore = create<ProfileState>((set) => ({
    profile: null,
    loading: true,
    name: '',
    position: '',
    editingRow: null,
    rowData: {},

    getProfile: async () => {
        const employeeData = localStorage.getItem('employee');
        if (employeeData) {
            const user = JSON.parse(employeeData);
            set({ profile: Array.isArray(user) ? user[0] : user });
        }
        set({ loading: false });
    },
}));

export default useProfileStore;
