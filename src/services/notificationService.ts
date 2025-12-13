import {
    getNotificationCount,
    getNotificationList,
    updateNotificationsRead,
} from '../api/notificationApi';
import type {
    NotificationCountResponse,
    NotificationListResponse,
    NotificationUpdateResponse,
    NotificationListParams,
} from '../types/notification';

// Lấy số thông báo chưa đọc
export const getNotificationCountService = async (): Promise<NotificationCountResponse> => {
    try {
        const response = await getNotificationCount();
        return response;
    } catch (error: any) {
        console.error('Lỗi lấy số thông báo:', error);
        throw error;
    }
};

// Lấy danh sách thông báo
export const getNotificationListService = async (
    params: NotificationListParams = {}
): Promise<NotificationListResponse> => {
    try {
        const response = await getNotificationList(params);
        return response;
    } catch (error: any) {
        console.error('Lỗi lấy danh sách thông báo:', error);
        throw error;
    }
};

// Đánh dấu thông báo đã đọc
export const markNotificationsAsReadService = async (
    notiIds: number[]
): Promise<NotificationUpdateResponse> => {
    try {
        const response = await updateNotificationsRead(notiIds);
        return response;
    } catch (error: any) {
        console.error('Lỗi cập nhật thông báo:', error);
        throw error;
    }
};
