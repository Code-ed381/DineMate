
import { renderHook, act } from "@testing-library/react";
import useBarStore from "../barStore";

// Mock Supabase
jest.mock("../supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
    channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

describe("barStore", () => {
    beforeEach(() => {
        useBarStore.setState({
            tabs: [],
            activeTab: 0,
            items: [],
            categories: [],
            selectedCategory: "all",
            searchQuery: "",
            tip: "",
            cash: "",
            card: "",
        });
    });

    test("addNewTab creates a tab with unique ID", () => {
        const { result } = renderHook(() => useBarStore());

        act(() => {
            result.current.addNewTab();
        });

        expect(result.current.tabs).toHaveLength(1);
        expect(result.current.tabs[0].name).toBe("Customer 1");

        act(() => {
            result.current.addNewTab();
        });

        expect(result.current.tabs).toHaveLength(2);
        expect(result.current.tabs[1].name).toBe("Customer 2");
        expect(result.current.tabs[0].id).not.toBe(result.current.tabs[1].id);
    });

    test("addToCart adds item and increments quantity", () => {
        const { result } = renderHook(() => useBarStore());
        const mockItem = { id: "1", name: "Beer", price: 5, image_url: "", category_id: "1", category_name: "Beer", restaurant_id: "1", type: "drink" };

        act(() => {
            result.current.addNewTab(); // activeTab is 0
        });

        act(() => {
            result.current.addToCart(mockItem);
        });

        expect(result.current.tabs[0].cart).toHaveLength(1);
        expect(result.current.tabs[0].cart[0].qty).toBe(1);

        act(() => {
            result.current.addToCart(mockItem);
        });

        expect(result.current.tabs[0].cart).toHaveLength(1);
        expect(result.current.tabs[0].cart[0].qty).toBe(2);
    });

    test("removeFromCart removes item completely", () => {
        const { result } = renderHook(() => useBarStore());
        const mockItem = { id: "1", name: "Beer", price: 5, image_url: "", category_id: "1", category_name: "Beer", restaurant_id: "1", type: "drink" };

        act(() => {
            result.current.addNewTab();
            result.current.addToCart(mockItem);
        });

        expect(result.current.tabs[0].cart).toHaveLength(1);

        act(() => {
            result.current.removeFromCart("1");
        });

        expect(result.current.tabs[0].cart).toHaveLength(0);
    });

    test("updateQuantity updates quantity and removes at 0", () => {
        const { result } = renderHook(() => useBarStore());
        const mockItem = { id: "1", name: "Beer", price: 5, image_url: "", category_id: "1", category_name: "Beer", restaurant_id: "1", type: "drink" };

        act(() => {
            result.current.addNewTab();
            result.current.addToCart(mockItem); // qty: 1
            result.current.addToCart(mockItem); // qty: 2
        });

        act(() => {
            result.current.updateQuantity("1", -1);
        });

        expect(result.current.tabs[0].cart[0].qty).toBe(1);

        act(() => {
            result.current.updateQuantity("1", -1);
        });

        expect(result.current.tabs[0].cart).toHaveLength(0);
    });

    test("getActiveCart returns cart for active tab", () => {
        const { result } = renderHook(() => useBarStore());
        const mockItem1 = { id: "1", name: "Beer", price: 5, image_url: "", category_id: "1", category_name: "Beer", restaurant_id: "1", type: "drink" };
        const mockItem2 = { id: "2", name: "Wine", price: 8, image_url: "", category_id: "1", category_name: "Wine", restaurant_id: "1", type: "drink" };

        act(() => {
            result.current.addNewTab(); // Tab 0
            result.current.addToCart(mockItem1);
            result.current.addNewTab(); // Tab 1
            result.current.setActiveTab(1);
            result.current.addToCart(mockItem2);
        });

        expect(result.current.getActiveCart()[0].name).toBe("Wine");

        act(() => {
             result.current.setActiveTab(0);
        });

        expect(result.current.getActiveCart()[0].name).toBe("Beer");
    });

    test("getTotal calculates correct sum", () => {
        const { result } = renderHook(() => useBarStore());
        const mockItem = { id: "1", name: "Beer", price: 5, image_url: "", category_id: "1", category_name: "Beer", restaurant_id: "1", type: "drink" };

        act(() => {
            result.current.addNewTab();
            result.current.addToCart(mockItem); // 5
            result.current.addToCart(mockItem); // 10
        });

        expect(result.current.getTotal()).toBe(10);
    });

    test("formatCashInput formats correctly", () => {
        const { result } = renderHook(() => useBarStore());
        expect(result.current.formatCashInput("12.3456")).toBe("12.35");
        expect(result.current.formatCashInput("10")).toBe("10.00");
        expect(result.current.formatCashInput("abc")).toBe("");
    });
    
    test("setTip updates tip state", () => {
        const { result } = renderHook(() => useBarStore());
        act(() => {
            result.current.setTip("5.00");
        });
        expect(result.current.tip).toBe("5.00");
    });
});
