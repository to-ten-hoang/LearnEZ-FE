/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/manage/QuestionBank/components/QuestionsTab.tsx
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
    Radio,
    Card,
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
    filterQuestionsService,
    updateQuestionService,
    getQuestionDetailService,
    filterQuestionBanksService,
    addQuestionToBankService,
    filterRangeTopicsService,
    filterScoreScalesService,
} from '../../../../services/questionBankService';
import type {
    Question,
    QuestionRequest,
    QuestionBank,
    AnswerRequest,
    RangeTopic,
    ScoreScale,
} from '../../../../types/questionBank';
import type { SortOrder } from 'antd/es/table/interface';

// Constants for answer options
const MIN_ANSWER_OPTIONS = 2;
const DEFAULT_ANSWER_OPTIONS = 4;

// Helper function to create default answer options
const createDefaultAnswers = (): AnswerRequest[] => {
    return Array.from({ length: DEFAULT_ANSWER_OPTIONS }, () => ({
        content: '',
        correct: false,
    }));
};

const QuestionsTab = () => {
    const [form] = Form.useForm();
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    // State for table data
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);

    // State for question banks dropdown
    const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
    const [selectedBankId, setSelectedBankId] = useState<number | undefined>(undefined);

    // State for modals/drawers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    // State for answer options in create/edit form
    const [answers, setAnswers] = useState<AnswerRequest[]>(createDefaultAnswers());
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);

    // State for RangeTopic and ScoreScale dropdowns
    const [rangeTopics, setRangeTopics] = useState<RangeTopic[]>([]);
    const [scoreScales, setScoreScales] = useState<ScoreScale[]>([]);

    // Fetch question banks for dropdown
    const fetchQuestionBanks = useCallback(async () => {
        try {
            const response = await filterQuestionBanksService({}, { page: 0, size: 100 });
            setQuestionBanks(response.data.content);
        } catch (error) {
            console.error('Error fetching question banks:', error);
        }
    }, []);

    // Fetch questions
    const fetchQuestions = useCallback(
        async (
            searchString: string | null = null,
            idQuestionBank: number | undefined = undefined,
            page: number = 0,
            size: number = 10,
            sort: string[] = []
        ) => {
            setLoading(true);
            try {
                const response = await filterQuestionsService(
                    {
                        searchString: searchString || undefined,
                        idQuestionBank: idQuestionBank,
                    },
                    { page, size, sort }
                );
                setQuestions(response.data.content);
                setTotalElements(response.data.totalElements);
                setCurrentPage(response.data.pageable.pageNumber);
            } catch (error) {
                console.error('Error fetching questions:', error);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Fetch RangeTopic for category dropdown
    const fetchRangeTopics = useCallback(async () => {
        try {
            const response = await filterRangeTopicsService({ searchString: null }, { page: 0, size: 100 });
            setRangeTopics(response.data.content);
        } catch (error) {
            console.error('Error fetching range topics:', error);
        }
    }, []);

    // Fetch ScoreScale for difficulty dropdown
    const fetchScoreScales = useCallback(async () => {
        try {
            const response = await filterScoreScalesService({ searchString: null }, { page: 0, size: 100 });
            setScoreScales(response.data.content);
        } catch (error) {
            console.error('Error fetching score scales:', error);
        }
    }, []);

    useEffect(() => {
        fetchQuestionBanks();
        fetchQuestions();
        fetchRangeTopics();
        fetchScoreScales();
    }, [fetchQuestionBanks, fetchQuestions, fetchRangeTopics, fetchScoreScales]);

    // Handle search
    const handleSearch = (values: { searchString?: string; idQuestionBank?: number }) => {
        const sortArray =
            sortField && sortOrder
                ? [`${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`]
                : [];
        setSelectedBankId(values.idQuestionBank);
        fetchQuestions(
            values.searchString || null,
            values.idQuestionBank,
            0,
            pageSize,
            sortArray
        );
        setCurrentPage(0);
    };

    // Handle reset filters
    const handleResetFilters = () => {
        form.resetFields();
        setSortField(null);
        setSortOrder(undefined);
        setSelectedBankId(undefined);
        fetchQuestions(null, undefined, 0, pageSize, []);
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
        fetchQuestions(
            searchValues.searchString || null,
            searchValues.idQuestionBank,
            pagination.current - 1,
            pagination.pageSize,
            sortArray
        );
    };

    // Handle create question
    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            setModalLoading(true);

            // Update correct answer
            const updatedAnswers = answers.map((answer, index) => ({
                id: undefined,
                content: answer.content,
                correct: index === correctAnswerIndex,
            }));

            const requestData: QuestionRequest = {
                id: undefined,
                questionContent: values.questionContent,
                category: values.category || '',
                difficulty: values.difficulty || '',
                answers: updatedAnswers,
                explanation: {
                    id: undefined,
                    explanationVietnamese: values.explanationVietnamese || '',
                    explanationEnglish: values.explanationEnglish || '',
                    isActive: true,
                    isDelete: false,
                },
                active: true,
                delete: false,
            };

            await addQuestionToBankService(values.bankId, requestData);
            setIsCreateModalOpen(false);
            createForm.resetFields();
            resetAnswers();
            // Refresh the list
            const searchValues = form.getFieldsValue();
            fetchQuestions(searchValues.searchString ?? null, selectedBankId, 0, pageSize);
        } catch (error) {
            console.error('Error creating question:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handle edit question
    const handleEdit = async () => {
        if (!selectedQuestion) return;
        try {
            const values = await editForm.validateFields();
            setModalLoading(true);

            // Update correct answer
            const updatedAnswers = answers.map((answer, index) => ({
                ...answer,
                id: selectedQuestion.answers?.[index]?.id,
                correct: index === correctAnswerIndex,
            }));

            const requestData: QuestionRequest = {
                id: selectedQuestion.id,
                questionContent: values.questionContent,
                category: values.category || '',
                difficulty: values.difficulty || '',
                answers: updatedAnswers,
                explanation: {
                    id: selectedQuestion.explanation?.id,
                    explanationVietnamese: values.explanationVietnamese || '',
                    explanationEnglish: values.explanationEnglish || '',
                },
                active: values.isActive,
                delete: values.isDelete,
            };

            await updateQuestionService(requestData);
            setIsEditModalOpen(false);
            editForm.resetFields();
            setSelectedQuestion(null);
            resetAnswers();
            // Preserve current search state
            const searchValues = form.getFieldsValue();
            fetchQuestions(
                searchValues.searchString ?? null,
                selectedBankId,
                currentPage,
                pageSize
            );
        } catch (error) {
            console.error('Error updating question:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Reset answers
    const resetAnswers = () => {
        setAnswers(createDefaultAnswers());
        setCorrectAnswerIndex(0);
    };

    // Open edit modal
    const openEditModal = async (question: Question) => {
        try {
            const response = await getQuestionDetailService(question.id!);
            const detailedQuestion = response.data;
            setSelectedQuestion(detailedQuestion);

            // Set form values
            editForm.setFieldsValue({
                questionContent: detailedQuestion.questionContent,
                category: detailedQuestion.category,
                difficulty: detailedQuestion.difficulty,
                explanationVietnamese: detailedQuestion.explanation?.explanationVietnamese,
                explanationEnglish: detailedQuestion.explanation?.explanationEnglish,
                isActive: detailedQuestion.isActive,
                isDelete: detailedQuestion.isDelete,
            });

            // Set answers
            if (detailedQuestion.answers && detailedQuestion.answers.length > 0) {
                const questionAnswers = detailedQuestion.answers.map((a) => ({
                    content: a.content,
                    correct: a.correct,
                }));
                // Ensure at least DEFAULT_ANSWER_OPTIONS answer options
                while (questionAnswers.length < DEFAULT_ANSWER_OPTIONS) {
                    questionAnswers.push({ content: '', correct: false });
                }
                setAnswers(questionAnswers);
                const correctIndex = detailedQuestion.answers.findIndex((a) => a.correct);
                setCorrectAnswerIndex(correctIndex >= 0 ? correctIndex : 0);
            } else {
                resetAnswers();
            }

            setIsEditModalOpen(true);
        } catch (error) {
            console.error('Error fetching question details:', error);
        }
    };

    // Open detail drawer
    const openDetailDrawer = async (question: Question) => {
        try {
            setLoading(true);
            const response = await getQuestionDetailService(question.id!);
            setSelectedQuestion(response.data);
            setIsDetailDrawerOpen(true);
        } catch (error) {
            console.error('Error fetching question details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update answer content
    const updateAnswerContent = (index: number, content: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = { ...newAnswers[index], content };
        setAnswers(newAnswers);
    };

    // Add answer option
    const addAnswerOption = () => {
        setAnswers([...answers, { content: '', correct: false }]);
    };

    // Remove answer option
    const removeAnswerOption = (index: number) => {
        if (answers.length <= MIN_ANSWER_OPTIONS) return; // Minimum answers required
        const newAnswers = answers.filter((_, i) => i !== index);
        setAnswers(newAnswers);
        if (correctAnswerIndex >= newAnswers.length) {
            setCorrectAnswerIndex(0);
        } else if (correctAnswerIndex > index) {
            setCorrectAnswerIndex(correctAnswerIndex - 1);
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
            title: 'Nội dung câu hỏi',
            dataIndex: 'questionContent',
            key: 'questionContent',
            width: 350,
            ellipsis: true,
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            width: 120,
        },
        {
            title: 'Độ khó',
            dataIndex: 'difficulty',
            key: 'difficulty',
            width: 100,
            render: (difficulty: string) => {
                const colorMap: Record<string, string> = {
                    easy: 'green',
                    medium: 'orange',
                    hard: 'red',
                };
                return (
                    <Tag color={colorMap[difficulty?.toLowerCase()] || 'default'}>
                        {difficulty || 'N/A'}
                    </Tag>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (isActive: boolean, record: Question) => (
                <Tag color={record.isDelete ? 'red' : isActive ? 'green' : 'orange'}>
                    {record.isDelete ? 'Đã xóa' : isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_: unknown, record: Question) => (
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

    // Render answer form
    const renderAnswerForm = () => (
        <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>
                Đáp án (chọn đáp án đúng):
            </label>
            <Radio.Group
                value={correctAnswerIndex}
                onChange={(e) => setCorrectAnswerIndex(e.target.value)}
                style={{ width: '100%' }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    {answers.map((answer, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 8,
                            }}
                        >
                            <Radio value={index}>
                                <Input
                                    placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                                    value={answer.content}
                                    onChange={(e) => updateAnswerContent(index, e.target.value)}
                                    style={{ width: 400 }}
                                />
                            </Radio>
                            {answers.length > MIN_ANSWER_OPTIONS && (
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeAnswerOption(index)}
                                />
                            )}
                        </div>
                    ))}
                </Space>
            </Radio.Group>
            <Button type="dashed" onClick={addAnswerOption} icon={<PlusOutlined />} block>
                Thêm đáp án
            </Button>
        </div>
    );

    return (
        <div className="questions-tab">
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
                        placeholder="Nhập từ khóa..."
                        prefix={<SearchOutlined />}
                        allowClear
                        style={{ width: 200 }}
                    />
                </Form.Item>
                <Form.Item name="idQuestionBank" label="Ngân hàng đề">
                    <Select
                        placeholder="Chọn ngân hàng đề"
                        allowClear
                        style={{ width: 200 }}
                        options={questionBanks.map((bank) => ({
                            value: bank.id,
                            label: bank.questionBankTitle,
                        }))}
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
                            onClick={() => {
                                resetAnswers();
                                setIsCreateModalOpen(true);
                            }}
                        >
                            Thêm câu hỏi
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={questions}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: currentPage + 1,
                    pageSize: pageSize,
                    total: totalElements,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} câu hỏi`,
                }}
                onChange={handleTableChange}
                rowClassName={(record) => (record.isDelete ? 'deleted-row' : '')}
                scroll={{ x: 800 }}
            />

            {/* Create Modal */}
            <Modal
                title="Thêm câu hỏi mới"
                open={isCreateModalOpen}
                onOk={handleCreate}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    createForm.resetFields();
                    resetAnswers();
                }}
                okText="Tạo mới"
                cancelText="Hủy"
                confirmLoading={modalLoading}
                width={700}
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item
                        name="bankId"
                        label="Ngân hàng đề"
                        rules={[{ required: true, message: 'Vui lòng chọn ngân hàng đề!' }]}
                    >
                        <Select
                            placeholder="Chọn ngân hàng đề"
                            options={questionBanks.map((bank) => ({
                                value: bank.id,
                                label: bank.questionBankTitle,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="questionContent"
                        label="Nội dung câu hỏi"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập nội dung câu hỏi" />
                    </Form.Item>
                    <Form.Item
                        name="category"
                        label="Chủ đề (RangeTopic)"
                        rules={[{ required: true, message: 'Vui lòng chọn chủ đề!' }]}
                    >
                        <Select
                            placeholder="Chọn chủ đề"
                            showSearch
                            optionFilterProp="label"
                            options={rangeTopics.map((topic) => ({
                                value: topic.content,
                                label: `${topic.content} - ${topic.vietnamese}`,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="difficulty"
                        label="Mức độ (ScoreScale)"
                        rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
                    >
                        <Select
                            placeholder="Chọn mức độ"
                            showSearch
                            optionFilterProp="label"
                            options={scoreScales.map((scale) => ({
                                value: scale.title,
                                label: `${scale.title} (${scale.fromScore}-${scale.toScore})`,
                            }))}
                        />
                    </Form.Item>

                    <Divider />
                    {renderAnswerForm()}
                    <Divider />

                    <Form.Item name="explanationVietnamese" label="Giải thích (Tiếng Việt)">
                        <Input.TextArea rows={2} placeholder="Nhập giải thích tiếng Việt" />
                    </Form.Item>
                    <Form.Item name="explanationEnglish" label="Giải thích (Tiếng Anh)">
                        <Input.TextArea rows={2} placeholder="Nhập giải thích tiếng Anh" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Chỉnh sửa câu hỏi"
                open={isEditModalOpen}
                onOk={handleEdit}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    editForm.resetFields();
                    setSelectedQuestion(null);
                    resetAnswers();
                }}
                okText="Cập nhật"
                cancelText="Hủy"
                confirmLoading={modalLoading}
                width={700}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="questionContent"
                        label="Nội dung câu hỏi"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập nội dung câu hỏi" />
                    </Form.Item>
                    <Form.Item
                        name="category"
                        label="Chủ đề (RangeTopic)"
                        rules={[{ required: true, message: 'Vui lòng chọn chủ đề!' }]}
                    >
                        <Select
                            placeholder="Chọn chủ đề"
                            showSearch
                            optionFilterProp="label"
                            options={rangeTopics.map((topic) => ({
                                value: topic.content,
                                label: `${topic.content} - ${topic.vietnamese}`,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="difficulty"
                        label="Mức độ (ScoreScale)"
                        rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
                    >
                        <Select
                            placeholder="Chọn mức độ"
                            showSearch
                            optionFilterProp="label"
                            options={scoreScales.map((scale) => ({
                                value: scale.title,
                                label: `${scale.title} (${scale.fromScore}-${scale.toScore})`,
                            }))}
                        />
                    </Form.Item>

                    <Divider />
                    {renderAnswerForm()}
                    <Divider />

                    <Form.Item name="explanationVietnamese" label="Giải thích (Tiếng Việt)">
                        <Input.TextArea rows={2} placeholder="Nhập giải thích tiếng Việt" />
                    </Form.Item>
                    <Form.Item name="explanationEnglish" label="Giải thích (Tiếng Anh)">
                        <Input.TextArea rows={2} placeholder="Nhập giải thích tiếng Anh" />
                    </Form.Item>

                    <Divider />

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
                title="Chi tiết câu hỏi"
                placement="right"
                onClose={() => {
                    setIsDetailDrawerOpen(false);
                    setSelectedQuestion(null);
                }}
                open={isDetailDrawerOpen}
                width={600}
            >
                {selectedQuestion && (
                    <>
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="ID">{selectedQuestion.id}</Descriptions.Item>
                            <Descriptions.Item label="Nội dung câu hỏi">
                                {selectedQuestion.questionContent}
                            </Descriptions.Item>
                            <Descriptions.Item label="Danh mục">
                                {selectedQuestion.category || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Độ khó">
                                <Tag
                                    color={
                                        selectedQuestion.difficulty?.toLowerCase() === 'easy'
                                            ? 'green'
                                            : selectedQuestion.difficulty?.toLowerCase() === 'medium'
                                                ? 'orange'
                                                : selectedQuestion.difficulty?.toLowerCase() === 'hard'
                                                    ? 'red'
                                                    : 'default'
                                    }
                                >
                                    {selectedQuestion.difficulty || 'N/A'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={
                                        selectedQuestion.isDelete
                                            ? 'red'
                                            : selectedQuestion.isActive
                                                ? 'green'
                                                : 'orange'
                                    }
                                >
                                    {selectedQuestion.isDelete
                                        ? 'Đã xóa'
                                        : selectedQuestion.isActive
                                            ? 'Hoạt động'
                                            : 'Tạm dừng'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <h4>Đáp án:</h4>
                        {selectedQuestion.answers?.map((answer, index) => (
                            <Card
                                key={index}
                                size="small"
                                style={{
                                    marginBottom: 8,
                                    backgroundColor: answer.correct ? '#f6ffed' : undefined,
                                    borderColor: answer.correct ? '#52c41a' : undefined,
                                }}
                            >
                                <Space>
                                    <strong>{String.fromCharCode(65 + index)}.</strong>
                                    {answer.content}
                                    {answer.correct && <Tag color="green">Đáp án đúng</Tag>}
                                </Space>
                            </Card>
                        ))}

                        {selectedQuestion.explanation && (
                            <>
                                <Divider />
                                <h4>Giải thích:</h4>
                                {selectedQuestion.explanation.explanationVietnamese && (
                                    <p>
                                        <strong>Tiếng Việt:</strong>{' '}
                                        {selectedQuestion.explanation.explanationVietnamese}
                                    </p>
                                )}
                                {selectedQuestion.explanation.explanationEnglish && (
                                    <p>
                                        <strong>Tiếng Anh:</strong>{' '}
                                        {selectedQuestion.explanation.explanationEnglish}
                                    </p>
                                )}
                            </>
                        )}
                    </>
                )}
            </Drawer>
        </div>
    );
};

export default QuestionsTab;
