import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Input, Modal, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import type { Class, ClassMember, GetMembersRequest } from '../../../types/class';
import { getMembersInClassService, removeUsersFromClassService } from '../../../services/classManagementService';
import AddStudentsModal from './AddStudentsModal';
import './StudentListTab.css';

const { Search } = Input;
const { Text } = Typography;

interface Props {
  classData: Class;
}

const STATUS_OPTIONS = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'INACTIVE', value: 'INACTIVE' },
];

const StudentListTab = ({ classData }: Props) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [searchString, setSearchString] = useState<string>('');
  const [status, setStatus] = useState<string[] | undefined>(undefined);
  const [joinDate, setJoinDate] = useState<Dayjs | null>(null);

  // CHANGED: lưu key theo memberId (id của quan hệ thành viên trong lớp)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const fetchMembers = async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const req: GetMembersRequest = {
        classId: classData.id,
        searchString: searchString?.trim() || undefined,
        joinDate: joinDate ? joinDate.toISOString() : null,
        status,
        page: page - 1, // backend 0-based
        size,
      };
      const res = await getMembersInClassService(req);
      const data = res.data;
      setMembers(data.content || []);
      setPagination({
        current: (data.pageable?.pageNumber ?? 0) + 1,
        pageSize: data.pageable?.pageSize ?? size,
        total: data.totalElements ?? 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(1, pagination.pageSize || 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classData.id, searchString, joinDate, JSON.stringify(status)]);

  const columns: ColumnsType<ClassMember> = useMemo(
    () => [
      {
        title: 'Họ và tên',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: (val) => val || '-',
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
        ellipsis: true,
        render: (val) => val || '-',
      },
      {
        title: 'Ngày tham gia',
        dataIndex: 'joinDate',
        key: 'joinDate',
        render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (val: ClassMember['status']) => (
          <Tag color={val === 'ACTIVE' ? 'green' : 'default'}>{val}</Tag>
        ),
      },
    //   {
    //     title: 'Vai trò',
    //     dataIndex: 'roleInClass',
    //     key: 'roleInClass',
    //     render: (v) => <Tag color="blue">{v}</Tag>,
    //   },
      {
        title: 'Thao tác',
        key: 'action',
        render: (_, record) => (
          <Space>
            {/* CHANGED: dùng record.memberId để xóa */}
            <Button danger type="link" onClick={() => handleRemove([record.memberId])}>
              Xóa
            </Button>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleTableChange = (p: TablePaginationConfig) => {
    fetchMembers(p.current || 1, p.pageSize || 10);
  };

  // CHANGED: ids ở đây là danh sách memberId
  const handleRemove = (ids: number[]) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content:
        ids.length > 1
          ? `Bạn có chắc muốn xóa ${ids.length} học viên khỏi lớp?`
          : 'Bạn có chắc muốn xóa học viên này khỏi lớp?',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await removeUsersFromClassService({
            id: classData.id,
            memberIds: ids,
          });
          setSelectedRowKeys((prev) => prev.filter((k) => !ids.includes(Number(k))));
          await fetchMembers(pagination.current || 1, pagination.pageSize || 10);
        } catch {
          // message đã hiển thị ở service
        }
      },
    });
  };

  return (
    <div className="student-list-tab">
      <div className="student-list-toolbar">
        <Space wrap>
          <Search
            allowClear
            placeholder="Tìm theo tên, email, SĐT..."
            onSearch={(v) => setSearchString(v)}
            onChange={(e) => !e.target.value && setSearchString('')}
            style={{ width: 280 }}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="Trạng thái"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(vals) => setStatus(vals.length ? (vals as string[]) : undefined)}
            style={{ minWidth: 180 }}
          />
          <DatePicker
            allowClear
            placeholder="Ngày tham gia"
            value={joinDate}
            onChange={(d) => setJoinDate(d)}
          />
        </Space>

        <Space>
          <Button
            danger
            disabled={selectedRowKeys.length === 0}
            onClick={() => handleRemove(selectedRowKeys as number[])}
          >
            Xóa đã chọn
          </Button>
          <Button type="primary" onClick={() => setAddModalVisible(true)}>
            Thêm học viên
          </Button>
        </Space>
      </div>

      <Table<ClassMember>
        // CHANGED: rowKey là memberId để chọn/xóa đúng theo API
        rowKey="memberId"
        loading={loading}
        columns={columns}
        dataSource={members}
        pagination={pagination}
        onChange={handleTableChange}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />

      <AddStudentsModal
        visible={addModalVisible}
        classId={classData.id}
        // GIỮ NGUYÊN: lọc trùng theo user.id (id trong list là user id)
        existingUserIds={members.map((m) => m.id)}
        onClose={async (changed) => {
          setAddModalVisible(false);
          if (changed) {
            await fetchMembers(pagination.current || 1, pagination.pageSize || 10);
          }
        }}
      />
    </div>
  );
};

export default StudentListTab;