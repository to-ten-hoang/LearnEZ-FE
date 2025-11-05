import { useEffect, useMemo, useState } from 'react';
import { Modal, Table, Input, Space, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { filterUsersService } from '../../../services/userService';
import type { User } from '../../../types/user';
import { addUsersToClassService } from '../../../services/classManagementService';
import './AddStudentsModal.css';

const { Search } = Input;

interface Props {
  visible: boolean;
  classId: number;
  existingUserIds: number[]; // user.id đã ở trong lớp
  onClose: (changed: boolean) => void;
}

const fullName = (u: User) => [u.firstName, u.lastName].filter(Boolean).join(' ').trim();

const AddStudentsModal = ({ visible, classId, existingUserIds, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchString, setSearchString] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const columns: ColumnsType<User> = useMemo(
    () => [
      {
        title: 'Họ và tên',
        key: 'name',
        render: (_, record) => fullName(record) || '-',
      },
      {
        title: 'SĐT',
        dataIndex: 'phone',
        key: 'phone',
        render: (val) => val || '-',
      },
      {
        title: 'Địa chỉ',
        dataIndex: 'address',
        key: 'address',
        render: (val) => val || '-',
      },
      {
        title: 'Vai trò',
        dataIndex: 'role',
        key: 'role',
        render: (role?: string) => (role ? <Tag>{role}</Tag> : <Tag>-</Tag>),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive?: boolean) => <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'ACTIVE' : 'INACTIVE'}</Tag>,
      },
    ],
    []
  );

  const fetchUsers = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await filterUsersService({
        searchString: searchString?.trim() || undefined,
        userRoles: ['STUDENT'],
        isDelete: false,
        page: page - 1,
        size,
      });
      const data = res.data;
      const items: User[] = data.content || [];
      // Lọc loại bỏ user đã trong lớp
      const filtered = items.filter((u) => !existingUserIds.includes(u.id));
      setUsers(filtered);
      setPagination({
        current: (data.pageable?.pageNumber ?? 0) + 1,
        pageSize: data.pageable?.pageSize ?? size,
        total: (data.totalElements ?? 0) - existingUserIds.length, // ước lượng hiển thị
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setSelectedRowKeys([]);
      fetchUsers(1, pagination.pageSize || 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, searchString]);

  const handleOk = async () => {
    if (selectedRowKeys.length === 0) {
      onClose(false);
      return;
    }
    setConfirmLoading(true);
    try {
      await addUsersToClassService({
        id: classId,
        memberIds: selectedRowKeys as number[],
      });
      onClose(true);
    } catch {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => onClose(false);

  const handleTableChange = (p: TablePaginationConfig) => {
    fetchUsers(p.current || 1, p.pageSize || 10);
  };

  return (
    <Modal
      open={visible}
      title="Thêm học viên vào lớp"
      okText="Thêm"
      cancelText="Hủy"
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      width={800}
      destroyOnClose
    >
      <div className="add-students-modal">
        <Space style={{ marginBottom: 12 }}>
          <Search
            allowClear
            placeholder="Tìm theo tên, SĐT..."
            onSearch={(v) => setSearchString(v)}
            onChange={(e) => !e.target.value && setSearchString('')}
            style={{ width: 280 }}
          />
        </Space>

        <Table<User>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={users}
          pagination={pagination}
          onChange={handleTableChange}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
        />
      </div>
    </Modal>
  );
};

export default AddStudentsModal;