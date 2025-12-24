// store/orderStore.ts - Updated with txnRef methods
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus, SearchOrderDto } from '../types/order';

/**
 * ✅ ORDER STORE INTERFACE
 * Định nghĩa tất cả state và actions cho Order Management
 */
interface OrderState {
    // =================== STATE DATA ===================
    orders: Order[]; // Danh sách đơn hàng
    isLoading: boolean; // Đang load orders từ server
    error: string | null; // Error message nếu có lỗi
    lastUpdated: string | null; // Lần cuối cập nhật (cho sync)

    // Current order being processed (cho purchase flow)
    currentOrder: Order | null; // Đơn hàng đang được xử lý

    // ✅ PAGINATION STATE (từ server response)
    pagination: {
        page: number; // Current page (0-indexed)
        size: number; // Items per page
        totalElements: number; // Total items
        totalPages: number; // Total pages
    };

    // ============== COMPUTED VALUES (GETTERS) ==============
    pendingOrdersCount: number; // Số đơn hàng đang chờ
    completedOrdersCount: number; // Số đơn hàng hoàn thành
    totalSpent: number; // Tổng tiền đã chi tiêu

    // =============== ACTIONS (METHODS) ================

    // --- Order Data Operations ---
    setOrders: (orders: Order[]) => void; // Set toàn bộ orders (từ API)
    addOrder: (order: Order) => void; // Thêm order mới (sau khi tạo)
    updateOrder: (orderId: number, updatedOrder: Partial<Order>) => void; // Update order
    removeOrder: (orderId: number) => void; // Xóa order (sau khi delete API)
    setCurrentOrder: (order: Order | null) => void; // Set order đang xử lý

    // --- Loading & Error Management ---
    setLoading: (loading: boolean) => void; // Set loading state
    setError: (error: string | null) => void; // Set error message

    // --- Helper Methods ---
    refreshOrders: (
        searchDto?: SearchOrderDto,
        page?: number,
        size?: number,
        sort?: string
    ) => Promise<void>; // Sync với server (support search & pagination)
    getOrderById: (orderId: number) => Order | null; // Lấy order theo ID
    getOrdersByStatus: (status: OrderStatus) => Order[]; // Lấy orders theo status
    getOrderByTxnRef: (txnRef: string) => Order | null; // ✅ NEW: Lấy order theo txnRef
    updateOrderByTxnRef: (txnRef: string, updates: Partial<Order>) => void; // ✅ NEW: Update bằng txnRef
    updateLastUpdated: () => void; // Update timestamp
    setPagination: (page: number, size: number, totalElements: number, totalPages: number) => void; // Set pagination
}

/**
 * ✅ ZUSTAND STORE CREATION
 */
