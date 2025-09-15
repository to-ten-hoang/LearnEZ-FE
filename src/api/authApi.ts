import type { UserProfileResponse } from 'types/user';
import api from '../lib/axios';
import type { RegisterRequest, LoginRequest, AuthResponse, LogoutResponse, UpdatePasswordRequest } from '../types/auth';

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


export const updatePassword = async(data: UpdatePasswordRequest): Promise<UserProfileResponse> => {
  const response = await api.post('/api/v1/user/update-own-info', data);
  return response.data;
}