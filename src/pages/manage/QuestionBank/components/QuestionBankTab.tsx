/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/manage/QuestionBank/components/QuestionBankTab.tsx
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
    Upload,
    Spin,
    List,
    Card,
    Checkbox,
    Radio,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    EditOutlined,
    UploadOutlined,
    FileTextOutlined,
    RobotOutlined,
    SwapOutlined,
} from '@ant-design/icons';
import {
    filterQuestionBanksService,
    createQuestionBankService,
    updateQuestionBankService,
    getQuestionBankByIdService,
    uploadFileToCloudService,
    analysisQuestionService,
    createQuestionBankFromAIService,
} from '../../../../services/questionBankService';
import { convertBankToQuizService } from '../../../../services/quizService';
import type {
    QuestionBank,
    QuestionBankCreateRequest,
    QuestionBankUpdateRequest,
    Question,
} from '../../../../types/questionBank';
import type { SortOrder } from 'antd/es/table/interface';
import type { UploadFile } from 'antd/es/upload/interface';

const QuestionBankTab = () => {
    const [form] = Form.useForm();
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [aiForm] = Form.useForm();

    // State for table data
    const [loading, setLoading] = useState(false);
    const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);

    // State for modals/drawers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [selectedQuestionBank, setSelectedQuestionBank] = useState<QuestionBank | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    // State for AI analysis
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analyzedQuestions, setAnalyzedQuestions] = useState<Question[]>([]);
    const [uploadedUrl, setUploadedUrl] = useState<string>('');

    // State for questions in edit modal
    const [editQuestions, setEditQuestions] = useState<Question[]>([]);

    // Fetch question banks
    const fetchQuestionBanks = useCallback(
        async (
            searchString: string | null = null,
            page: number = 0,
            size: number = 10,
            sort: string[] = []
        ) => {
            setLoading(true);
            try {
                const response = await filterQuestionBanksService(
                    { searchString: searchString || undefined },
                    { page, size, sort }
                );
                setQuestionBanks(response.data.content);
                setTotalElements(response.data.totalElements);
                setCurrentPage(response.data.pageable.pageNumber);
            } catch (error) {
                console.error('Error fetching question banks:', error);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchQuestionBanks();
    }, [fetchQuestionBanks]);

    // Handle search
    const handleSearch = (values: { searchString?: string }) => {
        const sortArray =
            sortField && sortOrder
                ? [`${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`]
                : [];
        fetchQuestionBanks(values.searchString || null, 0, pageSize, sortArray);
        setCurrentPage(0);
    };

    // Handle reset filters
    const handleResetFilters = () => {
        form.resetFields();
        setSortField(null);
        setSortOrder(undefined);
        fetchQuestionBanks(null, 0, pageSize, []);
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
        fetchQuestionBanks(
            searchValues.searchString || null,
            pagination.current - 1,
            pagination.pageSize,
            sortArray
        );
    };

    // Handle create question bank
    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            setModalLoading(true);

            const requestData: QuestionBankCreateRequest = {
                questionBankTitle: values.questionBankTitle,
                url: values.url || '',
            };

            await createQuestionBankService(requestData);
            setIsCreateModalOpen(false);
            createForm.resetFields();
            // Reset to page 0 to ensure new question bank is visible
            const searchValues = form.getFieldsValue();
            fetchQuestionBanks(searchValues.searchString ?? null, 0, pageSize);
        } catch (error) {
            console.error('Error creating question bank:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handle edit question bank
    const handleEdit = async () => {
        if (!selectedQuestionBank) return;
        try {
            const values = await editForm.validateFields();
            setModalLoading(true);

            const requestData: QuestionBankUpdateRequest = {
                id: selectedQuestionBank.id!,
                questionBankTitle: values.questionBankTitle,
                url: values.url || '',
                isActive: values.isActive,
                isDeleted: values.isDeleted,
                questions: editQuestions,
            };

            await updateQuestionBankService(requestData);
            setIsEditModalOpen(false);
            editForm.resetFields();
            setSelectedQuestionBank(null);
            setEditQuestions([]);
            // Preserve current search state
            const searchValues = form.getFieldsValue();
            fetchQuestionBanks(searchValues.searchString ?? null, currentPage, pageSize);
        } catch (error) {
            console.error('Error updating question bank:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Open edit modal with full details
    const openEditModal = async (questionBank: QuestionBank) => {
        try {
            setModalLoading(true);
            const response = await getQuestionBankByIdService(questionBank.id!);
            const fullQuestionBank = response.data;
            setSelectedQuestionBank(fullQuestionBank);
            setEditQuestions(fullQuestionBank.questions || []);
            editForm.setFieldsValue({
                questionBankTitle: fullQuestionBank.questionBankTitle,
                url: fullQuestionBank.url,
                isActive: fullQuestionBank.isActive,
                isDeleted: fullQuestionBank.isDeleted,
            });
            setIsEditModalOpen(true);
        } catch (error) {
            console.error('Error fetching question bank details:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Remove question from edit list
    const removeQuestionFromEdit = (questionId: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc muốn xóa câu hỏi này khỏi ngân hàng đề?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => {
                setEditQuestions(prev => prev.filter(q => q.id !== questionId));
            },
        });
    };

    // Open detail drawer
    const openDetailDrawer = async (questionBank: QuestionBank) => {
        try {
            setLoading(true);
            const response = await getQuestionBankByIdService(questionBank.id!);
            setSelectedQuestionBank(response.data);
            setIsDetailDrawerOpen(true);
        } catch (error) {
            console.error('Error fetching question bank details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle file upload for AI analysis
    const handleUploadFile = async () => {
        if (fileList.length === 0) return null;

        const uploadFile = fileList[0];
        const file = uploadFile.originFileObj || (uploadFile as unknown as File);

        if (!file || file === undefined) {
            console.error('File is undefined');
            return null;
        }

        setUploadLoading(true);
        try {
            const response = await uploadFileToCloudService(file as File);
            setUploadedUrl(response.data);
            return response.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        } finally {
            setUploadLoading(false);
        }
    };

    // Handle AI analysis
    const handleAnalyzeFile = async () => {
        let url = uploadedUrl;
        if (!url && fileList.length > 0) {
            url = (await handleUploadFile()) || '';
        }

        if (!url) {
            return;
        }

        setAnalysisLoading(true);
        try {
            const response = await analysisQuestionService(url);
            setAnalyzedQuestions(response.data?.questions || []);
        } catch (error) {
            console.error('Error analyzing file:', error);
        } finally {
            setAnalysisLoading(false);
        }
    };

    // Handle create question bank from AI
    const handleCreateFromAI = async () => {
        try {
            const values = await aiForm.validateFields();
            setModalLoading(true);

            await createQuestionBankFromAIService({
                questionBankTitle: values.questionBankTitle,
                url: uploadedUrl || '',
                questions: analyzedQuestions,
            });

            setIsAIModalOpen(false);
            aiForm.resetFields();
            setFileList([]);
            setUploadedUrl('');
            setAnalyzedQuestions([]);
            // Refresh the list
            const searchValues = form.getFieldsValue();
            fetchQuestionBanks(searchValues.searchString ?? null, 0, pageSize);
        } catch (error) {
            console.error('Error creating question bank from AI:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Reset AI modal state
    const resetAIModal = () => {
        setIsAIModalOpen(false);
        aiForm.resetFields();
        setFileList([]);
        setUploadedUrl('');
        setAnalyzedQuestions([]);
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
            dataIndex: 'questionBankTitle',
            key: 'questionBankTitle',
            width: 300,
            ellipsis: true,
            sorter: true,
            sortOrder: sortField === 'questionBankTitle' ? sortOrder : undefined,
        },
        {
            title: 'Số câu hỏi',
            dataIndex: 'questions',
            key: 'questionCount',
            width: 120,
            render: (questions: Question[]) => questions?.length || 0,
        },
        {
            title: 'Người tạo',
            dataIndex: 'createdBy',
            key: 'createdBy',
            width: 150,
            render: (createdBy: any) =>
                createdBy ? createdBy.fullName || 'N/A' : 'N/A',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (isActive: boolean, record: QuestionBank) => (
                <Tag color={record.isDeleted ? 'red' : isActive ? 'green' : 'orange'}>
                    {record.isDeleted ? 'Đã xóa' : isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_: unknown, record: QuestionBank) => (
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
                    <Button
                        type="text"
                        icon={<SwapOutlined />}
                        onClick={() => {
                            Modal.confirm({
                                title: 'Chuyển sang bài kiểm tra',
                                content: `Bạn có muốn chuyển ngân hàng đề "${record.questionBankTitle}" thành bài kiểm tra?`,
                                okText: 'Chuyển đổi',
                                cancelText: 'Hủy',
                                onOk: async () => {
                                    await convertBankToQuizService(record.id!);
                                },
                            });
                        }}
                        title="Chuyển thành bài kiểm tra"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="question-bank-tab">
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
                        <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Thêm mới
                        </Button>
                        <Button
                            type="default"
                            icon={<RobotOutlined />}
                            onClick={() => setIsAIModalOpen(true)}
                        >
                            Tạo từ AI
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={questionBanks}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: currentPage + 1,
                    pageSize: pageSize,
                    total: totalElements,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} ngân hàng đề`,
                }}
                onChange={handleTableChange}
                rowClassName={(record) => (record.isDeleted ? 'deleted-row' : '')}
                scroll={{ x: 800 }}
            />

            {/* Create Modal */}
            <Modal
                title="Thêm ngân hàng đề mới"
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
                        name="questionBankTitle"
                        label="Tiêu đề ngân hàng đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="Nhập tiêu đề ngân hàng đề" />
                    </Form.Item>
                    <Form.Item name="url" label="URL file đề (tùy chọn)">
                        <Input placeholder="Nhập URL file đề" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Chỉnh sửa ngân hàng đề"
                open={isEditModalOpen}
                onOk={handleEdit}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    editForm.resetFields();
                    setSelectedQuestionBank(null);
                    setEditQuestions([]);
                }}
                okText="Cập nhật"
                cancelText="Hủy"
                confirmLoading={modalLoading}
                width={800}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="questionBankTitle"
                        label="Tiêu đề ngân hàng đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="Nhập tiêu đề ngân hàng đề" />
                    </Form.Item>
                    <Form.Item name="url" label="URL file đề">
                        <Input placeholder="Nhập URL file đề" />
                    </Form.Item>
                    <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
                    </Form.Item>
                    <Form.Item name="isDeleted" label="Đánh dấu xóa" valuePropName="checked">
                        <Switch checkedChildren="Đã xóa" unCheckedChildren="Chưa xóa" />
                    </Form.Item>

                    {/* Question List */}
                    {editQuestions.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <h4>Danh sách câu hỏi ({editQuestions.length}):</h4>
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
                                                    onClick={() => removeQuestionFromEdit(question.id!)}
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
                        </div>
                    )}
                </Form>
            </Modal>

            {/* AI Create Modal */}
            <Modal
                title="Tạo ngân hàng đề từ AI"
                open={isAIModalOpen}
                onOk={handleCreateFromAI}
                onCancel={resetAIModal}
                okText="Tạo ngân hàng đề"
                cancelText="Hủy"
                confirmLoading={modalLoading}
                width={900}
                okButtonProps={{ disabled: analyzedQuestions.length === 0 }}
            >
                <Form form={aiForm} layout="vertical">
                    <Form.Item
                        name="questionBankTitle"
                        label="Tiêu đề ngân hàng đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="Nhập tiêu đề ngân hàng đề" />
                    </Form.Item>

                    <Form.Item label="Tải file đề (docx, pdf)">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Upload
                                fileList={fileList}
                                beforeUpload={(file) => {
                                    // Create proper UploadFile object with originFileObj
                                    const uploadFile: UploadFile = {
                                        uid: `-${Date.now()}`,
                                        name: file.name,
                                        status: 'done',
                                        originFileObj: file as any,
                                    };
                                    setFileList([uploadFile]);
                                    setUploadedUrl('');
                                    setAnalyzedQuestions([]);
                                    return false;
                                }}
                                onRemove={() => {
                                    setFileList([]);
                                    setUploadedUrl('');
                                    setAnalyzedQuestions([]);
                                }}
                                accept=".docx,.pdf"
                                maxCount={1}
                            >
                                <Button icon={<UploadOutlined />}>Chọn file</Button>
                            </Upload>
                            <Button
                                type="primary"
                                icon={<FileTextOutlined />}
                                onClick={handleAnalyzeFile}
                                loading={uploadLoading || analysisLoading}
                                disabled={fileList.length === 0}
                            >
                                {uploadLoading
                                    ? 'Đang tải lên...'
                                    : analysisLoading
                                        ? 'Đang phân tích...'
                                        : 'Phân tích file'}
                            </Button>
                        </Space>
                    </Form.Item>

                    {(uploadLoading || analysisLoading) && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin
                                tip={uploadLoading ? 'Đang tải file lên...' : 'Đang phân tích đề...'}
                            />
                        </div>
                    )}

                    {analyzedQuestions.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <h4>Kết quả phân tích ({analyzedQuestions.length} câu hỏi):</h4>
                            <div style={{ maxHeight: 400, overflow: 'auto' }}>
                                <List
                                    dataSource={analyzedQuestions}
                                    renderItem={(question, index) => (
                                        <Card
                                            size="small"
                                            style={{ marginBottom: 8 }}
                                            title={`Câu ${index + 1}: ${question.questionContent?.substring(0, 100)}${(question.questionContent?.length || 0) > 100 ? '...' : ''}`}
                                        >
                                            <div>
                                                <strong>Đáp án:</strong>
                                                <Radio.Group
                                                    value={question.answers?.findIndex(
                                                        (a) => a.correct
                                                    )}
                                                    disabled
                                                >
                                                    <Space direction="vertical">
                                                        {question.answers?.map((answer, ansIndex) => (
                                                            <Radio
                                                                key={ansIndex}
                                                                value={ansIndex}
                                                            >
                                                                {answer.content}
                                                                {answer.correct && (
                                                                    <Tag
                                                                        color="green"
                                                                        style={{ marginLeft: 8 }}
                                                                    >
                                                                        Đáp án đúng
                                                                    </Tag>
                                                                )}
                                                            </Radio>
                                                        ))}
                                                    </Space>
                                                </Radio.Group>
                                            </div>
                                            {question.explanation && (
                                                <div style={{ marginTop: 8 }}>
                                                    <strong>Giải thích:</strong>
                                                    <p>
                                                        {question.explanation.explanationVietnamese ||
                                                            question.explanation.explanationEnglish}
                                                    </p>
                                                </div>
                                            )}
                                        </Card>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết ngân hàng đề"
                placement="right"
                onClose={() => {
                    setIsDetailDrawerOpen(false);
                    setSelectedQuestionBank(null);
                }}
                open={isDetailDrawerOpen}
                width={700}
            >
                {selectedQuestionBank && (
                    <>
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="ID">{selectedQuestionBank.id}</Descriptions.Item>
                            <Descriptions.Item label="Tiêu đề">
                                {selectedQuestionBank.questionBankTitle}
                            </Descriptions.Item>
                            <Descriptions.Item label="URL file">
                                {selectedQuestionBank.url || 'Không có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số câu hỏi">
                                {selectedQuestionBank.questions?.length || 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người tạo">
                                {selectedQuestionBank.createdBy
                                    ? selectedQuestionBank.createdBy.fullName || 'N/A'
                                    : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={
                                        selectedQuestionBank.isDeleted
                                            ? 'red'
                                            : selectedQuestionBank.isActive
                                                ? 'green'
                                                : 'orange'
                                    }
                                >
                                    {selectedQuestionBank.isDeleted
                                        ? 'Đã xóa'
                                        : selectedQuestionBank.isActive
                                            ? 'Hoạt động'
                                            : 'Tạm dừng'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedQuestionBank.questions &&
                            selectedQuestionBank.questions.length > 0 && (
                                <div style={{ marginTop: 20 }}>
                                    <h4>Danh sách câu hỏi:</h4>
                                    <List
                                        dataSource={selectedQuestionBank.questions}
                                        renderItem={(question, index) => (
                                            <Card size="small" style={{ marginBottom: 8 }}>
                                                <strong>Câu {index + 1}:</strong>{' '}
                                                {question.questionContent}
                                                <div style={{ marginTop: 8 }}>
                                                    {question.answers?.map((answer, ansIndex) => (
                                                        <div key={ansIndex}>
                                                            <Checkbox
                                                                checked={answer.correct}
                                                                disabled
                                                            >
                                                                {answer.content}
                                                            </Checkbox>
                                                        </div>
                                                    ))}
                                                </div>
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

export default QuestionBankTab;
