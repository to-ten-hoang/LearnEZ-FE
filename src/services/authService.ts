import { message } from 'antd';
import { login, register, logout, refreshToken, updatePassword } from '../api/auth/authApi';
import useAuthStore from '../store/authStore';
import type { RegisterRequest, LoginRequest, AuthResponse, LogoutResponse, UpdatePasswordRequest } from '../types/auth';
import type { UserProfileResponse } from 'types/user';
import { getUserProfile } from '../api/user/userApi';

const roleMapping: { [key: number]: 'student' | 'teacher' | 'manager' | 'consultant' } = {
  1: 'manager',
  2: 'consultant',
  3: 'teacher',
  4: 'student',
};

export const registerService = async (data: RegisterRequest): Promise<LogoutResponse> => {
  try {
    const response = await register(data);
    if (response.code === 200) {
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      return response;
    }
    throw new Error(response.message || 'Đăng ký thất bại.');
  } catch (error: any) {
    message.error(error.message || 'Đã có lỗi xảy ra khi đăng ký.');
    throw error;
  }
};

export const loginService = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await login(data);
    if (response.code === 200 && response.data) {
      const { token, role } = response.data;
      useAuthStore.getState().setToken(token);
      const userProfile = await getUserProfile();
      const userRole = roleMapping[role] || 'student';
      useAuthStore.getState().login({
        id: '',
        firstName: userProfile.data.firstName || '',
        lastName: userProfile.data.lastName || '',
        email: data.email,
        password: data.password,
        role: userRole,
      });
      message.success('Đăng nhập thành công!');
      return response;
    }
    throw new Error(response.message || 'Đăng nhập thất bại.');
  } catch (error: any) {
    message.error(error.message || 'Đã có lỗi xảy ra khi đăng nhập.');
    throw error;
  }
};

export const logoutService = async (): Promise<LogoutResponse> => {
  try {
    const response = await logout();
    if (response.code === 200) {
      useAuthStore.getState().logout();
      message.success('Đăng xuất thành công!');
      return response;
    }
    throw new Error(response.message || 'Đăng xuất thất bại.');
  } catch (error: any) {
    message.error(error.message || 'Đã có lỗi xảy ra khi đăng xuất.');
    throw error;
  }
};

export const refreshTokenService = async (): Promise<AuthResponse> => {
  try {
    const response = await refreshToken();
    if (response.code === 200 && response.data) {
      const { token } = response.data;
      useAuthStore.getState().setToken(token);
      return response;
    }
    throw new Error(response.message || 'Không thể làm mới token.');
  } catch (error: any) {
    message.error(error.message || 'Đã có lỗi xảy ra khi làm mới token.');
    throw error;
  }
};

export const updatePasswordService = async(data: UpdatePasswordRequest) : Promise<UserProfileResponse> => {
  try{
    const response = await updatePassword(data);
    if(response.code === 200 && response.data){
      message.success('Đổi mật khẩu thành công');
      return response;
    }
    throw new Error(response.message || 'Đổi mật khẩu thất bại.');
  }catch(error: any) {
    message.error(error.message || 'Đã có lỗi xảy ra khi đổi mật khẩu.');
    throw error;
  }
}