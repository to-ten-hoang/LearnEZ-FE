import { useState, useEffect } from 'react';
import { Modal, Input, DatePicker, Table, message, Empty, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Quiz } from '../../../types/quiz';
import { searchQuizzes } from '../../../api/quizApi';
import { pullQuizToClass } from '../../../api/classQuizApi';

const { Search } = Input;

interface Props {
    open: boolean;
    classId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const PullQuizModal = ({ open, classId, onClose, onSuccess }: Props) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [searchString, setSearchString] = useState('');
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [startAt, setStartAt] = useState<dayjs.Dayjs | null>(null);
    const [endAt, setEndAt] = useState<dayjs.Dayjs | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await searchQuizzes(
                { searchString: searchString || undefined },
                { page: pagination.current - 1, size: pagination.pageSize }
            );

            if (response.data) {
                setQuizzes(response.data.content);
                setPagination((prev) => ({
                    ...prev,
                    total: response.data.totalElements,
                }));
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchQuizzes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, pagination.current]);

    const handleSubmit = async () => {
        if (!selectedQuiz) {
            message.warning('Vui lòng chọn bài kiểm tra');
            return;
        }

        setSubmitting(true);
        try {
            await pullQuizToClass({
                classId,
                quizId: selectedQuiz.id!,
                startAt: startAt?.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                endAt: endAt?.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            });
            message.success('Đã giao bài kiểm tra cho lớp');
            handleClose();
            onSuccess();
        } catch (error) {
            message.error('Có lỗi xảy ra');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedQuiz(null);
        setStartAt(null);
        setEndAt(null);
        setSearchString('');
        onClose();
    };

    const columns: ColumnsType<Quiz> = [
        {
            title: 'Tên bài kiểm tra',
            dataIndex: 'title',
            key: 'title',
            render: (title: string, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{title}</div>
                    {record.description && (
                        <div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
                    )}
                </div>
            ),
        },
        {
            title: 'Số câu',
            dataIndex: 'totalQuestions',
            key: 'totalQuestions',
            width: 80,
            align: 'center',
            render: (v: number) => (
                <span>
                    <QuestionCircleOutlined style={{ marginRight: 4 }} />
                    {v || 0}
                </span>
            ),
        },
    ];

    return (
        <Modal
            title="Giao bài kiểm tra cho lớp"
            open={open}
            onCancel={handleClose}
            onOk={handleSubmit}
            confirmLoading={submitting}
            okText="Giao bài"
            cancelText="Hủy"
            width={700}
            okButtonProps={{ disabled: !selectedQuiz }}
        >
            <div style={{ marginBottom: 16 }}>
                <Search
                    placeholder="Tìm kiếm bài kiểm tra..."
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                    onSearch={() => {
                        setPagination((prev) => ({ ...prev, current: 1 }));
                        fetchQuizzes();
                    }}
                    allowClear
                />
            </div>

            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={quizzes}
                    rowKey="id"
                    size="small"
                    pagination={{
                        ...pagination,
                        size: 'small',
                        onChange: (page) => setPagination((prev) => ({ ...prev, current: page })),
                    }}
                    rowSelection={{
                        type: 'radio',
                        selectedRowKeys: selectedQuiz ? [selectedQuiz.id!] : [],
                        onChange: (_, selectedRows) => {
                            setSelectedQuiz(selectedRows[0] || null);
                        },
                    }}
                    locale={{ emptyText: <Empty description="Không tìm thấy bài kiểm tra nào" /> }}
                    scroll={{ x: 'max-content' }}
                />
            </Spin>

            {selectedQuiz && (
                <div style={{ marginTop: 16, padding: 16, background: '#f6ffed', borderRadius: 8 }}>
                    <div style={{ fontWeight: 500, marginBottom: 12 }}>
                        Đã chọn: {selectedQuiz.title}
                    </div>

                    <div className="time-range-inputs">
                        <div>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                                Thời gian bắt đầu (không bắt buộc):
                            </label>
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                value={startAt}
                                onChange={setStartAt}
                                placeholder="Chọn thời gian bắt đầu"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                                Thời gian kết thúc (không bắt buộc):
                            </label>
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                value={endAt}
                                onChange={setEndAt}
                                placeholder="Chọn thời gian kết thúc"
                                style={{ width: '100%' }}
                                disabledDate={(current) =>
                                    startAt ? current && current.isBefore(startAt) : false
                                }
                            />
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default PullQuizModal;
