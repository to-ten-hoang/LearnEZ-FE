// UPDATE / NEW CONTENT: Service layer cho Lesson (handle message & error)
import { message } from 'antd';
import type {
  LessonCreateRequest,
  LessonUpdateInfoRequest,
  LessonStatusUpdateRequest,
  LessonQueryRequest,
  PaginatedLessonResponse,
  Lesson,
  ApiResponse
} from '../types/lesson';
import {
  createLessonApi,
  updateLessonInfoApi,
  updateLessonStatusApi,
  getLessonsApi,
  getAllLessonsApi,
  getOwnLessonsApi,
  getLessonByIdApi
} from '../api/lessonApi';

export const createLessonService = async (
  data: LessonCreateRequest
): Promise<ApiResponse<Lesson>> => {
  try {
    const res = await createLessonApi(data);
    if (res.code === 200) {
      message.success('Tạo bài học thành công!');
      return res;
    }
    throw new Error(res.message || 'Tạo bài học thất bại.');
  } catch (err: any) {
    message.error(err.response?.data?.message || 'Lỗi khi tạo bài học.');
    throw err;
  }
};

export const updateLessonInfoService = async (
  data: LessonUpdateInfoRequest
): Promise<ApiResponse<Lesson>> => {
  try {
    const res = await updateLessonInfoApi(data);
    if (res.code === 200) {
      message.success('Cập nhật bài học thành công!');
      return res;
    }
    throw new Error(res.message || 'Cập nhật bài học thất bại.');
  } catch (err: any) {
    message.error(err.response?.data?.message || 'Lỗi khi cập nhật bài học.');
    throw err;
  }
};

export const updateLessonStatusService = async (
  data: LessonStatusUpdateRequest
): Promise<ApiResponse<Lesson>> => {
  try {
    const res = await updateLessonStatusApi(data);
    if (res.code === 200) {
      message.success('Cập nhật trạng thái bài học thành công!');
      return res;
    }
    throw new Error(res.message || 'Cập nhật trạng thái thất bại.');
  } catch (err: any) {
    message.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái bài học.');
    throw err;
  }
};

interface GetLessonsParams {
  page?: number;
  size?: number;
  sort?: string;
  mode?: 'public' | 'own' | 'all';
}

export const getLessonsService = async (
  body: LessonQueryRequest,
  params: GetLessonsParams
): Promise<ApiResponse<PaginatedLessonResponse>> => {
  try {
    let res: ApiResponse<PaginatedLessonResponse>;
    switch (params.mode) {
      case 'own':
        res = await getOwnLessonsApi(body, params);
        break;
      case 'all':
        res = await getAllLessonsApi(body, params);
        break;
      default:
        res = await getLessonsApi(body, params);
    }
    if (res.code === 200) {
      return res;
    }
    throw new Error(res.message || 'Lấy danh sách bài học thất bại.');
  } catch (err: any) {
    message.error(err.response?.data?.message || 'Lỗi khi lấy danh sách bài học.');
    throw err;
  }
};

export const getLessonByIdService = async (id: number): Promise<ApiResponse<Lesson>> => {
  try {
    const res = await getLessonByIdApi(id);
    if (res.code === 200) {
      return res;
    }
    throw new Error(res.message || 'Lấy chi tiết bài học thất bại.');
  } catch (err: any) {
    message.error(err.response?.data?.message || 'Lỗi khi lấy chi tiết bài học.');
    throw err;
  }
};