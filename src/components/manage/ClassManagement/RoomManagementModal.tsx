import { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Button, Space, Form, Input, Switch, Spin, Tag } from 'antd';
import { PlusOutlined, EditOutlined, HomeOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { Room, CreateRoomRequest, UpdateRoomRequest } from '../../../types/room';
import { filterRoomsService, createRoomService, updateRoomService } from '../../../services/roomService';
import './RoomManagementModal.css';

interface RoomManagementModalProps {
    visible: boolean;
    onClose: () => void;
}

const RoomManagementModal = ({ visible, onClose }: RoomManagementModalProps) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [form] = Form.useForm();

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        try {
            const response = await filterRoomsService({
                isActive: null, // Lấy tất cả
                isDelete: false,
            });
            setRooms(response.data);
        } catch (error) {
            console.error('Lỗi lấy danh sách phòng:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            fetchRooms();
        }
    }, [visible, fetchRooms]);

    const handleAddNew = () => {
        setIsAddMode(true);
        setEditingRoom(null);
        form.resetFields();
    };

    const handleEdit = (room: Room) => {
        setEditingRoom(room);
        setIsAddMode(false);
        form.setFieldsValue({
            name: room.name,
            description: room.description || '',
            isActive: room.isActive === true || room.isActive === 'true',
        });
    };

    const handleCancelEdit = () => {
        setEditingRoom(null);
        setIsAddMode(false);
        form.resetFields();
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            if (isAddMode) {
                // Tạo mới
                const createData: CreateRoomRequest = {
                    name: values.name,
                    description: values.description || '',
                };
                await createRoomService(createData);
            } else if (editingRoom) {
                // Cập nhật
                const updateData: UpdateRoomRequest = {
                    id: editingRoom.id,
                    name: values.name,
                    description: values.description || '',
                    isActive: values.isActive,
                    isDelete: false,
                };
                await updateRoomService(updateData);
            }

            setEditingRoom(null);
            setIsAddMode(false);
            form.resetFields();
            fetchRooms();
        } catch (error) {
            console.error('Lỗi lưu phòng học:', error);
        } finally {
            setSaving(false);
        }
    };

    // handleDeactivate đã được tích hợp vào handleSave

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên phòng',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span className="room-name">{text}</span>,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => text || <span className="text-muted">Chưa có mô tả</span>,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            render: (_: any, record: Room) => {
                const isActive = record.isActive === true || record.isActive === 'true';
                return isActive ? (
                    <Tag color="success">Hoạt động</Tag>
                ) : (
                    <Tag color="default">Không hoạt động</Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            render: (_: any, record: Room) => (
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                    disabled={editingRoom?.id === record.id || isAddMode}
                >
                    Sửa
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title={
                <Space>
                    <HomeOutlined />
                    <span>Quản lý phòng học</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width={800}
            footer={null}
            className="room-management-modal"
        >
            <div className="modal-toolbar">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddNew}
                    disabled={isAddMode || !!editingRoom}
                >
                    Thêm phòng mới
                </Button>
            </div>

            {/* Form thêm/sửa */}
            {(isAddMode || editingRoom) && (
                <div className="room-form-container">
                    <Form form={form} layout="inline" className="room-form">
                        <Form.Item
                            name="name"
                            rules={[{ required: true, message: 'Nhập tên phòng!' }]}
                        >
                            <Input placeholder="Tên phòng" style={{ width: 180 }} />
                        </Form.Item>
                        <Form.Item name="description">
                            <Input placeholder="Mô tả (tùy chọn)" style={{ width: 250 }} />
                        </Form.Item>
                        {editingRoom && (
                            <Form.Item name="isActive" valuePropName="checked" label="Hoạt động">
                                <Switch />
                            </Form.Item>
                        )}
                        <Form.Item>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSave}
                                    loading={saving}
                                >
                                    {isAddMode ? 'Thêm' : 'Lưu'}
                                </Button>
                                <Button
                                    icon={<CloseOutlined />}
                                    onClick={handleCancelEdit}
                                >
                                    Hủy
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </div>
            )}

            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={rooms}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    scroll={{ y: 350 }}
                    rowClassName={(record) =>
                        editingRoom?.id === record.id ? 'row-editing' : ''
                    }
                />
            </Spin>
        </Modal>
    );
};

export default RoomManagementModal;
