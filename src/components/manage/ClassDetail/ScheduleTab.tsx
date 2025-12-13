"use client"

// src/components/manage/ClassDetail/ScheduleTab.tsx
import { useState, useEffect, useCallback } from "react"
<<<<<<< HEAD
import { Card, Calendar, Badge, Button, Space, Spin, Tag, Tooltip, Empty } from "antd"
import { PlusOutlined, CalendarOutlined, ReloadOutlined } from "@ant-design/icons"
=======
import { Card, Calendar, Badge, Button, Space, Spin } from "antd"
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons"
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
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
<<<<<<< HEAD
import "./ScheduleTab.css"
=======
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665

interface ScheduleTabProps {
  classData: Class
}

<<<<<<< HEAD
// Status config cho schedule
const SCHEDULE_STATUS: Record<string, { color: string; badgeStatus: "success" | "error" | "default" | "processing" | "warning"; label: string }> = {
  ACTIVE: { color: "green", badgeStatus: "success", label: "Đang hoạt động" },
  CANCELLED: { color: "red", badgeStatus: "error", label: "Đã hủy" },
  CANCELED: { color: "red", badgeStatus: "error", label: "Đã hủy" },
}

=======
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
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
<<<<<<< HEAD
    if (daySchedules.length === 0) return null

    return (
      <div className="schedule-cell">
        {daySchedules.slice(0, 3).map((schedule) => {
          const status = SCHEDULE_STATUS[schedule.status] || SCHEDULE_STATUS.ACTIVE
          return (
            <Tooltip
              key={schedule.id}
              title={`${schedule.title} - ${dayjs(schedule.startAt).format("HH:mm")} đến ${dayjs(schedule.endAt).format("HH:mm")}`}
            >
              <div
                className={`schedule-item ${schedule.status === 'CANCELLED' || schedule.status === 'CANCELED' ? 'cancelled' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleScheduleClick(schedule)
                }}
              >
                <Badge status={status.badgeStatus} />
                <span className="schedule-time">{dayjs(schedule.startAt).format("HH:mm")}</span>
                <span className="schedule-title">{schedule.title}</span>
              </div>
            </Tooltip>
          )
        })}
        {daySchedules.length > 3 && (
          <Tag className="more-tag">+{daySchedules.length - 3} buổi</Tag>
        )}
      </div>
=======
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
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
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

<<<<<<< HEAD
  // Thống kê nhanh
  const totalSchedules = schedules.length
  const activeSchedules = schedules.filter(s => s.status === 'ACTIVE').length
  const cancelledSchedules = schedules.filter(s => s.status === 'CANCELLED' || s.status === 'CANCELED').length

  return (
    <Card className="schedule-tab-card">
      <div className="schedule-header">
        <Space wrap>
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
          <Button
            type="default"
            icon={<CalendarOutlined />}
            onClick={() => setIsRecurringModalVisible(true)}
          >
            Tạo lịch hàng tuần
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchSchedules}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>

        <div className="schedule-stats">
          <Tag color="blue">Tổng: {totalSchedules}</Tag>
          <Tag color="green">Hoạt động: {activeSchedules}</Tag>
          <Tag color="red">Đã hủy: {cancelledSchedules}</Tag>
        </div>
      </div>

      <Spin spinning={loading}>
        {schedules.length > 0 ? (
          <Calendar
            cellRender={(current, info) => {
              if (info.type === 'date') return dateCellRender(current)
              return info.originNode
            }}
            onSelect={handleDateSelect}
          />
        ) : (
          <Empty
            description="Chưa có lịch học nào"
            style={{ padding: '60px 0' }}
          >
            <Button type="primary" onClick={() => setIsCreateModalVisible(true)}>
              Tạo lịch học đầu tiên
            </Button>
          </Empty>
        )}
=======
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
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
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
