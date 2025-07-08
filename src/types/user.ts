export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  gender: string;
  avatarUrl: string;
  isActive: boolean;
  isDelete: boolean;
  education: string;
  major: string;
  role: string;
  student?: {
    education: string;
    major: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterRequest {
  searchString?: string;
  email?: string;
  name?: string;
  phone?: string;
  isActive?: boolean;
  isDelete?: boolean;
  userRoles?: string[] | null;
  fromDate?: string;
  toDate?: string;
  title?: string;
  categoryPost?: string[];
  categories?: string[];
  page?: number;
  size?: number;
  sort?: string | null;
}

export interface FilterResponse {
  code: number;
  message: string;
  data: {
    totalPages: number;
    totalElements: number;
    size: number;
    content: User[];
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    pageable: {
      offset: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      unpaged: boolean;
      paged: boolean;
      pageNumber: number;
      pageSize: number;
    };
    first: boolean;
    last: boolean;
    empty: boolean;
  };
}

export interface DisableUserRequest {
  id: number;
  isActive: boolean;
}

export interface DisableUserResponse {
  code: number;
  message: string;
  data: User;
}

export interface DeleteUserRequest {
  id: number;
  isDelete: boolean;
  isActive: boolean;
}

export interface DeleteUserResponse {
  code: number;
  message: string;
  data: User;
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

export interface UpdateUserInfoRequest {
  // id: number;
  // email?: string;
  // password?: string;
  // oldPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  avatarUrl?: string;
  education?: string;
  major?: string;
  isActive?: boolean;
  isDelete?: boolean;
  token?: string;
}

export interface UpdateUserInfoResponse {
  code: number;
  message: string;
  data: User;
}