import { create } from "zustand";
import { supabase } from "./supabase";
import useRestaurantStore from "./restaurantStore";
import { toast } from "react-toastify";

// Define strict types for our settings to improve autocomplete and safety
export interface GeneralSettings {
  // Interface
  show_date_and_time_on_navbar?: boolean;
  allow_notifications?: boolean;
  allow_complaints?: boolean;
  show_breadcrumb?: boolean;
  show_light_night_toggle?: boolean;
  show_online_status?: boolean;
  enable_command_palette?: boolean;
  enable_page_transitions?: boolean;
  enable_keyboard_shortcuts?: boolean;
  // Localization
  currency_symbol?: string;
  currency_code?: string;
  timezone?: string;
  date_format?: string;
  // Defaults
  default_view?: string;
  default_theme_mode?: string;
  sidebar_default_open?: boolean;
  tax_rate?: string | number;
  // Session & Security
  session_idle_timeout?: number;
  require_logout_confirmation?: boolean;
  // Receipts
  receipt_footer_message?: string;
}

export interface EmployeePermissions {
  // Admin / Owner Permissions
  employees_update_profile?: boolean;
  admins_view_report?: boolean;
  admin_invite_employee?: boolean;
  admin_delete_edit_employee?: boolean;
  // Waiter Access Controls
  waiter_view_order_history?: boolean;
  waiter_view_performance?: boolean;
  employees_change_password?: boolean;
  // Status Controls
  allow_suspend_employee?: boolean;
  auto_suspend_after_days?: number;
}

export interface EmployeeDefaults {
  // Onboarding
  default_role?: string;
  require_avatar_on_invite?: boolean;
  require_phone_on_invite?: boolean;
  invite_welcome_message?: string;
  // Scheduling
  max_shift_days?: number;
  default_shift_hours?: number;
  // Display
  show_employee_search?: boolean;
  show_role_filter?: boolean;
  show_joined_date?: boolean;
  show_phone_column?: boolean;
  cards_per_page?: number;
}

export interface TableSettings {
  allow_admin_assign?: boolean;
  require_deposit?: boolean;
  default_capacity?: number;
  default_view_mode?: "grid" | "floor";
  show_table_stats?: boolean;
  show_floor_plan?: boolean;
  enable_table_transfer?: boolean;
  enable_reservations?: boolean;
  auto_close_idle_minutes?: number;
  show_session_timer?: boolean;
  timer_warning_minutes?: number;
  timer_danger_minutes?: number;
  show_service_alerts?: boolean;
  allow_waiter_cancel?: boolean;
}

export interface CashierSettings {
  // Payment Methods
  enable_cash?: boolean;
  enable_card?: boolean;
  enable_momo?: boolean;
  enable_card_cash?: boolean;
  enable_online?: boolean;
  default_payment_method?: string;
  // Discounts & Checkout
  allow_manual_discount?: boolean;
  max_discount_percent?: number;
  require_payment_confirmation?: boolean;
  // Receipts & Printing
  auto_print_receipt?: boolean;
  show_proforma_bill?: boolean;
  receipt_footer_message?: string;
  // Display & Audit
  show_revenue_stats?: boolean;
  show_audit_stats?: boolean;
  enable_csv_export?: boolean;
}

export interface BarSettings {
  // Service Modes
  enable_dine_in?: boolean;
  enable_takeaway?: boolean;
  default_mode?: string;
  // Takeaway / OTC Controls
  allow_tips?: boolean;
  allow_void_orders?: boolean;
  show_recent_orders?: boolean;
  show_otc_proforma?: boolean;
  // Dine-In Queue
  show_recipes?: boolean;
  show_order_notes?: boolean;
  show_sla_progress?: boolean;
  enable_overdue_pulse?: boolean;
  show_served_column?: boolean;
  // Receipts
  auto_print_otc?: boolean;
  otc_receipt_footer?: string;
  // Dashboard Display
  show_dashboard_kpis?: boolean;
  show_hourly_chart?: boolean;
  show_popular_drinks?: boolean;
  show_prep_time_chart?: boolean;
}

