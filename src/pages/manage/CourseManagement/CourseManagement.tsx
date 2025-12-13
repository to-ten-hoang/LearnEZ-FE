// UPDATED: Thay đổi hành vi click row -> navigate đến trang chi tiết, bỏ Drawer
import { Button, Table, Input, Select, DatePicker, Form, Switch, Modal } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import {
    getAllCoursesService,
    updateCourseStatusService,
    getCategoriesService
} from '../../../services/courseManagementService';
import moment from 'moment';
import './CourseManagement.css';
import type { AllCoursesRequest, Course, Category } from '../../../types/course';
import type { SortOrder } from 'antd/es/table/interface';
import useAuthStore from 'store/authStore';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { RangePicker } = DatePicker;

const CourseManagement = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalElements, setTotalElements] = useState(0);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalState, setModalState] = useState({
        activeOpen: false,
        activeChecked: false,
        deleteOpen: false,
        isDelete: false,
        courseId: null as number | null
    });

    const role = useAuthStore().user?.role;

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getCategoriesService();
            if (response.code === 200) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách danh mục:', error);
        }
    }, []);

    const fetchCourses = useCallback(
        async (values: any = {}, page: number = 0, size: number = 5, sort: string | null = null) => {
            setLoading(true);
            try {
                const { title, dateRange, categories } = values;
                const dataBody: AllCoursesRequest = {
                    fromDate: dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD') : null,
                    toDate: dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD') : null,
                    title: title || null,
                    categories: categories ? [categories] : [],
                    page,
                    size,
                    sort
                };
                const response = await getAllCoursesService(dataBody, role ?? undefined);
                setCourses(response.data.content);
                setTotalElements(response.data.totalElements);
                setCurrentPage(response.data.pageable.pageNumber);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách khóa học:', error);
            } finally {
                setLoading(false);
            }
        },
        [role]
    );

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleToggleActive = useCallback((courseId: number, checked: boolean) => {
        setModalState((prev) => ({
            ...prev,
            activeOpen: true,
            activeChecked: checked,
            courseId
        }));
    }, []);

    const handleModalActiveOk = async () => {
        if (modalState.courseId === null) return;
        setModalLoading(true);
        try {
            const response = await updateCourseStatusService({
                id: modalState.courseId,
                isActive: modalState.activeChecked
            });
            if (response.code === 200) {
                // Message đã được hiển thị bởi service
                setCourses((prev) =>
                    prev.map((c) =>
                        c.id === modalState.courseId ? { ...c, isActive: modalState.activeChecked } : c
                    )
                );
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái khóa học:', error);
        } finally {
            setModalLoading(false);
            setModalState((prev) => ({ ...prev, activeOpen: false, courseId: null }));
        }
    };

    const handleModalActiveCancel = () => {
        setModalState((prev) => ({ ...prev, activeOpen: false, courseId: null }));
    };

    const handleDeleteOrRestore = useCallback((courseId: number, isDelete: boolean) => {
        setModalState((prev) => ({
            ...prev,
            deleteOpen: true,
            isDelete,
            courseId
        }));
    }, []);

    const handleModalDeleteOk = async () => {
        if (modalState.courseId === null) return;
        setModalLoading(true);
        try {
            const response = await updateCourseStatusService({
                id: modalState.courseId,
                isDelete: modalState.isDelete,
                ...(modalState.isDelete && { isActive: false })
            });
            if (response.code === 200) {
                // Message đã được hiển thị bởi service
                setCourses((prev) =>
                    prev.map((c) =>
                        c.id === modalState.courseId
                            ? {
                                ...c,
                                isDelete: modalState.isDelete,
                                isActive: modalState.isDelete ? false : c.isActive
                            }
                            : c
                    )
                );
            }
        } catch (error) {
            console.error(
                modalState.isDelete ? 'Lỗi khi xóa khóa học:' : 'Lỗi khi khôi phục khóa học:',
                error
            );
        } finally {
            setModalLoading(false);
            setModalState((prev) => ({ ...prev, deleteOpen: false, courseId: null }));
        }
    };

    const handleModalDeleteCancel = () => {
        setModalState((prev) => ({ ...prev, deleteOpen: false, courseId: null }));
    };

    const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
        const { field, order } = sorter;
        const newSortField = field || null;
        const newSortOrder = order as SortOrder;
        setSortField(newSortField);
        setSortOrder(newSortOrder);
        setCurrentPage(pagination.current - 1);
        setPageSize(pagination.pageSize);
        fetchCourses(
            form.getFieldsValue(),
            pagination.current - 1,
            pagination.pageSize,
            newSortField && newSortOrder
                ? `${newSortField},${newSortOrder === 'ascend' ? 'asc' : 'desc'}`
                : null
        );
    };

    const handleRowClick = (record: Course) => {
        navigate(`/dashboard/course-management/${record.id}`);
    };

    const handleCreateCourse = () => {
        navigate('/dashboard/course-management/new'); // Trang tạo mới (có thể tái sử dụng course detail page ở mode create)
    };

    const columns = [
        {
            title: 'Ảnh bìa',
            dataIndex: 'thumbnailUrl',
            key: 'thumbnailUrl',
            width: 100,
            render: (thumbnailUrl: string, record: Course) => (
                <div className="course-thumbnail-cell" onClick={(e) => e.stopPropagation()}>
                    {thumbnailUrl ? (
                        <img
                            src={thumbnailUrl}
                            alt={record.title}
                            className="course-thumbnail-img"
                        />
                    ) : (
                        <div className="course-thumbnail-placeholder">
                            Chưa có ảnh
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true,
            sorter: true,
            sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
            sortOrder: sortField === 'title' ? sortOrder : undefined,
            render: (title: string, record: Course) => (
                <div className="course-title-cell">
                    <div className="course-title">{title}</div>
                    {record.description && (
                        <div className="course-description">{record.description}</div>
                    )}
                </div>
            )
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            sorter: true,
            sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
            sortOrder: sortField === 'price' ? sortOrder : undefined,
            render: (price: number) => (
                <span className="course-price">
                    {price?.toLocaleString('vi-VN')} ₫
                </span>
            )
        },
        {
            title: 'Chủ đề',
            dataIndex: 'categoryName',
            key: 'categoryName',
            width: 130,
            render: (categoryName: string) => (
                <span className="course-category">{categoryName || 'Chưa xác định'}</span>
            )
        },
        {
            title: 'Tác giả',
            dataIndex: 'authorName',
            key: 'authorName',
            width: 140,
            render: (authorName: string) => authorName || 'Chưa xác định'
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (createdAt: string) => moment(createdAt).format('DD/MM/YYYY'),
            sorter: true,
            sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
            sortOrder: sortField === 'createdAt' ? sortOrder : undefined
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive: boolean, record: Course) => (
                <Switch
                    checked={isActive}
                    onChange={(checked) => handleToggleActive(record.id, checked)}
                    disabled={record.isDelete}
                    aria-label={`Bật/tắt trạng thái cho khóa học ${record.title}`}
                    onClick={(_checked, e) => e.stopPropagation()}
                />
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            render: (_: any, record: Course) => (
                <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                    {record.isDelete ? (
                        <Button
                            size="small"
                            className="action-button-fixed"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrRestore(record.id, false);
                            }}
                        >
                            Khôi phục
                        </Button>
                    ) : (
                        <Button
                            danger
                            size="small"
                            className="action-button-fixed"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrRestore(record.id, true);
                            }}
                        >
                            Xóa
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="course-management">
            <h2>Quản Lý Khóa Học</h2>
            <Form
                form={form}
                layout="inline"
                onFinish={(values) =>
                    fetchCourses(
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
                    <Input placeholder="Nhập tiêu đề khóa học" />
                </Form.Item>
                <Form.Item name="categories" label="Chủ đề">
                    <Select placeholder="Chọn chủ đề" allowClear>
                        {categories.map((category) => (
                            <Option key={category.id} value={category.name}>
                                {category.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="dateRange" label="Ngày tạo khóa học">
                    <RangePicker format="DD/MM/YYYY" />
                </Form.Item>
                <div className="form-actions">
                    <Form.Item>
                        <Button type="primary" htmlType="submit" onClick={() => setCurrentPage(0)}>
                            Tìm kiếm
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            onClick={() => {
                                form.resetFields();
                                setSortField(null);
                                setSortOrder(undefined);
                                fetchCourses({}, 0, pageSize, null);
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" onClick={handleCreateCourse}>
                            Tạo khóa học
                        </Button>
                    </Form.Item>
                </div>
            </Form>
            <Table
                columns={columns}
                dataSource={courses}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: currentPage + 1,
                    pageSize: pageSize,
                    total: totalElements,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khóa học`
                }}
                onChange={handleTableChange}
                rowClassName={(record) => (record.isDelete ? 'deleted-row' : '')}
                onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    style: { cursor: 'pointer' }
                })}
            />
            <Modal
                title={
                    modalState.activeChecked ? 'Xác nhận duyệt khóa học' : 'Xác nhận hủy duyệt khóa học'
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
                        ? 'Bạn có chắc chắn muốn duyệt khóa học này?'
                        : 'Bạn có chắc chắn muốn hủy duyệt khóa học này?'}
                </p>
            </Modal>
            <Modal
                title={modalState.isDelete ? 'Xác nhận xóa khóa học' : 'Xác nhận khôi phục khóa học'}
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
                        ? 'Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.'
                        : 'Bạn có chắc chắn muốn khôi phục khóa học này?'}
                </p>
            </Modal>
        </div>
    );
};

export default CourseManagement;