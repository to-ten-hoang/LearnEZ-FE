import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Input,
    Select,
    DatePicker,
    Row,
    Col,
    Tag,
    Spin,
    Empty,
    Pagination,
    Avatar,
    message,
    Button,
    Card,
} from 'antd';
import {
    BookOutlined,
    UserOutlined,
    CalendarOutlined,
    RightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { filterClasses } from '../../../api/classApi';
import type { Class, ClassStatus } from '../../../types/class';
import './StudentOfflineClasses.css';

const { RangePicker } = DatePicker;

const STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Đang hoạt động', color: 'green' },
    { value: 'PENDING', label: 'Chờ bắt đầu', color: 'orange' },
    { value: 'COMPLETED', label: 'Đã kết thúc', color: 'default' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red' },
];

const getStatusColor = (status: string) => {
    const found = STATUS_OPTIONS.find((s) => s.value === status);
    return found?.color || 'default';
};

const getStatusLabel = (status: string) => {
    const found = STATUS_OPTIONS.find((s) => s.value === status);
    return found?.label || status;
};

const StudentOfflineClasses = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<Class[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    });

    // Filter states
    const [searchString, setSearchString] = useState('');
    const [statusFilter, setStatusFilter] = useState<ClassStatus[]>([]);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await filterClasses({
                searchString: searchString || undefined,
                statusClass: statusFilter.length > 0 ? statusFilter : undefined,
                fromDate: dateRange?.[0]?.format('YYYY-MM-DD') || undefined,
                toDate: dateRange?.[1]?.format('YYYY-MM-DD') || undefined,
                page: pagination.current - 1,
                size: pagination.pageSize,
            });

            if (response.data) {
                setClasses(response.data.content);
                setPagination((prev) => ({
                    ...prev,
                    total: response.data.totalElements,
                }));
            }
        } catch (error) {
            message.error('Không thể tải danh sách lớp học');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize]);

    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, current: 1 }));
        fetchClasses();
    };

    const handleReset = () => {
        setSearchString('');
        setStatusFilter([]);
        setDateRange(null);
        setPagination((prev) => ({ ...prev, current: 1 }));
        setTimeout(() => fetchClasses(), 0);
    };

    const handleCardClick = (classId: number) => {
        navigate(`/dashboard/offline-classes/${classId}`);
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize: pageSize || prev.pageSize,
        }));
    };

    return (
        <div className="student-offline-classes">
            <h2>Lớp học của tôi</h2>

            {/* Filter Section - matching teacher style */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Nhập tên lớp học..."
                            value={searchString}
                            onChange={(e) => setSearchString(e.target.value)}
                            onPressEnter={handleSearch}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            mode="multiple"
                            placeholder="Trạng thái"
                            style={{ width: '100%' }}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            allowClear
                            options={STATUS_OPTIONS.map((s) => ({
                                value: s.value,
                                label: s.label,
                            }))}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <RangePicker
                            style={{ width: '100%' }}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4} style={{ textAlign: 'right' }}>
                        <Button
                            type="primary"
                            onClick={handleSearch}
                            loading={loading}
                            style={{ marginRight: 8 }}
                        >
                            Tìm kiếm
                        </Button>
                        <Button onClick={handleReset} disabled={loading}>
                            Xóa bộ lọc
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Class Grid */}
            <Spin spinning={loading}>
                {classes.length > 0 ? (
                    <>
                        <div className="class-grid">
                            {classes.map((classItem) => (
                                <div
                                    key={classItem.id}
                                    className="class-card"
                                    onClick={() => handleCardClick(classItem.id)}
                                >
                                    <div className="class-card-header">
                                        <h3 className="class-card-title">{classItem.name}</h3>
                                        <Tag color={getStatusColor(classItem.status)}>
                                            {getStatusLabel(classItem.status)}
                                        </Tag>
                                    </div>

                                    <div className="class-card-body">
                                        <p className="class-card-description">
                                            {classItem.description || 'Không có mô tả'}
                                        </p>
                                        <div className="class-card-meta">
                                            {classItem.subject && (
                                                <span className="class-meta-item">
                                                    <BookOutlined />
                                                    {classItem.subject}
                                                </span>
                                            )}
                                            <span className="class-meta-item">
                                                <CalendarOutlined />
                                                {dayjs(classItem.createdAt).format('DD/MM/YYYY')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="class-card-footer">
                                        <div className="teacher-info">
                                            <Avatar
                                                size="small"
                                                src={classItem.teacher?.avatarUrl}
                                                icon={<UserOutlined />}
                                            />
                                            <span className="teacher-name">
                                                {classItem.teacher
                                                    ? `${classItem.teacher.lastName} ${classItem.teacher.firstName}`
                                                    : 'Chưa có giáo viên'}
                                            </span>
                                        </div>
                                        <span className="view-detail-text">
                                            Xem chi tiết <RightOutlined />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pagination-container">
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={handlePageChange}
                                showSizeChanger
                                showTotal={(total) => `Tổng ${total} lớp học`}
                            />
                        </div>
                    </>
                ) : (
                    <Empty
                        className="empty-state"
                        description="Bạn chưa tham gia lớp học nào"
                    />
                )}
            </Spin>
        </div>
    );
};

export default StudentOfflineClasses;
