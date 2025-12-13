import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Upload, message, Image, Card, Space } from 'antd';
import { UploadOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import TipTapEditor from 'components/common/TipTapEditor/TipTapEditor';
import {
    createPostService,
    uploadImageService,
    getCategoriesService,
} from '../../../services/blogService';
import type { Category } from '../../../types/blog';
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
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [themeUrl, setThemeUrl] = useState<string>('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [isDraft, setIsDraft] = useState(false);

    // Load categories on component mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await getCategoriesService();
                if (response.data) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('Failed to load categories:', error);
                message.error('Không thể tải danh mục');
                // Fallback categories
                setCategories([
                    { id: 1, name: 'TIPS' },
                    { id: 2, name: 'Giáo dục' },
                    { id: 3, name: 'Lập trình' },
                ]);
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();
    }, []);

    // Auto-save draft functionality
    useEffect(() => {
        const saveDraft = () => {
            const formValues = form.getFieldsValue();
            const draftData = {
                ...formValues,
                content,
                themeUrl,
                timestamp: Date.now(),
            };
            localStorage.setItem('blog_draft', JSON.stringify(draftData));
        };

        // Save draft every 30 seconds if there's content
        const interval = setInterval(() => {
            if (content || form.getFieldValue('title')) {
                saveDraft();
                setIsDraft(true);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [content, form, themeUrl]);

    // Load draft on component mount
    useEffect(() => {
        const loadDraft = () => {
            const savedDraft = localStorage.getItem('blog_draft');
            if (savedDraft) {
                try {
                    const draftData = JSON.parse(savedDraft);
                    // Only load draft if it's less than 24 hours old
                    if (Date.now() - draftData.timestamp < 24 * 60 * 60 * 1000) {
                        form.setFieldsValue({
                            title: draftData.title || '',
                            categoryId: draftData.categoryId || 1,
                            themeUrl: draftData.themeUrl || '',
                        });
                        setContent(draftData.content || '');
                        setThemeUrl(draftData.themeUrl || '');
                        setIsDraft(true);
                    }
                } catch (error) {
                    console.error('Failed to load draft:', error);
                }
            }
        };

        loadDraft();
    }, [form]);

    const validateContent = () => {
        if (!content || content.trim() === '' || content === '<p></p>') {
            return false;
        }
        // Check if content has meaningful text (not just HTML tags)
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        return textContent.length > 10;
    };

    const resetForm = () => {
        // Clear draft
        localStorage.removeItem('blog_draft');
        // Reset form
        form.resetFields();
        // Reset states
        setContent('');
        setThemeUrl('');
        setIsDraft(false);
        // Reset form values to initial state
        form.setFieldsValue({
            title: '',
            themeUrl: '',
            categoryId: categories.length > 0 ? categories[0].id : 1,
        });
    };

    const handleSubmit = async (values: BlogFormValues) => {
        if (!validateContent()) {
            message.error('Vui lòng nhập nội dung bài viết (ít nhất 10 ký tự)');
            return;
        }

        setLoading(true);
        try {
            const postData = {
                title: values.title,
                content,
                themeUrl: values.themeUrl,
                categoryId: values.categoryId,
            };

            const response = await createPostService(postData);
            if (response.code === 200) {
                message.success('Đăng bài thành công! Bạn có thể tiếp tục viết bài mới.');
                // Reset form to initial state
                resetForm();
            }
        } catch (error) {
            console.error('Submit error:', error);
            message.error('Đăng bài thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadTheme = async (file: File) => {
        // Validate file
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
        } catch (error: any) {
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

    const handleSaveDraft = () => {
        const formValues = form.getFieldsValue();
        const draftData = {
            ...formValues,
            content,
            themeUrl,
            timestamp: Date.now(),
        };
        localStorage.setItem('blog_draft', JSON.stringify(draftData));
        setIsDraft(true);
        message.success('Đã lưu bản nháp');
    };

    const handleCancel = () => {
        const hasUnsavedChanges = content || form.getFieldValue('title') || themeUrl;

        if (hasUnsavedChanges) {
            const confirmed = window.confirm('Bạn có muốn lưu bản nháp trước khi thoát không?');
            if (confirmed) {
                handleSaveDraft();
                return;
            }
        }

        // Navigate back to dashboard
        navigate('/dashboard');
    };

    const handleNewPost = () => {
        const hasUnsavedChanges = content || form.getFieldValue('title') || themeUrl;

        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                'Bạn có muốn lưu bản nháp trước khi tạo bài mới không?'
            );
            if (confirmed) {
                handleSaveDraft();
            }
        }

        resetForm();
        message.success('Đã tạo bài viết mới');
    };

    const handleClearDraft = () => {
        localStorage.removeItem('blog_draft');
        resetForm();
        message.success('Đã xóa bản nháp');
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
        <div className="write-blog">
            <div className="write-blog-header">
                <h2>Viết Blog</h2>
                <div className="header-actions">
                    {isDraft && (
                        <div className="draft-indicator">
                            <span className="draft-badge">Bản nháp đã lưu</span>
                            <Button size="small" onClick={handleClearDraft}>
                                Xóa bản nháp
                            </Button>
                        </div>
                    )}
                    <Button type="default" onClick={handleNewPost} disabled={loading}>
                        📝 Bài mới
                    </Button>
                </div>
            </div>

            <Card className="write-blog-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ categoryId: 1 }}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tiêu đề!' },
                            { min: 10, message: 'Tiêu đề phải có ít nhất 10 ký tự!' },
                            { max: 200, message: 'Tiêu đề không được vượt quá 200 ký tự!' },
                        ]}
                    >
                        <Input placeholder="Nhập tiêu đề bài viết" showCount maxLength={200} />
                    </Form.Item>

                    <Form.Item
                        name="themeUrl"
                        label="Ảnh đại diện"
                        rules={[{ required: true, message: 'Vui lòng tải ảnh đại diện!' }]}
                    >
                        <div className="theme-upload-container">
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                beforeUpload={handleUploadTheme}
                                disabled={uploadLoading}
                            >
                                <Button
                                    icon={<UploadOutlined />}
                                    loading={uploadLoading}
                                    disabled={!!themeUrl}
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
                        <Select placeholder="Chọn chuyên mục" loading={loadingCategories}>
                            {categories.map((category) => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Nội dung"
                        name="content"
                        rules={[
                            {
                                validator: () => {
                                    if (!validateContent()) {
                                        return Promise.reject(
                                            new Error(
                                                'Vui lòng nhập nội dung bài viết (ít nhất 10 ký tự)!'
                                            )
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <TipTapEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Bắt đầu viết nội dung bài blog của bạn..."
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

                    <Form.Item>
                        <div className="button-group">
                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    disabled={!validateContent()}
                                >
                                    Đăng bài
                                </Button>
                                <Button
                                    type="default"
                                    onClick={handleSaveDraft}
                                    icon={<SaveOutlined />}
                                    disabled={loading}
                                >
                                    Lưu nháp
                                </Button>
                                <Button type="default" onClick={handleCancel} disabled={loading}>
                                    Hủy
                                </Button>
                            </Space>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default WriteBlog;
