// src/types/schedule.ts
export interface Schedule {
  id: number
  clazz: {
    id: number
    name: string
    description: string
    subject: string | null
    title: string
    status: string
    teacher: {
      id: number
      firstName: string
      lastName: string
      phone: string | null
      address: string | null
      dob: string | null
      gender: string | null
      avatarUrl: string | null
      isActive: boolean
      isDelete: boolean
      education: string | null
      major: string | null
      role: string
      code: string
    }
    createdAt: string | null
    updatedAt: string | null
    createdByName: string
    updatedByName: string | null
  }
  title: string
  startAt: string
  endAt: string
  status: string
  isActive: boolean
  isDelete: boolean
  createdAt: string
  updatedAt: string | null
  createdBy: {
    id: number
    firstName: string
    lastName: string
    code: string
  }
  updatedBy: {
    id: number
    firstName: string
    lastName: string
    code: string
  } | null
}

export interface GetSchedulesRequest {
  classId: number[]
  status?: string[]
  teacherId?: number[]
  fromDate?: string | null
  toDate?: string | null
}

export interface GetSchedulesResponse {
  code: number
  message: string
  data: {
    content: Schedule[]
    pageable: {
      pageNumber: number
      pageSize: number
      sort: {
        empty: boolean
        unsorted: boolean
        sorted: boolean
      }
      offset: number
      paged: boolean
      unpaged: boolean
    }
    totalElements: number
    totalPages: number
    last: boolean
    size: number
    number: number
    sort: {
      empty: boolean
      unsorted: boolean
      sorted: boolean
    }
    numberOfElements: number
    first: boolean
    empty: boolean
  }
}

export interface GetScheduleDetailResponse {
  code: number
  message: string
  data: Schedule
}

export interface CreateScheduleRequest {
  title: string
  startAt: string
  endAt: string
  roomId: number
  classId: number
}

export interface UpdateScheduleRequest {
  classScheduleId: number
  title: string
  startAt: string
  endAt: string
  status: number
  isActive: boolean
  isDelete: boolean
  roomId: number
  classId: number
}

export interface CancelScheduleResponse {
  code: number
  message: string
  data: null
}
