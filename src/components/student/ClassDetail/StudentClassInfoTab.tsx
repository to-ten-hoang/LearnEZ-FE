import { Descriptions, Tag, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { Class } from '../../../types/class';
import dayjs from 'dayjs';

interface Props {
    classData: Class;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'Đang hoạt động', color: 'green' },
    PENDING: { label: 'Chờ bắt đầu', color: 'orange' },
    COMPLETED: { label: 'Đã kết thúc', color: 'default' },
    CANCELLED: { label: 'Đã hủy', color: 'red' },
    PLANNING: { label: 'Đang lên kế hoạch', color: 'blue' },
};

const StudentClassInfoTab = ({ classData }: Props) => {
    const statusInfo = STATUS_LABELS[classData.status] || { label: classData.status, color: 'default' };

    return (
        <div className="tab-content">
            <div className="info-card">
                <Descriptions
                    column={{ xs: 1, sm: 2 }}
                    labelStyle={{ fontWeight: 500, color: '#666' }}
                    contentStyle={{ color: '#1a1a2e' }}
                >
                    <Descriptions.Item label="Tên lớp">{classData.name}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiêu đề">{classData.title || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Môn học">{classData.subject || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả" span={2}>
                        {classData.description || 'Không có mô tả'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giáo viên">
                        {classData.teacher ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Avatar
                                    size="small"
                                    src={classData.teacher.avatarUrl}
                                    icon={<UserOutlined />}
                                />
                                <span>
                                    {classData.teacher.lastName} {classData.teacher.firstName}
                                </span>
                            </div>
                        ) : (
                            '—'
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(classData.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                </Descriptions>
            </div>
        </div>
    );
};

export default StudentClassInfoTab;
