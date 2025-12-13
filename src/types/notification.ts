// Types cho Notification API

// Loại thông báo
export type ENotiType = 'NEW_COURSE' | 'ADD_TO_CLASS' | 'NEW_QUIZ_IN_CLASS' | 'UPDATE_IN_CLASS';

// Interface cho 1 thông báo
export interface Notification {
    id: number;
    title: string;
    content: string;
    objectId: number | null;
    notiType: ENotiType;
    createdAt: string;
    isRead: boolean;
}

// Response từ API đếm thông báo chưa đọc
export interface NotificationCountResponse {
    code: number;
    message: string;
    data: number;
}

// Response từ API danh sách thông báo
export interface NotificationListResponse {
    code: number;
    message: string;
    data: {
        content: Notification[];
        pageable: {
            pageNumber: number;
            pageSize: number;
            sort: {
                sorted: boolean;
                unsorted: boolean;
                empty: boolean;
            };
            offset: number;
            paged: boolean;
            unpaged: boolean;
        };
        totalPages: number;
        totalElements: number;
        last: boolean;
        first: boolean;
        size: number;
        number: number;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        numberOfElements: number;
        empty: boolean;
    };
}

// Response từ API cập nhật trạng thái đã đọc
export interface NotificationUpdateResponse {
    code: number;
    message: string;
    data: null;
}

// Request params cho API list
export interface NotificationListParams {
    page?: number;
    size?: number;
    sort?: string;
}
