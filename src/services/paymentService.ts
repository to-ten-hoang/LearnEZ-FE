import type { PaymentResponse } from 'types/payment';
// services/paymentService.ts
import { message } from 'antd';
import { createPayment } from '../api/paymentApi';

/**
 * ✅ SERVICE: TẠO PAYMENT URL VÀ MỞ TRONG TAB MỚI
 *
 * @param orderId - ID của đơn hàng cần thanh toán
 * @returns Promise<PaymentResponse>
 */
export const createPaymentService = async (orderId: number): Promise<PaymentResponse> => {
    try {
        message.loading({ content: 'Đang tạo liên kết thanh toán...', key: 'payment' });

        const response = await createPayment(orderId);

        if (response.code === 200 && response.data.url) {
            message.destroy('payment');
            message.success('Đã tạo liên kết thanh toán! Chuyển hướng...');

            // ✅ Mở VNPay URL trong tab mới
            const paymentWindow = window.open(
                response.data.url,
                '_blank',
                'width=800,height=600,scrollbars=yes,resizable=yes'
            );

            // ✅ Optional: Focus vào payment window
            if (paymentWindow) {
                paymentWindow.focus();
            }

            return response;
        }

        throw new Error(response.message || 'Tạo liên kết thanh toán thất bại.');
    } catch (error: any) {
        message.destroy('payment');
        const errorMessage =
            error.response?.data?.message || error.message || 'Lỗi khi tạo liên kết thanh toán.';

        message.error(errorMessage);
        throw error;
    }
};

/*
 * ✅ HELPER: PARSE PAYMENT CALLBACK URL PARAMS
 *
 * Lấy params từ URL callback: /order-status?status=success&txnRef=xxx...
 */
export const parsePaymentCallback = (search: string) => {
    const params = new URLSearchParams(search);

    return {
        status: params.get('status'),
        txnRef: params.get('txnRef'),
        transactionNo: params.get('transactionNo'),
        amount: params.get('amount'),
        payDate: params.get('payDate'),
    };
};

/**
 * ✅ HELPER: FORMAT PAYMENT AMOUNT
 */
export const formatPaymentAmount = (amount: string | null): number => {
    if (!amount) return 0;
    // VNPay trả về amount * 100, cần chia lại
    return parseInt(amount) / 100;
};

/**
 * ✅ SERVICE: CẬP NHẬT ORDER STATUS SAU KHI THANH TOÁN
 *
 * @param txnRef - Transaction reference từ VNPay
 * @param paymentData - Thông tin thanh toán từ callback
 */
export const updateOrderAfterPayment = async (txnRef: string, paymentData: any) => {
    try {
        // ✅ Import order store
        const { default: useOrderStore } = await import('../store/orderStore');
        const { updateOrderByTxnRef, refreshOrders } = useOrderStore.getState();

        // ✅ Determine order status based on payment status
        const orderStatus = paymentData.status === 'success' ? 'COMPLETED' : 'FAILED';

        // ✅ Update order với thông tin thanh toán
        const orderUpdates = {
            status: orderStatus,
            transactionCode: paymentData.transactionNo || null,
            totalAmount: paymentData.formattedAmount || null,
            updatedAt: new Date().toISOString(),
        };

        // ✅ Update local store trước
        updateOrderByTxnRef(txnRef, orderUpdates);

        // ✅ Refresh từ server để đảm bảo data sync
        setTimeout(() => {
            refreshOrders();
        }, 1000);

        return true;
    } catch (error) {
        console.error('Update order after payment failed:', error);
        return false;
    }
};
