import api from '../lib/axios';
import type { AddToCartResponse, CartResponse, RemoveFromCartResponse } from 'types/cart';

export const addToCart = async (courseId: number): Promise<AddToCartResponse> => {
    const response = await api.post('/api/v1/cart/add-to-cart', null, {
        params: { id: courseId },
    });
    return response.data;
};

export const getCart = async (): Promise<CartResponse> => {
    const response = await api.get('/api/v1/cart');
    return response.data;
};

export const removeFromCart = async (cartItemId: number): Promise<RemoveFromCartResponse> => {
    const response = await api.delete('/api/v1/cart/remove-from-cart', {
        params: { id: cartItemId },
    });
    return response.data;
};

//API ko có clear thì e hoàng tự làm tạm hehe
export const clearCart = async (cartItemIds: number[]): Promise<void> => {
    const promises = cartItemIds.map((itemId) => removeFromCart(itemId));
    await Promise.all(promises);
};
