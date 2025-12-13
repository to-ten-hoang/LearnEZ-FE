// Tab thông tin khóa học (Create / Update)
import { Form, Input, InputNumber, Select, Button, Upload, Image, message, Card, Tag, Descriptions, Divider } from 'antd';
import { useEffect, useState } from 'react';
import { UploadOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    createCourseService,
    updateCourseInfoService,
    uploadImageService
} from '../../../services/courseManagementService';
import type { Course, Category } from '../../../types/course';
import moment from 'moment';

interface CourseInfoTabProps {
    isCreateMode: boolean;
    course: Course | null;
    categories: Category[];
    teachers: any[];
    onSaved: () => void;
    onCreated: (newId: number) => void;
}

const CourseInfoTab = ({
    isCreateMode,
    course,
    categories,
    teachers,
    onSaved,
    onCreated
}: CourseInfoTabProps) => {
    const [form] = Form.useForm();
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isCreateMode && course) {
            form.setFieldsValue({
                title: course.title,
                description: course.description,
                price: course.price,
                categoryId: course.categoryId,
                authorId: course.author?.id
            });
            setThumbnailUrl(course.thumbnailUrl || null);
            setFileList(
                course.thumbnailUrl
                    ? [{ uid: '-1', name: 'thumbnail.jpg', url: course.thumbnailUrl, status: 'done' }]
                    : []
            );
        } else {
            form.resetFields();
            setThumbnailUrl(null);
            setFileList([]);
        }
    }, [isCreateMode, course, form]);

    const handleUpload = async ({ file }: any) => {
        if (!file) return;
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ hỗ trợ upload ảnh cho thumbnail!');
            return;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Kích thước file phải < 5MB');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            setUploading(true);
            const res = await uploadImageService(formData);
            if (res.code === 200) {
                setThumbnailUrl(res.data);
                setFileList([{ uid: file.uid, name: file.name, url: res.data, status: 'done' }]);
            }
        } catch {
            setThumbnailUrl(null);
            setFileList([]);
        } finally {
            setUploading(false);
        }
    };

    const onFinish = async (values: any) => {
        setSaving(true);
        try {
            if (isCreateMode) {
                const createReq = {
                    title: values.title,
                    description: values.description || '',
                    price: values.price,
                    authorId: values.authorId,
                    categoryId: values.categoryId,
                    thumbnailUrl: thumbnailUrl || '',
                    isActive: false,
                    isDelete: false
                };
                const res = await createCourseService(createReq);
                if (res.code === 200) {
                    message.success('Tạo khóa học thành công');
                    onCreated(res.data.id);
                }
            } else if (course) {
                const updateReq = {
                    id: course.id,
                    title: values.title,
                    description: values.description,
                    price: values.price,
                    categoryId: values.categoryId,
                    authorId: values.authorId,
                    thumbnailUrl: thumbnailUrl || course.thumbnailUrl || ''
                };
                const res = await updateCourseInfoService(updateReq);
                if (res.code === 200) {
                    message.success('Cập nhật khóa học thành công');
                    onSaved();
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {/* LEFT: Form */}
            <div style={{ flex: 1, minWidth: 320, maxWidth: 600 }}>
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ price: 0 }}>
                    <Form.Item
                        name="title"
                        label="Tiêu đề khóa học"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tiêu đề!' },
                            { min: 5, message: 'Ít nhất 5 ký tự' }
                        ]}
                    >
                        <Input placeholder="Nhập tiêu đề khóa học" size="large" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả chi tiết">
                        <Input.TextArea rows={4} placeholder="Mô tả khóa học..." />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            name="price"
                            label="Giá (VND)"
                            rules={[{ required: true, message: 'Nhập giá!' }, { type: 'number', min: 0 }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/,/g, '') as any}
                            />
                        </Form.Item>

                        <Form.Item
                            name="categoryId"
                            label="Chủ đề"
                            rules={[{ required: true, message: 'Chọn chủ đề!' }]}
                            style={{ flex: 1 }}
                        >
                            <Select placeholder="Chọn chủ đề">
                                {categories.map((c) => (
                                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="authorId"
                        label="Giáo viên phụ trách"
                        rules={[{ required: true, message: 'Chọn giáo viên!' }]}
                    >
                        <Select
                            placeholder="Chọn giáo viên"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {teachers.map((t: any) => (
                                <Select.Option key={t.id} value={t.id}>
                                    {t.firstName} {t.lastName} {t.phone ? ` - ${t.phone}` : ''}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Ảnh bìa (Thumbnail)">
                        <Upload
                            fileList={fileList}
                            customRequest={handleUpload}
                            onRemove={() => { setThumbnailUrl(null); setFileList([]); }}
                            maxCount={1}
                            accept="image/*"
                            listType="picture"
                        >
                            <Button icon={<UploadOutlined />} loading={uploading} disabled={fileList.length >= 1}>
                                {fileList.length >= 1 ? 'Đã tải lên' : 'Chọn ảnh'}
                            </Button>
                        </Upload>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                            Tối đa 5MB. Định dạng: JPG, PNG, WEBP
                        </div>
                    </Form.Item>

                    {thumbnailUrl && (
                        <Form.Item label="Xem trước ảnh bìa">
                            <Image
                                src={thumbnailUrl}
                                alt="thumbnail"
                                style={{ maxWidth: 300, maxHeight: 180, objectFit: 'cover', borderRadius: 8 }}
                            />
                        </Form.Item>
                    )}

                    <Form.Item style={{ marginTop: 24 }}>
                        <Button type="primary" htmlType="submit" loading={saving} size="large">
                            {isCreateMode ? 'Tạo khóa học' : 'Lưu thay đổi'}
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            {/* RIGHT: Metadata Card (only for edit mode) */}
            {!isCreateMode && course && (
                <div style={{ width: 320 }}>
                    <Card title="Thông tin khóa học" size="small">
                        {/* Status Tags */}
                        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {course.isActive ? (
                                <Tag icon={<CheckCircleOutlined />} color="success">Đã duyệt</Tag>
                            ) : (
                                <Tag icon={<CloseCircleOutlined />} color="warning">Chưa duyệt</Tag>
                            )}
                            {course.isDelete && (
                                <Tag icon={<DeleteOutlined />} color="error">Đã xóa</Tag>
                            )}
                        </div>

                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="ID">{course.id}</Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {course.createdAt ? moment(course.createdAt).format('DD/MM/YYYY HH:mm') : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật lần cuối">
                                {course.updatedAt ? moment(course.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người tạo">
                                {course.createdByName || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người cập nhật">
                                {course.updatedByName || '-'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider style={{ margin: '16px 0' }} />

                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Số bài học">
                                {course.lessons?.length || 0} bài
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá hiện tại">
                                <span style={{ color: '#1890ff', fontWeight: 600 }}>
                                    {course.price?.toLocaleString('vi-VN')} ₫
                                </span>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CourseInfoTab;