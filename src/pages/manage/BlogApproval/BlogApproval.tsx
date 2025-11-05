import {
    Button,
    message,
    Table,
    Input,
    Select,
    DatePicker,
    Form,
    Switch,
    Modal,
    Image,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useEffect, useState, useCallback } from 'react';
import {
    getAllPostsService,
    updatePostStatusService,
    getCategoriesService,
} from '../../../services/blogService';
import moment from 'moment';
import './BlogApproval.css';
import type { AllPostsRequest, Post, Category } from '../../../types/blog';
import type { SortOrder } from 'antd/es/table/interface';

const { Option } = Select;
const { RangePicker } = DatePicker;

const BlogApproval = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
    const [modalLoading, setModalLoading] = useState(false);

    // Preview modal state
    const [previewModal, setPreviewModal] = useState({
        open: false,
        post: null as Post | null,
    });

    const [modalState, setModalState] = useState({
        activeOpen: false,
        activeChecked: false,
        deleteOpen: false,
        isDelete: false,
        postId: null as number | null,
    });

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getCategoriesService();
            if (response.code === 200) {
                setCategories(response.data);
            }
        } catch (error) {
            message.error('Lỗi khi lấy danh sách danh mục.');
        }
    }, []);

    const fetchPosts = useCallback(
        async (
            values: any = {},
            page: number = 0,
            size: number = 5,
            sort: string | null = null
        ) => {
            setLoading(true);
            try {
                const { title, dateRange, categoryPost } = values;
                const dataBody: AllPostsRequest = {
                    fromDate: dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : null,
                    toDate: dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : null,
                    title: title || null,
                    categoryPost: categoryPost ? [categoryPost] : [],
                    page,
                    size,
                    sort,
                };
                const response = await getAllPostsService(dataBody);
                setPosts(response.data.content);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.pageable.pageNumber);
            } catch (error) {
                message.error('Lỗi khi lấy danh sách bài đăng.');
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchCategories();
        fetchPosts();
    }, []);

    // Preview functionality
    const handlePreview = useCallback((post: Post) => {
        setPreviewModal({
            open: true,
            post,
        });
    }, []);

    const handleClosePreview = () => {
        setPreviewModal({
            open: false,
            post: null,
        });
    };

    const handleToggleActive = useCallback(
        (postId: number, checked: boolean) => {
            setModalState({
                ...modalState,
                activeOpen: true,
                activeChecked: checked,
                postId,
            });
        },
        [modalState]
    );

    const handleModalActiveOk = async () => {
        if (modalState.postId === null) return;
        setModalLoading(true);
        try {
            const response = await updatePostStatusService({
                id: modalState.postId,
                isActive: modalState.activeChecked,
            });
            if (response.code === 200) {
                message.success(
                    modalState.activeChecked
                        ? 'Duyệt bài đăng thành công!'
                        : 'Hủy duyệt bài đăng thành công!'
                );
                setPosts(
                    posts.map((post) =>
                        post.id === modalState.postId
                            ? { ...post, isActive: modalState.activeChecked }
                            : post
                    )
                );
            }
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái bài đăng.');
        } finally {
            setModalLoading(false);
            setModalState({ ...modalState, activeOpen: false, postId: null });
        }
    };

    const handleModalActiveCancel = () => {
        setModalState({ ...modalState, activeOpen: false, postId: null });
    };

    const handleDeleteOrRestore = useCallback(
        (postId: number, isDelete: boolean) => {
            setModalState({
                ...modalState,
                deleteOpen: true,
                isDelete,
                postId,
            });
        },
        [modalState]
    );

    const handleModalDeleteOk = async () => {
        if (modalState.postId === null) return;
        setModalLoading(true);
        try {
            const response = await updatePostStatusService({
                id: modalState.postId,
                isDelete: modalState.isDelete,
                isActive: false,
            });
            if (response.code === 200) {
                message.success(
                    modalState.isDelete
                        ? 'Xóa bài đăng thành công!'
                        : 'Khôi phục bài đăng thành công!'
                );
                setPosts(
                    posts.map((post) =>
                        post.id === modalState.postId
                            ? {
                                  ...post,
                                  isDelete: modalState.isDelete,
                                  isActive: modalState.isDelete ? false : post.isActive,
                              }
                            : post
                    )
                );
            }
        } catch (error) {
            message.error(
                modalState.isDelete ? 'Lỗi khi xóa bài đăng.' : 'Lỗi khi khôi phục bài đăng.'
            );
        } finally {
            setModalLoading(false);
            setModalState({ ...modalState, deleteOpen: false, postId: null });
        }
    };

    const handleModalDeleteCancel = () => {
        setModalState({ ...modalState, deleteOpen: false, postId: null });
    };

    const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
        const { field, order } = sorter;
        const newSortField = field || null;
        const newSortOrder = order as SortOrder;
        setSortField(newSortField);
        setSortOrder(newSortOrder);
        setCurrentPage(pagination.current - 1);
        setPageSize(pagination.pageSize);

        fetchPosts(
            form.getFieldsValue(),
            pagination.current - 1,
            pagination.pageSize,
            newSortField && newSortOrder
                ? `${newSortField},${newSortOrder === 'ascend' ? 'asc' : 'desc'}`
                : null
        );
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true,
            sorter: true,
            sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
            sortOrder: sortField === 'title' ? sortOrder : undefined,
        },
        {
            title: 'Chuyên mục',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: (category: string) => category || 'Chưa xác định',
        },
        {
            title: 'Tác giả',
            dataIndex: 'author',
            key: 'author',
            width: 150,
            render: (author: any) => author?.name || 'Chưa xác định',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (createdAt: string) => moment(createdAt).format('DD/MM/YYYY HH:mm'),
            sorter: true,
            sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
            sortOrder: sortField === 'createdAt' ? sortOrder : undefined,
        },
        {
            title: 'Cập nhật gần nhất',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 150,
            render: (updatedAt: string | null) =>
                updatedAt ? moment(updatedAt).format('DD/MM/YYYY HH:mm') : 'Chưa cập nhật',
            sorter: true,
            sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
            sortOrder: sortField === 'updatedAt' ? sortOrder : undefined,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive: boolean, record: Post) => (
                <Switch
                    checked={isActive}
                    onChange={(checked) => handleToggleActive(record.id, checked)}
                    disabled={record.isDelete}
                    aria-label={`Bật/tắt trạng thái cho bài đăng ${record.title}`}
                />
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            render: (_: any, record: Post) => (
                <div className="action-buttons">
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(record)}
                        title="Xem trước"
                    >
                        Xem
                    </Button>
                    {record.isDelete ? (
                        <Button
                            size="small"
                            onClick={() => handleDeleteOrRestore(record.id, false)}
                            className="action-button-fixed"
                        >
                            Khôi phục
                        </Button>
                    ) : (
                        <Button
                            danger
                            size="small"
                            onClick={() => handleDeleteOrRestore(record.id, true)}
                            className="action-button-fixed"
                        >
                            Xóa
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="blog-approval">
            <h2>Duyệt Bài Đăng</h2>
            <Form
                form={form}
                layout="inline"
                onFinish={(values) =>
                    fetchPosts(
                        values,
                        0,
                        pageSize,
                        sortField && sortOrder
                            ? `${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`
                            : null
                    )
                }
                style={{ marginBottom: 16 }}
                className="search-form"
            >
                <Form.Item name="title" label="Tiêu đề">
                    <Input placeholder="Nhập tiêu đề bài viết" />
                </Form.Item>
                <Form.Item name="categoryPost" label="Chuyên mục">
                    <Select placeholder="Chọn chuyên mục" allowClear>
                        {categories.map((category) => (
                            <Option key={category.id} value={category.name}>
                                {category.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="dateRange" label="Ngày tạo blog">
                    <RangePicker format="DD/MM/YYYY" />
                </Form.Item>
                <div className="form-actions">
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            onClick={() => {
                                setCurrentPage(0);
                            }}
                        >
                            Tìm kiếm
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            onClick={() => {
                                form.resetFields();
                                setSortField(null);
                                setSortOrder(undefined);
                                fetchPosts({}, 0, pageSize, null);
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </Form.Item>
                </div>
            </Form>

            <Table
                columns={columns}
                dataSource={posts}
                loading={loading}
                pagination={{
                    current: currentPage + 1,
                    pageSize: pageSize,
                    total: totalPages * pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                }}
                onChange={handleTableChange}
            />

            {/* Preview Modal */}
            <Modal
                title="Xem trước bài đăng"
                open={previewModal.open}
                onCancel={handleClosePreview}
                footer={[
                    <Button key="close" onClick={handleClosePreview}>
                        Đóng
                    </Button>,
                ]}
                width={800}
                className="blog-preview-modal"
            >
                {previewModal.post && (
                    <div className="blog-preview-content">
                        <div className="blog-preview-header">
                            <h1 className="blog-preview-title">{previewModal.post.title}</h1>
                            <div className="blog-preview-meta">
                                <span className="blog-preview-category">
                                    📂 {previewModal.post.category || 'Chưa xác định'}
                                </span>
                                <span className="blog-preview-date">
                                    📅{' '}
                                    {moment(previewModal.post.createdAt).format('DD/MM/YYYY HH:mm')}
                                </span>
                                <span className="blog-preview-author">
                                    👤 {previewModal.post.author?.name || 'Chưa xác định'}
                                </span>
                            </div>
                        </div>

                        {previewModal.post.themeUrl && (
                            <div className="blog-preview-image">
                                <Image
                                    src={previewModal.post.themeUrl}
                                    alt={previewModal.post.title}
                                    style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}
                                    preview={false}
                                />
                            </div>
                        )}

                        <div className="blog-preview-body">
                            <div
                                className="blog-content"
                                dangerouslySetInnerHTML={{ __html: previewModal.post.content }}
                            />
                        </div>

                        <div className="blog-preview-footer">
                            <div className="blog-preview-status">
                                <span
                                    className={`status-badge ${
                                        previewModal.post.isActive ? 'active' : 'inactive'
                                    }`}
                                >
                                    {previewModal.post.isActive ? '✅ Đã duyệt' : '⏳ Chưa duyệt'}
                                </span>
                                {previewModal.post.isDelete && (
                                    <span className="status-badge deleted">🗑️ Đã xóa</span>
                                )}
                            </div>
                            {previewModal.post.updatedAt && (
                                <div className="blog-preview-updated">
                                    <small>
                                        Cập nhật lần cuối:{' '}
                                        {moment(previewModal.post.updatedAt).format(
                                            'DD/MM/YYYY HH:mm'
                                        )}
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Existing Modals */}
            <Modal
                title={
                    modalState.activeChecked
                        ? 'Xác nhận duyệt bài đăng'
                        : 'Xác nhận hủy duyệt bài đăng'
                }
                open={modalState.activeOpen}
                onOk={handleModalActiveOk}
                onCancel={handleModalActiveCancel}
                okText="Xác nhận"
                cancelText="Hủy"
                confirmLoading={modalLoading}
            >
                <p>
                    {modalState.activeChecked
                        ? 'Bạn có chắc chắn muốn duyệt bài đăng này?'
                        : 'Bạn có chắc chắn muốn hủy duyệt bài đăng này?'}
                </p>
            </Modal>

            <Modal
                title={
                    modalState.isDelete ? 'Xác nhận xóa bài đăng' : 'Xác nhận khôi phục bài đăng'
                }
                open={modalState.deleteOpen}
                onOk={handleModalDeleteOk}
                onCancel={handleModalDeleteCancel}
                okText="Xác nhận"
                cancelText="Hủy"
                okType={modalState.isDelete ? 'danger' : 'primary'}
                confirmLoading={modalLoading}
            >
                <p>
                    {modalState.isDelete
                        ? 'Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.'
                        : 'Bạn có chắc chắn muốn khôi phục bài đăng này?'}
                </p>
            </Modal>
        </div>
    );
};

export default BlogApproval;
