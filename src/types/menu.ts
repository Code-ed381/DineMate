import { RealtimeChannel } from "@supabase/supabase-js";

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  category_name?: string;
  type: 'food' | 'drink';
  image_url?: string;
  restaurant_id: string;
  modifier_groups?: ModifierGroup[];
}

export interface KitchenTask {
  id: string;
  order_id: string;
  order_item_id: string;
  menu_item_id: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  created_at: string;
  updated_at?: string;
}

export interface RestaurantTable {
  id: string;
  table_number: number;
  table_no?: string;
  status: 'available' | 'occupied' | 'reserved' | 'unavailable';
  restaurant_id: string;
  capacity?: number;
  assign?: string | null;
  x_position?: number;
  y_position?: number;
  rotation?: number;
  shape?: 'square' | 'circle';
}

export interface TableSession {
  id: string;
  session_id?: string;
  table_id: string;
  waiter_id: string;
  restaurant_id: string;
  status: string;
  opened_at: string;
  closed_at?: string;
  table_number?: string | number;
  session_status?: string;
}

export interface ModifierGroup {
  id: string;
  restaurant_id: string;
  name: string;
  min_selection: number;
  max_selection: number | null;
  modifiers?: Modifier[];
}

export interface Modifier {
  id: string;
  group_id: string;
  name: string;
  price_adjustment: number;
  is_available: boolean;
}

export interface Category {
  id: string;
  name: string;
  restaurant_id: string;
  image_url?: string;
}

export interface Order {
  id: string;
  session_id: string;
  restaurant_id: string;
  cash?: number;
  card?: number;
  balance?: number;
  total?: number;
  status: string;
  printed: boolean;
  opened_at: string;
  order_total?: number; // From view
  tip?: number;
}

export interface OrderItem {
  id: string;
  order_item_id?: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  sum_price: number;
  type: string;
  status: "pending" | "preparing" | "ready" | "served" | "cancelled";
  notes?: string;
  created_at: string;
  updated_at?: string;
  prepared_by?: string;
  item_name?: string;
  name?: string;
  menu_item_name?: string;
  image_url?: string;
  selected_modifiers?: Modifier[];
  course?: number;
  is_started?: boolean;
  payment_status?: 'pending' | 'completed' | 'failed';
  completed_at?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: string;
  image_url?: string;
  category_id?: string;
  category_name?: string;
  notes?: string;
  selected_modifiers?: Modifier[];
  course?: number;
}

export interface SelectedModifier {
  id: string;
  order_item_id: string;
  modifier_id: string;
  name: string;
  price: number;
}

export interface SalesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface MenuState {
  activeSessionByRestaurant: TableSession[];
  assignedTablesLoaded: boolean;
  tableSelected: boolean;
  assignedTables: Order[];
  chosenTable: string | number | null;
  drinks: MenuItem[];
  originalDrinks: MenuItem[];
  meals: MenuItem[];
  orderTime: string | null;
  originalMeals: MenuItem[];
  drinksLoaded: boolean;
  mealsLoaded: boolean;
  mealsBackgroundColor: string;
  mealsColor: string;
  drinksBackgroundColor: string;
  drinksColor: string;
  filteredMeals: MenuItem[];
  filteredDrinks: MenuItem[];
  showSearch: boolean;
  showFilter: boolean;
  orders: Order[];
  orderId: string | null;
  waiterName: string | null;
  orderItems: OrderItem[];
  originalOrders: Order[];
  orderLoaded: boolean;
  totalOrdersQty: number;
  totalOrdersPrice: number;
  totalRemaining: number;
  orderItemsLoaded: boolean;
  activeStep: number;
  steps: string[];
  proceedToCheckOut: boolean;
  proceedToPrint: boolean;
  cash: string;
  card: string;
  tipAmount: number;
  totalCashCardAmount: number;
  selectedTableOrders: OrderItem[];
  noTablesFound: boolean;
  bill_printed: boolean;
  searchMealValue: string;
  searchDrinkValue: string;
  selectedCategory: string;
  menuItems: MenuItem[];
  filteredMenuItems: MenuItem[];
  originalMenuItems: MenuItem[];
  menuItemsLoaded: boolean;
  loadingMenuItems: boolean;
  categories: Category[];
  loadingCategories: boolean;
  favoriteItemIds: string[];
  chosenTableSession: TableSession | null;
  chosenTableOrderItems: OrderItem[];
  loadingActiveSessionByTableNumber: boolean;
  loadingActiveSessionByRestaurant: boolean;
  activeSeesionByTableNumberLoaded: boolean;
  activeSeesionByRestaurantLoaded: boolean;
  salesData: SalesData;
  loadingChart: boolean;
  myOrders: Order[];
  loadingMyOrders: boolean;
  sessionsChannel: RealtimeChannel | null;
  orderItemsChannel?: RealtimeChannel | null;
  currentOrder: Order | null;
  loadingCurrentOrder: boolean;
  currentOrderItems: OrderItem[];
  loadingCurrentOrderItems: boolean;
  table?: RestaurantTable | null;

