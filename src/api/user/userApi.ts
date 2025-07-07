import api from '../../lib/axios';
import type { FilterRequest, FilterResponse, DisableUserRequest, DisableUserResponse, DeleteUserRequest, DeleteUserResponse } from '../../types/user';

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