// services/courseManagementService.ts - Cải thiện
import { message } from 'antd';
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourseInfo,
    updateCourseStatus,
    uploadImage,
    getCategories,
    getOwnCourses,
} from '../api/courseApi';
import type {
    AllCoursesRequest,
    CourseResponse,
    CourseDetailResponse,
    CourseCreateRequest,
    CourseUpdateRequest,
    CourseStatusUpdateRequest, // ✅ Thêm type mới
    UploadResponse,
    CategoryResponse,
} from '../types/course';

export const getAllCoursesService = async (
    data: AllCoursesRequest,
    role: string | undefined
): Promise<CourseResponse> => {
    try {
        const response = role === 'manager' ? await getAllCourses(data) : await getOwnCourses(data);

        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy danh sách khóa học thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy danh sách khóa học.');
        throw error;
    }
};

// ✅ Thêm service để lấy danh sách giáo viên
export const getTeachersService = async () => {
    try {
        // Sử dụng API filter user để lấy danh sách giáo viên
        const { filterUsersService } = await import('./userService');
        const response = await filterUsersService({
            userRoles: ['TEACHER'],
            isActive: true,
            isDelete: false,
            page: 0,
            size: 100,
        });

        if (response.code === 200) {
            return response.data.content;
        }
        return [];
    } catch (error: any) {
        console.error('Lỗi khi lấy danh sách giáo viên:', error);
        return [];
    }
};

export const getCourseByIdService = async (id: number): Promise<CourseDetailResponse> => {
    try {
        const response = await getCourseById(id);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy chi tiết khóa học thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy chi tiết khóa học.');
        throw error;
    }
};

export const createCourseService = async (
    data: CourseCreateRequest
): Promise<CourseDetailResponse> => {
    try {
        const response = await createCourse(data);
        if (response.code === 200) {
            message.success('Tạo khóa học thành công!');
            return response;
        }
        throw new Error(response.message || 'Tạo khóa học thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi tạo khóa học.');
        throw error;
    }
};

export const updateCourseInfoService = async (
    data: CourseUpdateRequest
): Promise<CourseDetailResponse> => {
    try {
        const response = await updateCourseInfo(data);
        if (response.code === 200) {
            message.success('Cập nhật khóa học thành công!');
            return response;
        }
        throw new Error(response.message || 'Cập nhật khóa học thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật khóa học.');
        throw error;
    }
};

// ✅ Tách riêng service cho update status
export const updateCourseStatusService = async (
    data: CourseStatusUpdateRequest
): Promise<CourseDetailResponse> => {
    try {
        const response = await updateCourseStatus(data);
        if (response.code === 200) {
            message.success('Cập nhật trạng thái khóa học thành công!');
            return response;
        }
        throw new Error(response.message || 'Cập nhật trạng thái khóa học thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái khóa học.');
        throw error;
    }
};

export const uploadImageService = async (formData: FormData): Promise<UploadResponse> => {
    try {
        const response = await uploadImage(formData);
        if (response.code === 200) {
            message.success('Tải ảnh thành công!');
            return response;
        }
        throw new Error(response.message || 'Tải ảnh thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi tải ảnh.');
        throw error;
    }
};

export const getCategoriesService = async (): Promise<CategoryResponse> => {
    try {
        const response = await getCategories();
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy danh sách danh mục thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy danh sách danh mục.');
        throw error;
    }
};
