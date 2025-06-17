import api from '../../lib/axios';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: number;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  code: number;
  message: string;
  data: {
    token: string;
    authenticated: boolean;
    role: number;
  } | null;
}

interface LogoutResponse {
  code: number;
  message: string;
  data: null;
}

interface UserProfileResponse {
  code: number;
  message: string;
  data: {
    // id: string;
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

export const register = async (data: RegisterRequest): Promise<LogoutResponse> => {
  const response = await api.post('/api/v1/auth/register', data);
  return response.data;
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post('/api/v1/auth/login', data);
  return response.data;
};

export const logout = async (): Promise<LogoutResponse> => {
  const response = await api.get('/api/v1/auth/logout');
  return response.data;
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await api.get('/api/v1/auth/refresh');
  return response.data;
};

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await api.get('/api/v1/user');
  return response.data;
};