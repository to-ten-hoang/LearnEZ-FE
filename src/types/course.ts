export interface AllCoursesRequest {
  fromDate: string | null;
  toDate: string | null;
  title: string | null;
  categories: string[];
  page?: number;
  size?: number;
  sort?: string | null;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  categoryName: string | null;
  updatedAt: string | null;
  createdAt: string;
  isDelete: boolean;
  isActive: boolean;
  isBought: boolean | null;
  authorName: string | null;
  createdByName: string | null;
  updatedByName: string | null;
  author: any | null;
  createdBy: any | null;
  updatedBy: any | null;
  lessons: any | null;
}

export interface CourseResponse {
  code: number;
  message: string;
  data: {
    content: Course[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
}

export interface CourseDetailResponse {
  code: number;
  message: string;
  data: Course;
}

export interface CourseCreateRequest {
  title: string;
  description: string;
  price: number;
  authorId: number;
  categoryId: number;
  thumbnailUrl: string;
  isActive: boolean;
  isDelete: boolean;
}

export interface CourseUpdateRequest {
  id: number;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  thumbnailUrl: string;
  isActive: boolean;
  isDelete: boolean;
}

export interface UploadResponse {
  code: number;
  message: string;
  data: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface CategoryResponse {
  code: number;
  message: string;
  data: Category[];
}