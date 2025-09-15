import { message } from 'antd';
import { filterUsers, disableUser, deleteUser, updateUserInfo, getUserProfile } from '../api/userApi';
import type { FilterRequest, FilterResponse, DisableUserRequest, DisableUserResponse, DeleteUserRequest, DeleteUserResponse, UpdateUserInfoRequest, UpdateUserInfoResponse, UserProfileResponse } from '../types/user';

export const filterUsersService = async (data: FilterRequest): Promise<FilterResponse> => {
  try {
    const response = await filterUsers(data);
    if (response.code === 200) {
      // message.success('Lấy danh sách người dùng thành công!');
      return response;
    }
    throw new Error(response.message || 'Lấy danh sách người dùng thất bại.');
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi lấy danh sách người dùng.');
    throw error;
  }
};

export const disableUserService = async (data: DisableUserRequest): Promise<DisableUserResponse> => {
  try {
    const response = await disableUser(data);
    if (response.code === 200) {
      message.success('Cập nhật trạng thái người dùng thành công!');
      return response;
    }
    throw new Error(response.message || 'Cập nhật trạng thái người dùng thất bại.');
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái người dùng.');
    throw error;
  }
};

export const deleteUserService = async (data: DeleteUserRequest): Promise<DeleteUserResponse> => {
  try {
    const response = await deleteUser(data);
    if (response.code === 200) {
      message.success('Cập nhật trạng thái xóa người dùng thành công!');
      return response;
    }
    throw new Error(response.message || 'Cập nhật trạng thái xóa người dùng thất bại.');
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái xóa người dùng.');
    throw error;
  }
};
export const getUserProfileService = async (): Promise<UserProfileResponse> => {
  try {
    const response = await getUserProfile();
    if (response.code === 200 && response.data) {
      message.success('Lấy thông tin cá nhân thành công');
      return response;
    }
    throw new Error(response.message || 'Lấy thông tin cá nhân thất bại.');
  } catch (error: any) {
    message.error(error.message || 'Đã có lỗi xảy ra khi lấy thông tin cá nhân.');
    throw error;
  }
};

export const updateUserInfoService = async (data: UpdateUserInfoRequest): Promise<UpdateUserInfoResponse> => {
  try {
    const response = await updateUserInfo(data);
    if (response.code === 200) {
      message.success('Cập nhật thông tin người dùng thành công!');
      return response;
    }
    throw new Error(response.message || 'Cập nhật thông tin người dùng thất bại.');
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin người dùng.');
    throw error;
  }
};