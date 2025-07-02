import { Modal, Form, Input, Button } from 'antd';
import { registerService } from '../../../../services/authService';
import './RegisterModal.css';

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;
}

const RegisterModal = ({ visible, onClose }: RegisterModalProps) => {
  const [form] = Form.useForm();

  const handleRegister = async () => {
    try {
      const values = await form.validateFields();
      const { email, password, confirmPassword, firstName, lastName } = values;
      if (password !== confirmPassword) {
        form.setFields([
          { name: 'confirmPassword', errors: ['Mật khẩu không khớp!'] },
        ]);
        return;
      }
      await registerService({ email, password, firstName, lastName });
      onClose(); // Đóng modal sau khi đăng ký
      form.resetFields(); // Reset form
    } catch (error) {
      console.error('Register failed:', error);
    }
  };

  return (
    <Modal
      title="Đăng ký"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleRegister}>
        <Form.Item
          name="firstName"
          label="Họ"
          rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
        >
          <Input placeholder="Nhập họ của bạn" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Tên"
          rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
        >
          <Input placeholder="Nhập tên của bạn" />
        </Form.Item>
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
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu phải dài ít nhất 6 ký tự!' }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]}
        >
          <Input.Password placeholder="Xác nhận mật khẩu" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RegisterModal;