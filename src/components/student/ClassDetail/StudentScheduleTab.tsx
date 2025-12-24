import { useState, useEffect } from 'react';
import { DatePicker, Select, Spin, Empty, Pagination, Tag, Modal, Descriptions } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getSchedulesInClass, getScheduleDetail } from '../../../api/classApi';
import type { ClassSchedule } from '../../../types/classQuiz';

const { RangePicker } = DatePicker;

interface Props {
    classId: number;
}

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Đang hoạt động', color: 'green' },
    { value: 'SCHEDULED', label: 'Đã lên lịch', color: 'blue' },
    { value: 'COMPLETED', label: 'Đã hoàn thành', color: 'cyan' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red' },
];

const StudentScheduleTab = ({ classId }: Props) => {
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [detailModal, setDetailModal] = useState<{ open: boolean; schedule: ClassSchedule | null }>({
        open: false,
        schedule: null,
    });

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await getSchedulesInClass({
                classId: [classId],
                status: statusFilter.length > 0 ? statusFilter : undefined,
                fromDate: dateRange?.[0]?.format('YYYY-MM-DD'),
                toDate: dateRange?.[1]?.format('YYYY-MM-DD'),
                page: pagination.current - 1,
                size: pagination.pageSize,
            });

            if (response.data) {
                setSchedules(response.data.content);
                setPagination((prev) => ({
                    ...prev,
                    total: response.data.totalElements,
                }));
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId, pagination.current, statusFilter]);

    const handleViewDetail = async (schedule: ClassSchedule) => {
        try {
            const response = await getScheduleDetail(schedule.id);
            setDetailModal({ open: true, schedule: response.data });
        } catch {
            setDetailModal({ open: true, schedule });
        }
    };

    const getStatusColor = (status: string) => {
        return STATUS_OPTIONS.find((s) => s.value === status)?.color || 'default';
    };

    const getStatusLabel = (status: string) => {
        return STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
    };

    return (
        <div className="tab-content">
            <div className="tab-filter-bar">
                <Select
                    mode="multiple"
                    placeholder="Trạng thái"
                    style={{ minWidth: 200 }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={STATUS_OPTIONS}
                    allowClear
                />
                <RangePicker
                    placeholder={['Từ ngày', 'Đến ngày']}
                    value={dateRange}
                    onChange={(dates) => {
                        setDateRange(dates);
                        setPagination((prev) => ({ ...prev, current: 1 }));
                        fetchSchedules();
                    }}
                />
            </div>

            <Spin spinning={loading}>
                {schedules.length > 0 ? (
                    <>
                        <div className="schedule-list">
                            {schedules.map((schedule) => (
                                <div
                                    key={schedule.id}
                                    className={`schedule-item ${schedule.status.toLowerCase()}`}
                                    onClick={() => handleViewDetail(schedule)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="schedule-date">
                                        <div className="schedule-day">
                                            {dayjs(schedule.startAt).format('DD')}
                                        </div>
                                        <div className="schedule-month">
                                            Th{dayjs(schedule.startAt).format('MM')}
                                        </div>
                                    </div>
                                    <div className="schedule-info">
                                        <div className="schedule-title">{schedule.title}</div>
                                        <div className="schedule-time">
                                            <ClockCircleOutlined />{' '}
                                            {dayjs(schedule.startAt).format('HH:mm')} -{' '}
                                            {dayjs(schedule.endAt).format('HH:mm')}
                                        </div>
                                    </div>
                                    <Tag color={getStatusColor(schedule.status)}>
                                        {getStatusLabel(schedule.status)}
                                    </Tag>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 20, textAlign: 'center' }}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={(page) => setPagination((prev) => ({ ...prev, current: page }))}
                                showTotal={(total) => `Tổng ${total} buổi học`}
                            />
                        </div>
                    </>
                ) : (
                    <Empty description="Chưa có lịch học nào" />
                )}
            </Spin>

            {/* Schedule Detail Modal */}
            <Modal
                title="Chi tiết buổi học"
                open={detailModal.open}
                onCancel={() => setDetailModal({ open: false, schedule: null })}
                footer={null}
                width={600}
            >
                {detailModal.schedule && (
                    <Descriptions column={1}>
                        <Descriptions.Item label="Tiêu đề">
                            {detailModal.schedule.title}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian bắt đầu">
                            {dayjs(detailModal.schedule.startAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian kết thúc">
                            {dayjs(detailModal.schedule.endAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getStatusColor(detailModal.schedule.status)}>
                                {getStatusLabel(detailModal.schedule.status)}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default StudentScheduleTab;
