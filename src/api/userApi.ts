import api from '../lib/axios';
import type { FilterRequest, FilterResponse, DisableUserRequest, DisableUserResponse, DeleteUserRequest, DeleteUserResponse, UserProfileResponse, UpdateUserInfoRequest, UpdateUserInfoResponse } from '../types/user';

export const filterUsers = async (data: FilterRequest): Promise<FilterResponse> => {
  const response = await api.post('/api/v1/user/filter', data, {
    params: {
      page: data.page || 0,
      size: data.size || 10,
      sort: data.sort || undefined,
    },
  });
  return response.data;
};

export const disableUser = async (data: DisableUserRequest): Promise<DisableUserResponse> => {
  const response = await api.post('/api/v1/user/disable-user', data);
  return response.data;
};

export const deleteUser = async (data: DeleteUserRequest): Promise<DeleteUserResponse> => {
  const response = await api.post('/api/v1/user/delete-user', data);
  return response.data;
};

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await api.get('/api/v1/user');
  return response.data;
};

export const updateUserInfo = async (data: UpdateUserInfoRequest): Promise<UpdateUserInfoResponse> => {
  const response = await api.post('/api/v1/user/update-own-info', data);
  return response.data;
};