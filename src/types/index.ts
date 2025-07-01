// types/index.ts
export interface PostData {
  title: string;
  content: string;
  themeUrl: string;
  categoryId: number;
}

export interface PostResponse {
  code: number;
  message: string;
  data: any; // Có thể thay đổi tùy theo dữ liệu trả về từ API createPost
}

export interface UploadResponse {
  code: number;
  message: string;
  data: string; // URL của ảnh đã upload
}

export interface AllPostsRequest {
  fromDate: string | null;
  toDate: string | null;
  title: string | null;
  categoryPost: number[];
}

export interface Post {
  id: number;
  title: string;
  content: string;
  themeUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  isDelete: boolean;
  isOwn: boolean | null;
  category: string;
  author: any | null;
}

export interface AllPostsResponse {
  code: number;
  message: string;
  data: {
    content: Post[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      offset: number;
      unpaged: boolean;
      paged: boolean;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
}

export interface UpdateStatusRequest {
  id: number;
  isActive: boolean;
  isDelete?: boolean;
}

export interface UpdateStatusResponse {
  code: number;
  message: string;
  data: any; 
}