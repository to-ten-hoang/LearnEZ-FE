import { Modal, Form, Input, Button } from 'antd';
import { useState } from 'react';
import { loginService } from '../../../../services/authService';
import './LoginModal.css';

interface LoginModalProps {
    visible: boolean;
    onClose: () => void;
    onForgotPassword?: () => void;
}

const LoginModal = ({ visible, onClose, onForgotPassword }: LoginModalProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const { email, password } = values;
            await loginService({ email, password });
            onClose(); // Đóng modal sau khi đăng nhập
            form.resetFields(); // Reset form
        } catch (error) {
            console.error('Login failed:', error);
            // Có thể thêm thông báo lỗi ở đây nếu cần
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (!loading) {
            onClose();
            form.resetFields();
        }
    };

    const handleForgotPassword = () => {
        if (!loading && onForgotPassword) {
            onClose();
            form.resetFields();
            onForgotPassword();
        }
    };

    return (
        <Modal
            title="Đăng nhập"
            open={visible}
            onCancel={handleCancel}
            footer={null}
            centered
            closable={!loading} // Không cho phép đóng modal khi đang loading
            maskClosable={!loading} // Không cho phép đóng modal bằng cách click bên ngoài khi đang loading
        >
            <Form form={form} layout="vertical" onFinish={handleLogin}>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' },
                    ]}
                >
                    <Input placeholder="Nhập email của bạn" disabled={loading} />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu" disabled={loading} />
                </Form.Item>
                {onForgotPassword && (
                    <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -8 }}>
                        <Button type="link" onClick={handleForgotPassword} disabled={loading} style={{ padding: 0 }}>
                            Quên mật khẩu?
                        </Button>
                    </div>
                )}
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default LoginModal;