export interface MenuSettings {
  // Availability & Display
  allow_online_ordering?: boolean;
  hide_out_of_stock?: boolean;
  scheduled_availability?: boolean;
  show_item_images?: boolean;
  show_search_bar?: boolean;
  // Pricing & Tax
  default_tax_rate?: number;
  global_discount?: string;
  // Ordering Controls
  enable_course_selector?: boolean;
  enable_favorites?: boolean;
  allow_order_notes?: boolean;
  allow_void_items?: boolean;
  allow_comp_items?: boolean;
  show_kitchen_status?: boolean;
  // Checkout & Payment
  enable_tips?: boolean;
  allow_split_bill?: boolean;
  show_print_bill?: boolean;
  // Waiter Features
  show_order_history?: boolean;
  allow_reprint?: boolean;
  show_waiter_performance?: boolean;
}

export interface ReportSettings {
  // Report Types & Visibility
  enable_sales_reports?: boolean;
  enable_inventory_reports?: boolean;
  enable_employee_performance?: boolean;
  enable_audit_logs?: boolean;
  enable_xz_reports?: boolean;
  show_report_kpi_cards?: boolean;
  // Export & Download
  default_export_format?: string;
  allow_csv_export?: boolean;
  allow_pdf_export?: boolean;
  export_include_logo?: boolean;
  // Filters & Display
  default_date_range?: string;
  show_waiter_filter?: boolean;
  show_advanced_filters?: boolean;
  show_transaction_table?: boolean;
  // Table Column Controls
  show_balance_column?: boolean;
  show_cash_column?: boolean;
  show_card_column?: boolean;
  // Access Control
  cashiers_view_audit?: boolean;
}

export interface KitchenSettings {
  enable_kds?: boolean;
  show_timers?: boolean;
  default_prep_time?: number;
  enable_border_flash?: boolean;
  enable_sound_alerts?: boolean;
  auto_accept_orders?: boolean;
}

export interface DashboardSettings {
  compact_layout?: boolean;
  default_landing_tab?: string;
  show_revenue_card?: boolean;
  show_order_stats?: boolean;
  show_quick_actions?: boolean;
}

export interface AppSettings {
  general?: GeneralSettings;
  employee_permissions?: EmployeePermissions;
  employee_defaults?: EmployeeDefaults;
  table_settings?: TableSettings;
  cashier_settings?: CashierSettings;
  bar_settings?: BarSettings;
  menu_settings?: MenuSettings;
  report_settings?: ReportSettings;
  kitchen_settings?: KitchenSettings;
  dashboard_settings?: DashboardSettings;
  [key: string]: any; // Allow indexing
}

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  fetchSettings: (restaurantId: string) => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  getSetting: <K extends keyof AppSettings>(key: K) => AppSettings[K] | undefined;
}

// Keep track of timeout IDs for debouncing
const debounceTimers: Record<string, NodeJS.Timeout> = {};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  loading: false,

  fetchSettings: async (restaurantId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("restaurant_settings")
      .select("*")
      .eq("restaurant_id", restaurantId);

    if (error) {
        console.error(error);
        toast.error("Failed to fetch settings.");
        set({ loading: false });
    } else {
      const map = Object.fromEntries((data || []).map((s) => [s.key, s.value]));
      set({ settings: map });
      set({ loading: false });
    }
  },

  updateSetting: async (key, value) => {
    const role = useRestaurantStore.getState().role;
    if (role !== "owner" && role !== "admin") {
      toast.error("Unauthorized: You don't have permission to change these settings.");
      return;
    }
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.id;
    if (!restaurantId) return;

    // Optimistically update local state immediately
    const prevSettings = { ...get().settings };
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));

    // Clear previous timer for this specific key if one is already running
    if (debounceTimers[key as string]) {
      clearTimeout(debounceTimers[key as string]);
    }

    // Debounce the network request by 1 second (1000ms)
    debounceTimers[key as string] = setTimeout(async () => {
      const { error } = await supabase.from("restaurant_settings").upsert(
        { restaurant_id: restaurantId, key: key as string, value },
        { onConflict: "restaurant_id, key" }
      );

      if (error) {
        console.error(`Settings save error for ${String(key)}:`, error);
        toast.error(`Failed to save settings.`);
        // Rollback the specific key to its previous value on failure
        set((state) => ({
          settings: { ...state.settings, [key]: prevSettings[key] },
        }));
      }
    }, 1000);
  },

  getSetting: (key) => {
    return get().settings[key];
  },
}));
