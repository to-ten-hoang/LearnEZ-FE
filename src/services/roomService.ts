import { message } from 'antd';
import { filterRooms, createRoom, updateRoom } from '../api/roomApi';
import type {
    FilterRoomRequest,
    CreateRoomRequest,
    UpdateRoomRequest,
    RoomListResponse,
    RoomDetailResponse,
} from '../types/room';

// Lấy danh sách phòng học
export const filterRoomsService = async (
    data: FilterRoomRequest = {}
): Promise<RoomListResponse> => {
    try {
        const response = await filterRooms(data);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy danh sách phòng học thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy danh sách phòng học.');
        throw error;
    }
};

// Tạo phòng học mới
export const createRoomService = async (
    data: CreateRoomRequest
): Promise<RoomDetailResponse> => {
    try {
        const response = await createRoom(data);
        if (response.code === 200) {
            message.success('Tạo phòng học thành công!');
            return response;
        }
        throw new Error(response.message || 'Tạo phòng học thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi tạo phòng học.');
        throw error;
    }
};

// Sửa phòng học
export const updateRoomService = async (
    data: UpdateRoomRequest
): Promise<RoomDetailResponse> => {
    try {
        const response = await updateRoom(data);
        if (response.code === 200) {
            message.success('Cập nhật phòng học thành công!');
            return response;
        }
        throw new Error(response.message || 'Cập nhật phòng học thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật phòng học.');
        throw error;
    }
};
