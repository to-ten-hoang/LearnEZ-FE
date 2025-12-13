// components/CourseManagement/CourseDetailDrawer/CourseDetailDrawer.tsx - Final
import {
    Drawer,
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    Upload,
    message,
    Descriptions,
    Divider,
    Image,
    Typography,
} from 'antd';
import { useState, useEffect } from 'react';
import { UploadOutlined, EyeOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
    getCourseByIdService,
    createCourseService,
    updateCourseInfoService,
    uploadImageService,
    getTeachersService,
} from '../../../../services/courseManagementService';
import type {
    Course,
    Category,
    CourseCreateRequest,
    CourseUpdateRequest,
} from '../../../../types/course';
import type { User } from '../../../../types/user';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';


const { Option } = Select;
const { Title, Text } = Typography;

interface CourseDetailDrawerProps {
    open: boolean;
    onClose: () => void;
    course: Course | null;
    categories: Category[];
    onCourseUpdated: () => void;
}

const CourseDetailDrawer = ({
    open,
    onClose,
    course,
    categories,
    onCourseUpdated,
}: CourseDetailDrawerProps) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [courseDetails, setCourseDetails] = useState<Course | null>(null);
    const [teachers, setTeachers] = useState<User[]>([]); // ✅ Thêm state cho teachers

    const isCreateMode = !course;
    const isViewMode = course && !isEditing;

    // ✅ Thêm function để fetch teachers
    const fetchTeachers = async () => {
        try {
            const teacherList = await getTeachersService();
            setTeachers(teacherList);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách giáo viên:', error);
        }
    };

    useEffect(() => {
        // ✅ Fetch teachers khi component mount
        fetchTeachers();

        if (course) {
            fetchCourseDetails(course.id);
            setIsEditing(false);
        } else {
            // Create mode
            form.resetFields();
            setThumbnailUrl(null);
            setFileList([]);
            setCourseDetails(null);
            setIsEditing(true);
        }
    }, [course, form]);

    const fetchCourseDetails = async (courseId: number) => {
        try {
            setLoading(true);
            const response = await getCourseByIdService(courseId);
            if (response.code === 200) {
                const courseData = response.data;
                setCourseDetails(courseData);

                // ✅ Map categoryName to categoryId để set form
                const categoryId = categories.find(
                    (cat) => cat.name === courseData.categoryName
                )?.id;
                // ✅ Find authorId từ author object
                const authorId = courseData.author?.id;

                form.setFieldsValue({
                    title: courseData.title,
                    description: courseData.description,
                    price: courseData.price,
                    categoryId: categoryId,
                    authorId: authorId, // ✅ Set authorId cho edit mode
                });

                setThumbnailUrl(courseData.thumbnailUrl);
                setFileList(
                    courseData.thumbnailUrl
                        ? [
                              {
                                  uid: '-1',
                                  name: 'thumbnail.jpg',
                                  url: courseData.thumbnailUrl,
                                  status: 'done',
                              },
                          ]
                        : []
                );
            }
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết khóa học:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async ({ file }: any) => {
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Vui lòng chọn file hình ảnh!');
            return;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Kích thước file phải nhỏ hơn 5MB!');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploadLoading(true);
            const response = await uploadImageService(formData);
            if (response.code === 200) {
                setThumbnailUrl(response.data);
                setFileList([
                    {
                        uid: file.uid,
                        name: file.name,
                        url: response.data,
                        status: 'done',
                    },
                ]);
                message.success('Tải ảnh lên thành công!');
            }
        } catch (error) {
            console.error('Lỗi khi tải ảnh lên:', error);
            setFileList([]);
            setThumbnailUrl(null);
        } finally {
            setUploadLoading(false);
        }
    };

    const handleRemoveFile = () => {
        setFileList([]);
        setThumbnailUrl(null);
    };

    const onFinish = async (values: any) => {
        // ✅ Validate authorId cho cả create và update
        if (!values.authorId) {
            message.error('Vui lòng chọn giáo viên!');
            return;
        }

        setLoading(true);
        try {
            if (course) {
                // Update existing course
                const updateData: CourseUpdateRequest = {
                    id: course.id,
                    title: values.title,
                    description: values.description,
                    price: values.price,
                    categoryId: values.categoryId,
                    thumbnailUrl: thumbnailUrl || course.thumbnailUrl || '',
                };

                const response = await updateCourseInfoService(updateData);
                if (response.code === 200) {
                    message.success('Cập nhật khóa học thành công!');
                    onCourseUpdated();
                    setIsEditing(false);
                    // Refresh course details
                    await fetchCourseDetails(course.id);
                }
            } else {
                // Create new course
                const createData: CourseCreateRequest = {
                    title: values.title,
                    description: values.description || '',
                    price: values.price,
                    authorId: values.authorId, // ✅ Sử dụng authorId từ form
                    categoryId: values.categoryId,
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
            console.error(course ? 'Lỗi khi cập nhật khóa học:' : 'Lỗi khi tạo khóa học:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setThumbnailUrl(null);
        setFileList([]);
        setIsEditing(false);
        setCourseDetails(null);
        onClose();
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form to original values
        if (courseDetails) {
            const categoryId = categories.find(
                (cat) => cat.name === courseDetails.categoryName
            )?.id;
            const authorId = courseDetails.author?.id;
            form.setFieldsValue({
                title: courseDetails.title,
                description: courseDetails.description,
                price: courseDetails.price,
                categoryId: categoryId,
                authorId: authorId, // ✅ Reset authorId
            });
            setThumbnailUrl(courseDetails.thumbnailUrl);
            setFileList(
                courseDetails.thumbnailUrl
                    ? [
                          {
                              uid: '-1',
                              name: 'thumbnail.jpg',
                              url: courseDetails.thumbnailUrl,
                              status: 'done',
                          },
                      ]
                    : []
            );
        }
    };

    const getTitle = () => {
        if (isCreateMode) return 'Tạo khóa học mới';
        if (isViewMode) return 'Chi tiết khóa học';
        return 'Chỉnh sửa khóa học';
    };

    const getFooterButtons = () => {
        if (isCreateMode) {
          return (
            <div style={{ textAlign: 'right' }}>
              <Button onClick={handleClose} style={{ marginRight: 8 }}>
                Hủy
              </Button>
              <Button type="primary" loading={loading} onClick={() => form.submit()}>
                Tạo mới
              </Button>
            </div>
          );
        }
      
        if (isViewMode) {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <Button
                onClick={() => {
                  // Điều hướng đến trang quản lý bài học của course này
                  // Bạn cần đảm bảo import useNavigate ở đầu file
                  navigate(`/dashboard/course-management/${courseDetails?.id}/lessons`);
                }}
                type="default"
              >
                Quản lý bài học
              </Button>
              <div style={{ marginLeft: 'auto' }}>
                <Button onClick={handleClose} style={{ marginRight: 8 }}>
                  Đóng
                </Button>
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          );
        }
      
        return (
          <div style={{ textAlign: 'right' }}>
            <Button onClick={handleCancelEdit} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" loading={loading} onClick={() => form.submit()}>
              Cập nhật
            </Button>
          </div>
        );
      };

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isCreateMode ? (
                        <PlusOutlined />
                    ) : isViewMode ? (
                        <EyeOutlined />
                    ) : (
                        <EditOutlined />
                    )}
                    {getTitle()}
                </div>
            }
            width={600}
            open={open}
            onClose={handleClose}
            destroyOnClose
            footer={getFooterButtons()}
        >
            {/* ✅ View Mode - Course Details */}
            {isViewMode && courseDetails && (
                <div>
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="ID">{courseDetails.id}</Descriptions.Item>
                        <Descriptions.Item label="Tiêu đề">{courseDetails.title}</Descriptions.Item>
                        <Descriptions.Item label="Mô tả">
                            {courseDetails.description || 'Chưa có mô tả'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giá">
                            <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(courseDetails.price)}
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Chủ đề">
                            {courseDetails.categoryName || 'Chưa xác định'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tác giả">
                            {courseDetails.authorName || 'Chưa xác định'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Người tạo">
                            {courseDetails.createdByName || 'Chưa xác định'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {moment(courseDetails.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật">
                            {courseDetails.updatedAt
                                ? moment(courseDetails.updatedAt).format('DD/MM/YYYY HH:mm')
                                : 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <span
                                style={{
                                    color: courseDetails.isActive ? '#52c41a' : '#faad14',
                                    fontWeight: 'bold',
                                }}
                            >
                                {courseDetails.isActive ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tình trạng">
                            <span
                                style={{
                                    color: courseDetails.isDelete ? '#ff4d4f' : '#52c41a',
                                    fontWeight: 'bold',
                                }}
                            >
                                {courseDetails.isDelete ? 'Đã xóa' : 'Hoạt động'}
                            </span>
                        </Descriptions.Item>
                    </Descriptions>

                    {courseDetails.thumbnailUrl && (
                        <div style={{ marginTop: 16 }}>
                            <Title level={5}>Hình ảnh thumbnail:</Title>
                            <Image
                                src={courseDetails.thumbnailUrl}
                                alt="Course thumbnail"
                                style={{ maxWidth: '100%', borderRadius: 8 }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8OH+QWdgY1YbSXZJM7K7lDOSByNvZOchsH1YLa+Kp7lKvFYuO0GOWFH4Q=="
                            />
                        </div>
                    )}

                    {courseDetails.lessons && courseDetails.lessons.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <Divider />
                            <Title level={5}>Bài học ({courseDetails.lessons.length})</Title>
                            {/* TODO: Implement lessons list */}
                            <Text type="secondary">Danh sách bài học sẽ được hiển thị ở đây</Text>
                        </div>
                    )}
                </div>
            )}

            {/* ✅ Edit/Create Mode - Form */}
            {(isEditing || isCreateMode) && (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        price: 0,
                    }}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tiêu đề khóa học!' },
                            { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự!' },
                            { max: 200, message: 'Tiêu đề không được quá 200 ký tự!' },
                        ]}
                    >
                        <Input placeholder="Nhập tiêu đề khóa học" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ max: 1000, message: 'Mô tả không được quá 1000 ký tự!' }]}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Nhập mô tả khóa học (tùy chọn)"
                            showCount
                            maxLength={1000}
                        />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Giá (VND)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá khóa học!' },
                            { type: 'number', min: 0, message: 'Giá phải lớn hơn hoặc bằng 0!' },
                        ]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="Nhập giá khóa học"
                        />
                    </Form.Item>

                    <Form.Item
                        name="categoryId"
                        label="Chủ đề"
                        rules={[{ required: true, message: 'Vui lòng chọn chủ đề!' }]}
                    >
                        <Select placeholder="Chọn chủ đề" allowClear>
                            {categories.map((category) => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* ✅ Thêm dropdown chọn giáo viên */}
                    <Form.Item
                        name="authorId"
                        label="Giáo viên"
                        rules={[{ required: true, message: 'Vui lòng chọn giáo viên!' }]}
                    >
                        <Select
                            placeholder="Chọn giáo viên"
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children?.toString()?.toLowerCase() ?? '').indexOf(
                                    input.toLowerCase()
                                ) >= 0
                            }
                        >
                            {teachers.map((teacher) => (
                                <Option key={teacher.id} value={teacher.id}>
                                    {`${teacher.firstName} ${teacher.lastName}`}
                                    {teacher.phone && ` - ${teacher.phone}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="thumbnail" label="Hình ảnh thumbnail">
                        <Upload
                            fileList={fileList}
                            customRequest={handleUpload}
                            onRemove={handleRemoveFile}
                            maxCount={1}
                            accept="image/*"
                            showUploadList={{
                                showPreviewIcon: true,
                                showRemoveIcon: true,
                            }}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                loading={uploadLoading}
                                disabled={fileList.length >= 1}
                            >
                                {fileList.length >= 1 ? 'Đã tải lên' : 'Tải ảnh lên'}
                            </Button>
                        </Upload>
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Chỉ chấp nhận file hình ảnh, kích thước tối đa 5MB
                        </div>
                    </Form.Item>

                    {thumbnailUrl && (
                        <Form.Item label="Xem trước">
                            <Image
                                src={thumbnailUrl}
                                alt="Thumbnail preview"
                                style={{
                                    maxWidth: '100%',
                                    borderRadius: 4,
                                    border: '1px solid #d9d9d9',
                                }}
                            />
                        </Form.Item>
                    )}
                </Form>
            )}
        </Drawer>
    );
};

export default CourseDetailDrawer;
