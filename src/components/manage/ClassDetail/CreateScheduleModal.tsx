"use client"

// src/components/manage/ClassDetail/CreateScheduleModal.tsx
import { useEffect } from "react"
import { Modal, Form, Input, DatePicker, InputNumber } from "antd"
import dayjs from "dayjs"
import type { CreateScheduleRequest } from "../../../types/schedule"

interface CreateScheduleModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: CreateScheduleRequest) => Promise<void>
  classId: number
  initialDate?: dayjs.Dayjs
}

const CreateScheduleModal = ({ visible, onClose, onSubmit, classId, initialDate }: CreateScheduleModalProps) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      if (initialDate) {
        form.setFieldsValue({
          date: initialDate,
        })
      } else {
        form.resetFields()
      }
    }
  }, [visible, initialDate, form])

  const handleOk = async () => {
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

      const payload: CreateScheduleRequest = {
        title: values.title,
        startAt,
        endAt,
        roomId: values.roomId,
        classId,
      }

      await onSubmit(payload)
      form.resetFields()
      onClose()
    } catch (error) {
      console.error("Failed to create schedule:", error)
    }
  }

  return (
    <Modal
      title="Tạo lịch học mới"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      okText="Tạo"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="createScheduleForm">
        <Form.Item
          name="title"
          label="Tiêu đề buổi học"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="Ví dụ: Buổi học số 1" />
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
          <InputNumber style={{ width: "100%" }} placeholder="Nhập ID phòng học" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateScheduleModal
