import api from '../lib/axios';
import type {
    AttendanceRequest,
    UpdateAttendanceRequest,
    OverviewStatisticResponse,
    DetailStatisticResponse,
    AttendanceActionResponse,
} from '../types/attendance';

// Điểm danh học sinh (POST /api/v1/class/attendance)
export const createAttendance = async (
    data: AttendanceRequest[]
): Promise<AttendanceActionResponse> => {
    const response = await api.post('/api/v1/class/attendance', data);
    return response.data;
};

// Sửa điểm danh (POST /api/v1/class/update-attendance)
export const updateAttendance = async (
    data: UpdateAttendanceRequest[]
): Promise<AttendanceActionResponse> => {
    const response = await api.post('/api/v1/class/update-attendance', data);
    return response.data;
};

// Thống kê điểm danh tổng quát (GET /api/v1/class/overview-statistic-attendance)
export const getOverviewStatistic = async (
    classId: number,
    page: number = 0,
    size: number = 20
): Promise<OverviewStatisticResponse> => {
    const response = await api.get('/api/v1/class/overview-statistic-attendance', {
        params: { classId, page, size },
    });
    return response.data;
};

// Thống kê điểm danh chi tiết của một buổi học (GET /api/v1/class/detail-statistic-attendance)
export const getDetailStatistic = async (
    scheduleId: number,
    page: number = 0,
    size: number = 100
): Promise<DetailStatisticResponse> => {
    const response = await api.get('/api/v1/class/detail-statistic-attendance', {
        params: { scheduleId, page, size },
    });
    return response.data;
};
