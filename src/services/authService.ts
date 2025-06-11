import { message } from 'antd';
import { login as loginApi, register as registerApi, logout as logoutApi, refreshToken as refreshTokenApi, getUserProfile as getUserProfileApi } from '../apis/authApi';
import useAuthStore from '../store/authStore';

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

// interface UserProfileResponse {
//   code: number;
//   message: string;
//   data: {
//     firstName: string;
//     lastName: string;
//     phone: string | null;
//     address: string | null;
//     dob: string | null;
//     gender: string | null;
//     avatarUrl: string | null;
//     isActive: boolean | null;
//     isDelete: boolean | null;
//     education: string | null;
//     major: string | null;
//     student: any | null;
//   };
// }

const roleMapping: { [key: number]: 'student' | 'teacher' | 'manager' | 'consultant' } = {
  1: 'manager',
  2: 'consultant',
  3: 'teacher',
  4: 'student',
};

export const register = async (data: RegisterRequest) => {
  try {
    const response = await registerApi(data);
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

export const login = async (data: LoginRequest) => {
  try {
    const response = await loginApi(data);
    if (response.code === 200 && response.data) {
      const { token, role } = response.data;
      const userRole = roleMapping[role] || 'student';
      useAuthStore.getState().login({
        id: '', // ID không được trả về từ API, có thể cần thêm vào API
        name: data.email.split('@')[0],
        email: data.email,
        password: data.password,
        role: userRole,
      });
      useAuthStore.getState().setToken(token);
      message.success('Đăng nhập thành công!');
      return response;
    }
    throw new Error(response.message || 'Đăng nhập thất bại.');
  } catch (error: any) {
    message.error(error.message || 'Đã có lỗi xảy ra khi đăng nhập.');
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await logoutApi();
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

export const refreshToken = async () => {
  try {
    const response = await refreshTokenApi();
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

export const getUserProfile = async () => {
  try{
    const response = await getUserProfileApi();
    if(response.code === 202 && response.data){
      message.success('Lấy thông tin cá nhân thành công');
      return response.data;
    }
    throw new Error(response.message || 'Lấy thông tin cá nhân thất bại.');
  } catch(error:any){
    message.error(error.message || 'Đã có lỗi xảy ra khi lấy thông tin cá nhân.');
    throw error;
  }

}