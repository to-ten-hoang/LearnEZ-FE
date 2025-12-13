// pages/manage/QuestionBank/components/RangeTopicTab.tsx
import { useState, useCallback, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
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
    filterRangeTopicsService,
    createRangeTopicService,
    updateRangeTopicService,
} from '../../../../services/questionBankService';
import type { RangeTopic, RangeTopicCreateRequest, RangeTopicUpdateRequest } from '../../../../types/questionBank';
import type { SortOrder } from 'antd/es/table/interface';

const RangeTopicTab = () => {
    const [form] = Form.useForm();
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // State for table data
    const [loading, setLoading] = useState(false);
    const [topics, setTopics] = useState<RangeTopic[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);

    // State for modals/drawers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<RangeTopic | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Fetch topics
    const fetchTopics = useCallback(
        async (
            searchString: string | null = null,
            page: number = 0,
            size: number = 10,
            sort: string[] = []
        ) => {
            setLoading(true);
            try {
                const response = await filterRangeTopicsService(
                    { searchString },
                    { page, size, sort }
                );
                setTopics(response.data.content);
                setTotalElements(response.data.totalElements);
                setCurrentPage(response.data.pageable.pageNumber);
            } catch (error) {
                console.error('Error fetching topics:', error);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    // Handle search
    const handleSearch = (values: { searchString?: string }) => {
        const sortArray = sortField && sortOrder
            ? [`${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`]
            : [];
        fetchTopics(values.searchString || null, 0, pageSize, sortArray);
        setCurrentPage(0);
    };

    // Handle reset filters
    const handleResetFilters = () => {
        form.resetFields();
        setSortField(null);
        setSortOrder(undefined);
        fetchTopics(null, 0, pageSize, []);
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
        fetchTopics(searchValues.searchString || null, pagination.current - 1, pagination.pageSize, sortArray);
    };

    // Handle create topic
    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            setModalLoading(true);

            const requestData: RangeTopicCreateRequest = {
                content: values.content,
                description: values.description ?? '',
                vietnamese: values.vietnamese ?? '',
                isActive: values.isActive ?? true,
                isDelete: false,
            };

            await createRangeTopicService(requestData);
            setIsCreateModalOpen(false);
            createForm.resetFields();
            // Reset to page 0 to ensure new topic is visible
            const searchValues = form.getFieldsValue();
            fetchTopics(searchValues.searchString ?? null, 0, pageSize);
        } catch (error) {
            console.error('Error creating topic:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handle edit topic
    const handleEdit = async () => {
        if (!selectedTopic) return;
        try {
            const values = await editForm.validateFields();
            setModalLoading(true);

            const requestData: RangeTopicUpdateRequest = {
                rangeTopicId: selectedTopic.rangeTopicId,
                content: values.content,
                description: values.description ?? '',
                vietnamese: values.vietnamese ?? '',
                isActive: values.isActive,
                isDelete: values.isDelete,
            };

            await updateRangeTopicService(requestData);
            setIsEditModalOpen(false);
            editForm.resetFields();
            setSelectedTopic(null);
            // Preserve current search state
            const searchValues = form.getFieldsValue();
            fetchTopics(searchValues.searchString ?? null, currentPage, pageSize);
        } catch (error) {
            console.error('Error updating topic:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Open edit modal
    const openEditModal = (topic: RangeTopic) => {
        setSelectedTopic(topic);
        editForm.setFieldsValue({
            content: topic.content,
            description: topic.description,
            vietnamese: topic.vietnamese,
            isActive: topic.isActive,
            isDelete: topic.isDelete,
        });
        setIsEditModalOpen(true);
    };

    // Open detail drawer
    const openDetailDrawer = (topic: RangeTopic) => {
        setSelectedTopic(topic);
        setIsDetailDrawerOpen(true);
    };

    // Table columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: true,
            sortOrder: sortField === 'id' ? sortOrder : undefined,
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
            width: 200,
            ellipsis: true,
            sorter: true,
            sortOrder: sortField === 'content' ? sortOrder : undefined,
        },
        {
            title: 'Tiếng Việt',
            dataIndex: 'vietnamese',
            key: 'vietnamese',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 250,
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive: boolean, record: RangeTopic) => (
                <Tag color={record.isDelete ? 'red' : isActive ? 'green' : 'orange'}>
                    {record.isDelete ? 'Đã xóa' : isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_: unknown, record: RangeTopic) => (
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
        <div className="range-topic-tab">
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
                            Thêm chủ đề
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={topics}
                loading={loading}
                rowKey="rangeTopicId"
                pagination={{
                    current: currentPage + 1,
                    pageSize: pageSize,
                    total: totalElements,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chủ đề`,
                }}
                onChange={handleTableChange}
                rowClassName={(record) => (record.isDelete ? 'deleted-row' : '')}
                scroll={{ x: 800 }}
            />

            {/* Create Modal */}
            <Modal
                title="Thêm chủ đề mới"
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
                        name="content"
                        label="Nội dung (Content)"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                    >
                        <Input placeholder="Nhập nội dung chủ đề (tiếng Anh)" />
                    </Form.Item>
                    <Form.Item
                        name="vietnamese"
                        label="Tiếng Việt"
                        rules={[{ required: true, message: 'Vui lòng nhập tên tiếng Việt!' }]}
                    >
                        <Input placeholder="Nhập tên tiếng Việt" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Nhập mô tả cho chủ đề" />
                    </Form.Item>
                    <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Chỉnh sửa chủ đề"
                open={isEditModalOpen}
                onOk={handleEdit}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    editForm.resetFields();
                    setSelectedTopic(null);
                }}
                okText="Cập nhật"
                cancelText="Hủy"
                confirmLoading={modalLoading}
                width={600}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="content"
                        label="Nội dung (Content)"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                    >
                        <Input placeholder="Nhập nội dung chủ đề (tiếng Anh)" />
                    </Form.Item>
                    <Form.Item
                        name="vietnamese"
                        label="Tiếng Việt"
                        rules={[{ required: true, message: 'Vui lòng nhập tên tiếng Việt!' }]}
                    >
                        <Input placeholder="Nhập tên tiếng Việt" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Nhập mô tả cho chủ đề" />
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
                title="Chi tiết chủ đề"
                placement="right"
                onClose={() => {
                    setIsDetailDrawerOpen(false);
                    setSelectedTopic(null);
                }}
                open={isDetailDrawerOpen}
                width={500}
            >
                {selectedTopic && (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="ID">
                            {selectedTopic.rangeTopicId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nội dung (Content)">
                            {selectedTopic.content}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tiếng Việt">
                            {selectedTopic.vietnamese}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả">
                            {selectedTopic.description || 'Không có mô tả'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={selectedTopic.isDelete ? 'red' : selectedTopic.isActive ? 'green' : 'orange'}>
                                {selectedTopic.isDelete ? 'Đã xóa' : selectedTopic.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    );
};

export default RangeTopicTab;
