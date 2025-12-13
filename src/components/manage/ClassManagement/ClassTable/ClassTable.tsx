// src/components/manage/ClassManagement/ClassTable/ClassTable.tsx
import { Table, Button, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { EditOutlined, StopOutlined } from '@ant-design/icons';
import type { Class, ClassStatus } from '../../../../types/class';
import { Link } from 'react-router-dom';

interface ClassTableProps {
    data: Class[];
    loading: boolean;
    pagination: any;
    onTableChange: (pagination: any) => void;
    onEdit: (cls: Class) => void;
    onCancel: (cls: Class) => void;
}

const statusColors: Record<ClassStatus, string> = {
    PENDING: 'gold',
    ACTIVE: 'green',
    FINISHED: 'blue',
    CANCELED: 'red',
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
            width: 200,
            render(text, record) {
                return <Link to={`/dashboard/class-management/${record.id}`}>{text}</Link>;
            },
        },
        { title: 'Tiêu đề', dataIndex: 'title', key: 'title', width: 200, ellipsis: true },
        {
            title: 'Giáo viên',
            dataIndex: ['teacher', 'lastName'],
            key: 'teacher',
            render: (_, record) => `${record.teacher.firstName} ${record.teacher.lastName}`,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => moment(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: ClassStatus) => (
                <Tag color={statusColors[status] || 'default'}>{status}</Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>
                        Sửa
                    </Button>
                    <Button
                        danger
                        type="link"
                        icon={<StopOutlined />}
                        onClick={() => onCancel(record)}
                        disabled={record.status === 'CANCELED' || record.status === 'FINISHED'}
                    >
                        Hủy
                    </Button>
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
        />
    );
};

export default ClassTable;
