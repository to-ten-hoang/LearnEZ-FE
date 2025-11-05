// components/Order/PurchaseModal/PurchaseModal.tsx
import React, { useState } from 'react';
import { Modal, Steps, Button, Radio, Card, Typography, Image, Result, Spin } from 'antd';
import { CreditCardOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import type { Course } from '../../../../types/course';
import type { Order, PaymentMethod } from '../../../../types/order';
import './PurchaseModal.css';

const { Title, Text } = Typography;
const { Step } = Steps;

/**
 * ✅ PURCHASE MODAL COMPONENT
 *
 * Modal phức tạp để handle luồng mua hàng
 * Steps: Confirm → Payment → Result
 */

interface PurchaseModalProps {
    visible: boolean; // Modal có hiển thị không
    onClose: () => void; // Đóng modal
    course: Course | null; // Khóa học được chọn mua
    purchaseType: 'direct' | 'cart'; // Mua trực tiếp hay từ giỏ hàng
    onPurchaseSuccess?: (order: Order) => void; // Callback khi mua thành công
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
    visible,
    onClose,
    course,
    purchaseType,
    onPurchaseSuccess,
}) => {
    // ✅ LOCAL STATE cho purchase flow
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [purchaseResult, setPurchaseResult] = useState<{
        success: boolean;
        order?: Order;
        error?: string;
    } | null>(null);

    // ✅ PAYMENT METHODS CONFIGURATION
    const paymentMethods = [
        { value: 'VN_PAY' as PaymentMethod, label: 'VN Pay', icon: '🏦' },
        { value: 'MOMO' as PaymentMethod, label: 'Momo', icon: '📱' },
        { value: 'BANK_TRANSFER' as PaymentMethod, label: 'Chuyển khoản ngân hàng', icon: '💳' },
    ];

    // ✅ FORMAT PRICE HELPER
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    // ✅ RESET MODAL STATE khi đóng
    const handleCancel = () => {
        setCurrentStep(0);
        setSelectedPaymentMethod(null);
        setIsProcessing(false);
        setPurchaseResult(null);
        onClose();
    };

    // ✅ XỬ LÝ MUA HÀNG
    const handleConfirmPurchase = async () => {
        if (!course || !selectedPaymentMethod) return;

        setIsProcessing(true);
        setCurrentStep(1); // Chuyển sang step Payment

        try {
            // Simulate payment processing
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // ✅ GỌI API TẠO ĐƠN HÀNG
            const { createOrderByCourseService } = await import(
                '../../../../services/orderService'
            );
            const response = await createOrderByCourseService(course.id);

            // ✅ SUCCESS CASE
            setPurchaseResult({
                success: true,
                order: response.data,
            });
            setCurrentStep(2); // Chuyển sang step Result

            // Callback cho parent component
            if (onPurchaseSuccess) {
                onPurchaseSuccess(response.data);
            }
        } catch (error: any) {
            // ✅ ERROR CASE
            setPurchaseResult({
                success: false,
                error: error.message || 'Có lỗi xảy ra trong quá trình thanh toán',
            });
            setCurrentStep(2); // Chuyển sang step Result
        } finally {
            setIsProcessing(false);
        }
    };

    // ✅ GET STEP STATUS
    const getStepStatus = (stepIndex: number) => {
        if (currentStep > stepIndex) return 'finish';
        if (currentStep === stepIndex) return isProcessing ? 'process' : 'process';
        return 'wait';
    };

    // ✅ RENDER CONFIRMATION STEP
    const renderConfirmationStep = () => (
        <div className="purchase-confirmation">
            {/* Course Summary */}
            <Card className="course-summary" size="small">
                <div className="course-summary-content">
                    <Image
                        src={course?.thumbnailUrl || '/assets/default-course.jpg'}
                        alt={course?.title}
                        width={80}
                        height={80}
                        style={{ borderRadius: 8, objectFit: 'cover' }}
                        preview={false}
                    />

                    <div className="course-details">
                        <Title level={4} style={{ margin: 0 }}>
                            {course?.title}
                        </Title>
                        <Text type="secondary">{course?.authorName}</Text>
                        <br />
                        <Text type="secondary">Chủ đề: {course?.categoryName}</Text>
                        <br />
                        <Title level={3} style={{ color: '#1890ff', margin: '8px 0 0 0' }}>
                            {course && formatPrice(course.price)}
                        </Title>
                    </div>
                </div>
            </Card>

            {/* Payment Methods */}
            <div className="payment-method-section">
                <Title level={5}>Chọn phương thức thanh toán:</Title>
                <Radio.Group
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="payment-methods"
                >
                    {paymentMethods.map((method) => (
                        <Radio.Button
                            key={method.value}
                            value={method.value}
                            className="payment-option"
                        >
                            <span className="payment-icon">{method.icon}</span>
                            {method.label}
                        </Radio.Button>
                    ))}
                </Radio.Group>
            </div>

            {/* Purchase Info */}
            <Card size="small" style={{ marginTop: 16, background: '#f6ffed' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    <strong>Loại mua hàng:</strong>{' '}
                    {purchaseType === 'direct' ? 'Mua trực tiếp' : 'Mua từ giỏ hàng'}
                    <br />
                    <strong>Thời gian:</strong> {moment().format('DD/MM/YYYY HH:mm')}
                </Text>
            </Card>
        </div>
    );

    // ✅ RENDER PROCESSING STEP
    const renderProcessingStep = () => (
        <div className="purchase-processing">
            <Spin size="large" />
            <Title level={4} style={{ textAlign: 'center', marginTop: 16 }}>
                Đang xử lý thanh toán...
            </Title>
            <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                Vui lòng không đóng cửa sổ này
            </Text>
        </div>
    );

    // ✅ RENDER SUCCESS RESULT
    const renderSuccessResult = () => (
        <Result
            status="success"
            title="Mua khóa học thành công!"
            subTitle={`Đơn hàng #${purchaseResult?.order?.id} đã được tạo. Bạn có thể bắt đầu học ngay.`}
            extra={[
                <Button type="primary" key="start-learning" onClick={handleCancel}>
                    Bắt đầu học
                </Button>,
                <Button
                    key="view-orders"
                    onClick={() => {
                        handleCancel();
                        // TODO: Navigate to orders page
                    }}
                >
                    Xem đơn hàng
                </Button>,
            ]}
        />
    );

    // ✅ RENDER ERROR RESULT
    const renderErrorResult = () => (
        <Result
            status="error"
            title="Thanh toán thất bại"
            subTitle={
                purchaseResult?.error ||
                'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'
            }
            extra={[
                <Button
                    type="primary"
                    key="retry"
                    onClick={() => {
                        setCurrentStep(0);
                        setPurchaseResult(null);
                    }}
                >
                    Thử lại
                </Button>,
                <Button key="close" onClick={handleCancel}>
                    Đóng
                </Button>,
            ]}
        />
    );

    // ✅ RENDER CONTENT theo current step
    const renderContent = () => {
        if (purchaseResult) {
            return purchaseResult.success ? renderSuccessResult() : renderErrorResult();
        }

        switch (currentStep) {
            case 0:
                return renderConfirmationStep();
            case 1:
                return renderProcessingStep();
            default:
                return renderConfirmationStep();
        }
    };

    // ✅ GET MODAL FOOTER
    const getModalFooter = () => {
        if (purchaseResult || currentStep === 1) {
            return null; // Result components có buttons riêng, processing không cần footer
        }

        return [
            <Button key="cancel" onClick={handleCancel}>
                Hủy
            </Button>,
            <Button
                key="confirm"
                type="primary"
                disabled={!selectedPaymentMethod}
                loading={isProcessing}
                onClick={handleConfirmPurchase}
            >
                Xác nhận mua - {course && formatPrice(course.price)}
            </Button>,
        ];
    };

    return (
        <Modal
            title="Xác nhận mua khóa học"
            open={visible}
            onCancel={handleCancel}
            footer={getModalFooter()}
            width={600}
            className="purchase-modal"
            maskClosable={false}
            destroyOnClose
        >
            <div className="purchase-modal-content">
                {/* ✅ STEPS INDICATOR */}
                <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
                    <Step
                        title="Xác nhận"
                        status={getStepStatus(0)}
                        icon={<CreditCardOutlined />}
                    />
                    <Step title="Thanh toán" status={getStepStatus(1)} />
                    <Step
                        title="Hoàn thành"
                        status={getStepStatus(2)}
                        icon={
                            purchaseResult?.success ? (
                                <CheckCircleOutlined />
                            ) : purchaseResult?.success === false ? (
                                <CloseCircleOutlined />
                            ) : undefined
                        }
                    />
                </Steps>

                {/* ✅ STEP CONTENT */}
                <div className="purchase-step-content">{renderContent()}</div>
            </div>
        </Modal>
    );
};

export default PurchaseModal;
