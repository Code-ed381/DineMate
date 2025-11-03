# 🔴 Supabase Realtime Implementation Guide

This guide shows you **where and how** to implement Supabase Realtime in your restaurant management system for live updates across all roles.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Implementation by Feature](#implementation-by-feature)
4. [Code Examples](#code-examples)
5. [Best Practices](#best-practices)

---

## Overview

### What Needs Realtime Updates?

| Feature | Tables to Subscribe | Why |
|---------|-------------------|-----|
| **Kitchen Orders** | `order_items` | Chefs see new orders instantly |
| **Bar Orders** | `order_items` | Bartenders see drink orders in real-time |
| **Waiter Dashboard** | `table_sessions`, `orders`, `order_items` | Track table status and order progress |
| **Cashier Panel** | `table_sessions`, `orders` | See tables ready for payment |
| **Table Management** | `restaurant_tables`, `table_sessions` | Real-time table status updates |
| **Menu Orders** | `orders`, `order_items` | Live order tracking for waiters |

---

## Setup & Configuration

### Step 1: Update Supabase Client

Update `/src/lib/supabase.js` to ensure realtime is configured:

```javascript
import { createClient } from '@supabase/supabase-js';

const PROJECT_URI = "https://bvgukcijhcmsfhzywros.supabase.co";
const PROJECT_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient(PROJECT_URI, PROJECT_ANON, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

### Step 2: Enable Realtime in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Enable realtime for these tables:
   - `order_items`
   - `orders`
   - `table_sessions`
   - `restaurant_tables`
   - `cashier_orders_overview` (if it's a table, not a view)

**Note**: Views don't support realtime by default. You'll need to subscribe to the underlying tables.

---

## Implementation by Feature

## 1. Kitchen Store - Real-time Order Updates

### File: `/src/lib/kitchenStore.js`

Add realtime subscriptions to automatically update pending, preparing, ready, and served meals.

```javascript
import { create } from 'zustand';
import { supabase } from './supabase';
import { handleError } from '../components/Error';
import useRestaurantStore from './restaurantStore';

const useKitchenStore = create((set, get) => ({
    loadingPending: false,
    loadingPreparing: false,
    loadingReady: false,
    loadingServed: false,
    pendingMeals: [],
    preparingMeals: [],
    readyMeals: [],
    servedMeals: [],
    orderItemsChannel: null, // Store channel reference

    // ✅ Initialize realtime subscription
    subscribeToOrderItems: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;

        if (!restaurantId) {
            console.warn('No restaurant selected for subscription');
            return;
        }

        // Unsubscribe from previous channel if exists
        const oldChannel = get().orderItemsChannel;
        if (oldChannel) {
            supabase.removeChannel(oldChannel);
        }

        // Create new channel for this restaurant
        const channel = supabase
            .channel(`kitchen-orders-${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'order_items',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                (payload) => {
                    console.log('Kitchen order change:', payload);
                    
                    // Refresh all meals when changes occur
                    get().handleFetchPendingMeals();
                    get().handleFetchPreparingMeals();
                    get().handleFetchReadyMeals();
                    get().handleFetchServedMeals();
                }
            )
            .subscribe();

        set({ orderItemsChannel: channel });
    },

    // ✅ Cleanup subscription
    unsubscribeFromOrderItems: () => {
        const channel = get().orderItemsChannel;
        if (channel) {
            supabase.removeChannel(channel);
            set({ orderItemsChannel: null });
        }
    },

    // Existing methods remain the same...
    handleFetchPendingMeals: async() => { /* ... */ },
    handleFetchPreparingMeals: async() => { /* ... */ },
    handleFetchReadyMeals: async() => { /* ... */ },
    handleFetchServedMeals: async() => { /* ... */ },
}));

export default useKitchenStore;
```

### Usage in Kitchen Component

Update `/src/pages/kitchen.js`:

```javascript
import React, { useEffect } from "react";
import useKitchenStore from "../lib/kitchenStore";

const Kitchen = () => {
  const {
    pendingMeals,
    readyMeals,
    servedMeals,
    handleFetchPendingMeals,
    handleFetchReadyMeals,
    handleFetchServedMeals,
    subscribeToOrderItems,      // ✅ Add this
    unsubscribeFromOrderItems,  // ✅ Add this
  } = useKitchenStore();

  useEffect(() => {
    // Initial fetch
    handleFetchPendingMeals();
    handleFetchReadyMeals();
    handleFetchServedMeals();
    
    // ✅ Subscribe to realtime updates
    subscribeToOrderItems();

    // ✅ Cleanup on unmount
    return () => {
      unsubscribeFromOrderItems();
    };
  }, []);

  return (
    // ... your existing JSX
  );
};

export default Kitchen;
```

---

## 2. Bar Store - Real-time Drink Orders

### File: `/src/lib/barStore.js`

```javascript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import useRestaurantStore from "./restaurantStore";

const useBarStore = create(
  persist(
    (set, get) => ({
      loadingItems: false,
      pendingOrders: [],
      readyOrders: [],
      servedOrders: [],
      orderItemsChannel: null,

      // ✅ Subscribe to drink orders
      subscribeToDrinkOrders: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;

        if (!restaurantId) return;

        const oldChannel = get().orderItemsChannel;
        if (oldChannel) {
            supabase.removeChannel(oldChannel);
        }

        const channel = supabase
            .channel(`bar-orders-${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'order_items',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                (payload) => {
                    console.log('Bar order change:', payload);
                    
                    // Only refresh if it's a drink item
                    // You can check payload.new.type === 'drink'
                    get().handleFetchPendingOrders();
                    get().handleFetchReadyOrders();
                    get().handleFetchServedOrders();
                }
            )
            .subscribe();

        set({ orderItemsChannel: channel });
      },

      unsubscribeFromDrinkOrders: () => {
        const channel = get().orderItemsChannel;
        if (channel) {
            supabase.removeChannel(channel);
            set({ orderItemsChannel: null });
        }
      },

      // Existing methods...
      handleFetchPendingOrders: async () => { /* ... */ },
      handleFetchReadyOrders: async () => { /* ... */ },
      handleFetchServedOrders: async () => { /* ... */ },
    }),
    {
      name: "bar-store",
    }
  )
);

export default useBarStore;
```

---

## 3. Cashier Store - Real-time Payment Sessions

### File: `/src/lib/cashierStore.js`

```javascript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import useRestaurantStore from "./restaurantStore";

const useCashierStore = create(
  persist(
    (set, get) => ({
      activeSessions: [],
      closedSessions: [],
      allSessions: [],
      sessionsChannel: null,

      // ✅ Subscribe to table sessions
      subscribeToSessions: () => {
        const { selectedRestaurant } = useRestaurantStore.getState();
        const restaurantId = selectedRestaurant?.restaurants?.id;

        if (!restaurantId) return;

        const oldChannel = get().sessionsChannel;
        if (oldChannel) {
            supabase.removeChannel(oldChannel);
        }

        const channel = supabase
            .channel(`cashier-sessions-${restaurantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'table_sessions',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                (payload) => {
                    console.log('Session change:', payload);
                    get().getActiveSessionByRestaurant();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `restaurant_id=eq.${restaurantId}`
                },
                (payload) => {
                    console.log('Order change:', payload);
                    get().getActiveSessionByRestaurant();
                }
            )
            .subscribe();

        set({ sessionsChannel: channel });
      },

      unsubscribeFromSessions: () => {
        const channel = get().sessionsChannel;
        if (channel) {
            supabase.removeChannel(channel);
            set({ sessionsChannel: null });
        }
      },

      // Existing methods...
      getActiveSessionByRestaurant: async () => { /* ... */ },
      handlePayment: async () => { /* ... */ },
    }),
    {
      name: "cashier-store",
    }
  )
);

export default useCashierStore;
```

### Usage in Cashier Component

Update `/src/pages/cashier.js`:

```javascript
import React, { useEffect } from "react";
import useCashierStore from "../lib/cashierStore";

export default function CashierDashboard() {
  const {
    activeSessions,
    getActiveSessionByRestaurant,
    subscribeToSessions,      // ✅ Add
    unsubscribeFromSessions,  // ✅ Add
  } = useCashierStore();

  useEffect(() => {
    getActiveSessionByRestaurant();
    subscribeToSessions();  // ✅ Subscribe

    return () => {
      unsubscribeFromSessions();  // ✅ Cleanup
    };
  }, []);

  return (
    // ... your existing JSX
  );
}
```

---

## 4. Tables Store - Real-time Table Status

### File: `/src/lib/tablesStore.js`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import useRestaurantStore from './restaurantStore';

const useTablesStore = create(persist((set, get) => ({
  tables: [],
  loadingTables: false,
  tablesChannel: null,

  // ✅ Subscribe to table changes
  subscribeToTables: () => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;

    if (!restaurantId) return;

    const oldChannel = get().tablesChannel;
    if (oldChannel) {
        supabase.removeChannel(oldChannel);
    }

    const channel = supabase
        .channel(`tables-${restaurantId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'restaurant_tables',
                filter: `restaurant_id=eq.${restaurantId}`
            },
            (payload) => {
                console.log('Table change:', payload);
                get().getTablesOverview();
            }
        )
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'table_sessions',
                filter: `restaurant_id=eq.${restaurantId}`
            },
            (payload) => {
                console.log('Table session change:', payload);
                get().getTablesOverview();
            }
        )
        .subscribe();

    set({ tablesChannel: channel });
  },

  unsubscribeFromTables: () => {
    const channel = get().tablesChannel;
    if (channel) {
        supabase.removeChannel(channel);
        set({ tablesChannel: null });
    }
  },

  // Existing methods...
  getTablesOverview: async () => { /* ... */ },
  handleStatusChange: async (table, status) => { /* ... */ },
})));

export default useTablesStore;
```

---

## 5. Waiter Dashboard - Real-time Session Updates

### File: `/src/pages/dashboards/waiter.js`

```javascript
import React, { useEffect } from "react";
import useMenuStore from "../../lib/menuStore";

const WaiterDashboard = () => {
  const {
    getActiveSessionByRestaurant,
    assignedTables,
    subscribeToSessions,      // ✅ Add to menuStore
    unsubscribeFromSessions,  // ✅ Add to menuStore
  } = useMenuStore();

  useEffect(() => {
    getActiveSessionByRestaurant();
    subscribeToSessions();  // ✅ Subscribe

    return () => {
      unsubscribeFromSessions();  // ✅ Cleanup
    };
  }, []);

  return (
    // ... your existing JSX
  );
};

export default WaiterDashboard;
```

---

## 6. Menu Store - Real-time Order Updates

### File: `/src/lib/menuStore.js`

Add these methods to your existing menuStore:

```javascript
// Inside your menuStore create function
sessionsChannel: null,

subscribeToSessions: () => {
    const { selectedRestaurant } = useRestaurantStore.getState();
    const restaurantId = selectedRestaurant?.restaurants?.id;
    const { user } = useAuthStore.getState();
    const userId = user?.user?.id;

    if (!restaurantId || !userId) return;

    const oldChannel = get().sessionsChannel;
    if (oldChannel) {
        supabase.removeChannel(oldChannel);
    }

    const channel = supabase
        .channel(`waiter-sessions-${userId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'table_sessions',
                filter: `restaurant_id=eq.${restaurantId}`
            },
            (payload) => {
                console.log('Session update:', payload);
                get().getActiveSessionByRestaurant();
            }
        )
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'order_items',
                filter: `restaurant_id=eq.${restaurantId}`
            },
            (payload) => {
                console.log('Order item update:', payload);
                get().getActiveSessionByRestaurant();
            }
        )
        .subscribe();

    set({ sessionsChannel: channel });
},

unsubscribeFromSessions: () => {
    const channel = get().sessionsChannel;
    if (channel) {
        supabase.removeChannel(channel);
        set({ sessionsChannel: null });
    }
},
```

---

## Best Practices

### 1. **Always Cleanup Subscriptions**

```javascript
useEffect(() => {
    subscribeToOrders();
    
    return () => {
        unsubscribeFromOrders();  // ✅ Prevents memory leaks
    };
}, []);
```

### 2. **Filter by Restaurant ID**

Always filter realtime subscriptions by restaurant:

```javascript
filter: `restaurant_id=eq.${restaurantId}`
```

### 3. **Use Unique Channel Names**

Prevent conflicts with unique channel names:

```javascript
.channel(`kitchen-orders-${restaurantId}`)
.channel(`bar-orders-${restaurantId}`)
.channel(`cashier-sessions-${restaurantId}`)
```

### 4. **Batch Updates**

Instead of updating state for every change, debounce or batch updates:

```javascript
import { debounce } from 'lodash';

const debouncedFetch = debounce(() => {
    get().handleFetchPendingMeals();
}, 500);
```

### 5. **Handle Errors Gracefully**

```javascript
.channel(`orders-${restaurantId}`)
.on('postgres_changes', { /* ... */ }, (payload) => {
    try {
        get().handleFetchOrders();
    } catch (error) {
        console.error('Error updating orders:', error);
    }
})
.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to orders');
    }
    if (status === 'CHANNEL_ERROR') {
        console.error('❌ Subscription error');
    }
});
```

---

## Summary of Changes Needed

| File | Action |
|------|--------|
| `kitchenStore.js` | Add `subscribeToOrderItems()`, `unsubscribeFromOrderItems()` |
| `barStore.js` | Add `subscribeToDrinkOrders()`, `unsubscribeFromDrinkOrders()` |
| `cashierStore.js` | Add `subscribeToSessions()`, `unsubscribeFromSessions()` |
| `tablesStore.js` | Add `subscribeToTables()`, `unsubscribeFromTables()` |
| `menuStore.js` | Add `subscribeToSessions()`, `unsubscribeFromSessions()` |
| `kitchen.js` | Call subscribe/unsubscribe in useEffect |
| `bar.js` | Call subscribe/unsubscribe in useEffect |
| `cashier.js` | Call subscribe/unsubscribe in useEffect |
| `waiter.js` | Call subscribe/unsubscribe in useEffect |

---

## Testing Realtime

1. Open two browser windows side-by-side
2. Login as different roles (Chef + Waiter, or Cashier + Waiter)
3. Create an order in one window
4. Watch it appear instantly in the other window

---

## Troubleshooting

**Issue**: Subscriptions not working
- Check Supabase Dashboard → Database → Replication
- Ensure tables have realtime enabled
- Check browser console for connection errors

**Issue**: Getting updates for wrong restaurant
- Verify `filter` includes correct restaurant_id
- Check that selectedRestaurant is set properly

**Issue**: Multiple subscriptions firing
- Ensure you're unsubscribing before creating new subscriptions
- Use unique channel names per component

---

This implementation will give you real-time updates across your entire restaurant management system! 🚀
