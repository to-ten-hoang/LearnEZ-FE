// pages/OrderStatus/OrderStatus.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Result, Button, Spin, Typography, Descriptions } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ShoppingOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { parsePaymentCallback, formatPaymentAmount } from '../../../services/paymentService';
import useOrderStore from '../../../store/orderStore';
import useCartStore from '../../../store/cartStore';
import './OrderStatus.css';

const { Title, Text } = Typography;

/**
 * ✅ ORDER STATUS PAGE
 *
 * Xử lý callback từ VNPay sau khi thanh toán:
 * /order-status?status=success&txnRef=20250821160529_7&transactionNo=15141156&amount=12312300&payDate=20250821160807
 */

const OrderStatusPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ ZUSTAND STORES
    const { refreshOrders } = useOrderStore();
    const { refreshCart } = useCartStore();

    // ✅ LOCAL STATE
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState<any>(null);

    // ✅ PARSE PAYMENT CALLBACK khi component mount
    useEffect(() => {
        const handlePaymentCallback = async () => {
            try {
                setLoading(true);

                // ✅ Parse URL parameters
                const params = parsePaymentCallback(location.search);

                if (!params.status || !params.txnRef) {
                    throw new Error('Invalid payment callback parameters');
                }

                // ✅ Set payment data
                setPaymentData({
                    ...params,
                    formattedAmount: formatPaymentAmount(params.amount),
                });

                // ✅ Nếu thanh toán thành công, refresh data
                if (params.status === 'success') {
                    // ✅ Update order status trước
                    const { updateOrderAfterPayment } = await import(
                        '../../../services/paymentService'
                    );
                    await updateOrderAfterPayment(params.txnRef, {
                        ...params,
                        formattedAmount: formatPaymentAmount(params.amount),
                    });

                    // Refresh orders để lấy thông tin order mới nhất
                    await refreshOrders();

                    // Refresh cart để xóa item đã mua (nếu có)
                    await refreshCart();
                }
            } catch (error) {
                console.error('Payment callback handling failed:', error);
                setPaymentData({
                    status: 'error',
                    error: 'Có lỗi xảy ra khi xử lý thông tin thanh toán',
                });
            } finally {
                setLoading(false);
            }
        };

        handlePaymentCallback();
    }, [location.search, refreshOrders, refreshCart]);

    // ✅ EVENT HANDLERS
    const handleViewOrders = () => {
        navigate('/dashboard/orders');
    };

    const handleViewCourses = () => {
        navigate('/dashboard/video-courses');
    };

    const handleBackToShopping = () => {
        navigate('/courses');
    };

    // ✅ FORMAT HELPERS
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString || dateString.length !== 14) return 'Không xác định';

        // Format: YYYYMMDDHHmmss -> DD/MM/YYYY HH:mm:ss
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        const hour = dateString.substring(8, 10);
        const minute = dateString.substring(10, 12);
        const second = dateString.substring(12, 14);

        return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
    };

    // ✅ LOADING STATE
    if (loading) {
        return (
            <div className="order-status-page">
                <Card className="status-card">
                    <div className="loading-container">
                        <Spin size="large" />
                        <Title level={4} style={{ marginTop: 16 }}>
                            Đang xử lý thông tin thanh toán...
                        </Title>
                        <Text type="secondary">Vui lòng chờ trong giây lát</Text>
                    </div>
                </Card>
            </div>
        );
    }

    // ✅ ERROR STATE
    if (!paymentData || paymentData.status === 'error') {
        return (
            <div className="order-status-page">
                <Card className="status-card">
                    <Result
                        status="error"
                        title="Lỗi xử lý thanh toán"
                        subTitle={
                            paymentData?.error ||
                            'Không thể xử lý thông tin thanh toán. Vui lòng kiểm tra lại đơn hàng.'
                        }
                        extra={[
                            <Button type="primary" key="orders" onClick={handleViewOrders}>
                                Xem đơn hàng
                            </Button>,
                            <Button key="shopping" onClick={handleBackToShopping}>
                                Tiếp tục mua sắm
                            </Button>,
                        ]}
                    />
                </Card>
            </div>
        );
    }

    // ✅ SUCCESS STATE
    if (paymentData.status === 'success') {
        return (
            <div className="order-status-page">
                <Card className="status-card">
                    <Result
                        status="success"
                        title="Thanh toán thành công!"
                        subTitle="Đơn hàng của bạn đã được thanh toán thành công. Bạn có thể truy cập khóa học ngay bây giờ."
                        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        extra={[
                            <Button
                                type="primary"
                                key="courses"
                                icon={<EyeOutlined />}
                                onClick={handleViewCourses}
                            >
                                Xem khóa học đã mua
                            </Button>,
                            <Button key="orders" onClick={handleViewOrders}>
                                Xem đơn hàng
                            </Button>,
                            <Button
                                key="shopping"
                                icon={<ShoppingOutlined />}
                                onClick={handleBackToShopping}
                            >
                                Tiếp tục mua sắm
                            </Button>,
                        ]}
                    />

                    {/* ✅ PAYMENT DETAILS */}
                    <Card title="Chi tiết thanh toán" style={{ marginTop: 24 }} size="small">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Mã giao dịch">
                                <Text code>{paymentData.txnRef}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số giao dịch VNPay">
                                <Text code>{paymentData.transactionNo}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tiền">
                                <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                                    {formatPrice(paymentData.formattedAmount)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian thanh toán">
                                {formatDateTime(paymentData.payDate)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                                    Thành công
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Card>
            </div>
        );
    }

    // ✅ FAILED STATE
    return (
        <div className="order-status-page">
            <Card className="status-card">
                <Result
                    status="error"
                    title="Thanh toán thất bại"
                    subTitle="Đơn hàng của bạn chưa được thanh toán thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ."
                    icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                    extra={[
                        <Button type="primary" key="retry" onClick={handleViewOrders}>
                            Thử thanh toán lại
                        </Button>,
                        <Button key="shopping" onClick={handleBackToShopping}>
                            Tiếp tục mua sắm
                        </Button>,
                    ]}
                />

                {/* ✅ FAILED PAYMENT DETAILS */}
                {paymentData.txnRef && (
                    <Card title="Chi tiết giao dịch" style={{ marginTop: 24 }} size="small">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Mã giao dịch">
                                <Text code>{paymentData.txnRef}</Text>
                            </Descriptions.Item>
                            {paymentData.amount && (
                                <Descriptions.Item label="Số tiền">
                                    {formatPrice(paymentData.formattedAmount)}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Trạng thái">
                                <Text style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                                    Thất bại
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}
            </Card>
        </div>
    );
};

export default OrderStatusPage;
