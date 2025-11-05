// src/api/classApi.ts
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

// NEW: Lấy danh sách học viên trong lớp
export const getMembersInClass = async (data: GetMembersRequest): Promise<MemberPagedResponse> => {
    const response = await api.post('/api/v1/class/get-members-in-class', data);
    return response.data;
};

// NEW: Thêm học viên vào lớp
export const addUserToClass = async (data: UpdateMembersRequest): Promise<ClassDetailResponse> => {
    const response = await api.post('/api/v1/class/add-user-to-class', data);
    return response.data;
};

// NEW: Xóa học viên khỏi lớp
export const removeUserFromClass = async (data: UpdateMembersRequest): Promise<ClassDetailResponse> => {
    const response = await api.post('/api/v1/class/remove-user-from-class', data);
    return response.data;
}