"use client"

// src/components/manage/ClassDetail/CreateScheduleModal.tsx
<<<<<<< HEAD
import { useEffect, useState } from "react"
import { Modal, Form, Input, DatePicker, Select, Spin } from "antd"
import dayjs from "dayjs"
import type { CreateScheduleRequest } from "../../../types/schedule"
import type { Room } from "../../../types/room"
import { filterRoomsService } from "../../../services/roomService"
=======
import { useEffect } from "react"
import { Modal, Form, Input, DatePicker, InputNumber } from "antd"
import dayjs from "dayjs"
import type { CreateScheduleRequest } from "../../../types/schedule"
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665

interface CreateScheduleModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: CreateScheduleRequest) => Promise<void>
  classId: number
  initialDate?: dayjs.Dayjs
}

const CreateScheduleModal = ({ visible, onClose, onSubmit, classId, initialDate }: CreateScheduleModalProps) => {
  const [form] = Form.useForm()
<<<<<<< HEAD
  const [rooms, setRooms] = useState<Room[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)

  // Fetch danh sách phòng học khi modal mở
  useEffect(() => {
    if (visible) {
      const fetchRooms = async () => {
        setLoadingRooms(true)
        try {
          const response = await filterRoomsService({ isActive: true, isDelete: false })
          setRooms(response.data)
        } catch (error) {
          console.error("Failed to fetch rooms:", error)
        } finally {
          setLoadingRooms(false)
        }
      }
      fetchRooms()
    }
  }, [visible])
=======
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665

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

<<<<<<< HEAD
        <Form.Item name="roomId" label="Phòng học" rules={[{ required: true, message: "Vui lòng chọn phòng học!" }]}>
          <Select
            placeholder="Chọn phòng học"
            loading={loadingRooms}
            notFoundContent={loadingRooms ? <Spin size="small" /> : "Không có phòng học"}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {rooms.map((room) => (
              <Select.Option key={room.id} value={room.id}>
                {room.name} {room.description ? `- ${room.description}` : ''}
              </Select.Option>
            ))}
          </Select>
=======
        <Form.Item name="roomId" label="Phòng học" rules={[{ required: true, message: "Vui lòng nhập phòng học!" }]}>
          <InputNumber style={{ width: "100%" }} placeholder="Nhập ID phòng học" />
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateScheduleModal
