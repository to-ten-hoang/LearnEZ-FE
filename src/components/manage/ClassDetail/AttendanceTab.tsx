import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Space, Spin, Empty } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Class } from '../../../types/class';
import type { OverviewStatistic } from '../../../types/attendance';
import { getOverviewStatisticService } from '../../../services/attendanceService';
import AttendanceModal from './AttendanceModal';
import './AttendanceTab.css';

interface AttendanceTabProps {
    classData: Class;
}

const AttendanceTab = ({ classData }: AttendanceTabProps) => {
    const [statistics, setStatistics] = useState<OverviewStatistic[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<OverviewStatistic | null>(null);

    const fetchStatistics = useCallback(async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const response = await getOverviewStatisticService(classData.id, page, size);
            setStatistics(response.data.content);
            setPagination({
                current: response.data.pageable.pageNumber + 1,
                pageSize: response.data.pageable.pageSize,
                total: response.data.totalElements,
            });
        } catch (error) {
            console.error('Lỗi lấy thống kê điểm danh:', error);
        } finally {
            setLoading(false);
        }
    }, [classData.id]);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    const handleTableChange = (paginationConfig: any) => {
        fetchStatistics(paginationConfig.current - 1, paginationConfig.pageSize);
    };

    const handleOpenModal = (record: OverviewStatistic) => {
        setSelectedSchedule(record);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedSchedule(null);
    };

    const handleAttendanceSuccess = () => {
        fetchStatistics(pagination.current - 1, pagination.pageSize);
    };

    const columns = [
        {
            title: 'Buổi học',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <span className="schedule-title">{text}</span>,
        },
        {
            title: 'Thời gian',
            key: 'time',
            render: (_: any, record: OverviewStatistic) => (
                <Space direction="vertical" size={0}>
                    <span>{dayjs(record.startAt).format('DD/MM/YYYY')}</span>
                    <span className="time-range">
                        {dayjs(record.startAt).format('HH:mm')} - {dayjs(record.endAt).format('HH:mm')}
                    </span>
                </Space>
            ),
        },
        {
            title: (
                <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>Có mặt</span>
                </Space>
            ),
            dataIndex: 'present',
            key: 'present',
            align: 'center' as const,
            render: (value: number) => (
                <Tag color="success" className="stat-tag">{value}</Tag>
            ),
        },
        {
            title: (
                <Space>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    <span>Vắng</span>
                </Space>
            ),
            dataIndex: 'absent',
            key: 'absent',
            align: 'center' as const,
            render: (value: number) => (
                <Tag color="error" className="stat-tag">{value}</Tag>
            ),
        },
        {
            title: (
                <Space>
                    <ClockCircleOutlined style={{ color: '#faad14' }} />
                    <span>Muộn</span>
                </Space>
            ),
            dataIndex: 'late',
            key: 'late',
            align: 'center' as const,
            render: (value: number) => (
                <Tag color="warning" className="stat-tag">{value}</Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: OverviewStatistic) => (
                <Button
                    type="primary"
                    icon={<TeamOutlined />}
                    onClick={() => handleOpenModal(record)}
                >
                    Điểm danh
                </Button>
            ),
        },
    ];

    return (
        <Card className="attendance-tab-card">
            <div className="attendance-header">
                <h3>📊 Thống kê điểm danh theo buổi học</h3>
            </div>

            <Spin spinning={loading}>
                {statistics.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={statistics}
                        rowKey="scheduleId"
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} buổi học`,
                        }}
                        onChange={handleTableChange}
                    />
                ) : (
                    <Empty
                        description="Chưa có lịch học nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Spin>

            {/* Modal điểm danh */}
            <AttendanceModal
                visible={modalVisible}
                onClose={handleCloseModal}
                schedule={selectedSchedule}
                classId={classData.id}
                onSuccess={handleAttendanceSuccess}
            />
        </Card>
    );
};

export default AttendanceTab;
