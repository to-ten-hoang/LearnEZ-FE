import api from 'lib/axios';
import type { PaymentResponse } from 'types/payment';

export const createPayment = async (orderId: number): Promise<PaymentResponse> => {
  const response = await api.get('api/v1/payment/create',{
    params: {orderId}
  });
  return response.data;
}