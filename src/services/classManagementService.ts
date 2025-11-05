// src/services/classManagementService.ts
import { message } from 'antd';
import { filterClasses, createClass, updateClass, getClassDetailById, addUserToClass, removeUserFromClass, getMembersInClass } from '../api/classApi';
import type {
    FilterClassesRequest,
    CreateClassRequest,
    UpdateClassRequest,
    ClassPagedResponse,
    ClassDetailResponse,
    UpdateMembersRequest,
    GetMembersRequest,
    MemberPagedResponse,
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
        message.error(
            error.response?.data?.message || 'Đã có lỗi xảy ra khi lấy danh sách lớp học.'
        );
        throw error;
    }
};

export const createClassService = async (
    data: CreateClassRequest
): Promise<ClassDetailResponse> => {
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

export const updateClassService = async (
    data: UpdateClassRequest
): Promise<ClassDetailResponse> => {
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

// Service riêng cho việc hủy lớp học để code rõ ràng hơn
export const cancelClassService = async (classId: number): Promise<ClassDetailResponse> => {
    try {
        const data: UpdateClassRequest = { id: classId };
        const response = await updateClass(data);
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

export const getClassByIdService = async (classId: number): Promise<ClassDetailResponse> => {
    try {
        const response = await getClassDetailById(classId);
        if (response.code !== 200) {
            throw new Error(response.message || 'Lấy thông tin lớp học thất bại.');
        }
        return response;
    } catch (error: any) {
        message.error(
            error.response?.data?.message || 'Đã có lỗi xảy ra khi lấy thông tin lớp học.'
        );
        throw error;
    }
};

// NEW: Lấy danh sách học viên trong lớp (có phân trang)
export const getMembersInClassService = async (
    data: GetMembersRequest
): Promise<MemberPagedResponse> => {
    try {
        const response = await getMembersInClass(data);
        if (response.code !== 200) {
            throw new Error(response.message || 'Lấy danh sách học viên thất bại.');
        }
        return response;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi lấy danh sách học viên.');
        throw error;
    }
};

// NEW: Thêm học viên vào lớp
export const addUsersToClassService = async (
    data: UpdateMembersRequest
): Promise<ClassDetailResponse> => {
    try {
        const response = await addUserToClass(data);
        if (response.code !== 200) {
            throw new Error(response.message || 'Thêm học viên thất bại.');
        }
        message.success('Đã thêm học viên vào lớp.');
        return response;
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi thêm học viên.');
        throw error;
    }
};

// NEW: Xóa học viên khỏi lớp
export const removeUsersFromClassService = async (
  data: UpdateMembersRequest // CHÚ Ý: memberIds ở đây là danh sách memberId (id bản ghi quan hệ trong lớp), KHÔNG phải user id
): Promise<ClassDetailResponse> => {
  try {
    const response = await removeUserFromClass(data);
    if (response.code !== 200) {
      throw new Error(response.message || 'Xóa học viên thất bại.');
    }
    message.success('Đã xóa học viên khỏi lớp.');
    return response;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Đã có lỗi xảy ra khi xóa học viên.');
    throw error;
  }
};