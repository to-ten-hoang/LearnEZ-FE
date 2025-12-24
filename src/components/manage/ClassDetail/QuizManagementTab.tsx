import { useState, useEffect } from 'react';
import {
    Button,
    Input,
    Table,
    Tag,
    Dropdown,
    message,
    Switch,
    Empty,
    Spin,
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    BarChartOutlined,
    MoreOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Class } from '../../../types/class';
import type { SharedQuiz } from '../../../types/classQuiz';
import {
    listQuizzesInClass,
    updateQuizInClass,
} from '../../../api/classQuizApi';
import PullQuizModal from './PullQuizModal';
import QuizSettingsModal from './QuizSettingsModal';
import SubmittedQuizListModal from './SubmittedQuizListModal';
import QuizStatisticModal from './QuizStatisticModal';
import './QuizManagementTab.css';

const { Search } = Input;

interface Props {
    classData: Class;
}

const QuizManagementTab = ({ classData }: Props) => {
    const [loading, setLoading] = useState(false);
    const [quizzes, setQuizzes] = useState<SharedQuiz[]>([]);
    const [searchString, setSearchString] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Modal states
    const [pullModalOpen, setPullModalOpen] = useState(false);
    const [settingsModal, setSettingsModal] = useState<{ open: boolean; quiz: SharedQuiz | null }>({
        open: false,
        quiz: null,
    });
    const [submittedModal, setSubmittedModal] = useState<{ open: boolean; quiz: SharedQuiz | null }>({
        open: false,
        quiz: null,
    });
    const [statisticModal, setStatisticModal] = useState<{ open: boolean; quiz: SharedQuiz | null }>({
        open: false,
        quiz: null,
    });

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await listQuizzesInClass(
                classData.id,
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
            message.error('Không thể tải danh sách bài kiểm tra');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classData.id, pagination.current, pagination.pageSize]);

    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, current: 1 }));
        fetchQuizzes();
    };

    const handleToggleActive = async (quiz: SharedQuiz, checked: boolean) => {
        try {
            await updateQuizInClass({
                sharedQuizId: quiz.sharedQuizId,
                classId: classData.id,
                isActive: checked,
            });
            message.success(checked ? 'Đã mở quiz' : 'Đã tạm dừng quiz');
            fetchQuizzes();
        } catch (error) {
            message.error('Có lỗi xảy ra');
            console.error(error);
        }
    };

    const handleDelete = async (quiz: SharedQuiz) => {
        try {
            await updateQuizInClass({
                sharedQuizId: quiz.sharedQuizId,
                classId: classData.id,
                isDelete: true,
            });
            message.success('Đã xóa quiz khỏi lớp');
            fetchQuizzes();
        } catch (error) {
            message.error('Có lỗi xảy ra');
            console.error(error);
        }
    };

    const getQuizStatus = (quiz: SharedQuiz) => {
        const now = dayjs();
        const startAt = quiz.startAt ? dayjs(quiz.startAt) : null;
        const endAt = quiz.endAt ? dayjs(quiz.endAt) : null;

        if (!quiz.isActive) return { label: 'Tạm dừng', color: 'default' };
        if (startAt && now.isBefore(startAt)) return { label: 'Chưa mở', color: 'orange' };
        if (endAt && now.isAfter(endAt)) return { label: 'Đã hết hạn', color: 'default' };
        return { label: 'Đang mở', color: 'green' };
    };

    const getMenuItems = (quiz: SharedQuiz): MenuProps['items'] => [
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Chỉnh sửa thời gian',
            onClick: () => setSettingsModal({ open: true, quiz }),
        },
        {
            key: 'submissions',
            icon: <EyeOutlined />,
            label: 'Xem bài nộp',
            onClick: () => setSubmittedModal({ open: true, quiz }),
        },
        {
            key: 'statistics',
            icon: <BarChartOutlined />,
            label: 'Thống kê điểm',
            onClick: () => setStatisticModal({ open: true, quiz }),
        },
        { type: 'divider' },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa khỏi lớp',
            danger: true,
            onClick: () => handleDelete(quiz),
        },
    ];

    const columns: ColumnsType<SharedQuiz> = [
        {
            title: 'Tên bài kiểm tra',
            dataIndex: ['quiz', 'title'],
            key: 'title',
            render: (title: string, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{title}</div>
                    {record.quiz.description && (
                        <div style={{ fontSize: 12, color: '#888' }}>
                            {record.quiz.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Số câu',
            dataIndex: ['quiz', 'totalQuestions'],
            key: 'totalQuestions',
            width: 80,
            align: 'center',
            render: (v: number) => v || 0,
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 200,
            render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                    <div>
                        <ClockCircleOutlined style={{ marginRight: 6 }} />
                        {record.startAt
                            ? dayjs(record.startAt).format('DD/MM/YYYY HH:mm')
                            : 'Không giới hạn'}
                    </div>
                    <div>
                        đến{' '}
                        {record.endAt
                            ? dayjs(record.endAt).format('DD/MM/YYYY HH:mm')
                            : 'Không giới hạn'}
                    </div>
                </div>
            ),
            responsive: ['md'],
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            render: (_, record) => {
                const status = getQuizStatus(record);
                return <Tag color={status.color}>{status.label}</Tag>;
            },
        },
        {
            title: 'Hoạt động',
            key: 'isActive',
            width: 100,
            render: (_, record) => (
                <Switch
                    checked={record.isActive}
                    onChange={(checked) => handleToggleActive(record, checked)}
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                />
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 50,
            render: (_, record) => (
                <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="quiz-management-tab">
            {/* Toolbar */}
            <div className="quiz-toolbar">
                <div className="quiz-toolbar-left">
                    <Search
                        placeholder="Tìm kiếm bài kiểm tra..."
                        value={searchString}
                        onChange={(e) => setSearchString(e.target.value)}
                        onSearch={handleSearch}
                        style={{ maxWidth: 300 }}
                        allowClear
                    />
                </div>
                <div className="quiz-toolbar-right">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setPullModalOpen(true)}
                    >
                        Giao bài kiểm tra
                    </Button>
                </div>
            </div>

            {/* Quiz Table */}
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={quizzes}
                    rowKey="sharedQuizId"
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bài kiểm tra`,
                        onChange: (page, pageSize) =>
                            setPagination({ ...pagination, current: page, pageSize }),
                    }}
                    locale={{ emptyText: <Empty description="Chưa có bài kiểm tra nào" /> }}
                    scroll={{ x: 'max-content' }}
                />
            </Spin>

            {/* Modals */}
            <PullQuizModal
                open={pullModalOpen}
                classId={classData.id}
                onClose={() => setPullModalOpen(false)}
                onSuccess={() => {
                    setPullModalOpen(false);
                    fetchQuizzes();
                }}
            />

            <QuizSettingsModal
                open={settingsModal.open}
                quiz={settingsModal.quiz}
                classId={classData.id}
                onClose={() => setSettingsModal({ open: false, quiz: null })}
                onSuccess={() => {
                    setSettingsModal({ open: false, quiz: null });
                    fetchQuizzes();
                }}
            />

            <SubmittedQuizListModal
                open={submittedModal.open}
                quiz={submittedModal.quiz}
                classId={classData.id}
                onClose={() => setSubmittedModal({ open: false, quiz: null })}
            />

            <QuizStatisticModal
                open={statisticModal.open}
                quiz={statisticModal.quiz}
                classId={classData.id}
                onClose={() => setStatisticModal({ open: false, quiz: null })}
            />
        </div>
    );
};

export default QuizManagementTab;
