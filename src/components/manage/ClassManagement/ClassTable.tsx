// src/components/manage/ClassManagement/ClassTable/ClassTable.tsx
import { Table, Button, Space, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { EditOutlined, StopOutlined, EyeOutlined } from '@ant-design/icons';
import type { Class } from '../../../types/class';
import { Link } from 'react-router-dom';

interface ClassTableProps {
    data: Class[];
    loading: boolean;
    pagination: any;
    onTableChange: (pagination: any) => void;
    onEdit: (cls: Class) => void;
    onCancel: (cls: Class) => void;
}

// Map status từ API sang màu sắc và label tiếng Việt
const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    PLANNING: { color: 'gold', label: 'Đang lên kế hoạch' },
    PENDING: { color: 'gold', label: 'Chờ xử lý' },
    ONGOING: { color: 'green', label: 'Đang diễn ra' },
    ACTIVE: { color: 'green', label: 'Đang hoạt động' },
    COMPLETED: { color: 'blue', label: 'Đã hoàn thành' },
    FINISHED: { color: 'blue', label: 'Đã kết thúc' },
    CANCELLED: { color: 'red', label: 'Đã hủy' },
    CANCELED: { color: 'red', label: 'Đã hủy' },
};

const ClassTable = ({
    data,
    loading,
    pagination,
    onTableChange,
    onEdit,
    onCancel,
}: ClassTableProps) => {
    const columns: ColumnsType<Class> = [
        {
            title: 'Tên lớp học',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            ellipsis: true,
            render(text, record) {
                return <Link to={`/dashboard/class-management/${record.id}`}>{text}</Link>;
            },
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 180,
            ellipsis: true
        },
        {
            title: 'Giáo viên',
            key: 'teacher',
            width: 150,
            ellipsis: true,
            render: (_, record) => {
                if (record.teacher) {
                    return `${record.teacher.firstName || ''} ${record.teacher.lastName || ''}`.trim() || 'N/A';
                }
                return 'Chưa có';
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 110,
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '--',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status: string) => {
                const config = STATUS_CONFIG[status] || { color: 'default', label: status };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Link to={`/dashboard/class-management/${record.id}`}>
                            <Button type="text" icon={<EyeOutlined />} />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Hủy lớp">
                        <Button
                            type="text"
                            danger
                            icon={<StopOutlined />}
                            onClick={() => onCancel(record)}
                            disabled={record.status === 'CANCELLED' || record.status === 'CANCELED' || record.status === 'COMPLETED' || record.status === 'FINISHED'}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            pagination={pagination}
            onChange={onTableChange}
            scroll={{ x: 900 }}
            size="middle"
        />
    );
};

export default ClassTable;
