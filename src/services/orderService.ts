// services/orderService.ts
import { message } from 'antd';
import type { AxiosError } from 'axios';
import {
    createOrderByCourse,
    createOrderByCartItem,
    getOrders,
    deleteOrder,
} from '../api/orderApi';
import type { OrderResponse, CreateOrderResponse, SearchOrderDto } from '../types/order';

/**
 * ✅ SERVICE: TẠO ĐƠN HÀNG TRỰC TIẾP TỪ KHÓA HỌC
 *
 * Xử lý logic:
 * - Validate course có thể mua không
 * - Call API create order
 * - Show success message với order info
 * - Handle errors appropriately
 */
export const createOrderByCourseService = async (
    courseId: number
): Promise<CreateOrderResponse> => {
    try {
        const response = await createOrderByCourse(courseId);

        if (response.code === 200) {
            message.success('Đã tạo đơn hàng thành công! Vui lòng tiến hành thanh toán.');
            return response;
        }

        throw new Error(response.message || 'Tạo đơn hàng thất bại.');
    } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
            axiosError.response?.data?.message || axiosError.message || 'Lỗi khi tạo đơn hàng.';

        message.error(errorMessage);
        throw error;
    }
};

/**
 * ✅ SERVICE: TẠO ĐƠN HÀNG TỪ CART ITEM
 *
 * @param cartItemId - ID của cart item
 */
export const createOrderByCartItemService = async (
    cartItemId: number
): Promise<CreateOrderResponse> => {
    try {
        const response = await createOrderByCartItem(cartItemId);

        if (response.code === 200) {
            message.success(
                'Đã tạo đơn hàng từ giỏ hàng thành công! Vui lòng tiến hành thanh toán.'
            );
            return response;
        }

        throw new Error(response.message || 'Tạo đơn hàng từ giỏ hàng thất bại.');
    } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Lỗi khi tạo đơn hàng từ giỏ hàng.';

        message.error(errorMessage);
        throw error;
    }
};

/**
 * ✅ SERVICE: LẤY DANH SÁCH ĐƠN HÀNG (với server-side search & pagination)
 *
 * @param searchDto - Search filters (searchString, statusOrder, fromDate, toDate)
 * @param page - Page number (0-indexed)
 * @param size - Page size
 * @param sort - Sort field and direction (e.g., 'createdAt,desc')
 */
export const getOrdersService = async (
    searchDto?: SearchOrderDto,
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
): Promise<OrderResponse> => {
    try {
        const response = await getOrders(searchDto, page, size, sort);

        if (response.code === 200) {
            console.log('Fetched orders:', response.data);
            return response;
        }

        throw new Error(response.message || 'Lấy danh sách đơn hàng thất bại.');
    } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            'Lỗi khi lấy danh sách đơn hàng.';

        message.error(errorMessage);
        throw error;
    }
};

/**
 * ✅ SERVICE: XÓA/HỦY ĐƠN HÀNG
 *
 * @param orderId - ID của đơn hàng cần xóa
 */
export const deleteOrderService = async (orderId: number): Promise<void> => {
    try {
        const response = await deleteOrder(orderId);

        if (response.code === 200) {
            message.success('Đã hủy đơn hàng thành công!');
            return;
        }

        throw new Error(response.message || 'Hủy đơn hàng thất bại.');
    } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage =
            axiosError.response?.data?.message || axiosError.message || 'Lỗi khi hủy đơn hàng.';

        message.error(errorMessage);
        throw error;
    }
};

/**
 * ✅ HELPER SERVICE: Mua trực tiếp với loading message
 */
export const purchaseDirectlyService = async (courseId: number): Promise<CreateOrderResponse> => {
    try {
        message.loading({ content: 'Đang tạo đơn hàng...', key: 'purchase' });
        const response = await createOrderByCourseService(courseId);
        message.destroy('purchase');
        return response;
    } catch (error: unknown) {
        message.destroy('purchase');
        throw error;
    }
};

/**
 * ✅ HELPER SERVICE: Mua từ giỏ hàng với loading message
 */
export const purchaseFromCartService = async (cartItemId: number): Promise<CreateOrderResponse> => {
    try {
        message.loading({ content: 'Đang tạo đơn hàng...', key: 'purchase-cart' });
        const response = await createOrderByCartItemService(cartItemId);
        message.destroy('purchase-cart');
        return response;
    } catch (error: unknown) {
        message.destroy('purchase-cart');
        throw error;
    }
};
