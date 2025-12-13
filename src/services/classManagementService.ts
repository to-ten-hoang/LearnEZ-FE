import { message } from 'antd';
import {
    filterClasses,
    createClass,
    updateClass,
    getClassDetailById,
    deleteClasses,
    getMembersInClass,
    addUserToClass,
    removeUserFromClass,
    // Notifications
    createNotificationInClass,
    getListNotificationInClass,
    updateNotificationInClass,
    disableOrDeleteNotificationInClass,
    uploadToCloud,
} from '../api/classApi';
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

export const filterClassesService = async (
    data: FilterClassesRequest
): Promise<ClassPagedResponse> => {
    try {
        const response = await filterClasses(data);
        if (response.code !== 200) {
            throw new Error(response.message || 'Lấy danh sách lớp học thất bại.');
        }
        return response;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi lấy danh sách lớp học.');
        throw error;
    }
};

export const createClassService = async (data: CreateClassRequest): Promise<ClassDetailResponse> => {
    try {
        const response = await createClass(data);
        if (response.code !== 200) {
            throw new Error(response.message || 'Tạo lớp học thất bại.');
        }
        message.success('Tạo lớp học thành công!');
        return response;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi tạo lớp học.');
        throw error;
    }
};

export const updateClassService = async (data: UpdateClassRequest): Promise<ClassDetailResponse> => {
    try {
        const response = await updateClass(data);
        if (response.code !== 200) {
            throw new Error(response.message || 'Cập nhật lớp học thất bại.');
        }
        message.success('Cập nhật lớp học thành công!');
        return response;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi cập nhật.');
        throw error;
    }
};

// Hủy/Xóa lớp học - sử dụng API /delete?ids=
export const deleteClassesService = async (ids: number[]): Promise<{ code: number; message: string; data: null }> => {
    try {
        const response = await deleteClasses(ids);
        if (response.code !== 200) {
            throw new Error(response.message || 'Hủy lớp học thất bại.');
        }
        message.success('Hủy lớp học thành công!');
        return response;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi hủy lớp học.');
        throw error;
    }
};

// Alias cho tương thích ngược
export const cancelClassService = async (classId: number): Promise<{ code: number; message: string; data: null }> => {
    return deleteClassesService([classId]);
};

export const getClassByIdService = async (classId: number): Promise<ClassDetailResponse> => {
    try {
        const response = await getClassDetailById(classId);
        if (response.code !== 200) {
            throw new Error(response.message || 'Lấy thông tin lớp học thất bại.');
        }
        return response;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi lấy thông tin lớp học.');
        throw error;
    }
};

// Members
export const getMembersInClassService = async (data: GetMembersRequest): Promise<MemberPagedResponse> => {
    try {
        const response = await getMembersInClass(data);
        if (response.code !== 200) throw new Error(response.message || 'Lấy danh sách học viên thất bại.');
        return response;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi lấy danh sách học viên.');
        throw error;
    }
};

export const addUsersToClassService = async (data: UpdateMembersRequest): Promise<ClassDetailResponse> => {
    try {
        const response = await addUserToClass(data);
        if (response.code !== 200) throw new Error(response.message || 'Thêm học viên thất bại.');
        message.success('Đã thêm học viên vào lớp.');
        return response;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi thêm học viên.');
        throw error;
    }
};

export const removeUsersFromClassService = async (data: UpdateMembersRequest): Promise<ClassDetailResponse> => {
    try {
        const response = await removeUserFromClass(data);
        if (response.code !== 200) throw new Error(response.message || 'Xóa học viên thất bại.');
        message.success('Đã xóa học viên khỏi lớp.');
        return response;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi xóa học viên.');
        throw error;
    }
};

// Notifications
export const createClassNotificationService = async (
    data: CreateClassNotificationRequest
): Promise<ClassNotificationDetailResponse> => {
    try {
        const res = await createNotificationInClass(data);
        if (res.code !== 200) throw new Error(res.message || 'Tạo thông báo thất bại.');
        message.success('Đã tạo thông báo.');
        return res;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi tạo thông báo.');
        throw error;
    }
};

export const getClassNotificationsService = async (
    data: GetClassNotificationsRequest
): Promise<ClassNotificationPagedResponse> => {
    try {
        const res = await getListNotificationInClass(data);
        if (res.code !== 200) throw new Error(res.message || 'Lấy danh sách thông báo thất bại.');
        return res;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy danh sách thông báo.');
        throw error;
    }
};

export const updateClassNotificationService = async (
    data: UpdateClassNotificationRequest
): Promise<ClassNotificationDetailResponse> => {
    try {
        const res = await updateNotificationInClass(data);
        if (res.code !== 200) throw new Error(res.message || 'Cập nhật thông báo thất bại.');
        message.success('Đã cập nhật thông báo.');
        return res;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật thông báo.');
        throw error;
    }
};

export const toggleActiveOrDeleteClassNotificationService = async (
    data: ToggleClassNotificationRequest
): Promise<ClassNotificationDetailResponse> => {
    try {
        const res = await disableOrDeleteNotificationInClass(data);
        if (res.code !== 200) throw new Error(res.message || 'Thao tác thất bại.');
        message.success('Đã cập nhật trạng thái thông báo.');
        return res;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái thông báo.');
        throw error;
    }
};

// Cloud upload
export const uploadFileToCloudService = async (file: File): Promise<string> => {
    try {
        const res = await uploadToCloud(file);
        if (res.code !== 200) throw new Error(res.message || 'Upload thất bại.');
        return res.data;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi upload tệp.');
        throw error;
    }
};