  setCurrentOrder: (order: Order | null) => void;
  setCurrentOrderItems: (items: OrderItem[]) => void;
  createOrder: (session_id: string, restaurant_id: string) => Promise<void>;
  deleteOrderBySessionId: (session_id: string) => Promise<void>;
  getOrderBySessionId: (id: string) => Promise<Order | null>;
  getOrderItemsByOrderId: (id: string) => Promise<OrderItem[]>;
  getOrderitemsBySessionId: (sessionId: string) => Promise<OrderItem[]>;
  currentKitchenTasks: KitchenTask[];
  dashboardKitchenTasks: KitchenTask[];
  loadingCurrentKitchenTasks: boolean;
  setAssignedTables: (table: Order[]) => void;
  subscribeToSessions: () => void;
  unsubscribeFromSessions: () => void;
  subscribeToOrderItems: () => void;
  unsubscribeFromOrderItems: () => void;
  fetchCategories: () => Promise<void>;
  fetchMenuItems: () => Promise<void>;
  setTableSelected: () => void;
  confirmPayment: () => Promise<boolean>;
  handleNext: () => Promise<void>;
  handleBack: () => void;
  resetStepper: () => void;
  formatCashInput: (amount: string | number) => string;
  getOrders: () => Promise<void>;
  filterMealsByCategory: (category: string, color: string, backgroundColor: string) => void;
  filterDrinksByCategory: (category: string, color: string, backgroundColor: string) => void;
  setChosenTable: (table: string | number | null) => Promise<void>;
  updateSessionStatus: (status: string) => Promise<void>;
  handlePrintBill: () => Promise<void>;
  addOrUpdateObject: (orderItem: MenuItem, selectedModifiers?: Modifier[]) => Promise<void>;
  updateQuantity: (item: OrderItem, action: 'increase' | 'decrease') => Promise<void>;
  handleRemoveItem: (item: OrderItem) => Promise<void>;
  isSelectedTable: (table: RestaurantTable) => boolean;
  getActiveSessionByRestaurant: () => Promise<void>;
  filterActiveSessionByTableNumber: (tableNumber: string | number) => Promise<void>;
  setSelectedCategory: (category: Category) => void;
  isSelectedCategory: (category: Category) => boolean;
  filterMenuItemsByCategory: () => void;
  setFilteredMenuItems: (menuItems: MenuItem[]) => void;
  fetchSalesData: () => Promise<void>;
  setCash: (value: string) => void;
  setCard: (value: string) => void;
  setTipAmount: (amount: number) => void;
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  updateItemNote: (orderItemId: string, note: string) => Promise<void>;
  payForItems: (itemIds: string[], cash: number, card: number) => Promise<boolean>;
  payAllItems: (cash: number, card: number) => Promise<boolean>;
  voidItem: (orderItemId: string, reason: string) => Promise<void>;
  compItem: (orderItemId: string, reason: string) => Promise<void>;
  resetOrder: () => void;
  // Internal helper functions or state
  getAssignedTables: () => void;
  fetchKitchenTasksForOrder: (orderId: string) => Promise<void>;
  selectedCourse: number;
  setSelectedCourse: (course: number) => void;
  startCourse: (orderId: string, course: number) => Promise<void>;
  recalculateTotals: () => void;
  reorderItem: (item: OrderItem) => Promise<void>;
  repeatRound: () => Promise<void>;
  fetchMyOrderHistory: (waiterId: string, startDate: string, endDate: string) => Promise<void>;
}
