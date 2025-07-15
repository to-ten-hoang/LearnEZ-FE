import { Drawer, Form, Input, Button, Select, InputNumber, Upload, message } from 'antd';
import { useState, useEffect } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { getCourseByIdService, createCourseService, updateCourseInfoService, uploadImageService } from '../../../services/courseManagementService';
import type { Course, Category, CourseCreateRequest, CourseUpdateRequest } from '../../../types/course';

const { Option } = Select;

interface CourseDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  categories: Category[];
  onCourseUpdated: () => void;
}

const CourseDetailDrawer = ({ open, onClose, course, categories, onCourseUpdated }: CourseDetailDrawerProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      fetchCourseDetails(course.id);
    } else {
      form.resetFields();
      setThumbnailUrl(null);
      setFileList([]);
    }
  }, [course, form]);

  const fetchCourseDetails = async (courseId: number) => {
    try {
      const response = await getCourseByIdService(courseId);
      if (response.code === 200) {
        const courseData = response.data;
        form.setFieldsValue({
          title: courseData.title,
          description: courseData.description,
          price: courseData.price,
          categoryId: courseData.categoryName,
        });
        setThumbnailUrl(courseData.thumbnailUrl);
        setFileList(courseData.thumbnailUrl ? [{ uid: '-1', name: 'thumbnail', url: courseData.thumbnailUrl, status: 'done' }] : []);
      }
    } catch (error) {
      message.error('Lỗi khi lấy chi tiết khóa học.');
    }
  };

  const handleUpload = async ({ file }: any) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      const response = await uploadImageService(formData);
      if (response.code === 200) {
        setThumbnailUrl(response.data);
        setFileList([{ uid: file.uid, name: file.name, url: response.data, status: 'done' }]);
        message.success('Tải ảnh lên thành công!');
      }
    } catch (error) {
      message.error('Lỗi khi tải ảnh lên.');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (course) {
        const updateData: CourseUpdateRequest = {
          id: course.id,
          title: values.title,
          description: values.description,
          price: values.price,
          categoryId: categories.find(cat => cat.name === values.categoryId)?.id || 0,
          thumbnailUrl: thumbnailUrl || '',
          isActive: course.isActive,
          isDelete: course.isDelete,
        };
        const response = await updateCourseInfoService(updateData);
        if (response.code === 200) {
          message.success('Cập nhật khóa học thành công!');
          onCourseUpdated();
          onClose();
        }
      } else {
        const createData: CourseCreateRequest = {
          title: values.title,
          description: values.description,
          price: values.price,
          authorId: 0, // Giả sử authorId được lấy từ context hoặc auth
          categoryId: categories.find(cat => cat.name === values.categoryId)?.id || 0,
          thumbnailUrl: thumbnailUrl || '',
          isActive: false,
          isDelete: false,
        };
        const response = await createCourseService(createData);
        if (response.code === 200) {
          message.success('Tạo khóa học thành công!');
          onCourseUpdated();
          onClose();
        }
      }
    } catch (error) {
      message.error(course ? 'Lỗi khi cập nhật khóa học.' : 'Lỗi khi tạo khóa học.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={course ? 'Chi tiết và chỉnh sửa khóa học' : 'Tạo khóa học mới'}
      width={500}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề khóa học!' }]}
        >
          <Input placeholder="Nhập tiêu đề khóa học" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học!' }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập mô tả khóa học" />
        </Form.Item>
        <Form.Item
          name="price"
          label="Giá"
          rules={[{ required: true, message: 'Vui lòng nhập giá khóa học!' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập giá khóa học" />
        </Form.Item>
        <Form.Item
          name="categoryId"
          label="Chủ đề"
          rules={[{ required: true, message: 'Vui lòng chọn chủ đề!' }]}
        >
          <Select placeholder="Chọn chủ đề">
            {categories.map(category => (
              <Option key={category.id} value={category.name}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="thumbnail"
          label="Thumbnail"
        >
          <Upload
            fileList={fileList}
            customRequest={handleUpload}
            onRemove={() => {
              setFileList([]);
              setThumbnailUrl(null);
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
          </Upload>
        </Form.Item>
        {thumbnailUrl && (
          <img src={thumbnailUrl} alt="Thumbnail" style={{ maxWidth: '100%', marginBottom: 16 }} />
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {course ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CourseDetailDrawer;