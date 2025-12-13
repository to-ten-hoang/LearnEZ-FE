"use client"

// src/components/manage/ClassDetail/CreateRecurringScheduleModal.tsx
<<<<<<< HEAD
import { useEffect, useState } from "react"
import { Modal, Form, Input, DatePicker, Select, Spin } from "antd"
import dayjs from "dayjs"
import type { CreateScheduleRequest } from "../../../types/schedule"
import type { Room } from "../../../types/room"
import { filterRoomsService } from "../../../services/roomService"
=======
import { useEffect } from "react"
import { Modal, Form, Input, DatePicker, InputNumber, Select } from "antd"
import dayjs from "dayjs"
import type { CreateScheduleRequest } from "../../../types/schedule"
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665

const { RangePicker } = DatePicker
const { Option } = Select

interface CreateRecurringScheduleModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: CreateScheduleRequest[]) => Promise<void>
  classId: number
}

const WEEKDAYS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ nhật" },
]

const CreateRecurringScheduleModal = ({ visible, onClose, onSubmit, classId }: CreateRecurringScheduleModalProps) => {
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
      form.resetFields()
    }
  }, [visible, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const [startDate, endDate] = values.dateRange
      const weekdays: number[] = values.weekdays

      const schedules: CreateScheduleRequest[] = []
<<<<<<< HEAD
      let currentDate = dayjs(startDate)
=======
      const currentDate = dayjs(startDate)
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
      let sessionNumber = 1

      while (currentDate.isBefore(endDate, "day") || currentDate.isSame(endDate, "day")) {
        const dayOfWeek = currentDate.day()
        if (weekdays.includes(dayOfWeek)) {
          const startAt = dayjs(currentDate)
            .hour(values.startTime.hour())
            .minute(values.startTime.minute())
            .format("YYYY-MM-DD HH:mm:ss")
          const endAt = dayjs(currentDate)
            .hour(values.endTime.hour())
            .minute(values.endTime.minute())
            .format("YYYY-MM-DD HH:mm:ss")

          schedules.push({
            title: `${values.titlePrefix} ${sessionNumber}`,
            startAt,
            endAt,
            roomId: values.roomId,
            classId,
          })
          sessionNumber++
        }
<<<<<<< HEAD
        currentDate = currentDate.add(1, "day")
=======
        currentDate.add(1, "day")
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
      }

      if (schedules.length === 0) {
        Modal.warning({
          title: "Không có buổi học nào được tạo",
          content: "Vui lòng kiểm tra lại khoảng thời gian và các ngày trong tuần đã chọn.",
        })
        return
      }

      await onSubmit(schedules)
      form.resetFields()
      onClose()
    } catch (error) {
      console.error("Failed to create recurring schedules:", error)
    }
  }

  return (
    <Modal
      title="Tạo lịch học hàng tuần"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      okText="Tạo"
      cancelText="Hủy"
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" name="createRecurringScheduleForm">
        <Form.Item
          name="titlePrefix"
          label="Tiền tố tiêu đề"
          rules={[{ required: true, message: "Vui lòng nhập tiền tố tiêu đề!" }]}
          tooltip="Ví dụ: 'Buổi học số' sẽ tạo ra 'Buổi học số 1', 'Buổi học số 2', ..."
        >
          <Input placeholder="Ví dụ: Buổi học số" />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Khoảng thời gian"
          rules={[{ required: true, message: "Vui lòng chọn khoảng thời gian!" }]}
        >
          <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="weekdays"
          label="Các ngày trong tuần"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất một ngày trong tuần!" }]}
        >
          <Select mode="multiple" placeholder="Chọn các ngày học trong tuần">
            {WEEKDAYS.map((day) => (
              <Option key={day.value} value={day.value}>
                {day.label}
              </Option>
            ))}
          </Select>
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
              <Option key={room.id} value={room.id}>
                {room.name} {room.description ? `- ${room.description}` : ''}
              </Option>
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

export default CreateRecurringScheduleModal
