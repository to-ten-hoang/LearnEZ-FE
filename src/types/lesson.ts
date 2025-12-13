// NEW FILE: types dành riêng cho Lesson (nếu bạn chưa có)
// Nếu đã có lesson.ts thì bổ sung / điều chỉnh các interface dưới đây.
export interface AttachDocumentLesson {
  id?: number;
  url: string;
  fileType?: string | null;
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  orderIndex: number;
  isPreviewAble: boolean;
  courseId: number | null;
  isBought: boolean;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdByName?: string | null;
  updatedByName?: string | null;
  attachDocumentLessons?: AttachDocumentLesson[] | null;
  documentUrls?: string[]; // tiện cho form (map từ attachDocumentLessons)
}

export interface LessonCreateRequest {
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  orderIndex: number;
  isPreviewAble: boolean;
  courseId: number;
  isActive: boolean;
  isDelete: boolean;
  documentUrls: string[];
}

export interface LessonUpdateInfoRequest {
  id: number;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  orderIndex: number;
  isPreviewAble: boolean;
  courseId: number;
  isActive: boolean;
  isDelete: boolean;
  documentUrls: string[];
}

export interface LessonStatusUpdateRequest {
  id: number;
  isActive?: boolean;
  isDelete?: boolean;
}

export interface LessonQueryRequest {
  id: number; // courseId
  title?: string | null;
  categories?: string[];
  fromDate?: string | null;
  toDate?: string | null;
}

export interface PaginatedLessonResponse {
  content: Lesson[];
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}