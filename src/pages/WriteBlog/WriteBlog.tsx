import { useState } from 'react';
import { Form, Input, Select, Button, Upload, message, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TipTapEditor from 'components/common/TipTapEditor/TipTapEditor';
import { createPostService, uploadImageService } from '../../services/blogService';
import './WriteBlog.css';

const { Option } = Select;

interface BlogFormValues {
  title: string;
  themeUrl: string;
  categoryId: number;
}

const WriteBlog = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [content, setContent] = useState('<p>Nhập nội dung bài viết...</p>');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [themeUrl, setThemeUrl] = useState<string>(''); // Lưu themeUrl để hiển thị ảnh

  const handleSubmit = async (values: BlogFormValues) => {
    setLoading(true);
    try {
      const postData = {
        title: values.title,
        content, // Chuỗi HTML từ TipTap
        themeUrl: values.themeUrl, // Chuỗi URL từ form
        categoryId: values.categoryId,
      };
      console.log('Post data:', postData); // Debug dữ liệu gửi lên
      const response = await createPostService(postData);
      if (response.code === 200) {
        message.success('Đăng bài thành công!');
        form.resetFields();
        setContent('<p>Nhập nội dung bài viết...</p>');
        setThemeUrl('');
        navigate('/dashboard');
      } else {
        message.error('Đăng bài thất bại.');
      }
    } catch (error) {
      message.error('Lỗi khi đăng bài.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTheme = async (file: File) => {
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await uploadImageService(formData);
      if (response.code === 200) {
        const url = response.data; // Lấy URL từ API
        form.setFieldsValue({ themeUrl: url }); // Cập nhật form
        setThemeUrl(url); // Cập nhật state để hiển thị ảnh
        message.success('Tải ảnh đại diện thành công!');
      } else {
        message.error('Tải ảnh đại diện thất bại.');
      }
    } catch (error) {
      message.error('Lỗi khi tải ảnh đại diện.');
    } finally {
      setUploadLoading(false);
    }
    return false; // Ngăn upload tự động
  };

  const handleRemoveTheme = () => {
    form.setFieldsValue({ themeUrl: '' });
    setThemeUrl('');
  };

  const handleCancel = () => {
    form.resetFields();
    setContent('<p>Nhập nội dung bài viết...</p>');
    setThemeUrl('');
    navigate('/dashboard');
  };

  return (
    <div className="write-blog">
      <h2>Viết Blog</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ categoryId: 1 }}
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
        >
          <Input placeholder="Nhập tiêu đề bài viết" />
        </Form.Item>
        <Form.Item
          name="themeUrl"
          label="Ảnh đại diện"
          rules={[{ required: true, message: 'Vui lòng tải ảnh đại diện!' }]}
        >
          <div>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleUploadTheme}
              disabled={uploadLoading}
            >
              <Button icon={<UploadOutlined />} loading={uploadLoading}>
                Tải ảnh đại diện
              </Button>
            </Upload>
            {themeUrl && (
              <div className="theme-preview">
                <Image src={themeUrl} alt="Ảnh đại diện" width={200} />
                <Button onClick={handleRemoveTheme} style={{ marginTop: 8 }}>
                  Xóa ảnh
                </Button>
              </div>
            )}
          </div>
        </Form.Item>
        <Form.Item
          name="categoryId"
          label="Chuyên mục"
          rules={[{ required: true, message: 'Vui lòng chọn chuyên mục!' }]}
        >
          <Select placeholder="Chọn chuyên mục">
            <Option value={1}>TIPS</Option>
            <Option value={2}>Giáo dục</Option>
            <Option value={3}>Lập trình</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Nội dung"
          name="content"
          rules={[
            {
              validator: () => {
                if (content === '<p>Nhập nội dung bài viết...</p>' || content === '') {
                  return Promise.reject(new Error('Vui lòng nhập nội dung!'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <TipTapEditor content={content} onChange={setContent} />
        </Form.Item>
        <Form.Item>
          <div className="button-group">
            <Button type="primary" htmlType="submit" loading={loading}>
              Đăng bài
            </Button>
            <Button type="default" onClick={handleCancel} style={{ marginLeft: 10 }}>
              Hủy
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default WriteBlog;