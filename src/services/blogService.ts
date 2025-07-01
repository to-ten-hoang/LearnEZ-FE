import api from '../lib/axios';
import { message } from 'antd';
import type { PostData, PostResponse, UploadResponse, AllPostsRequest, AllPostsResponse, UpdateStatusRequest, UpdateStatusResponse } from 'types';

export const createPost = async (data: PostData): Promise<PostResponse> => {
  try {
    const response = await api.post('/api/v1/post/create', data);
    return response.data;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi đăng bài.');
    throw error;
  }
};

export const uploadImage = async (formData: FormData): Promise<UploadResponse> => {
  try {
    const response = await api.post('/api/v1/cloud/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi tải ảnh.');
    throw error;
  }
};

export const getAllPosts = async (data: AllPostsRequest): Promise<AllPostsResponse> => {
  try {
    const response = await api.post('/api/v1/post/all-posts', data);
    return response.data;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi lấy danh sách bài đăng.');
    throw error;
  }
};

// Hàm để cập nhật trạng thái bài đăng (nếu có API duyệt bài)
export const updatePostStatus = async (data: UpdateStatusRequest): Promise<UpdateStatusResponse> => {
  try {
    const response = await api.post('/api/v1/post/update-status', data);
    return response.data;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái bài đăng.');
    throw error;
  }
};