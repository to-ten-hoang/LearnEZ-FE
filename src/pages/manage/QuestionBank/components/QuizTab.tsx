/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/manage/QuestionBank/components/QuizTab.tsx
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
    Select,
    DatePicker,
    Card,
    List,
    Checkbox,
    Divider,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import {
    searchQuizzesService,
    createQuizService,
    updateQuizService,
    getQuizByIdService,
    addQuestionsToQuizService,
    removeQuestionsFromQuizService,
} from '../../../../services/quizService';
import { filterQuestionsService } from '../../../../services/questionBankService';
import type { Quiz, QuizUpdateRequest } from '../../../../types/quiz';
import type { Question } from '../../../../types/questionBank';
import type { SortOrder } from 'antd/es/table/interface';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const QuizTab = () => {
    const [form] = Form.useForm();
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // State for table data
    const [loading, setLoading] = useState(false);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);

    // State for modals/drawers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [isAddQuestionsModalOpen, setIsAddQuestionsModalOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    // State for edit questions
    const [editQuestions, setEditQuestions] = useState<Question[]>([]);

    // State for add questions modal
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);

    // Fetch quizzes
    const fetchQuizzes = useCallback(
        async (
            searchString: string | null = null,
            fromDate: string | null = null,
            toDate: string | null = null,
            page: number = 0,
            size: number = 10,
            sort: string[] = []
        ) => {
            setLoading(true);
            try {
                const response = await searchQuizzesService(
                    {
                        searchString: searchString || undefined,
                        fromDate: fromDate || undefined,
                        toDate: toDate || undefined,
                    },
                    { page, size, sort }
                );
                setQuizzes(response.data.content);
                setTotalElements(response.data.totalElements);
                setCurrentPage(response.data.pageable.pageNumber);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

    // Handle search
    const handleSearch = (values: { searchString?: string; dateRange?: any }) => {
        const sortArray =
            sortField && sortOrder
                ? [`${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`]
                : [];
        const fromDate = values.dateRange?.[0]?.toISOString() || null;
        const toDate = values.dateRange?.[1]?.toISOString() || null;
        fetchQuizzes(values.searchString || null, fromDate, toDate, 0, pageSize, sortArray);
        setCurrentPage(0);
    };

    // Handle reset filters
    const handleResetFilters = () => {
        form.resetFields();
        setSortField(null);
        setSortOrder(undefined);
        fetchQuizzes(null, null, null, 0, pageSize, []);
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

        const sortArray =
            newSortField && newSortOrder
                ? [`${newSortField},${newSortOrder === 'ascend' ? 'asc' : 'desc'}`]
                : [];
        const searchValues = form.getFieldsValue();
        const fromDate = searchValues.dateRange?.[0]?.toISOString() || null;
        const toDate = searchValues.dateRange?.[1]?.toISOString() || null;
        fetchQuizzes(
            searchValues.searchString || null,
            fromDate,
            toDate,
            pagination.current - 1,
            pagination.pageSize,
            sortArray
        );
    };

    // Handle create quiz
    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            setModalLoading(true);

            await createQuizService({
                title: values.title,
                description: values.description || '',
            });

            setIsCreateModalOpen(false);
            createForm.resetFields();
            fetchQuizzes();
        } catch (error) {
            console.error('Error creating quiz:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handle edit quiz
    const handleEdit = async () => {
        if (!selectedQuiz) return;
        try {
            const values = await editForm.validateFields();
            setModalLoading(true);

            const requestData: QuizUpdateRequest = {
                id: selectedQuiz.id!,
                title: values.title,
                description: values.description || '',
                status: values.status,
                isActive: values.isActive,
                isDelete: values.isDelete,
            };

            await updateQuizService(requestData);
            setIsEditModalOpen(false);
            editForm.resetFields();
            setSelectedQuiz(null);
            setEditQuestions([]);
            fetchQuizzes();
        } catch (error) {
            console.error('Error updating quiz:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Open edit modal with full details
    const openEditModal = async (quiz: Quiz) => {
        try {
            setModalLoading(true);
            const response = await getQuizByIdService(quiz.id!);
            const fullQuiz = response.data;
            setSelectedQuiz(fullQuiz);
            setEditQuestions(fullQuiz.questions || []);

            // Convert status string to number
            let statusValue = 1;
            if (fullQuiz.status === 'Owner') statusValue = 2;
            if (fullQuiz.status === 'Public') statusValue = 3;

            editForm.setFieldsValue({
                title: fullQuiz.title,
                description: fullQuiz.description,
                status: statusValue,
                isActive: fullQuiz.isActive ?? true,
                isDelete: fullQuiz.isDelete ?? false,
            });
            setIsEditModalOpen(true);
        } catch (error) {
            console.error('Error fetching quiz details:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Remove question from quiz
    const removeQuestionFromQuiz = (questionId: number) => {
        if (!selectedQuiz) return;
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc muốn xóa câu hỏi này khỏi bài kiểm tra? (Không thể hoàn tác)',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await removeQuestionsFromQuizService({
                        id: selectedQuiz.id!,
                        idQuestions: [questionId],
                    });
                    setEditQuestions((prev) => prev.filter((q) => q.id !== questionId));
                } catch (error) {
                    console.error('Error removing question:', error);
                }
            },
        });
    };

    // Open detail drawer
    const openDetailDrawer = async (quiz: Quiz) => {
        try {
            setLoading(true);
            const response = await getQuizByIdService(quiz.id!);
            setSelectedQuiz(response.data);
            setIsDetailDrawerOpen(true);
        } catch (error) {
            console.error('Error fetching quiz details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Open add questions modal
    const openAddQuestionsModal = async () => {
        try {
            setQuestionsLoading(true);
            const response = await filterQuestionsService({}, { page: 0, size: 100 });
            // Filter out questions already in quiz
            const existingIds = editQuestions.map((q) => q.id);
            const filtered = response.data.content.filter((q) => !existingIds.includes(q.id));
            setAvailableQuestions(filtered);
            setSelectedQuestionIds([]);
            setIsAddQuestionsModalOpen(true);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setQuestionsLoading(false);
        }
    };

    // Handle add questions
    const handleAddQuestions = async () => {
        if (!selectedQuiz || selectedQuestionIds.length === 0) return;
        try {
            setModalLoading(true);
            const response = await addQuestionsToQuizService({
                id: selectedQuiz.id!,
                idQuestions: selectedQuestionIds,
            });
            setEditQuestions(response.data.questions || []);
            setIsAddQuestionsModalOpen(false);
            setSelectedQuestionIds([]);
        } catch (error) {
            console.error('Error adding questions:', error);
        } finally {
            setModalLoading(false);
        }
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
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 300,
            ellipsis: true,
        },
        {
            title: 'Số câu hỏi',
            dataIndex: 'totalQuestions',
            key: 'totalQuestions',
            width: 120,
            render: (val: number) => val || 0,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                const colorMap: Record<string, string> = {
                    Private: 'default',
                    Owner: 'blue',
                    Public: 'green',
                };
                return <Tag color={colorMap[status] || 'default'}>{status || 'N/A'}</Tag>;
            },
        },
        {
            title: 'Người tạo',
            dataIndex: 'createBy',
            key: 'createBy',
            width: 150,
            render: (createBy: any) =>
                createBy
                    ? `${createBy.firstName || ''} ${createBy.lastName || ''}`.trim() || 'N/A'
                    : 'N/A',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createAt',
            key: 'createAt',
            width: 150,
            sorter: true,
            sortOrder: sortField === 'createAt' ? sortOrder : undefined,
            render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A'),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            render: (_: unknown, record: Quiz) => (
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
        <div className="quiz-tab">
            {/* Search Form */}
            <Form
                form={form}
                layout="inline"
                onFinish={handleSearch}
                className="search-form"
                style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}
            >
                <Form.Item name="searchString" label="Tìm kiếm">
                    <Input
                        placeholder="Nhập tiêu đề..."
                        prefix={<SearchOutlined />}
                        allowClear
                        style={{ width: 200 }}
                    />
                </Form.Item>
                <Form.Item name="dateRange" label="Khoảng thời gian">
                    <RangePicker format="DD/MM/YYYY" />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Tìm kiếm
                        </Button>
                        <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Thêm bài kiểm tra
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={quizzes}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: currentPage + 1,
                    pageSize: pageSize,
                    total: totalElements,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài kiểm tra`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 900 }}
            />

            {/* Create Modal */}
            <Modal
                title="Thêm bài kiểm tra mới"
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
                        <Input placeholder="Nhập tiêu đề bài kiểm tra" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Nhập mô tả bài kiểm tra" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Chỉnh sửa bài kiểm tra"
                open={isEditModalOpen}
                onOk={handleEdit}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    editForm.resetFields();
                    setSelectedQuiz(null);
                    setEditQuestions([]);
                }}
                okText="Cập nhật"
                cancelText="Hủy"
                confirmLoading={modalLoading}
                width={900}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="Nhập tiêu đề bài kiểm tra" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} placeholder="Nhập mô tả bài kiểm tra" />
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái chia sẻ">
                        <Select placeholder="Chọn trạng thái">
                            <Select.Option value={1}>Private - Chỉ mình tôi</Select.Option>
                            <Select.Option value={2}>Owner - Chia sẻ tổ chức</Select.Option>
                            <Select.Option value={3}>Public - Công khai</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    </Form.Item>
                    <Form.Item name="isDelete" label="Đánh dấu xóa" valuePropName="checked">
                        <Switch checkedChildren="Đã xóa" unCheckedChildren="Chưa xóa" />
                    </Form.Item>

                    <Divider />

                    {/* Question List */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h4 style={{ margin: 0 }}>Danh sách câu hỏi ({editQuestions.length}):</h4>
                            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={openAddQuestionsModal}>
                                Thêm câu hỏi
                            </Button>
                        </div>
                        {editQuestions.length > 0 ? (
                            <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                <List
                                    dataSource={editQuestions}
                                    renderItem={(question, index) => (
                                        <Card
                                            size="small"
                                            style={{ marginBottom: 8 }}
                                            extra={
                                                <Button
                                                    type="text"
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeQuestionFromQuiz(question.id!)}
                                                >
                                                    Xóa
                                                </Button>
                                            }
                                        >
                                            <strong>Câu {index + 1}:</strong> {question.questionContent}
                                            <div style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
                                                Chủ đề: {question.category || 'N/A'} | Độ khó: {question.difficulty || 'N/A'}
                                            </div>
                                        </Card>
                                    )}
                                />
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                                Chưa có câu hỏi. Nhấn "Thêm câu hỏi" để thêm.
                            </div>
                        )}
                    </div>
                </Form>
            </Modal>

            {/* Add Questions Modal */}
            <Modal
                title="Thêm câu hỏi vào bài kiểm tra"
                open={isAddQuestionsModalOpen}
                onOk={handleAddQuestions}
                onCancel={() => {
                    setIsAddQuestionsModalOpen(false);
                    setSelectedQuestionIds([]);
                }}
                okText={`Thêm ${selectedQuestionIds.length} câu hỏi`}
                cancelText="Hủy"
                confirmLoading={modalLoading}
                okButtonProps={{ disabled: selectedQuestionIds.length === 0 }}
                width={800}
            >
                <div style={{ marginBottom: 16 }}>
                    <strong>Chọn câu hỏi từ danh sách:</strong>
                </div>
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                    {questionsLoading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>
                    ) : availableQuestions.length > 0 ? (
                        <Checkbox.Group
                            value={selectedQuestionIds}
                            onChange={(values) => setSelectedQuestionIds(values as number[])}
                            style={{ width: '100%' }}
                        >
                            <List
                                dataSource={availableQuestions}
                                renderItem={(question) => (
                                    <Card size="small" style={{ marginBottom: 8 }}>
                                        <Checkbox value={question.id}>
                                            <div>
                                                <strong>{question.questionContent}</strong>
                                                <div style={{ fontSize: 12, color: '#888' }}>
                                                    Chủ đề: {question.category || 'N/A'} | Độ khó: {question.difficulty || 'N/A'}
                                                </div>
                                            </div>
                                        </Checkbox>
                                    </Card>
                                )}
                            />
                        </Checkbox.Group>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
                            Không có câu hỏi nào khả dụng.
                        </div>
                    )}
                </div>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết bài kiểm tra"
                placement="right"
                onClose={() => {
                    setIsDetailDrawerOpen(false);
                    setSelectedQuiz(null);
                }}
                open={isDetailDrawerOpen}
                width={700}
            >
                {selectedQuiz && (
                    <>
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="ID">{selectedQuiz.id}</Descriptions.Item>
                            <Descriptions.Item label="Tiêu đề">{selectedQuiz.title}</Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {selectedQuiz.description || 'Không có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số câu hỏi">
                                {selectedQuiz.totalQuestions || 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={
                                        selectedQuiz.status === 'Public'
                                            ? 'green'
                                            : selectedQuiz.status === 'Owner'
                                                ? 'blue'
                                                : 'default'
                                    }
                                >
                                    {selectedQuiz.status || 'N/A'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Người tạo">
                                {selectedQuiz.createBy
                                    ? `${selectedQuiz.createBy.firstName || ''} ${selectedQuiz.createBy.lastName || ''}`.trim()
                                    : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {selectedQuiz.createAt
                                    ? dayjs(selectedQuiz.createAt).format('DD/MM/YYYY HH:mm')
                                    : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày cập nhật">
                                {selectedQuiz.updateAt
                                    ? dayjs(selectedQuiz.updateAt).format('DD/MM/YYYY HH:mm')
                                    : 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedQuiz.questions && selectedQuiz.questions.length > 0 && (
                            <div style={{ marginTop: 20 }}>
                                <h4>Danh sách câu hỏi:</h4>
                                <List
                                    dataSource={selectedQuiz.questions}
                                    renderItem={(question, index) => (
                                        <Card size="small" style={{ marginBottom: 8 }}>
                                            <strong>Câu {index + 1}:</strong> {question.questionContent}
                                            <div style={{ marginTop: 8 }}>
                                                {question.answers?.map((answer, ansIndex) => (
                                                    <div
                                                        key={ansIndex}
                                                        style={{
                                                            padding: '4px 8px',
                                                            marginBottom: 4,
                                                            backgroundColor: answer.correct ? '#f6ffed' : undefined,
                                                            borderRadius: 4,
                                                            border: answer.correct ? '1px solid #52c41a' : '1px solid #d9d9d9',
                                                        }}
                                                    >
                                                        {String.fromCharCode(65 + ansIndex)}. {answer.content}
                                                        {answer.correct && (
                                                            <Tag color="green" style={{ marginLeft: 8 }}>
                                                                Đáp án đúng
                                                            </Tag>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {question.explanation && (
                                                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                                                    <strong>Giải thích:</strong>{' '}
                                                    {question.explanation.explanationVietnamese ||
                                                        question.explanation.explanationEnglish ||
                                                        'Không có'}
                                                </div>
                                            )}
                                        </Card>
                                    )}
                                />
                            </div>
                        )}
                    </>
                )}
            </Drawer>
        </div>
    );
};

export default QuizTab;
