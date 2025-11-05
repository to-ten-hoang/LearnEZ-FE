// src/types/class.ts
import type { User } from './user';

// Định nghĩa các trạng thái của lớp học để sử dụng nhất quán
export const CLASS_STATUSES = ['PENDING', 'ACTIVE', 'FINISHED', 'CANCELED'] as const;
export type ClassStatus = (typeof CLASS_STATUSES)[number];

export interface Class {
    id: number;
    name: string;
    description: string;
    subject: string | null;
    title: string;
    teacher: User;
    createdAt: string;
    updatedAt: string | null;
    createdByName: string | null;
    updatedByName: string | null;
    status: ClassStatus;
    memberIds?: number[];
}

export interface FilterClassesRequest {
    searchString?: string;
    idTeacher?: number;
    statusClass?: ClassStatus[];
    fromDate?: string | null;
    toDate?: string | null;
    page?: number;
    size?: number;
}

export interface CreateClassRequest {
    name: string;
    description: string;
    title: string;
    teacher: number;
    memberIds?: number[];
    // status: ClassStatus;
}

export interface UpdateClassRequest extends Partial<Omit<CreateClassRequest, 'teacher'>> {
    id: number;
    teacher?: number;
}

// Response cho API lấy danh sách (đã phân trang)
export interface ClassPagedResponse {
    code: number;
    message: string;
    data: {
        content: Class[];
        totalPages: number;
        totalElements: number;
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
    };
}

// Response cho API tạo/sửa/chi tiết
export interface ClassDetailResponse {
    code: number;
    message: string;
    data: Class;
}

export interface ClassMember {
  // id người dùng trong hệ thống
  id: number;
  name: string;
  joinDate: string;
  email: string;
  phone: string | null;
  // memberId: id bản ghi quan hệ thành viên-trong-lớp (dùng cho API xóa)
  memberId: number;
  address: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  roleInClass: 'STUDENT' | 'TEACHER';
}
// Request body để lấy danh sách thành viên
export interface GetMembersRequest {
    classId: number;
    searchString?: string;
    joinDate?: string | null;
    status?: string[];
    page?: number;
    size?: number;
}

// Request body để thêm hoặc xóa thành viên
export interface UpdateMembersRequest {
    id: number; // classId
    memberIds: number[];
}


// Response API cho danh sách thành viên (có phân trang)
export interface MemberPagedResponse {
    code: number;
    message: string;
    data: {
        content: ClassMember[];
        totalPages: number;
        totalElements: number;
        pageable: {
            pageNumber: number;
            pageSize: number;
        }
    };
}