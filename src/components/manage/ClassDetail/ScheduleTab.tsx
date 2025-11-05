"use client"

// src/components/manage/ClassDetail/ScheduleTab.tsx
import { useState, useEffect, useCallback } from "react"
import { Card, Calendar, Badge, Button, Space, Spin } from "antd"
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons"
import dayjs, { type Dayjs } from "dayjs"
import type { Class } from "../../../types/class"
import type { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from "../../../types/schedule"
import {
  getSchedulesService,
  createSchedulesService,
  updateScheduleService,
  cancelScheduleService,
} from "../../../services/scheduleService"
import CreateScheduleModal from "./CreateScheduleModal"
import CreateRecurringScheduleModal from "./CreateRecurringScheduleModal"
import ScheduleDetailModal from "./ScheduleDetailModal"

interface ScheduleTabProps {
  classData: Class
}

const ScheduleTab = ({ classData }: ScheduleTabProps) => {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)

  // Modal states
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isRecurringModalVisible, setIsRecurringModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getSchedulesService({
        classId: [classData.id],
        status: [],
        teacherId: [],
        fromDate: null,
        toDate: null,
      })
      setSchedules(response.data.content)
    } catch (error) {
      console.error("Failed to fetch schedules:", error)
    } finally {
      setLoading(false)
    }
  }, [classData.id])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  // Lấy danh sách lịch học theo ngày
  const getSchedulesForDate = (date: Dayjs): Schedule[] => {
    return schedules.filter((schedule) => dayjs(schedule.startAt).isSame(date, "day"))
  }

  // Render nội dung của mỗi ô ngày trong calendar
  const dateCellRender = (value: Dayjs) => {
    const daySchedules = getSchedulesForDate(value)
    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {daySchedules.map((schedule) => (
          <li key={schedule.id} style={{ marginBottom: 4 }}>
            <Badge
              status={schedule.status === "ACTIVE" ? "success" : "default"}
              text={
                <span
                  style={{
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleScheduleClick(schedule)
                  }}
                >
                  {dayjs(schedule.startAt).format("HH:mm")} - {schedule.title}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    )
  }

  // Xử lý khi click vào một ngày
  const handleDateSelect = (date: Dayjs) => {
    const daySchedules = getSchedulesForDate(date)
    if (daySchedules.length === 0) {
      // Nếu ngày chưa có lịch học, mở modal tạo mới
      setSelectedDate(date)
      setIsCreateModalVisible(true)
    }
  }

  // Xử lý khi click vào một buổi học
  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsDetailModalVisible(true)
  }

  // Xử lý tạo lịch học đơn lẻ
  const handleCreateSchedule = async (data: CreateScheduleRequest) => {
    await createSchedulesService([data])
    await fetchSchedules()
  }

  // Xử lý tạo lịch học hàng tuần
  const handleCreateRecurringSchedules = async (data: CreateScheduleRequest[]) => {
    await createSchedulesService(data)
    await fetchSchedules()
  }

  // Xử lý cập nhật lịch học
  const handleUpdateSchedule = async (data: UpdateScheduleRequest) => {
    await updateScheduleService(data)
    await fetchSchedules()
  }

  // Xử lý hủy lịch học
  const handleCancelSchedule = async (scheduleId: number) => {
    await cancelScheduleService([scheduleId])
    await fetchSchedules()
  }

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedDate(null)
            setIsCreateModalVisible(true)
          }}
        >
          Tạo lịch học
        </Button>
        <Button type="default" icon={<CalendarOutlined />} onClick={() => setIsRecurringModalVisible(true)}>
          Tạo lịch học hàng tuần
        </Button>
      </Space>

      <Spin spinning={loading}>
        <Calendar dateCellRender={dateCellRender} onSelect={handleDateSelect} />
      </Spin>

      {/* Modal tạo lịch học đơn lẻ */}
      <CreateScheduleModal
        visible={isCreateModalVisible}
        onClose={() => {
          setIsCreateModalVisible(false)
          setSelectedDate(null)
        }}
        onSubmit={handleCreateSchedule}
        classId={classData.id}
        initialDate={selectedDate || undefined}
      />

      {/* Modal tạo lịch học hàng tuần */}
      <CreateRecurringScheduleModal
        visible={isRecurringModalVisible}
        onClose={() => setIsRecurringModalVisible(false)}
        onSubmit={handleCreateRecurringSchedules}
        classId={classData.id}
      />

      {/* Modal xem chi tiết và chỉnh sửa */}
      <ScheduleDetailModal
        visible={isDetailModalVisible}
        onClose={() => {
          setIsDetailModalVisible(false)
          setSelectedSchedule(null)
        }}
        schedule={selectedSchedule}
        onUpdate={handleUpdateSchedule}
        onCancel={handleCancelSchedule}
      />
    </Card>
  )
}

export default ScheduleTab
