// Types cho Attendance API

// EAttendanceStatus: Trạng thái điểm danh
export type EAttendanceStatus = 1 | 2 | 3; // 1=Present, 2=Absent, 3=Late

export const ATTENDANCE_STATUS = {
    PRESENT: 1 as EAttendanceStatus,
    ABSENT: 2 as EAttendanceStatus,
    LATE: 3 as EAttendanceStatus,
};

export const ATTENDANCE_STATUS_LABELS: Record<EAttendanceStatus, string> = {
    1: 'Có mặt',
    2: 'Vắng mặt',
    3: 'Đi muộn',
};

export const ATTENDANCE_STATUS_COLORS: Record<EAttendanceStatus, string> = {
    1: '#52c41a', // green
    2: '#ff4d4f', // red
    3: '#faad14', // orange
};

// Request điểm danh học sinh
// Lưu ý: Backend tự động tìm scheduleId khả dụng dựa trên classId
// scheduleId có thể không được sử dụng bởi backend nhưng vẫn nên gửi
export interface AttendanceRequest {
    classId: number;
    scheduleId?: number; // Optional - Backend có thể tự động tìm schedule khả dụng
    studentId: number;
    checkIn?: string; // ISO date string - Thời gian check-in
    attendanceStatus: EAttendanceStatus;
}

// Request sửa điểm danh
export interface UpdateAttendanceRequest {
    attendanceId: number;
    attendanceStatus: EAttendanceStatus;
}

// Thống kê tổng quát theo buổi học
export interface OverviewStatistic {
    scheduleId: number;
    classId: number;
    title: string;
    startAt: string;
    endAt: string;
    present: number;
    absent: number;
    late: number;
}

// Chi tiết điểm danh của học viên
export interface DetailStatistic {
    odSmall: number;
    odMedium: number;
    userId: number;
    classId: number;
    scheduleId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    present: boolean;
    absent: boolean;
    late: boolean;
    checkInDate: string | null;
    attendanceId?: number;
}

// Response cho API thống kê tổng quát
export interface OverviewStatisticResponse {
    code: number;
    message: string;
    data: {
        content: OverviewStatistic[];
        totalPages: number;
        totalElements: number;
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
    };
}

// Response cho API thống kê chi tiết
export interface DetailStatisticResponse {
    code: number;
    message: string;
    data: {
        content: DetailStatistic[];
        totalPages: number;
        totalElements: number;
        pageable: {
            pageNumber: number;
            pageSize: number;
        };
    };
}

// Response cho API điểm danh/cập nhật
export interface AttendanceActionResponse {
    code: number;
    message: string;
    data: any;
}
