// src/components/manage/ClassManagement/ClassFormModal/ClassFormModal.tsx
import { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import type { Class, CreateClassRequest, UpdateClassRequest } from '../../../../types/class';
import {
    createClassService,
    updateClassService,
} from '../../../../services/classManagementService';
import type { User } from '../../../../types/user';

const { Option } = Select;
const { TextArea } = Input;

interface ClassFormModalProps {
    visible: boolean;
    onClose: (shouldRefresh: boolean) => void;
    initialData: Class | null;
    teachers: User[];
}

const ClassFormModal = ({ visible, onClose, initialData, teachers }: ClassFormModalProps) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialData;

    useEffect(() => {
        if (visible) {
            if (isEditMode) {
                form.setFieldsValue({
                    ...initialData,
                    teacher: initialData.teacher?.id,
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, initialData, form, isEditMode]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (isEditMode) {
                const payload: UpdateClassRequest = {
                    id: initialData.id,
                    ...values,
                };
                await updateClassService(payload);
            } else {
                const payload: CreateClassRequest = {
                    ...values,
                };
                await createClassService(payload);
            }
            onClose(true);
        } catch (error) {
            console.error('Failed to save class:', error);
        }
    };

    return (
        <Modal
            title={isEditMode ? 'Chỉnh sửa Lớp học' : 'Tạo Lớp học mới'}
            open={visible}
            onOk={handleOk}
            onCancel={() => onClose(false)}
            okText="Lưu"
            cancelText="Hủy"
            destroyOnClose
        >
            <Form form={form} layout="vertical" name="classForm">
                <Form.Item
                    name="name"
                    label="Tên lớp học"
                    rules={[{ required: true, message: 'Vui lòng nhập tên lớp học!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="title"
                    label="Tiêu đề"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={4} />
                </Form.Item>
                <Form.Item
                    name="teacher"
                    label="Giáo viên"
                    rules={[{ required: true, message: 'Vui lòng chọn giáo viên!' }]}
                >
                    <Select placeholder="Chọn giáo viên" allowClear>
                        {teachers.map((teacher) => (
                            <Option key={teacher.id} value={teacher.id}>
                                {`${teacher.firstName} ${teacher.lastName}`}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ClassFormModal;