const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            // =================== INITIAL STATE ===================
            orders: [], // Ban đầu chưa có orders
            isLoading: false, // Không loading
            error: null, // Không có lỗi
            lastUpdated: null, // Chưa update lần nào
            currentOrder: null, // Không có order đang xử lý
            pagination: {
                page: 0,
                size: 10,
                totalElements: 0,
                totalPages: 0,
            },

            // =============== COMPUTED VALUES =================
            get pendingOrdersCount() {
                return get().orders.filter((order) => order.status === 'Pending').length;
            },

            get completedOrdersCount() {
                return get().orders.filter((order) => order.status === 'Completed').length;
            },

            get totalSpent() {
                return get()
                    .orders.filter((order) => order.status === 'Completed')
                    .reduce((total, order) => {
                        // Dùng totalAmount nếu có, nếu không dùng priceAtPurchase
                        return total + (order.totalAmount || order.detail.priceAtPurchase);
                    }, 0);
            },

            // ================= ORDER OPERATIONS =================

            /**
             * Set toàn bộ orders (thường từ API response)
             * Sort theo ngày tạo mới nhất
             */
            setOrders: (orders) =>
                set({
                    orders: orders.sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    ),
                    lastUpdated: new Date().toISOString(),
                    error: null,
                }),

            /**
             * Thêm order mới (sau khi tạo đơn hàng thành công)
             * Thêm vào đầu array để hiển thị đầu tiên
             */
            addOrder: (order) =>
                set((state) => ({
                    orders: [order, ...state.orders],
                    lastUpdated: new Date().toISOString(),
                    error: null,
                })),

            /**
             * Update thông tin order (ví dụ: status change, payment update)
             */
            updateOrder: (orderId, updatedOrder) =>
                set((state) => ({
                    orders: state.orders.map((order) =>
                        order.id === orderId ? { ...order, ...updatedOrder } : order
                    ),
                    lastUpdated: new Date().toISOString(),
                    error: null,
                })),

            /**
             * Xóa order (sau khi delete API thành công)
             */
            removeOrder: (orderId) =>
                set((state) => ({
                    orders: state.orders.filter((order) => order.id !== orderId),
                    lastUpdated: new Date().toISOString(),
                    error: null,
                })),

            /**
             * Set current order đang được xử lý (cho purchase flow)
             */
            setCurrentOrder: (order) => set({ currentOrder: order }),

            // ============== LOADING & ERROR MANAGEMENT ==============

            setLoading: (loading) => set({ isLoading: loading }),

            setError: (error) => set({ error }),

            // ================== HELPER METHODS ==================

            /**
             * ✅ REFRESH ORDERS - Sync với server (support search & pagination)
             *
             * @param searchDto - Search filters (optional)
             * @param page - Page number, 0-indexed (optional, default 0)
             * @param size - Page size (optional, default 10)
             * @param sort - Sort field and direction (optional, default 'createdAt,desc')
             */
            refreshOrders: async (searchDto, page = 0, size = 10, sort = 'createdAt,desc') => {
                set({ isLoading: true, error: null });

                try {
                    // ✅ Dynamic import để tránh circular dependency
                    const { getOrdersService } = await import('../services/orderService');
                    const response = await getOrdersService(searchDto, page, size, sort);

                    // Sort orders theo createdAt mới nhất
                    const sortedOrders = response.data.content.sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );

                    set({
                        orders: sortedOrders,
                        isLoading: false,
                        lastUpdated: new Date().toISOString(),
                        error: null,
                        pagination: {
                            page: response.data.number,
                            size: response.data.size,
                            totalElements: response.data.totalElements,
                            totalPages: response.data.totalPages,
                        },
                    });
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error ? error.message : 'Lỗi khi tải danh sách đơn hàng';
                    set({
                        isLoading: false,
                        error: errorMessage,
                    });
                }
            },

            /**
             * ✅ SET PAGINATION STATE
             */
            setPagination: (page, size, totalElements, totalPages) =>
                set({
                    pagination: { page, size, totalElements, totalPages },
                }),

            /**
             * ✅ GET ORDER BY ID
             */
            getOrderById: (orderId) => {
                return get().orders.find((order) => order.id === orderId) || null;
            },

            /**
             * ✅ GET ORDERS BY STATUS
             */
            getOrdersByStatus: (status) => {
                return get().orders.filter((order) => order.status === status);
            },

            /**
             * ✅ GET ORDER BY TRANSACTION REF
             * Tìm order theo txnRef từ VNPay callback
             *
             * @param txnRef - Format: "20250821160529_7" where 7 is orderId
             * @returns Order | null
             */
            getOrderByTxnRef: (txnRef) => {
                // ✅ Parse orderId from txnRef
                // txnRef format: "20250821160529_7" -> orderId = 7
                const parts = txnRef.split('_');
                if (parts.length < 2) {
                    console.warn(`Invalid txnRef format: ${txnRef}`);
                    return null;
                }

                const orderIdStr = parts[parts.length - 1]; // Lấy phần cuối
                const orderId = parseInt(orderIdStr);

                if (isNaN(orderId)) {
                    console.warn(`Cannot parse orderId from txnRef: ${txnRef}`);
                    return null;
                }

                return get().orders.find((order) => order.id === orderId) || null;
            },

            /**
             * ✅ UPDATE ORDER STATUS BY TXNREF
             * Cập nhật order status sau khi thanh toán
             *
             * @param txnRef - Transaction reference từ VNPay
             * @param updates - Partial order data để update
             */
            updateOrderByTxnRef: (txnRef, updates) => {
                // ✅ Parse orderId từ txnRef
                const parts = txnRef.split('_');
                if (parts.length < 2) {
                    console.warn(`Invalid txnRef format: ${txnRef}`);
                    return;
                }

                const orderIdStr = parts[parts.length - 1];
                const orderId = parseInt(orderIdStr);

                if (isNaN(orderId)) {
                    console.warn(`Cannot parse orderId from txnRef: ${txnRef}`);
                    return;
                }

                // ✅ Update order với orderId tương ứng
                set((state) => ({
                    orders: state.orders.map((order) =>
                        order.id === orderId
                            ? {
                                  ...order,
                                  ...updates,
                                  updatedAt: new Date().toISOString(), // ✅ Always update timestamp
                              }
                            : order
                    ),
                    lastUpdated: new Date().toISOString(),
                    error: null,
                }));

                console.log(`Updated order ${orderId} from txnRef ${txnRef}:`, updates);
            },

            /**
             * Update timestamp
             */
            updateLastUpdated: () => set({ lastUpdated: new Date().toISOString() }),
        }),

        // ================ PERSIST CONFIGURATION ================
        {
            name: 'order-storage', // localStorage key
            partialize: (state) => ({
                orders: state.orders,
                lastUpdated: state.lastUpdated,
                // KHÔNG lưu: isLoading, error, currentOrder (temporary states)
            }),
        }
    )
);

export default useOrderStore;
