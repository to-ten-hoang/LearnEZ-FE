// src/services/scheduleService.ts
import { message } from "antd"
import {
  getSchedulesInClass,
  getScheduleDetail,
  createSchedules,
  updateSchedule,
  cancelSchedule,
} from "../api/scheduleApi"
import type {
  GetSchedulesRequest,
  GetSchedulesResponse,
  GetScheduleDetailResponse,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from "../types/schedule"

export const getSchedulesService = async (data: GetSchedulesRequest): Promise<GetSchedulesResponse> => {
  try {
    const response = await getSchedulesInClass(data)
    if (response.code !== 200) {
      throw new Error(response.message || "Lấy danh sách lịch học thất bại.")
    }
    return response
  } catch (error: any) {
    message.error(error.response?.data?.message || "Đã có lỗi xảy ra khi lấy danh sách lịch học.")
    throw error
  }
}

export const getScheduleDetailService = async (scheduleId: number): Promise<GetScheduleDetailResponse> => {
  try {
    const response = await getScheduleDetail(scheduleId)
    if (response.code !== 200) {
      throw new Error(response.message || "Lấy chi tiết lịch học thất bại.")
    }
    return response
  } catch (error: any) {
    message.error(error.response?.data?.message || "Đã có lỗi xảy ra khi lấy chi tiết lịch học.")
    throw error
  }
}

export const createSchedulesService = async (data: CreateScheduleRequest[]): Promise<GetSchedulesResponse> => {
  try {
    const response = await createSchedules(data)
    if (response.code !== 200) {
      throw new Error(response.message || "Tạo lịch học thất bại.")
    }
    message.success("Tạo lịch học thành công!")
    return response
  } catch (error: any) {
    message.error(error.response?.data?.message || "Đã có lỗi xảy ra khi tạo lịch học.")
    throw error
  }
}

export const updateScheduleService = async (data: UpdateScheduleRequest): Promise<GetScheduleDetailResponse> => {
  try {
    const response = await updateSchedule(data)
    if (response.code !== 200) {
      throw new Error(response.message || "Cập nhật lịch học thất bại.")
    }
    message.success("Cập nhật lịch học thành công!")
    return response
  } catch (error: any) {
    message.error(error.response?.data?.message || "Đã có lỗi xảy ra khi cập nhật lịch học.")
    throw error
  }
}

export const cancelScheduleService = async (ids: number[]): Promise<void> => {
  try {
    const response = await cancelSchedule(ids)
    if (response.code !== 200) {
      throw new Error(response.message || "Hủy lịch học thất bại.")
    }
    message.success("Hủy lịch học thành công!")
  } catch (error: any) {
    message.error(error.response?.data?.message || "Đã có lỗi xảy ra khi hủy lịch học.")
    throw error
  }
}
