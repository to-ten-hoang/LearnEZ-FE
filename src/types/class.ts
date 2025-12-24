import type { User } from './user';

// Định nghĩa các trạng thái của lớp học để sử dụng nhất quán
export const CLASS_STATUSES = [
    'PENDING',
    'ACTIVE',
    'FINISHED',
    'CANCELED',
    'PLANNING',
    'CANCELLED',
    'COMPLETED',
    'ONGOING',
] as const;
export type ClassStatus = (typeof CLASS_STATUSES)[number];

export interface Class {
    id: number;
    name: string;
    description: string;
    subject: string | null;
    title: string;
    teacher: User;
    createdAt: string;
    updatedAt: string | null;
    createdByName: string | null;
    updatedByName: string | null;
    status: ClassStatus;
    memberIds?: number[];
}

export interface FilterClassesRequest {
    searchString?: string;
    idTeacher?: number;
    statusClass?: ClassStatus[];
    fromDate?: string | null;
    toDate?: string | null;
    page?: number;
    size?: number;
}

export interface CreateClassRequest {
    name: string;
    description: string;
    title: string;
    teacher: number;
    memberIds?: number[];
}

export interface UpdateClassRequest extends Partial<Omit<CreateClassRequest, 'teacher'>> {
    id: number;
    teacher?: number;
}

// Response cho API lấy danh sách (đã phân trang)
export interface ClassPagedResponse {
    code: number;
    message: string;
    data: {
        content: Class[];
        totalPages: number;
        totalElements: number;
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
    };
}

// Response cho API tạo/sửa/chi tiết
export interface ClassDetailResponse {
    code: number;
    message: string;
    data: Class;
}

export interface ClassMember {
    // id người dùng trong hệ thống
    id: number;
    name: string;
    joinDate: string;
    email: string;
    phone: string | null;
    // memberId: id bản ghi quan hệ thành viên-trong-lớp (dùng cho API xóa)
    memberId: number;
    address: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    roleInClass: 'STUDENT' | 'TEACHER';
}

// Request body để lấy danh sách thành viên
export interface GetMembersRequest {
    classId: number;
    searchString?: string;
    joinDate?: string | null;
    status?: string[];
    page?: number;
    size?: number;
}

// Request body để thêm hoặc xóa thành viên
export interface UpdateMembersRequest {
    id: number; // classId
    memberIds: number[];
}

// Response API cho danh sách thành viên (có phân trang)
export interface MemberPagedResponse {
    code: number;
    message: string;
    data: {
        content: ClassMember[];
        totalPages: number;
        totalElements: number;
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
    };
}

/* ====== Class Notification types ====== */

export interface AttachDocumentClass {
    id?: number;
    linkUrl: string;
    name?: string;
}

export type NotificationTypeNumber = 1 | 2; // 1: Thông báo thường, 2: Bài tập (có thời gian)
export interface ClassNotification {
    id: number;
    description: string;
    // Chuỗi mô tả kiểu từ backend, ví dụ: "Exercise"
    typeNotification: string;
    fromDate: string | null;
    toDate: string | null;
    isPin: boolean;
    isActive: boolean;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string | null;
    createdBy: User;
    updatedBy: User | null;
    attachDocumentClasses: AttachDocumentClass[];
}

export interface CreateClassNotificationRequest {
    classId: number;
    description: string;
    isPin: boolean;
    typeNotification: NotificationTypeNumber;
    fromDate: string | null; // "YYYY-MM-DD HH:mm:ss" hoặc null
    toDate: string | null; // "YYYY-MM-DD HH:mm:ss" hoặc null
    urlAttachment: string[]; // các URL cuối cùng
}

export interface UpdateClassNotificationRequest
    extends Omit<CreateClassNotificationRequest, 'classId'> {
    classId: number;
    classNotificationId: number;
}

export interface GetClassNotificationsRequest {
    classId: number;
    searchString?: string;
    fromDate?: string | null;
    toDate?: string | null;
    page?: number;
    size?: number;
}

export interface ClassNotificationPagedResponse {
    code: number;
    message: string;
    data: {
        content: ClassNotification[];
        totalPages: number;
        totalElements: number;
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
    };
}

export interface ToggleClassNotificationRequest {
    classId: number;
    classNotificationId: number;
    isActive: boolean;
    isDelete: boolean;
}

export interface ClassNotificationDetailResponse {
    code: number;
    message: string;
    data: ClassNotification;
}
