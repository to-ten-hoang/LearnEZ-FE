import { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Button } from 'antd';
import { getUserProfile } from '../../../../services/authService';
import './ProfileCard.css';

const { Option } = Select;

const EGender = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
} as const;

// type EGenderType = typeof EGender[keyof typeof EGender];

const ProfileCard = () => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<'profile' | 'changePassword'>('profile');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await getUserProfile();
        form.setFieldsValue({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          address: data.address || '',
          dob: data.dob ? new Date(data.dob) : null,
          gender: data.gender || EGender.MALE,
          customerId: 'CUS' + Math.floor(100000000 + Math.random() * 900000000).toString(),
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setMode('profile');
  };

  const handleSave = (values: any) => {
    console.log('Saved values:', values);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    setIsEditing(true);
    setMode('changePassword');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMode('profile');
    // form.resetFields();
  };

  return (
    <div className="profile-details">
      <div className="student-card">
        <div className="card-left">
          <img src="https://mcdn.coolmate.me/image/March2023/meme-meo-cute-hai-huoc-1297_521.jpg" alt="Avatar" className="avatar-img" />
        </div>
        <div className="card-right">
          <Form form={form} layout="vertical" onFinish={handleSave}>
            {mode === 'profile' && (
              <>
                <div className="info-row">
                  <Form.Item label="Họ" name="firstName">
                    <Input disabled={!isEditing} />
                  </Form.Item>
                  <Form.Item label="Tên" name="lastName">
                    <Input disabled={!isEditing} />
                  </Form.Item>
                </div>
                <div className="info-row">
                  <Form.Item label="Ngày sinh" name="dob">
                    <DatePicker style={{ width: '100%' }} disabled={!isEditing} />
                  </Form.Item>
                  <Form.Item label="Giới tính" name="gender">
                    <Select disabled={!isEditing}>
                      <Option value={EGender.MALE}>{EGender.MALE}</Option>
                      <Option value={EGender.FEMALE}>{EGender.FEMALE}</Option>
                      <Option value={EGender.OTHER}>{EGender.OTHER}</Option>
                    </Select>
                  </Form.Item>
                </div>
                <Form.Item label="Số điện thoại" name="phone">
                  <Input disabled={!isEditing} />
                </Form.Item>
                <Form.Item label="Địa chỉ" name="address">
                  <Input disabled={!isEditing} />
                </Form.Item>
                <Form.Item label="Mã khách hàng" name="customerId">
                  <Input disabled />
                </Form.Item>
              </>
            )}
            {mode === 'changePassword' && (
              <>
                <Form.Item name="oldPassword" label="Mật khẩu cũ" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}>
                  <Input.Password />
                </Form.Item>
                <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu phải dài ít nhất 6 ký tự!' }]}>
                  <Input.Password />
                </Form.Item>
                <Form.Item name="confirmPassword" label="Xác nhận mật khẩu" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }, ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                  },
                })]}>
                  <Input.Password />
                </Form.Item>
              </>
            )}
          </Form>
        </div>
      </div>
      <div className="button-group">
        {!isEditing && (
          <div>
            <Button type="primary" onClick={handleEdit}>Sửa thông tin</Button>
            <Button type="default" onClick={handleChangePassword} style={{ marginLeft: 10 }}>Đổi mật khẩu</Button>
          </div>
        )}
        {isEditing && (
          <div>
            <Button type="primary" htmlType="submit" onClick={() => form.submit()} style={{ marginLeft: 10 }}>Lưu</Button>
            <Button type="default" onClick={handleCancel} style={{ marginLeft: 10 }}>Thoát</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;