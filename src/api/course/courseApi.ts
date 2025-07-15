import api from '../../lib/axios';
import type { AllCoursesRequest, CourseResponse, CourseDetailResponse, CourseCreateRequest, CourseUpdateRequest, UploadResponse, CategoryResponse } from '../../types/course';

export const getAllCourses = async (data: AllCoursesRequest): Promise<CourseResponse> => {
  const response = await api.post('/api/v1/course/all-courses', data, {
    params: {
      page: data.page || 0,
      size: data.size || 10,
      sort: data.sort || undefined,
    },
  });
  return response.data;
};

export const getCourseById = async (id: number): Promise<CourseDetailResponse> => {
  const response = await api.post('/api/v1/course/get-courses', { id });
  return response.data;
};

export const createCourse = async (data: CourseCreateRequest): Promise<CourseDetailResponse> => {
  const response = await api.post('/api/v1/course/create', data);
  return response.data;
};

export const updateCourseInfo = async (data: CourseUpdateRequest): Promise<CourseDetailResponse> => {
  const response = await api.post('/api/v1/course/update-info', data);
  return response.data;
};

export const updateCourseStatus = async (data: CourseUpdateRequest): Promise<CourseDetailResponse> => {
  const response = await api.post('/api/v1/course/update-info', data);
  return response.data;
};

export const uploadImage = async (formData: FormData): Promise<UploadResponse> => {
  const response = await api.post('/api/v1/cloud/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getCategories = async (): Promise<CategoryResponse> => {
  const response = await api.get('/api/v1/category/post');
  return response.data;
};