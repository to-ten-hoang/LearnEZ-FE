"use client"

// src/components/manage/ClassDetail/ScheduleDetailModal.tsx
import { useEffect, useState } from "react"
import { Modal, Form, Input, DatePicker, InputNumber, Descriptions, Button, Space } from "antd"
import dayjs from "dayjs"
import type { Schedule, UpdateScheduleRequest } from "../../../types/schedule"

interface ScheduleDetailModalProps {
  visible: boolean
  onClose: () => void
  schedule: Schedule | null
  onUpdate: (data: UpdateScheduleRequest) => Promise<void>
  onCancel: (scheduleId: number) => Promise<void>
}

const ScheduleDetailModal = ({ visible, onClose, schedule, onUpdate, onCancel }: ScheduleDetailModalProps) => {
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (visible && schedule) {
      setIsEditing(false)
      form.setFieldsValue({
        title: schedule.title,
        date: dayjs(schedule.startAt),
        startTime: dayjs(schedule.startAt),
        endTime: dayjs(schedule.endAt),
        roomId: 1, // Giả sử roomId mặc định là 1, bạn cần lấy từ API nếu có
      })
    }
  }, [visible, schedule, form])

  const handleUpdate = async () => {
    if (!schedule) return

    try {
      const values = await form.validateFields()
      const startAt = dayjs(values.date)
        .hour(values.startTime.hour())
        .minute(values.startTime.minute())
        .format("YYYY-MM-DD HH:mm:ss")
      const endAt = dayjs(values.date)
        .hour(values.endTime.hour())
        .minute(values.endTime.minute())
        .format("YYYY-MM-DD HH:mm:ss")

      const payload: UpdateScheduleRequest = {
        classScheduleId: schedule.id,
        title: values.title,
        startAt,
        endAt,
        status: 1,
        isActive: true,
        isDelete: false,
        roomId: values.roomId,
        classId: schedule.clazz.id,
      }

      await onUpdate(payload)
      setIsEditing(false)
      onClose()
    } catch (error) {
      console.error("Failed to update schedule:", error)
    }
  }

  const handleCancelSchedule = async () => {
    if (!schedule) return

    Modal.confirm({
      title: "Xác nhận hủy buổi học",
      content: `Bạn có chắc chắn muốn hủy buổi học "${schedule.title}" không?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        await onCancel(schedule.id)
        onClose()
      },
    })
  }

  if (!schedule) return null

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa lịch học" : "Chi tiết lịch học"}
      open={visible}
      onCancel={onClose}
      footer={
        isEditing ? (
          <Space>
            <Button onClick={() => setIsEditing(false)}>Hủy chỉnh sửa</Button>
            <Button type="primary" onClick={handleUpdate}>
              Lưu thay đổi
            </Button>
          </Space>
        ) : (
          <Space>
            <Button danger onClick={handleCancelSchedule}>
              Hủy buổi học
            </Button>
            <Button type="primary" onClick={() => setIsEditing(true)}>
              Chỉnh sửa
            </Button>
            <Button onClick={onClose}>Đóng</Button>
          </Space>
        )
      }
      destroyOnClose
      width={600}
    >
      {!isEditing ? (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Tiêu đề">{schedule.title}</Descriptions.Item>
          <Descriptions.Item label="Ngày học">{dayjs(schedule.startAt).format("DD/MM/YYYY")}</Descriptions.Item>
          <Descriptions.Item label="Giờ bắt đầu">{dayjs(schedule.startAt).format("HH:mm")}</Descriptions.Item>
          <Descriptions.Item label="Giờ kết thúc">{dayjs(schedule.endAt).format("HH:mm")}</Descriptions.Item>
          <Descriptions.Item label="Giáo viên">
            {`${schedule.clazz.teacher.firstName} ${schedule.clazz.teacher.lastName}`}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{schedule.status}</Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {`${schedule.createdBy.firstName} ${schedule.createdBy.lastName}`}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">{dayjs(schedule.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical" name="updateScheduleForm">
          <Form.Item
            name="title"
            label="Tiêu đề buổi học"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="date" label="Ngày học" rules={[{ required: true, message: "Vui lòng chọn ngày học!" }]}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="startTime"
            label="Giờ bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu!" }]}
          >
            <DatePicker.TimePicker style={{ width: "100%" }} format="HH:mm" minuteStep={15} />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="Giờ kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc!" }]}
          >
            <DatePicker.TimePicker style={{ width: "100%" }} format="HH:mm" minuteStep={15} />
          </Form.Item>

          <Form.Item name="roomId" label="Phòng học" rules={[{ required: true, message: "Vui lòng nhập phòng học!" }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}

export default ScheduleDetailModal
