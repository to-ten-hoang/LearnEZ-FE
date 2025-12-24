// api/order/orderApi.ts
import api from '../lib/axios';
import type {
    OrderResponse,
    CreateOrderResponse,
    DeleteOrderResponse,
    SearchOrderDto,
} from '../types/order';

export const createOrderByCourse = async (courseId: number): Promise<CreateOrderResponse> => {
    const response = await api.post('/api/v1/order/create-order-by-course', null, {
        params: { id: courseId }, // courseId đi qua query parameter
    });
    return response.data;
};

export const createOrderByCartItem = async (cartItemId: number): Promise<CreateOrderResponse> => {
    const response = await api.post('/api/v1/order/create-order-by-cart-item', null, {
        params: { id: cartItemId }, // cartItemId đi qua query parameter
    });
    return response.data;
};

export const getOrders = async (
    searchDto?: SearchOrderDto,
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
): Promise<OrderResponse> => {
    const response = await api.post('/api/v1/order', searchDto || {}, {
        params: { page, size, sort },
    });
    return response.data;
};

export const deleteOrder = async (orderId: number): Promise<DeleteOrderResponse> => {
    const response = await api.post('/api/v1/order/delete', null, {
        params: { id: orderId },
    });
    return response.data;
};
