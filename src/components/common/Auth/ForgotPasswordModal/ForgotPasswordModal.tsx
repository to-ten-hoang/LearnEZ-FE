import { Modal, Form, Input, Button, Typography, Space } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import {
    verifyEmailService,
    verifyOtpService,
    resetPasswordService,
} from '../../../../services/authService';
import './ForgotPasswordModal.css';

const { Text } = Typography;

interface ForgotPasswordModalProps {
    visible: boolean;
    onClose: () => void;
    onBackToLogin?: () => void;
}

type Step = 'email' | 'otp' | 'password';

const ForgotPasswordModal = ({ visible, onClose, onBackToLogin }: ForgotPasswordModalProps) => {
    const [form] = Form.useForm();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Reset state when modal closes
    useEffect(() => {
        if (!visible) {
            setStep('email');
            setEmail('');
            setToken(null);
            setLoading(false);
            setCountdown(0);
            form.resetFields();
        }
    }, [visible, form]);

    // Countdown timer for OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSendOtp = useCallback(async () => {
        try {
            setLoading(true);
            const values = await form.validateFields(['email']);
            await verifyEmailService(values.email);
            setEmail(values.email);
            setStep('otp');
            setCountdown(300); // 5 minutes
            form.resetFields(['otp']);
        } catch (error) {
            console.error('Send OTP failed:', error);
        } finally {
            setLoading(false);
        }
    }, [form]);

    const handleVerifyOtp = useCallback(async () => {
        try {
            setLoading(true);
            const values = await form.validateFields(['otp']);
            const otpNumber = parseInt(values.otp, 10);
            const response = await verifyOtpService(email, otpNumber);
            if (response.data?.token) {
                setToken(response.data.token);
                setStep('password');
                form.resetFields(['password', 'confirmPassword']);
            }
        } catch (error) {
            console.error('Verify OTP failed:', error);
        } finally {
            setLoading(false);
        }
    }, [email, form]);

    const handleResetPassword = useCallback(async () => {
        try {
            setLoading(true);
            const values = await form.validateFields(['password', 'confirmPassword']);
            if (values.password !== values.confirmPassword) {
                form.setFields([
                    { name: 'confirmPassword', errors: ['Mật khẩu xác nhận không khớp!'] },
                ]);
                return;
            }
            if (!token) return;
            await resetPasswordService(token, values.password);
            onClose();
            // Optionally trigger login modal
            if (onBackToLogin) {
                onBackToLogin();
            }
        } catch (error) {
            console.error('Reset password failed:', error);
        } finally {
            setLoading(false);
        }
    }, [form, token, onClose, onBackToLogin]);

    const handleResendOtp = useCallback(async () => {
        try {
            setLoading(true);
            await verifyEmailService(email);
            setCountdown(300);
        } catch (error) {
            console.error('Resend OTP failed:', error);
        } finally {
            setLoading(false);
        }
    }, [email]);

    const handleCancel = () => {
        if (!loading) {
            onClose();
        }
    };

    const handleBackToEmail = () => {
        setStep('email');
        setToken(null);
        setCountdown(0);
        form.resetFields();
    };

    const getStepTitle = () => {
        switch (step) {
            case 'email':
                return 'Quên mật khẩu';
            case 'otp':
                return 'Xác thực OTP';
            case 'password':
                return 'Đặt mật khẩu mới';
            default:
                return 'Quên mật khẩu';
        }
    };

    const getStepNumber = () => {
        switch (step) {
            case 'email':
                return 1;
            case 'otp':
                return 2;
            case 'password':
                return 3;
            default:
                return 1;
        }
    };

    return (
        <Modal
            title={getStepTitle()}
            open={visible}
            onCancel={handleCancel}
            footer={null}
            centered
            closable={!loading}
            maskClosable={!loading}
        >
            <div className="forgot-password-step-info">
                <span className="step-number">{getStepNumber()}</span>
                <span className="step-title">Bước {getStepNumber()} / 3</span>
            </div>

            <Form form={form} layout="vertical">
                {/* Step 1: Email Input */}
                {step === 'email' && (
                    <>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input
                                placeholder="Nhập email đã đăng ký"
                                disabled={loading}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                block
                                loading={loading}
                                onClick={handleSendOtp}
                            >
                                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                            </Button>
                        </Form.Item>
                    </>
                )}

                {/* Step 2: OTP Verification */}
                {step === 'otp' && (
                    <>
                        <div className="forgot-password-otp-notice">
                            Mã OTP đã được gửi đến email: <strong>{email}</strong>
                            {countdown > 0 && (
                                <div className="forgot-password-countdown">
                                    Mã có hiệu lực trong: {formatTime(countdown)}
                                </div>
                            )}
                        </div>
                        <Form.Item
                            name="otp"
                            label="Mã OTP"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã OTP!' },
                                { pattern: /^\d{6}$/, message: 'Mã OTP phải là 6 chữ số!' },
                            ]}
                        >
                            <Input
                                placeholder="Nhập mã OTP 6 chữ số"
                                maxLength={6}
                                disabled={loading}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                block
                                loading={loading}
                                onClick={handleVerifyOtp}
                            >
                                {loading ? 'Đang xác thực...' : 'Xác nhận'}
                            </Button>
                        </Form.Item>
                        <Space direction="vertical" style={{ width: '100%' }} align="center">
                            {countdown === 0 && (
                                <Button
                                    type="link"
                                    onClick={handleResendOtp}
                                    disabled={loading}
                                    className="forgot-password-resend"
                                >
                                    Gửi lại mã OTP
                                </Button>
                            )}
                            <Button
                                type="link"
                                onClick={handleBackToEmail}
                                disabled={loading}
                                className="forgot-password-back-btn"
                            >
                                Quay lại nhập email
                            </Button>
                        </Space>
                    </>
                )}

                {/* Step 3: New Password */}
                {step === 'password' && (
                    <>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 16, textAlign: 'center' }}>
                            Vui lòng nhập mật khẩu mới cho tài khoản: <strong>{email}</strong>
                        </Text>
                        <Form.Item
                            name="password"
                            label="Mật khẩu mới"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            ]}
                        >
                            <Input.Password
                                placeholder="Nhập mật khẩu mới"
                                disabled={loading}
                            />
                        </Form.Item>
                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu"
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ]}
                        >
                            <Input.Password
                                placeholder="Nhập lại mật khẩu mới"
                                disabled={loading}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                block
                                loading={loading}
                                onClick={handleResetPassword}
                            >
                                {loading ? 'Đang xử lý...' : 'Đặt mật khẩu mới'}
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default ForgotPasswordModal;
