import { Modal, Form, Input, Select, Button, Upload, message, Image } from 'antd';
import { UploadOutlined, EyeOutlined } from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';
import TipTapEditor from '../../../components/common/TipTapEditor/TipTapEditor';
import {
    updatePostInfoService,
    uploadImageService,
    getCategoriesService,
} from '../../../services/blogService';
import type { Post, Category } from '../../../types/blog';
import './EditPostModal.css';

const { Option } = Select;

interface EditPostModalProps {
    visible: boolean;
    post: Post | null;
    onClose: () => void;
    onSuccess: () => void;
}

const EditPostModal = ({ visible, post, onClose, onSuccess }: EditPostModalProps) => {
    const [form] = Form.useForm();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [themeUrl, setThemeUrl] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Load categories
    const loadCategories = useCallback(async () => {
        try {
            setLoadingCategories(true);
            const response = await getCategoriesService();
            if (response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    // Initialize form with post data
    useEffect(() => {
        if (visible && post) {
            loadCategories();
            form.setFieldsValue({
                title: post.title,
                themeUrl: post.themeUrl || '',
            });
            setContent(post.content || '');
            setThemeUrl(post.themeUrl || '');
            
            // Set categoryId after categories are loaded
            const category = categories.find(c => c.name === post.category);
            if (category) {
                form.setFieldsValue({ categoryId: category.id });
            }
        }
    }, [visible, post, form, loadCategories]);

    // Update categoryId when categories are loaded
    useEffect(() => {
        if (post && categories.length > 0) {
            const category = categories.find(c => c.name === post.category);
            if (category) {
                form.setFieldsValue({ categoryId: category.id });
            }
        }
    }, [categories, post, form]);

    // Reset form when modal closes
    useEffect(() => {
        if (!visible) {
            form.resetFields();
            setContent('');
            setThemeUrl('');
        }
    }, [visible, form]);

    const validateContent = () => {
        if (!content || content.trim() === '' || content === '<p></p>') {
            return false;
        }
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        return textContent.length > 10;
    };

    const handleSubmit = async () => {
        if (!post) return;

        if (!validateContent()) {
            message.error('Vui lòng nhập nội dung bài viết (ít nhất 10 ký tự)');
            return;
        }

        try {
            setLoading(true);
            const values = await form.validateFields();
            
            const updateData = {
                id: post.id,
                title: values.title,
                content,
                themeUrl: values.themeUrl || themeUrl,
                categoryId: values.categoryId,
            };

            await updatePostInfoService(updateData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadTheme = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            message.error('Vui lòng chọn file ảnh');
            return false;
        }

        if (file.size > 5 * 1024 * 1024) {
            message.error('Kích thước ảnh không được vượt quá 5MB');
            return false;
        }

        setUploadLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await uploadImageService(formData);
            if (response.code === 200) {
                const url = response.data;
                form.setFieldsValue({ themeUrl: url });
                setThemeUrl(url);
                message.success('Tải ảnh đại diện thành công!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            message.error('Lỗi khi tải ảnh đại diện.');
        } finally {
            setUploadLoading(false);
        }
        return false;
    };

    const handleRemoveTheme = () => {
        form.setFieldsValue({ themeUrl: '' });
        setThemeUrl('');
    };

    const handleCancel = () => {
        if (!loading) {
            onClose();
        }
    };

    const getWordCount = () => {
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        const words = textContent.split(/\s+/).filter((word) => word.length > 0);
        return {
            characters: textContent.length,
            words: words.length,
        };
    };

    const wordCount = getWordCount();

    return (
        <Modal
            title="Chỉnh sửa bài viết"
            open={visible}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel} disabled={loading}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                    disabled={!validateContent()}
                >
                    Lưu thay đổi
                </Button>,
            ]}
            width={900}
            className="edit-post-modal"
            closable={!loading}
            maskClosable={!loading}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="title"
                    label="Tiêu đề"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tiêu đề!' },
                        { min: 10, message: 'Tiêu đề phải có ít nhất 10 ký tự!' },
                        { max: 200, message: 'Tiêu đề không được vượt quá 200 ký tự!' },
                    ]}
                >
                    <Input
                        placeholder="Nhập tiêu đề bài viết"
                        showCount
                        maxLength={200}
                        disabled={loading}
                    />
                </Form.Item>

                <Form.Item name="themeUrl" label="Ảnh đại diện">
                    <div className="theme-upload-container">
                        <Upload
                            accept="image/*"
                            showUploadList={false}
                            beforeUpload={handleUploadTheme}
                            disabled={uploadLoading || loading}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                loading={uploadLoading}
                                disabled={!!themeUrl || loading}
                            >
                                {uploadLoading ? 'Đang tải...' : 'Tải ảnh đại diện'}
                            </Button>
                        </Upload>

                        {themeUrl && (
                            <div className="theme-preview">
                                <Image
                                    src={themeUrl}
                                    alt="Ảnh đại diện"
                                    width={200}
                                    preview={{
                                        mask: <EyeOutlined />,
                                    }}
                                />
                                <Button
                                    onClick={handleRemoveTheme}
                                    style={{ marginTop: 8 }}
                                    danger
                                    disabled={loading}
                                >
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
                    <Select
                        placeholder="Chọn chuyên mục"
                        loading={loadingCategories}
                        disabled={loading}
                    >
                        {categories.map((category) => (
                            <Option key={category.id} value={category.id}>
                                {category.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Nội dung">
                    <TipTapEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Nhập nội dung bài viết..."
                    />
                </Form.Item>

                <div className="content-stats">
                    <span>
                        📝 {wordCount.words} từ, {wordCount.characters} ký tự
                    </span>
                    <span className={wordCount.characters < 100 ? 'warning' : 'success'}>
                        {wordCount.characters < 100
                            ? '⚠️ Nội dung còn quá ngắn'
                            : '✅ Độ dài phù hợp'}
                    </span>
                </div>
            </Form>
        </Modal>
    );
};

export default EditPostModal;
