import { useState, useEffect } from 'react';
import { Modal, Input, InputNumber, Table, Avatar, Button, Empty, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UserOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { SharedQuiz, SubmittedQuiz } from '../../../types/classQuiz';
import { searchSubmittedQuizzes, getSubmittedQuizDetail } from '../../../api/classQuizApi';

const { Search } = Input;

interface Props {
    open: boolean;
    quiz: SharedQuiz | null;
    classId: number;
    onClose: () => void;
}

const SubmittedQuizListModal = ({ open, quiz, classId, onClose }: Props) => {
    const [loading, setLoading] = useState(false);
    const [submissions, setSubmissions] = useState<SubmittedQuiz[]>([]);
    const [searchString, setSearchString] = useState('');
    const [fromScore, setFromScore] = useState<number | null>(null);
    const [toScore, setToScore] = useState<number | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Detail modal state
    const [detailModal, setDetailModal] = useState<{ open: boolean; submission: SubmittedQuiz | null }>({
        open: false,
        submission: null,
    });
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchSubmissions = async () => {
        if (!quiz) return;

        setLoading(true);
        try {
            const response = await searchSubmittedQuizzes(
                quiz.quiz.id!,
                classId,
                {
                    searchString: searchString || undefined,
                    fromScore: fromScore ?? undefined,
                    toScore: toScore ?? undefined,
                },
                { page: pagination.current - 1, size: pagination.pageSize }
            );

            if (response.data) {
                setSubmissions(response.data.content);
                setPagination((prev) => ({
                    ...prev,
                    total: response.data.totalElements,
                }));
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && quiz) {
            fetchSubmissions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, quiz, pagination.current]);

    const handleViewDetail = async (submission: SubmittedQuiz) => {
        setDetailLoading(true);
        try {
            const response = await getSubmittedQuizDetail(submission.idSubmitted!);
            setDetailModal({ open: true, submission: response.data });
        } catch (error) {
            message.error('Không thể tải chi tiết bài làm');
            console.error(error);
        } finally {
            setDetailLoading(false);
        }
    };

    const getScoreClass = (score: number) => {
        if (score >= 8) return 'high';
        if (score >= 5) return 'medium';
        return 'low';
    };

    const handleClose = () => {
        setSearchString('');
        setFromScore(null);
        setToScore(null);
        setPagination({ current: 1, pageSize: 10, total: 0 });
        onClose();
    };

    const columns: ColumnsType<SubmittedQuiz> = [
        {
            title: 'Học sinh',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar size="small" src={user?.avatarUrl} icon={<UserOutlined />} />
                    <span>
                        {user?.lastName} {user?.firstName}
                    </span>
                </div>
            ),
        },
        {
            title: 'Điểm',
            dataIndex: 'score',
            key: 'score',
            width: 100,
            align: 'center',
            render: (score: number) => (
                <span className={`submitted-score ${getScoreClass(score)}`}>
                    {score?.toFixed(2) || '0.00'}
                </span>
            ),
            sorter: (a, b) => (a.score || 0) - (b.score || 0),
        },
        {
            title: 'Thời gian làm',
            key: 'duration',
            width: 150,
            render: (_, record) => {
                if (!record.startAt || !record.endAt) return '—';
                const start = dayjs(record.startAt);
                const end = dayjs(record.endAt);
                const minutes = end.diff(start, 'minute');
                return `${minutes} phút`;
            },
            responsive: ['md'],
        },
        {
            title: 'Thời gian nộp',
            dataIndex: 'endAt',
            key: 'endAt',
            width: 160,
            render: (v: string) => (v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '—'),
            responsive: ['md'],
        },
        {
            title: '',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record)}
                    loading={detailLoading}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <>
            <Modal
                title={`Danh sách bài nộp: ${quiz?.quiz.title || ''}`}
                open={open}
                onCancel={handleClose}
                footer={null}
                width={800}
            >
                <div className="submitted-list-filter">
                    <Search
                        placeholder="Tìm theo tên học sinh..."
                        value={searchString}
                        onChange={(e) => setSearchString(e.target.value)}
                        onSearch={() => {
                            setPagination((prev) => ({ ...prev, current: 1 }));
                            fetchSubmissions();
                        }}
                        allowClear
                    />
                    <InputNumber
                        placeholder="Điểm từ"
                        min={0}
                        max={10}
                        value={fromScore}
                        onChange={(v) => setFromScore(v)}
                        style={{ width: '100%' }}
                    />
                    <InputNumber
                        placeholder="Điểm đến"
                        min={0}
                        max={10}
                        value={toScore}
                        onChange={(v) => setToScore(v)}
                        style={{ width: '100%' }}
                    />
                    <Button onClick={() => fetchSubmissions()}>Lọc</Button>
                </div>

                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={submissions}
                        rowKey="idSubmitted"
                        pagination={{
                            ...pagination,
                            showSizeChanger: false,
                            showTotal: (total) => `Tổng ${total} bài nộp`,
                            onChange: (page) => setPagination((prev) => ({ ...prev, current: page })),
                        }}
                        locale={{ emptyText: <Empty description="Chưa có bài nộp nào" /> }}
                        scroll={{ x: 'max-content' }}
                    />
                </Spin>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title={`Chi tiết bài làm: ${detailModal.submission?.user?.lastName || ''} ${detailModal.submission?.user?.firstName || ''}`}
                open={detailModal.open}
                onCancel={() => setDetailModal({ open: false, submission: null })}
                footer={null}
                width={700}
            >
                {detailModal.submission && (
                    <div>
                        <div style={{ marginBottom: 16, padding: 16, background: '#f6ffed', borderRadius: 8 }}>
                            <strong>Điểm: </strong>
                            <span className={`submitted-score ${getScoreClass(detailModal.submission.score || 0)}`}>
                                {detailModal.submission.score?.toFixed(2) || '0.00'}/10
                            </span>
                        </div>

                        {detailModal.submission.quiz?.questions?.map((question, idx) => {
                            return (
                                <div key={question.id} className="detail-question-item">
                                    <div className="detail-question-header">
                                        Câu {idx + 1}: {question.questionContent}
                                    </div>
                                    {question.answers?.map((answer) => {
                                        let className = 'detail-answer';
                                        if (answer.correct) className += ' correct';
                                        return (
                                            <div key={answer.id} className={className}>
                                                {answer.correct && '✓ '}
                                                {answer.content}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default SubmittedQuizListModal;
