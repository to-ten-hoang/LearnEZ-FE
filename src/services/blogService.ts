import { message } from 'antd';
import {
    createPost,
    uploadImage,
    getAllPosts,
    updatePostStatus,
    getCategories,
    getPublicPosts,
    updatePostInfo,
} from '../api/blogApi';
import type {
    PostData,
    PostResponse,
    UploadResponse,
    AllPostsRequest,
    AllPostsResponse,
    UpdateStatusRequest,
    UpdateStatusResponse,
    CategoryResponse,
    UpdatePostInfoRequest,
} from '../types/blog';

export const createPostService = async (data: PostData): Promise<PostResponse> => {
    try {
        const response = await createPost(data);
        if (response.code === 200) {
            message.success('Đăng bài thành công!');
            return response;
        }
        throw new Error(response.message || 'Đăng bài thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi đăng bài.');
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

export const getAllPostsService = async (data: AllPostsRequest): Promise<AllPostsResponse> => {
    try {
        const response = await getAllPosts(data);
        // console.log('data',data);

        if (response.code === 200) {
            message.success('Lấy danh sách bài đăng thành công!');
            return response;
        }
        throw new Error(response.message || 'Lấy danh sách bài đăng thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy danh sách bài đăng.');
        throw error;
    }
};

export const updatePostStatusService = async (
    data: UpdateStatusRequest
): Promise<UpdateStatusResponse> => {
    try {
        const response = await updatePostStatus(data);
        if (response.code === 200) {
            message.success('Cập nhật trạng thái bài đăng thành công!');
            return response;
        }
        throw new Error(response.message || 'Cập nhật trạng thái bài đăng thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái bài đăng.');
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

// Service mới cho trang Blog public - không hiện message thành công
export const getPublicPostsService = async (data: AllPostsRequest): Promise<AllPostsResponse> => {
    try {
        const response = await getPublicPosts(data);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy danh sách bài đăng thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy danh sách bài đăng.');
        throw error;
    }
};

// Service chỉnh sửa thông tin bài viết
export const updatePostInfoService = async (data: UpdatePostInfoRequest): Promise<PostResponse> => {
    try {
        const response = await updatePostInfo(data);
        if (response.code === 200) {
            message.success('Cập nhật bài viết thành công!');
            return response;
        }
        throw new Error(response.message || 'Cập nhật bài viết thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật bài viết.');
        throw error;
    }
};
