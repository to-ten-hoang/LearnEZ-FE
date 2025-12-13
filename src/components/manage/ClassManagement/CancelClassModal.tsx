// src/components/manage/ClassManagement/CancelClassModal/CancelClassModal.tsx
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { cancelClassService } from '../../../services/classManagementService';
import type { Class } from '../../../types/class';

interface CancelClassModalProps {
    visible: boolean;
    onClose: (shouldRefresh: boolean) => void;
    classData: Class | null;
}

const CancelClassModal = ({ visible, onClose, classData }: CancelClassModalProps) => {
    if (!classData) return null;

    const handleConfirm = async () => {
        try {
            await cancelClassService(classData.id);
            onClose(true);
        } catch (error) {
            console.error('Failed to cancel class:', error);
            onClose(false);
        }
    };

    return (
        <Modal
            title={
                <>
                    <ExclamationCircleOutlined style={{ color: 'red', marginRight: 8 }} />
                    Xác nhận hủy lớp học
                </>
            }
            open={visible}
            onOk={handleConfirm}
            onCancel={() => onClose(false)}
            okText="Xác nhận"
            cancelText="Hủy"
            okType="danger"
        >
            <p>
                Bạn có chắc chắn muốn hủy lớp học <strong>"{classData.name}"</strong> không? Hành
                động này sẽ chuyển trạng thái của lớp học sang CANCELED.
            </p>
        </Modal>
    );
};

export default CancelClassModal;
