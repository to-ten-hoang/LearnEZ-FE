<<<<<<< HEAD
=======
// src/api/classApi.ts
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
import api from '../lib/axios';
import type {
    FilterClassesRequest,
    CreateClassRequest,
    UpdateClassRequest,
    ClassPagedResponse,
    ClassDetailResponse,
    GetMembersRequest,
    MemberPagedResponse,
    UpdateMembersRequest,
<<<<<<< HEAD
    // Notifications
    CreateClassNotificationRequest,
    UpdateClassNotificationRequest,
    GetClassNotificationsRequest,
    ClassNotificationPagedResponse,
    ToggleClassNotificationRequest,
    ClassNotificationDetailResponse,
=======
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
} from '../types/class';

export const filterClasses = async (data: FilterClassesRequest): Promise<ClassPagedResponse> => {
    const response = await api.post('/api/v1/class/filter', data);
    return response.data;
};

export const createClass = async (data: CreateClassRequest): Promise<ClassDetailResponse> => {
    const response = await api.post('/api/v1/class/create', data);
    return response.data;
};

export const updateClass = async (data: UpdateClassRequest): Promise<ClassDetailResponse> => {
    const response = await api.post('/api/v1/class/update', data);
    return response.data;
};

export const getClassDetailById = async (classId: number): Promise<ClassDetailResponse> => {
    const response = await api.get(`/api/v1/class/detail?id=${classId}`);
    return response.data;
};

<<<<<<< HEAD
// Xóa/Hủy lớp học (POST /api/v1/class/delete?ids=1,2,3)
export const deleteClasses = async (ids: number[]): Promise<{ code: number; message: string; data: null }> => {
    const response = await api.post(`/api/v1/class/delete?ids=${ids.join(',')}`);
    return response.data;
};

// Members
// POST /api/v1/class/get-members-in-class?page=0&size=20
export const getMembersInClass = async (data: GetMembersRequest): Promise<MemberPagedResponse> => {
    const { page = 0, size = 20, ...bodyData } = data;
    const response = await api.post(
        `/api/v1/class/get-members-in-class?page=${page}&size=${size}`,
        bodyData
    );
    return response.data;
};

=======
// NEW: Lấy danh sách học viên trong lớp
export const getMembersInClass = async (data: GetMembersRequest): Promise<MemberPagedResponse> => {
    const response = await api.post('/api/v1/class/get-members-in-class', data);
    return response.data;
};

// NEW: Thêm học viên vào lớp
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
export const addUserToClass = async (data: UpdateMembersRequest): Promise<ClassDetailResponse> => {
    const response = await api.post('/api/v1/class/add-user-to-class', data);
    return response.data;
};

<<<<<<< HEAD
export const removeUserFromClass = async (data: UpdateMembersRequest): Promise<ClassDetailResponse> => {
    const response = await api.post('/api/v1/class/remove-user-from-class', data);
    return response.data;
};

// Notifications
export const createNotificationInClass = async (
    data: CreateClassNotificationRequest
): Promise<ClassNotificationDetailResponse> => {
    const response = await api.post('/api/v1/class/create-notification-in-class', data);
    return response.data;
};

// POST /api/v1/class/get-list-notification-in-class?page=0&size=20
export const getListNotificationInClass = async (
    data: GetClassNotificationsRequest
): Promise<ClassNotificationPagedResponse> => {
    const { page = 0, size = 20, ...bodyData } = data;
    const response = await api.post(
        `/api/v1/class/get-list-notification-in-class?page=${page}&size=${size}`,
        bodyData
    );
    return response.data;
};

export const updateNotificationInClass = async (
    data: UpdateClassNotificationRequest
): Promise<ClassNotificationDetailResponse> => {
    const response = await api.post('/api/v1/class/update-notification-in-class', data);
    return response.data;
};

export const disableOrDeleteNotificationInClass = async (
    data: ToggleClassNotificationRequest
): Promise<ClassNotificationDetailResponse> => {
    const response = await api.post('/api/v1/class/disable-or-delete-notification-in-class', data);
    return response.data;
};

// Cloud upload
export const uploadToCloud = async (file: File): Promise<{ code: number; message: string; data: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/cloud/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
=======
// NEW: Xóa học viên khỏi lớp
export const removeUserFromClass = async (data: UpdateMembersRequest): Promise<ClassDetailResponse> => {
    const response = await api.post('/api/v1/class/remove-user-from-class', data);
    return response.data;
}
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
