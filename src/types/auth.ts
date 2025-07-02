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