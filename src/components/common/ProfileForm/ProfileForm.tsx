import { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, Select, DatePicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './ProfileForm.css';
import { getUserProfile } from '../../../services/authService';
import useAuthStore from '../../../store/authStore';

const { Option } = Select;

const EGender = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
} as const;

const ProfileForm = () => {
    const [form] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try{
                console.log('data:hahah');
                const response = await getUserProfile();
                const data= response;
                
                form.setFieldsValue({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    dob: data.dob ? new Date(data.dob) : null,
                    gender: data.gender || EGender.MALE,
                    email: user?.email || '',
                    role: user?.role || '',
                });
                setAvatarUrl(data.avatarUrl);
            }catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };
        fetchUserProfile();
    }, [user?.email])

  const handleFinish = (values: any) => {
    console.log('Form values:', values);
    // Logic lưu dữ liệu (sẽ tích hợp API sau)
  };

  const handleUpload = (file: any) => {
    const url = URL.createObjectURL(file.file.originFileObj);
    setAvatarUrl(url);
    return false; // Ngăn upload thực tế
  };

  return (
    <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleFinish} 
        // initialValues={{
        //     email: 'student@example.com',
        //     firstName: 'Vũ',
        //     lastName: 'Huy Hoàng',
        //     phone: '0901234567',
        //     address: '123 Đường ABC',
        //     dob: null,
        //     gender: EGender.MALE,
        // }}
    >
      <Form.Item label="Ảnh đại diện">
        <Upload
          name="avatar"
          listType="picture-card"
          showUploadList={false}
          customRequest={handleUpload}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" style={{ width: '100%' }} />
          ) : (
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Tải lên</div>
            </div>
          )}
        </Upload>
      </Form.Item>
      <Form.Item label="Vai trò" name="role">
        <Input disabled />
      </Form.Item>
      <Form.Item label="Email" name="email">
        <Input disabled />
      </Form.Item>
      <Form.Item label="Họ" name="firstName">
        <Input />
      </Form.Item>
      <Form.Item label="Tên" name="lastName">
        <Input />
      </Form.Item>
      <Form.Item label="Số điện thoại" name="phone">
        <Input />
      </Form.Item>
      <Form.Item label="Địa chỉ" name="address">
        <Input />
      </Form.Item>
      <Form.Item label="Ngày sinh" name="dob">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Giới tính" name="gender">
        <Select>
          <Option value={EGender.MALE}>{EGender.MALE}</Option>
          <Option value={EGender.FEMALE}>{EGender.FEMALE}</Option>
          <Option value={EGender.OTHER}>{EGender.OTHER}</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Lưu thay đổi
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProfileForm;