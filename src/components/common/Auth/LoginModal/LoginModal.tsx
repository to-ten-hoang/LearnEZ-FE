import { Modal, Form, Input, Button } from 'antd';
import { login as loginService } from '../../../../services/authService';
import './LoginModal.css';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

const LoginModal = ({ visible, onClose }: LoginModalProps) => {
  const [form] = Form.useForm();

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      const { email, password } = values;
      await loginService({ email, password });
      onClose(); // Đóng modal sau khi đăng nhập
      form.resetFields(); // Reset form
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Modal
      title="Đăng nhập"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleLogin}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
        >
          <Input placeholder="Nhập email của bạn" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoginModal;