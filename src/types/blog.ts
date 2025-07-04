export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  message: string;
  data: {
    token: string;
    authenticated: boolean;
    role: number;
  } | null;
}

export interface LogoutResponse {
  code: number;
  message: string;
  data: null;
}

export interface UserProfileResponse {
  code: number;
  message: string;
  data: {
    firstName: string;
    lastName: string;
    phone: string | null;
    address: string | null;
    dob: string | null;
    gender: string | null;
    avatarUrl: string | null;
    isActive: boolean | null;
    isDelete: boolean | null;
    education: string | null;
    major: string | null;
    student: any | null;
  };
}

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
  page?: number; // Số trang, bắt đầu từ 0
  size?: number; // Số phần tử mỗi trang
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
  isActive?: boolean;
  isDelete?: boolean;
}

export interface UpdateStatusResponse {
  code: number;
  message: string;
  data: any;
}