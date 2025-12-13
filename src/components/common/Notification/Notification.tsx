import { useState, useEffect, useCallback } from 'react';
import { Badge, Dropdown, Spin, Empty, Button, message } from 'antd';
import { BellOutlined, CheckOutlined, BookOutlined, TeamOutlined, FileTextOutlined, SyncOutlined } from '@ant-design/icons';
import {
    getNotificationCountService,
    getNotificationListService,
    markNotificationsAsReadService,
} from '../../../services/notificationService';
import type { Notification as NotificationType, ENotiType } from '../../../types/notification';
import './Notification.css';

<<<<<<< HEAD
const NotificationComponent = () => {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await getNotificationCountService();
            if (res.code === 200) {
                setUnreadCount(res.data);
            }
        } catch (error) {
            console.error('Lỗi lấy số thông báo:', error);
        }
    }, []);

    // Fetch notification list
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getNotificationListService({ page: 0, size: 10 });
            if (res.code === 200) {
                setNotifications(res.data.content);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách thông báo:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    // Fetch list when dropdown opens
    useEffect(() => {
        if (dropdownOpen) {
            fetchNotifications();
        }
    }, [dropdownOpen, fetchNotifications]);

    // Get icon based on notification type
    const getNotificationIcon = (type: ENotiType) => {
        switch (type) {
            case 'NEW_COURSE':
                return <BookOutlined className="noti-type-icon noti-type-course" />;
            case 'ADD_TO_CLASS':
                return <TeamOutlined className="noti-type-icon noti-type-class" />;
            case 'NEW_QUIZ_IN_CLASS':
                return <FileTextOutlined className="noti-type-icon noti-type-quiz" />;
            case 'UPDATE_IN_CLASS':
                return <SyncOutlined className="noti-type-icon noti-type-update" />;
            default:
                return <BellOutlined className="noti-type-icon" />;
        }
    };

    // Format time ago
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    // Mark single notification as read
    const handleMarkAsRead = async (notiId: number) => {
        try {
            const res = await markNotificationsAsReadService([notiId]);
            if (res.code === 200) {
                setNotifications(prev =>
                    prev.map(n => (n.id === notiId ? { ...n, isRead: true } : n))
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            message.error('Không thể đánh dấu đã đọc');
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length === 0) return;

        try {
            const res = await markNotificationsAsReadService(unreadIds);
            if (res.code === 200) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
                message.success('Đã đánh dấu tất cả đã đọc');
            }
        } catch (error) {
            message.error('Không thể đánh dấu đã đọc');
        }
    };

    // Dropdown content
    const dropdownContent = (
        <div className="notification-dropdown">
            <div className="notification-header">
                <span className="notification-title">Thông báo</span>
                {unreadCount > 0 && (
                    <Button
                        type="link"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={handleMarkAllAsRead}
                        className="mark-all-btn"
                    >
                        Đánh dấu tất cả đã đọc
                    </Button>
                )}
            </div>

            <div className="notification-list">
                {loading ? (
                    <div className="notification-loading">
                        <Spin size="small" />
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map(noti => (
                        <div
                            key={noti.id}
                            className={`notification-item ${!noti.isRead ? 'unread' : ''}`}
                            onClick={() => !noti.isRead && handleMarkAsRead(noti.id)}
                        >
                            <div className="notification-item-icon">
                                {getNotificationIcon(noti.notiType)}
                            </div>
                            <div className="notification-item-content">
                                <div className="notification-item-title">{noti.title}</div>
                                <div className="notification-item-desc">{noti.content}</div>
                                <div className="notification-item-time">
                                    {formatTimeAgo(noti.createdAt)}
                                </div>
                            </div>
                            {!noti.isRead && <div className="notification-unread-dot" />}
                        </div>
                    ))
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có thông báo"
                        className="notification-empty"
                    />
                )}
            </div>
        </div>
    );

    return (
        <Dropdown
            dropdownRender={() => dropdownContent}
            trigger={['click']}
            placement="bottomRight"
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
        >
            <div className="notification-trigger">
                <Badge count={unreadCount} className="noti-badge" overflowCount={99}>
                    <BellOutlined className="notification-icon" />
                </Badge>
            </div>
        </Dropdown>
    );
};

export default NotificationComponent;
=======
const Notification = () => {
    return (
        <div>
            <Badge count={5} className="noti-badge">
                <BellOutlined className="notification-icon" />
            </Badge>
        </div>
    );
};

export default Notification;
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
