import api from '../../lib/axios';
import type { PostData, PostResponse, UploadResponse, AllPostsRequest, AllPostsResponse, UpdateStatusRequest, UpdateStatusResponse } from '../../types/blog';

export const createPost = async (data: PostData): Promise<PostResponse> => {
  const response = await api.post('/api/v1/post/create', data);
  return response.data;
};

export const uploadImage = async (formData: FormData): Promise<UploadResponse> => {
  const response = await api.post('/api/v1/cloud/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAllPosts = async (data: AllPostsRequest): Promise<AllPostsResponse> => {
  const response = await api.post('/api/v1/post/all-posts', data);
  return response.data;
};

export const updatePostStatus = async (data: UpdateStatusRequest): Promise<UpdateStatusResponse> => {
  const response = await api.post('/api/v1/post/update-status', data);
  return response.data;
};