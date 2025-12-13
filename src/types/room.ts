// Types cho Room API

// Interface cho phòng học
export interface Room {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean | string; // API trả về string "true"/"false"
    isDelete: boolean | string;
    createdAt: string;
    updatedAt: string | null;
}

// Request lọc danh sách phòng
export interface FilterRoomRequest {
    searchString?: string;
    isActive?: boolean | null;
    isDelete?: boolean | null;
}

// Request tạo phòng mới
export interface CreateRoomRequest {
    name: string;
    description?: string;
}

// Request sửa phòng
export interface UpdateRoomRequest {
    id: number;
    name?: string;
    description?: string;
    isActive?: boolean;
    isDelete?: boolean;
}

// Response cho API filter (trả về array trực tiếp)
export interface RoomListResponse {
    code: number;
    message: string;
    data: Room[];
}

// Response cho API create/update
export interface RoomDetailResponse {
    code: number;
    message: string;
    data: Room;
}
