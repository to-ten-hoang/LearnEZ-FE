// UPDATE / NEW CONTENT: API layer cho Lesson
import api from '../lib/axios';
import type {
  LessonCreateRequest,
  LessonUpdateInfoRequest,
  LessonStatusUpdateRequest,
  LessonQueryRequest,
  ApiResponse,
  PaginatedLessonResponse,
  Lesson
} from '../types/lesson';

// Helper chuẩn hóa lesson (map attachDocumentLessons -> documentUrls)
const mapLesson = (lesson: any): Lesson => {
  return {
    ...lesson,
    documentUrls: Array.isArray(lesson.attachDocumentLessons)
      ? lesson.attachDocumentLessons.map((d: any) => d.url)
      : []
  };
};

export const createLessonApi = async (
  data: LessonCreateRequest
): Promise<ApiResponse<Lesson>> => {
  const res = await api.post('/api/v1/lesson/create', data);
  res.data.data = mapLesson(res.data.data);
  return res.data;
};

export const updateLessonInfoApi = async (
  data: LessonUpdateInfoRequest
): Promise<ApiResponse<Lesson>> => {
  const res = await api.post('/api/v1/lesson/update-info', data);
  res.data.data = mapLesson(res.data.data);
  return res.data;
};

export const updateLessonStatusApi = async (
  data: LessonStatusUpdateRequest
): Promise<ApiResponse<Lesson>> => {
  const res = await api.post('/api/v1/lesson/update-status', data);
  res.data.data = mapLesson(res.data.data);
  return res.data;
};

interface LessonListParams {
  page?: number;
  size?: number;
  sort?: string; // ví dụ: orderIndex,asc
}

const postList = async (
  endpoint: string,
  body: LessonQueryRequest,
  params: LessonListParams
): Promise<ApiResponse<PaginatedLessonResponse>> => {
  const res = await api.post(endpoint, body, {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort
    }
  });
  const mapped = {
    ...res.data.data,
    content: res.data.data.content.map((l: any) => mapLesson(l))
  };
  return { ...res.data, data: mapped };
};

export const getLessonsApi = async (
  body: LessonQueryRequest,
  params: LessonListParams
): Promise<ApiResponse<PaginatedLessonResponse>> => {
  return postList('/api/v1/lesson/get-lessons', body, params);
};

export const getOwnLessonsApi = async (
  body: LessonQueryRequest,
  params: LessonListParams
): Promise<ApiResponse<PaginatedLessonResponse>> => {
  return postList('/api/v1/lesson/get-own-lessons', body, params);
};

export const getAllLessonsApi = async (
  body: LessonQueryRequest,
  params: LessonListParams
): Promise<ApiResponse<PaginatedLessonResponse>> => {
  return postList('/api/v1/lesson/get-all-lessons', body, params);
};

export const getLessonByIdApi = async (id: number): Promise<ApiResponse<Lesson>> => {
  const res = await api.get('/api/v1/lesson', { params: { id } });
  res.data.data = mapLesson(res.data.data);
  return res.data;
};