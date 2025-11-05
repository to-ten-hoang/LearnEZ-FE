// src/api/scheduleApi.ts
import axiosInstance from "../lib/axios"
import type {
  GetSchedulesRequest,
  GetSchedulesResponse,
  GetScheduleDetailResponse,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  CancelScheduleResponse,
} from "../types/schedule"

export const getSchedulesInClass = async (data: GetSchedulesRequest): Promise<GetSchedulesResponse> => {
  const response = await axiosInstance.post("api/v1/class/get-schedules-in-class", data)
  return response.data
}

export const getScheduleDetail = async (scheduleId: number): Promise<GetScheduleDetailResponse> => {
  const response = await axiosInstance.get(`api/v1/class/get-schedule-detail-in-class?scheduleId=${scheduleId}`)
  return response.data
}

export const createSchedules = async (data: CreateScheduleRequest[]): Promise<GetSchedulesResponse> => {
  const response = await axiosInstance.post("api/v1/class/create-schedule-in-class", data)
  return response.data
}

export const updateSchedule = async (data: UpdateScheduleRequest): Promise<GetScheduleDetailResponse> => {
  const response = await axiosInstance.post("api/v1/class/update-schedule-in-class", data)
  return response.data
}

export const cancelSchedule = async (ids: number[]): Promise<CancelScheduleResponse> => {
  const response = await axiosInstance.post(`api/v1/class/cancelled-schedule-in-class?ids=${ids.join(",")}`)
  return response.data
}
