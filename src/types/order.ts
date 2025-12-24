// types/order.ts
import type { Course } from './course';

/**
 * ✅ ORDER DETAIL - Chi tiết khóa học trong đơn hàng
 * Từ API response: order.detail
 */
export interface OrderDetail {
    id: number; // ID của order detail
    priceAtPurchase: number; // Giá tại thời điểm mua (có thể khác giá hiện tại)
    course: Course; // Thông tin khóa học đầy đủ
}

/**
 * ✅ ORDER - Đơn hàng chính
 * Từ API response mẫu
 */
export interface Order {
    id: number; // ID đơn hàng
    totalAmount: number | null; // Tổng tiền (có thể null nếu chưa tính)
    paymentMethod: string; // "VN_PAY" | "MOMO" | "BANK_TRANSFER"
    transactionCode: string | null; // Mã giao dịch (có thể null nếu chưa thanh toán)
    createdAt: string; // Ngày tạo đơn hàng
    updatedAt: string | null; // Ngày cập nhật cuối
    status: string; // "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED"
    detail: OrderDetail; // Chi tiết đơn hàng
}

/**
 * ✅ GET ORDERS RESPONSE
 * GET /api/v1/order
 */
export interface OrderPage {
    content: Order[]; // Danh sách đơn hàng
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}

export interface OrderResponse {
    code: number; // 200 = success
    message: string; // "Get Order is successfully"
    data: OrderPage; // Page object chứa orders
}

/**
 * ✅ CREATE ORDER RESPONSE
 * POST /api/v1/order/create-order-by-course
 * POST /api/v1/order/create-order-by-cart-item
 */
export interface CreateOrderResponse {
    code: number; // 200 = success
    message: string; // "Order has been created"
    data: Order; // Order vừa tạo
}

/**
 * ✅ DELETE ORDER RESPONSE
 * DELETE /api/v1/order/delete
 */
export interface DeleteOrderResponse {
    code: number; // 200 = success
    message: string; // "Order has been deleted"
    data: null; // Không trả về data
}

/**
 * ✅ UNION TYPES cho type safety
 */
export type PaymentMethod = 'VN_PAY' | 'MOMO' | 'ZALO_PAY';

export type OrderStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Failed';

// Helper constant for status mapping (matches backend EStatusOrder)
export const ORDER_STATUS = {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
} as const;

/**
 * ✅ ORDER SUMMARY cho UI (computed values)
 */
export interface OrderSummary {
    totalOrders: number; // Tổng số đơn hàng
    pendingOrders: number; // Đơn hàng đang chờ
    completedOrders: number; // Đơn hàng hoàn thành
    cancelledOrders: number; // Đơn hàng đã hủy
    totalSpent: number; // Tổng tiền đã chi tiêu
}

/**
 * ✅ ORDER FILTER cho search/filter functionality (local)
 */
export interface OrderFilter {
    status?: OrderStatus[]; // Filter theo status
    paymentMethod?: PaymentMethod[]; // Filter theo payment method
    dateRange?: [string, string]; // Filter theo khoảng thời gian
    searchQuery?: string; // Search theo tên khóa học hoặc order ID
}

/**
 * ✅ STATUS ORDER FILTER - Giá trị để filter (REQUEST) - VIẾT HOA
 * API yêu cầu enum values uppercase
 */
export type StatusOrderFilter = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

/**
 * ✅ SEARCH ORDER DTO - Body cho POST /api/v1/order
 * Dùng để server-side filtering
 */
export interface SearchOrderDto {
    searchString?: string; // Search theo tên khóa học, mô tả
    statusOrder?: StatusOrderFilter[]; // Filter theo status - PHẢI VIẾT HOA
    fromDate?: string; // Start date (ISO format: YYYY-MM-DD)
    toDate?: string; // End date (ISO format: YYYY-MM-DD)
}

/**
 * ✅ ORDER PAGINATION PARAMS - Query params cho phân trang
 */
export interface OrderPaginationParams {
    page?: number; // 0-indexed page number
    size?: number; // Number of items per page (default 10)
    sort?: string; // Sort field and direction (e.g., 'createdAt,desc')
}
