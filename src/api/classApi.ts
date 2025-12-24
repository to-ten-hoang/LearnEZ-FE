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
    // Notifications
    CreateClassNotificationRequest,
    UpdateClassNotificationRequest,
    GetClassNotificationsRequest,
    ClassNotificationPagedResponse,
    ToggleClassNotificationRequest,
    ClassNotificationDetailResponse,
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

// Xóa/Hủy lớp học (POST /api/v1/class/delete?ids=1,2,3)
export const deleteClasses = async (
    ids: number[]
): Promise<{ code: number; message: string; data: null }> => {
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

export const addUserToClass = async (data: UpdateMembersRequest): Promise<ClassDetailResponse> => {
    const response = await api.post('/api/v1/class/add-user-to-class', data);
    return response.data;
};

export const removeUserFromClass = async (
    data: UpdateMembersRequest
): Promise<ClassDetailResponse> => {
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
export const uploadToCloud = async (
    file: File
): Promise<{ code: number; message: string; data: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/cloud/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// ==================== Schedule APIs ====================
import type {
    GetSchedulesRequest,
    ClassSchedulePagedResponse,
    ClassScheduleDetailResponse,
    SubmitExerciseRequest,
    UpdateExerciseRequest,
    CancelExerciseRequest,
    SubmitExerciseResponse,
} from '../types/classQuiz';

// POST /api/v1/class/get-schedules-in-class
export const getSchedulesInClass = async (
    data: GetSchedulesRequest
): Promise<ClassSchedulePagedResponse> => {
    const { page = 0, size = 10, ...bodyData } = data;
    const response = await api.post(
        `/api/v1/class/get-schedules-in-class?page=${page}&size=${size}`,
        bodyData
    );
    return response.data;
};

// GET /api/v1/class/get-schedule-detail-in-class
export const getScheduleDetail = async (
    scheduleId: number
): Promise<ClassScheduleDetailResponse> => {
    const response = await api.get(
        `/api/v1/class/get-schedule-detail-in-class?scheduleId=${scheduleId}`
    );
    return response.data;
};

// GET /api/v1/class/get-detail-notification-in-class
export const getNotificationDetail = async (
    notificationId: number
): Promise<ClassNotificationDetailResponse> => {
    const response = await api.get(
        `/api/v1/class/get-detail-notification-in-class?notificationId=${notificationId}`
    );
    return response.data;
};

// ==================== Homework Submission APIs ====================

// POST /api/v1/class/submit-exercise-in-notification
export const submitExercise = async (
    data: SubmitExerciseRequest
): Promise<SubmitExerciseResponse> => {
    const response = await api.post('/api/v1/class/submit-exercise-in-notification', data);
    return response.data;
};

// POST /api/v1/class/update-exercise-in-notification
export const updateExercise = async (
    data: UpdateExerciseRequest
): Promise<SubmitExerciseResponse> => {
    const response = await api.post('/api/v1/class/update-exercise-in-notification', data);
    return response.data;
};

// POST /api/v1/class/disable-or-cancel-exercise-in-notification
export const cancelExercise = async (
    data: CancelExerciseRequest
): Promise<SubmitExerciseResponse> => {
    const response = await api.post(
        '/api/v1/class/disable-or-cancel-exercise-in-notification',
        data
    );
    return response.data;
};

// GET /api/v1/class/get-detail-exercise-in-notification
export const getExerciseDetail = async (submitId: number): Promise<SubmitExerciseResponse> => {
    const response = await api.get(
        `/api/v1/class/get-detail-exercise-in-notification?submitId=${submitId}`
    );
    return response.data;
};
