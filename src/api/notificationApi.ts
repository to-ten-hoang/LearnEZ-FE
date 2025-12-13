import api from '../lib/axios';
import type {
    NotificationCountResponse,
    NotificationListResponse,
    NotificationUpdateResponse,
    NotificationListParams,
} from '../types/notification';

// Đếm số thông báo chưa đọc
export const getNotificationCount = async (): Promise<NotificationCountResponse> => {
    const response = await api.get('/api/v1/noti/count');
    return response.data;
};

// Lấy danh sách thông báo (có phân trang)
export const getNotificationList = async (
    params: NotificationListParams = {}
): Promise<NotificationListResponse> => {
    const response = await api.get('/api/v1/noti/list', {
        params: {
            page: params.page || 0,
            size: params.size || 10,
            sort: params.sort || 'createdAt,desc',
        },
    });
    return response.data;
};

// Đánh dấu các thông báo đã đọc
// Spring controller nhận List<Long> notiIds qua query params: ?notiIds=1&notiIds=2&notiIds=3
export const updateNotificationsRead = async (
    notiIds: number[]
): Promise<NotificationUpdateResponse> => {
    // Build query string: notiIds=1&notiIds=2&notiIds=3
    const queryString = notiIds.map(id => `notiIds=${id}`).join('&');
    const response = await api.post(`/api/v1/noti/update?${queryString}`);
    return response.data;
};
