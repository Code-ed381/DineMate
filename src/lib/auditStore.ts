import { create } from 'zustand';
import { supabase } from './supabase';
import useAuthStore from './authStore';
import useRestaurantStore from './restaurantStore';

export interface AuditLogEntry {
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  restaurant_id?: string;
  user_id?: string;
}

interface AuditState {
  logs: any[];
  loading: boolean;
  logAction: (entry: AuditLogEntry) => Promise<void>;
  fetchLogs: (restaurantId: string, limit?: number) => Promise<void>;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: [],
  loading: false,

  logAction: async (entry: AuditLogEntry) => {
    try {
      const { user } = useAuthStore.getState();
      const { selectedRestaurant } = useRestaurantStore.getState();
      
      const payload = {
        restaurant_id: entry.restaurant_id || selectedRestaurant?.id,
        user_id: entry.user_id || user?.id,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        details: entry.details || {},
        created_at: new Date().toISOString(),
      };

      if (!payload.restaurant_id || !payload.user_id) {
        console.warn("Audit logging skipped: missing restaurant_id or user_id", payload);
        return;
      }

      const { error } = await supabase.from('audit_logs').insert(payload);
      if (error) throw error;
      
    } catch (error) {
      console.error("Failed to log audit action:", error);
      // Fail silently to not block UI
    }
  },

  fetchLogs: async (restaurantId: string, limit = 50) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            user:users!user_id(first_name, last_name, email)
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      set({ logs: data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      set({ loading: false });
    }
  }
}));
