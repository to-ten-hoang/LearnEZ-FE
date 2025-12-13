import { message } from 'antd';
import {
    createAttendance,
    updateAttendance,
    getOverviewStatistic,
    getDetailStatistic,
} from '../api/attendanceApi';
import type {
    AttendanceRequest,
    UpdateAttendanceRequest,
    OverviewStatisticResponse,
    DetailStatisticResponse,
    AttendanceActionResponse,
} from '../types/attendance';

// Điểm danh học sinh
export const createAttendanceService = async (
    data: AttendanceRequest[]
): Promise<AttendanceActionResponse> => {
    try {
        const response = await createAttendance(data);
        if (response.code === 200) {
            message.success('Điểm danh thành công!');
            return response;
        }
        throw new Error(response.message || 'Điểm danh thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi điểm danh.');
        throw error;
    }
};

// Sửa điểm danh
export const updateAttendanceService = async (
    data: UpdateAttendanceRequest[]
): Promise<AttendanceActionResponse> => {
    try {
        const response = await updateAttendance(data);
        if (response.code === 200) {
            message.success('Cập nhật điểm danh thành công!');
            return response;
        }
        throw new Error(response.message || 'Cập nhật điểm danh thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi cập nhật điểm danh.');
        throw error;
    }
};

// Lấy thống kê tổng quát
export const getOverviewStatisticService = async (
    classId: number,
    page: number = 0,
    size: number = 20
): Promise<OverviewStatisticResponse> => {
    try {
        const response = await getOverviewStatistic(classId, page, size);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy thống kê điểm danh thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy thống kê điểm danh.');
        throw error;
    }
};

// Lấy thống kê chi tiết buổi học
export const getDetailStatisticService = async (
    scheduleId: number,
    page: number = 0,
    size: number = 100
): Promise<DetailStatisticResponse> => {
    try {
        const response = await getDetailStatistic(scheduleId, page, size);
        if (response.code === 200) {
            return response;
        }
        throw new Error(response.message || 'Lấy chi tiết điểm danh thất bại.');
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Lỗi khi lấy chi tiết điểm danh.');
        throw error;
    }
};
