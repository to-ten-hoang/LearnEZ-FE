import { useState, useEffect } from 'react';
import {
    Input,
    Select,
    Spin,
    Empty,
    Pagination,
    Tag,
    Button,
    Modal,
    message,
    Tooltip,
} from 'antd';
import {
    SearchOutlined,
    PushpinOutlined,
    FileTextOutlined,
    BookOutlined,
    ClockCircleOutlined,
    LinkOutlined,
    // EditOutlined,
    // DeleteOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getListNotificationInClass, submitExercise, updateExercise } from '../../../api/classApi';
import type { Class, ClassNotification, AttachDocumentClass } from '../../../types/class';

interface Props {
    classData: Class;
}

const NOTIFICATION_TYPES = [
    { value: 'INFO', label: 'Thông báo', color: 'default', icon: <FileTextOutlined /> },
    { value: 'HOMEWORK', label: 'Bài tập', color: 'blue', icon: <BookOutlined /> },
    { value: 'DOCUMENT', label: 'Tài liệu', color: 'purple', icon: <FileTextOutlined /> },
];

const StudentNotificationTab = ({ classData }: Props) => {
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<ClassNotification[]>([]);
    const [searchString, setSearchString] = useState('');
    const [typeFilter, setTypeFilter] = useState<string[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Homework submission modal
    const [submitModal, setSubmitModal] = useState<{
        open: boolean;
        notification: ClassNotification | null;
        submitId?: number;
        linkUrl: string;
        isEdit: boolean;
    }>({
        open: false,
        notification: null,
        linkUrl: '',
        isEdit: false,
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await getListNotificationInClass({
                classId: classData.id,
                searchString: searchString || undefined,
                page: pagination.current - 1,
                size: pagination.pageSize,
            });

            if (response.data) {
                // Filter by type if selected
                let content = response.data.content;
                if (typeFilter.length > 0) {
                    content = content.filter((n) => typeFilter.includes(n.typeNotification));
                }
                setNotifications(content);
                setPagination((prev) => ({
                    ...prev,
                    total: response.data.totalElements,
                }));
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classData.id, pagination.current, typeFilter]);

    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, current: 1 }));
        fetchNotifications();
    };

    const getNotificationType = (type: string) => {
        return NOTIFICATION_TYPES.find((t) => t.value === type) || NOTIFICATION_TYPES[0];
    };

    const getDeadlineStatus = (toDate: string | null) => {
        if (!toDate) return null;
        const deadline = dayjs(toDate);
        const now = dayjs();
        const diff = deadline.diff(now, 'hour');

        if (diff < 0) return { class: 'deadline-overdue', text: 'Đã hết hạn' };
        if (diff < 24) return { class: 'deadline-warning', text: `Còn ${diff} giờ` };
        return { class: 'deadline-ok', text: `Hạn: ${deadline.format('DD/MM/YYYY HH:mm')}` };
    };

    const openSubmitModal = (notification: ClassNotification, isEdit = false, submitId?: number, existingUrl?: string) => {
        setSubmitModal({
            open: true,
            notification,
            submitId,
            linkUrl: existingUrl || '',
            isEdit,
        });
    };

    const handleSubmitHomework = async () => {
        if (!submitModal.notification || !submitModal.linkUrl.trim()) {
            message.warning('Vui lòng nhập link bài nộp');
            return;
        }

        setSubmitting(true);
        try {
            if (submitModal.isEdit && submitModal.submitId) {
                await updateExercise({
                    submitId: submitModal.submitId,
                    linkUrl: submitModal.linkUrl.trim(),
                });
                message.success('Cập nhật bài nộp thành công!');
            } else {
                await submitExercise({
                    notificationId: submitModal.notification.id,
                    linkUrl: submitModal.linkUrl.trim(),
                });
                message.success('Nộp bài thành công!');
            }
            setSubmitModal({ open: false, notification: null, linkUrl: '', isEdit: false });
            fetchNotifications();
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // const handleCancelSubmission = async (submitId: number) => {
    //     Modal.confirm({
    //         title: 'Xác nhận hủy nộp bài',
    //         content: 'Bạn có chắc chắn muốn hủy bài đã nộp?',
    //         okText: 'Hủy nộp',
    //         cancelText: 'Đóng',
    //         okButtonProps: { danger: true },
    //         onOk: async () => {
    //             try {
    //                 await cancelExercise({ submitId });
    //                 message.success('Đã hủy bài nộp');
    //                 fetchNotifications();
    //             } catch (error) {
    //                 message.error('Có lỗi xảy ra');
    //                 console.error(error);
    //             }
    //         },
    //     });
    // };

    return (
        <div className="tab-content">
            <div className="tab-filter-bar">
                <Input
                    placeholder="Tìm kiếm thông báo..."
                    prefix={<SearchOutlined />}
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ maxWidth: 300 }}
                    allowClear
                />
                <Select
                    mode="multiple"
                    placeholder="Loại thông báo"
                    style={{ minWidth: 200 }}
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={NOTIFICATION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                    allowClear
                />
            </div>

            <Spin spinning={loading}>
                {notifications.length > 0 ? (
                    <>
                        <div className="notification-list">
                            {notifications.map((notification) => {
                                const typeInfo = getNotificationType(notification.typeNotification);
                                const deadlineStatus =
                                    notification.typeNotification === 'HOMEWORK'
                                        ? getDeadlineStatus(notification.toDate)
                                        : null;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${notification.isPin ? 'pinned' : ''} ${
                                            notification.typeNotification === 'HOMEWORK' ? 'homework' : ''
                                        }`}
                                    >
                                        <div className="notification-header">
                                            <div className="notification-type">
                                                {notification.isPin && (
                                                    <Tooltip title="Được ghim">
                                                        <PushpinOutlined style={{ color: '#faad14' }} />
                                                    </Tooltip>
                                                )}
                                                <Tag color={typeInfo.color} icon={typeInfo.icon}>
                                                    {typeInfo.label}
                                                </Tag>
                                            </div>
                                            <span className="notification-date">
                                                {dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm')}
                                            </span>
                                        </div>

                                        <div className="notification-content">
                                            {notification.description}
                                        </div>

                                        {notification.attachDocumentClasses?.length > 0 && (
                                            <div className="notification-attachments">
                                                {notification.attachDocumentClasses.map((doc: AttachDocumentClass, idx: number) => (
                                                    <a
                                                        key={idx}
                                                        href={doc.linkUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Tag icon={<LinkOutlined />}>
                                                            Tài liệu {idx + 1}
                                                        </Tag>
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        {notification.typeNotification === 'HOMEWORK' && (
                                            <div className="notification-footer">
                                                <div className="homework-deadline">
                                                    {deadlineStatus && (
                                                        <>
                                                            <ClockCircleOutlined />
                                                            <span className={deadlineStatus.class}>
                                                                {deadlineStatus.text}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <Button
                                                        type="primary"
                                                        icon={<UploadOutlined />}
                                                        size="small"
                                                        onClick={() => openSubmitModal(notification)}
                                                        disabled={deadlineStatus?.class === 'deadline-overdue'}
                                                    >
                                                        Nộp bài
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: 20, textAlign: 'center' }}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={(page) => setPagination((prev) => ({ ...prev, current: page }))}
                                showTotal={(total) => `Tổng ${total} thông báo`}
                            />
                        </div>
                    </>
                ) : (
                    <Empty description="Chưa có thông báo nào" />
                )}
            </Spin>

            {/* Homework Submit Modal */}
            <Modal
                title={submitModal.isEdit ? 'Sửa bài nộp' : 'Nộp bài tập'}
                open={submitModal.open}
                onCancel={() => setSubmitModal({ open: false, notification: null, linkUrl: '', isEdit: false })}
                onOk={handleSubmitHomework}
                confirmLoading={submitting}
                okText={submitModal.isEdit ? 'Cập nhật' : 'Nộp bài'}
                cancelText="Hủy"
            >
                {submitModal.notification && (
                    <div style={{ marginBottom: 16 }}>
                        <p><strong>Bài tập:</strong> {submitModal.notification.description}</p>
                        {submitModal.notification.toDate && (
                            <p>
                                <strong>Hạn nộp:</strong>{' '}
                                {dayjs(submitModal.notification.toDate).format('DD/MM/YYYY HH:mm')}
                            </p>
                        )}
                    </div>
                )}
                <Input
                    placeholder="Nhập link bài nộp (Google Drive, Dropbox...)"
                    prefix={<LinkOutlined />}
                    value={submitModal.linkUrl}
                    onChange={(e) => setSubmitModal((prev) => ({ ...prev, linkUrl: e.target.value }))}
                />
            </Modal>
        </div>
    );
};

export default StudentNotificationTab;
