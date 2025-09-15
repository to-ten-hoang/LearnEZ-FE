import { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Button, message } from 'antd';
import { updatePasswordService} from '../../../../../services/authService';
import './ProfileCard.css';
import type { UpdatePasswordRequest } from 'types/auth';
import moment from 'moment';
import { getUserProfileService, updateUserInfoService } from '../../../../../services/userService';
import type { UpdateUserInfoRequest } from 'types/user';

const { Option } = Select;

// type EGenderType = typeof EGender[keyof typeof EGender];

const ProfileCard = () => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<'profile' | 'changePassword'>('profile');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfileService();
        const data = response.data;
        form.setFieldsValue({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          address: data.address || '',
          dob: data.dob ? moment(data.dob) : null,
          gender: data.gender,
          customerId: 'CUS' + Math.floor(100000000 + Math.random() * 900000000).toString(),
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

  const handleSave = async (values: any) => {
    setLoading(true);
    console.log('Saved values:', values);
    try{
      if(mode === 'changePassword'){
        const passWordData: UpdatePasswordRequest = {
          oldPassword: values.oldPassword,
          password: values.newPassword
        };
        const response = await updatePasswordService(passWordData);
        if(response.code === 200){
          form.resetFields(['oldPassword', 'newPassword', 'confirmPassword']);
          // setIsEditing(false);
          // setMode('profile');
          message.success('Đổi mật khẩu thành công');
        }
      } else{
        const updateUserData: UpdateUserInfoRequest = {
          firstName: values.firstName,
          lastName: values.lastName,
          dob: values.dob,
          gender: 
            values.gender === 'MALE'
              ? '1'
              : values.gender === 'FEMALE'
                ? '2'
                : '3'
          ,
          phone: values.phone,
          address: values.address,
        }
        const response  = await updateUserInfoService(updateUserData);
        const data = response.data;
        form.setFieldsValue({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          address: data.address || '',
          dob: data.dob ? moment(data.dob) : null,
          gender: data.gender 
        });
      }
    } catch(error){
      console.error('Lỗi khi lưu:', error);
    }finally{
      setLoading(false);
      setIsEditing(false);
      setMode('profile');
    }
  };

  const handleChangePassword = () => {
    setIsEditing(true);
    setMode('changePassword');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMode('profile');
    // form.resetFields();
    if(mode === 'changePassword'){
      form.resetFields(['oldPassword', 'newPassword', 'confirmPassword']);
    }
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
                      <Option value={'MALE'}>Nam</Option>
                      <Option value={'FEMALE'}>Nữ</Option>
                      <Option value={'OTHER'}>Khác</Option>
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
            <Button type="primary" htmlType="submit" onClick={() => form.submit()} style={{ marginLeft: 10 }} loading={loading}>Lưu</Button>
            <Button type="default" onClick={handleCancel} style={{ marginLeft: 10 }}>Thoát</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;