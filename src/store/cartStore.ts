// store/cartStore.ts - FIXED VERSION
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/cart';

interface CartState {
    // =================== STATE DATA ===================
    items: CartItem[]; // Danh sách items trong giỏ hàng
    itemCount: number; // ✅ FIXED: Chuyển thành regular state
    totalAmount: number; // ✅ FIXED: Chuyển thành regular state
    isLoading: boolean; // Đang load từ server
    error: string | null; // Error message nếu có lỗi
    lastUpdated: string | null; // Lần cuối sync với server

    // =============== ACTIONS (METHODS) ================

    // --- Cart Data Operations ---
    setItems: (items: CartItem[]) => void; // Set toàn bộ items (từ API)
    addItem: (item: CartItem) => void; // Thêm item mới
    removeItem: (cartItemId: number) => void; // Xóa item theo cart ID
    clearCart: () => void; // Xóa tất cả items

    // --- Helper để update computed values ---
    updateComputedValues: () => void; // ✅ NEW: Update count & total

    // --- Loading & Error Management ---
    setLoading: (loading: boolean) => void; // Set loading state
    setError: (error: string | null) => void; // Set error message

    // --- Helper Methods ---
    refreshCart: () => Promise<void>; // Sync với server
    isItemInCart: (courseId: number) => boolean; // Check course có trong cart không
    getCartItemByCourseId: (courseId: number) => CartItem | null; // Get cart item theo course ID
    updateLastUpdated: () => void; // Update timestamp
}

/**
 * ✅ HELPER: Tính computed values
 */
const calculateComputedValues = (items: CartItem[]) => {
    return {
        itemCount: items.length,
        totalAmount: items.reduce((total, item) => total + item.course.price, 0),
    };
};

/**
 * ✅ ZUSTAND STORE CREATION - FIXED
 */
const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // =================== INITIAL STATE ===================
            items: [], // Ban đầu giỏ hàng rỗng
            itemCount: 0, // ✅ FIXED: Regular state
            totalAmount: 0, // ✅ FIXED: Regular state
            isLoading: false, // Không loading
            error: null, // Không có lỗi
            lastUpdated: null, // Chưa sync lần nào

            // ================= CART OPERATIONS =================

            /**
             * ✅ SET ITEMS - Set toàn bộ cart items (từ API)
             */
            setItems: (items) => {
                const computed = calculateComputedValues(items);
                set({
                    items,
                    itemCount: computed.itemCount, // ✅ Update computed values
                    totalAmount: computed.totalAmount, // ✅ Update computed values
                    lastUpdated: new Date().toISOString(),
                    error: null,
                });
            },

            /**
             * ✅ ADD ITEM - Thêm item mới vào cart
             */
            addItem: (item) =>
                set((state) => {
                    // ✅ Check duplicate
                    const existingItem = state.items.find((i) => i.course.id === item.course.id);
                    if (existingItem) {
                        return state; // Không thêm duplicate
                    }

                    const newItems = [...state.items, item];
                    const computed = calculateComputedValues(newItems);

                    return {
                        items: newItems,
                        itemCount: computed.itemCount, // ✅ Update computed values
                        totalAmount: computed.totalAmount, // ✅ Update computed values
                        lastUpdated: new Date().toISOString(),
                        error: null,
                    };
                }),

            /**
             * ✅ REMOVE ITEM - Xóa item theo cart item ID
             */
            removeItem: (cartItemId) =>
                set((state) => {
                    const newItems = state.items.filter((item) => item.id !== cartItemId);
                    const computed = calculateComputedValues(newItems);

                    return {
                        items: newItems,
                        itemCount: computed.itemCount, // ✅ Update computed values
                        totalAmount: computed.totalAmount, // ✅ Update computed values
                        lastUpdated: new Date().toISOString(),
                        error: null,
                    };
                }),

            /**
             * ✅ CLEAR CART - Xóa tất cả items
             */
            clearCart: () =>
                set({
                    items: [],
                    itemCount: 0, // ✅ Reset computed values
                    totalAmount: 0, // ✅ Reset computed values
                    lastUpdated: new Date().toISOString(),
                    error: null,
                }),

            /**
             * ✅ UPDATE COMPUTED VALUES - Manual update nếu cần
             */
            updateComputedValues: () =>
                set((state) => {
                    const computed = calculateComputedValues(state.items);
                    return {
                        itemCount: computed.itemCount,
                        totalAmount: computed.totalAmount,
                    };
                }),

            // ============== LOADING & ERROR MANAGEMENT ==============

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error }),

            // ================== HELPER METHODS ==================

            /**
             * ✅ REFRESH CART - Sync với server
             */
            refreshCart: async () => {
                set({ isLoading: true, error: null });

                try {
                    const { getCartService } = await import('../services/cartService');
                    const response = await getCartService();

                    // ✅ Sử dụng setItems để tự động update computed values
                    const computed = calculateComputedValues(response.data);

                    set({
                        items: response.data,
                        itemCount: computed.itemCount,
                        totalAmount: computed.totalAmount,
                        isLoading: false,
                        lastUpdated: new Date().toISOString(),
                        error: null,
                    });
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.message || 'Lỗi khi tải giỏ hàng',
                    });
                }
            },

            /**
             * ✅ IS ITEM IN CART - Kiểm tra course có trong cart không
             */
            isItemInCart: (courseId) => {
                return get().items.some((item) => item.course.id === courseId);
            },

            /**
             * ✅ GET CART ITEM BY COURSE ID
             */
            getCartItemByCourseId: (courseId) => {
                return get().items.find((item) => item.course.id === courseId) || null;
            },

            /**
             * ✅ UPDATE TIMESTAMP
             */
            updateLastUpdated: () => set({ lastUpdated: new Date().toISOString() }),
        }),

        // ================ PERSIST CONFIGURATION ================
        {
            name: 'cart-storage', // localStorage key
            partialize: (state) => ({
                items: state.items,
                itemCount: state.itemCount, // ✅ PERSIST computed values
                totalAmount: state.totalAmount, // ✅ PERSIST computed values
                lastUpdated: state.lastUpdated,
                // KHÔNG persist: isLoading, error (temporary states)
            }),

            // ✅ HYDRATION CALLBACK - Đảm bảo computed values đúng sau khi restore
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // ✅ Recalculate computed values sau khi restore từ localStorage
                    const computed = calculateComputedValues(state.items);
                    state.itemCount = computed.itemCount;
                    state.totalAmount = computed.totalAmount;
                }
            },
        }
    )
);

export default useCartStore;
