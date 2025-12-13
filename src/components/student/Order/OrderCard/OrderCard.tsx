// components/Order/OrderCard/OrderCard.tsx
import React from 'react';
import { Card, Tag, Button, Typography, Image, Space, Modal } from 'antd';
import { DeleteOutlined, EyeOutlined, CreditCardOutlined } from '@ant-design/icons';
import moment from 'moment';
import useOrderStore from '../../../../store/orderStore';
import type { Order } from '../../../../types/order';
import './OrderCard.css';

const { Title, Text } = Typography;

interface OrderCardProps {
    order: Order; // Đơn hàng cần hiển thị
    showActions?: boolean; // Hiển thị buttons actions
    size?: 'default' | 'small'; // Kích thước card
    onClick?: () => void; // Custom click handler
}

const OrderCard: React.FC<OrderCardProps> = ({
    order,
    showActions = true,
    size = 'default',
    onClick,
}) => {
    // ✅ ZUSTAND ACTIONS
    const removeOrder = useOrderStore((state) => state.removeOrder);
    const refreshOrders = useOrderStore((state) => state.refreshOrders);

    // ✅ STATUS CONFIGURATION
    const getStatusConfig = () => {
        switch (order.status) {
            case 'pending':
                return { label: 'Đang chờ', color: 'orange' };
            case 'completed':
                return { label: 'Hoàn thành', color: 'green' };
            case 'cancelled':
                return { label: 'Đã hủy', color: 'red' };
            case 'failed':
                return { label: 'Thất bại', color: 'red' };
            default:
                return { label: order.status, color: 'default' };
        }
    };

    // ✅ PAYMENT METHOD ICON
    const getPaymentMethodIcon = () => {
        switch (order.paymentMethod) {
            case 'VN_PAY':
                return '🏦';
            case 'MOMO':
                return '📱';
            case 'BANK_TRANSFER':
                return '💳';
            default:
                return '💰';
        }
    };

    // ✅ BUSINESS LOGIC
    const canCancelOrder = () => {
        return order.status === 'pending' || order.status === 'failed';
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    // ✅ EVENT HANDLERS
    const handleCancelOrder = () => {
        Modal.confirm({
            title: 'Xác nhận hủy đơn hàng',
            content: `Bạn có chắc muốn hủy đơn hàng #${order.id}?`,
            okText: 'Hủy đơn hàng',
            cancelText: 'Không',
            okType: 'danger',
            onOk: async () => {
                try {
                    // Import service dynamically
                    const { deleteOrderService } = await import(
                        '../../../../services/orderService'
                    );
                    await deleteOrderService(order.id);

                    // ✅ Optimistic update - xóa khỏi store ngay lập tức
                    removeOrder(order.id);

                    // ✅ Refresh orders sau 500ms để sync với server
                    setTimeout(() => {
                        refreshOrders();
                    }, 500);
                } catch (error) {
                    console.error('Cancel order failed:', error);
                    // Error message đã được handle trong service
                }
            },
        });
    };

    const handleViewCourse = () => {
        // TODO: Navigate to course detail page
        console.log('View course:', order.detail.course.id);
    };

    const handleContinuePayment = async () => {
        try {
            // ✅ Import payment service
            const { createPaymentService } = await import('../../../../services/paymentService');

            // ✅ Tạo payment URL và mở VNPay
            await createPaymentService(order.id);

            // ✅ Optional: Show thông báo hướng dẫn
            Modal.info({
                title: 'Thanh toán đã được mở',
                content:
                    'Vui lòng hoàn tất thanh toán trong cửa sổ mới. Trang này sẽ tự động cập nhật khi thanh toán thành công.',
                okText: 'Đã hiểu',
            });
        } catch (error) {
            console.error('Payment creation failed:', error);
            // Error message đã được handle trong service
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <Card
            className={`order-card ${size === 'small' ? 'order-card-small' : ''}`}
            size={size}
            hoverable
            onClick={onClick}
        >
            {/* ✅ ORDER HEADER */}
            <div className="order-header">
                <div className="order-info">
                    <Title level={size === 'small' ? 5 : 4} style={{ margin: 0 }}>
                        Đơn hàng #{order.id}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                </div>

                <div className="order-status">
                    <Tag color={statusConfig.color} style={{ margin: 0 }}>
                        {statusConfig.label}
                    </Tag>
                </div>
            </div>

            {/* ✅ COURSE INFORMATION */}
            <div className="order-content">
                <div className="course-info">
                    <Image
                        src={
                            order.detail.course.thumbnailUrl ||
<<<<<<< HEAD
                            'https://placehold.co/60x60/e8e8e8/666?text=Course'
=======
                            'https://symbols.vn/wp-content/uploads/2023/10/Hinh-meme-meo-cuoi-de-thuong.jpg'
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
                        }
                        alt={order.detail.course.title}
                        width={size === 'small' ? 50 : 60}
                        height={size === 'small' ? 50 : 60}
<<<<<<< HEAD
                        style={{ borderRadius: 8, objectFit: 'cover' }}
                        preview={false}
=======
                        style={{ borderRadius: 6, objectFit: 'cover' }}
                        preview={false}
                        fallback="/assets/default-course.jpg"
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
                    />

                    <div className="course-details">
                        <Title level={5} ellipsis={{ tooltip: order.detail.course.title }}>
                            {order.detail.course.title}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {order.detail.course.authorName}
                        </Text>
                        <br />
                        <Text strong style={{ color: '#1890ff' }}>
                            {formatPrice(order.detail.priceAtPurchase)}
                        </Text>
                    </div>
                </div>

                {/* ✅ PAYMENT INFORMATION */}
                <div className="payment-info">
                    <Space size={4} direction="vertical">
                        <div className="payment-method">
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {getPaymentMethodIcon()} {order.paymentMethod}
                            </Text>
                        </div>

                        {order.transactionCode && (
                            <div className="transaction-code">
                                <Text type="secondary" style={{ fontSize: 10 }}>
                                    Mã GD: {order.transactionCode}
                                </Text>
                            </div>
                        )}

                        {order.totalAmount && (
                            <div className="total-amount">
                                <Text type="secondary" style={{ fontSize: 10 }}>
                                    Tổng: {formatPrice(order.totalAmount)}
                                </Text>
                            </div>
                        )}
                    </Space>
                </div>
            </div>

            {/* ✅ ACTION BUTTONS */}
            {showActions && (
                <div className="order-actions" onClick={(e) => e.stopPropagation()}>
                    <Space size={8}>
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={handleViewCourse}
                        >
                            Xem khóa học
                        </Button>

                        {/* Hiển thị "Tiếp tục thanh toán" cho pending orders */}
                        {order.status === 'pending' && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<CreditCardOutlined />}
                                onClick={handleContinuePayment}
                            >
                                Thanh toán
                            </Button>
                        )}

                        {/* Hiển thị "Hủy đơn" cho orders có thể hủy */}
                        {canCancelOrder() && (
                            <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={handleCancelOrder}
                            >
                                Hủy đơn
                            </Button>
                        )}
                    </Space>
                </div>
            )}
        </Card>
    );
};

export default OrderCard;
