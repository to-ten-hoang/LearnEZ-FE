import api from '../lib/axios';
import type {
    FilterRoomRequest,
    CreateRoomRequest,
    UpdateRoomRequest,
    RoomListResponse,
    RoomDetailResponse,
} from '../types/room';

// Lấy danh sách phòng học (POST /api/v1/room/filter)
export const filterRooms = async (data: FilterRoomRequest = {}): Promise<RoomListResponse> => {
    const response = await api.post('/api/v1/room/filter', {
        searchString: data.searchString || '',
        isActive: data.isActive ?? true,
        isDelete: data.isDelete ?? false,
    });
    return response.data;
};

// Tạo phòng học mới (POST /api/v1/room/create)
export const createRoom = async (data: CreateRoomRequest): Promise<RoomDetailResponse> => {
    const response = await api.post('/api/v1/room/create', data);
    return response.data;
};

// Sửa phòng học (POST /api/v1/room/update)
export const updateRoom = async (data: UpdateRoomRequest): Promise<RoomDetailResponse> => {
    const response = await api.post('/api/v1/room/update', data);
    return response.data;
};
