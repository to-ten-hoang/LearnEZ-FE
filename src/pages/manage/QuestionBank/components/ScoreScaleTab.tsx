// pages/manage/QuestionBank/components/ScoreScaleTab.tsx
import { useState, useCallback, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    InputNumber,
    Form,
    Modal,
    Switch,
    Space,
    Drawer,
    Descriptions,
    Tag,
} from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import {
    filterScoreScalesService,
    createScoreScaleService,
    updateScoreScaleService,
} from '../../../../services/questionBankService';
import type { ScoreScale, ScoreScaleCreateRequest, ScoreScaleUpdateRequest } from '../../../../types/questionBank';
import type { SortOrder } from 'antd/es/table/interface';

const ScoreScaleTab = () => {
    const [form] = Form.useForm();
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // State for table data
    const [loading, setLoading] = useState(false);
    const [scoreScales, setScoreScales] = useState<ScoreScale[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);

    // State for modals/drawers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [selectedScoreScale, setSelectedScoreScale] = useState<ScoreScale | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Fetch score scales
    const fetchScoreScales = useCallback(
        async (
            searchString: string | null = null,
            page: number = 0,
            size: number = 10,
            sort: string[] = []
        ) => {
            setLoading(true);
            try {
                const response = await filterScoreScalesService(
                    { searchString },
                    { page, size, sort }
                );
                setScoreScales(response.data.content);
                setTotalElements(response.data.totalElements);
                setCurrentPage(response.data.pageable.pageNumber);
            } catch (error) {
                console.error('Error fetching score scales:', error);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchScoreScales();
    }, [fetchScoreScales]);

    // Handle search
    const handleSearch = (values: { searchString?: string }) => {
        const sortArray = sortField && sortOrder
            ? [`${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`]
            : [];
        fetchScoreScales(values.searchString || null, 0, pageSize, sortArray);
        setCurrentPage(0);
    };

    // Handle reset filters
    const handleResetFilters = () => {
        form.resetFields();
        setSortField(null);
        setSortOrder(undefined);
        fetchScoreScales(null, 0, pageSize, []);
    };

    // Handle table change (pagination, sorting)
    const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
        const { field, order } = sorter;
        const newSortField = field || null;
        const newSortOrder = order as SortOrder;
        setSortField(newSortField);
        setSortOrder(newSortOrder);
        setCurrentPage(pagination.current - 1);
        setPageSize(pagination.pageSize);

        const sortArray = newSortField && newSortOrder
            ? [`${newSortField},${newSortOrder === 'ascend' ? 'asc' : 'desc'}`]
            : [];
        const searchValues = form.getFieldsValue();
        fetchScoreScales(searchValues.searchString || null, pagination.current - 1, pagination.pageSize, sortArray);
    };

    // Handle create score scale
    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            setModalLoading(true);

            const requestData: ScoreScaleCreateRequest = {
                title: values.title,
                fromScore: values.fromScore,
                toScore: values.toScore,
                isActive: values.isActive ?? true,
                isDelete: false,
            };

            await createScoreScaleService(requestData);
            setIsCreateModalOpen(false);
            createForm.resetFields();
            // Reset to page 0 to ensure new score scale is visible
            const searchValues = form.getFieldsValue();
            fetchScoreScales(searchValues.searchString ?? null, 0, pageSize);
        } catch (error) {
            console.error('Error creating score scale:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handle edit score scale
    const handleEdit = async () => {
        if (!selectedScoreScale) return;
        try {
            const values = await editForm.validateFields();
            setModalLoading(true);

            const requestData: ScoreScaleUpdateRequest = {
                scoreScaleId: selectedScoreScale.scoreScaleId,
                title: values.title,
                fromScore: values.fromScore,
                toScore: values.toScore,
                isActive: values.isActive,
                isDelete: values.isDelete,
            };

            await updateScoreScaleService(requestData);
            setIsEditModalOpen(false);
            editForm.resetFields();
            setSelectedScoreScale(null);
            // Preserve current search and sort state
            const searchValues = form.getFieldsValue();
            const sortArray = sortField && sortOrder
                ? [`${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`]
                : [];
            fetchScoreScales(searchValues.searchString ?? null, currentPage, pageSize, sortArray);
        } catch (error) {
            console.error('Error updating score scale:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Open edit modal
    const openEditModal = (scoreScale: ScoreScale) => {
        setSelectedScoreScale(scoreScale);
        editForm.setFieldsValue({
            title: scoreScale.title,
            fromScore: scoreScale.fromScore,
            toScore: scoreScale.toScore,
            isActive: scoreScale.isActive,
            isDelete: scoreScale.isDelete,
        });
        setIsEditModalOpen(true);
    };

    // Open detail drawer
    const openDetailDrawer = (scoreScale: ScoreScale) => {
        setSelectedScoreScale(scoreScale);
        setIsDetailDrawerOpen(true);
    };

    // Table columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'scoreScaleId',
            key: 'scoreScaleId',
            width: 80,
            sorter: true,
            sortOrder: sortField === 'scoreScaleId' ? sortOrder : undefined,
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true,
            sorter: true,
            sortOrder: sortField === 'title' ? sortOrder : undefined,
        },
        {
            title: 'Điểm từ',
            dataIndex: 'fromScore',
            key: 'fromScore',
            width: 100,
            sorter: true,
            sortOrder: sortField === 'fromScore' ? sortOrder : undefined,
        },
        {
            title: 'Điểm đến',
            dataIndex: 'toScore',
            key: 'toScore',
            width: 100,
            sorter: true,
            sortOrder: sortField === 'toScore' ? sortOrder : undefined,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (isActive: boolean, record: ScoreScale) => (
                <Tag color={record.isDelete ? 'red' : isActive ? 'green' : 'orange'}>
                    {record.isDelete ? 'Đã xóa' : isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_: unknown, record: ScoreScale) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => openDetailDrawer(record)}
                        title="Xem chi tiết"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(record)}
                        title="Chỉnh sửa"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="score-scale-tab">
            {/* Search Form */}
            <Form
                form={form}
                layout="inline"
                onFinish={handleSearch}
                className="search-form"
                style={{ marginBottom: 16 }}
            >
                <Form.Item name="searchString" label="Tìm kiếm">
                    <Input
                        placeholder="Nhập từ khóa..."
                        prefix={<SearchOutlined />}
                        allowClear
                        style={{ width: 250 }}
                    />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Tìm kiếm
                        </Button>
                        <Button onClick={handleResetFilters}>
                            Xóa bộ lọc
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Thêm mức độ
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={scoreScales}
                loading={loading}
                rowKey="scoreScaleId"
                pagination={{
                    current: currentPage + 1,
                    pageSize: pageSize,
                    total: totalElements,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mức độ`,
                }}
                onChange={handleTableChange}
                rowClassName={(record) => (record.isDelete ? 'deleted-row' : '')}
                scroll={{ x: 800 }}
            />

            {/* Create Modal */}
            <Modal
                title="Thêm mức độ mới"
                open={isCreateModalOpen}
                onOk={handleCreate}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    createForm.resetFields();
                }}
                okText="Tạo mới"
                cancelText="Hủy"
                confirmLoading={modalLoading}
                width={600}
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="Nhập tiêu đề mức độ (VD: Dễ, Trung bình, Khó)" />
                    </Form.Item>
                    <Form.Item
                        name="fromScore"
                        label="Điểm từ"
                        dependencies={['toScore']}
                        rules={[
                            { required: true, message: 'Vui lòng nhập điểm bắt đầu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const toScore = getFieldValue('toScore');
                                    if (value !== undefined && toScore !== undefined && value >= toScore) {
                                        return Promise.reject(new Error('Điểm từ phải nhỏ hơn điểm đến!'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <InputNumber
                            min={0}
                            placeholder="Nhập điểm bắt đầu"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="toScore"
                        label="Điểm đến"
                        dependencies={['fromScore']}
                        rules={[
                            { required: true, message: 'Vui lòng nhập điểm kết thúc!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const fromScore = getFieldValue('fromScore');
                                    if (value !== undefined && fromScore !== undefined && value <= fromScore) {
                                        return Promise.reject(new Error('Điểm đến phải lớn hơn điểm từ!'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <InputNumber
                            min={0}
                            placeholder="Nhập điểm kết thúc"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Chỉnh sửa mức độ"
                open={isEditModalOpen}
                onOk={handleEdit}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    editForm.resetFields();
                    setSelectedScoreScale(null);
                }}
                okText="Cập nhật"
                cancelText="Hủy"
                confirmLoading={modalLoading}
                width={600}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="Nhập tiêu đề mức độ" />
                    </Form.Item>
                    <Form.Item
                        name="fromScore"
                        label="Điểm từ"
                        dependencies={['toScore']}
                        rules={[
                            { required: true, message: 'Vui lòng nhập điểm bắt đầu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const toScore = getFieldValue('toScore');
                                    if (value !== undefined && toScore !== undefined && value >= toScore) {
                                        return Promise.reject(new Error('Điểm từ phải nhỏ hơn điểm đến!'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <InputNumber
                            min={0}
                            placeholder="Nhập điểm bắt đầu"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="toScore"
                        label="Điểm đến"
                        dependencies={['fromScore']}
                        rules={[
                            { required: true, message: 'Vui lòng nhập điểm kết thúc!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const fromScore = getFieldValue('fromScore');
                                    if (value !== undefined && fromScore !== undefined && value <= fromScore) {
                                        return Promise.reject(new Error('Điểm đến phải lớn hơn điểm từ!'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <InputNumber
                            min={0}
                            placeholder="Nhập điểm kết thúc"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    </Form.Item>
                    <Form.Item name="isDelete" label="Đánh dấu xóa" valuePropName="checked">
                        <Switch checkedChildren="Đã xóa" unCheckedChildren="Chưa xóa" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết mức độ"
                placement="right"
                onClose={() => {
                    setIsDetailDrawerOpen(false);
                    setSelectedScoreScale(null);
                }}
                open={isDetailDrawerOpen}
                width={500}
            >
                {selectedScoreScale && (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="ID">
                            {selectedScoreScale.scoreScaleId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tiêu đề">
                            {selectedScoreScale.title}
                        </Descriptions.Item>
                        <Descriptions.Item label="Điểm từ">
                            {selectedScoreScale.fromScore}
                        </Descriptions.Item>
                        <Descriptions.Item label="Điểm đến">
                            {selectedScoreScale.toScore}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khoảng điểm">
                            {selectedScoreScale.fromScore} - {selectedScoreScale.toScore}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={selectedScoreScale.isDelete ? 'red' : selectedScoreScale.isActive ? 'green' : 'orange'}>
                                {selectedScoreScale.isDelete ? 'Đã xóa' : selectedScoreScale.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    );
};

export default ScoreScaleTab;
