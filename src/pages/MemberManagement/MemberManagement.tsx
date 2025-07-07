import { Button, message, Table, Input, Select, DatePicker, Form, Switch, Modal } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import moment from 'moment';
import { filterUsersService, disableUserService, deleteUserService } from '../../services/userService';
import './MemberManagement.css';
import type { FilterRequest, User, FilterResponse } from '../../types/user';
import type { SortOrder } from 'antd/es/table/interface';

const { Option } = Select;
const { RangePicker } = DatePicker;

const MemberManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalState, setModalState] = useState({
    activeOpen: false,
    activeChecked: false,
    deleteOpen: false,
    isDelete: false,
    userId: null as number | null,
  });

  const fetchUsers = useCallback(
    async (values: any = {}, page: number = 0, size: number = 5, sort: string | null = null) => {
      setLoading(true);
      try {
        // const { searchString, email, name, phone, isActive, userRoles, dateRange } = values;
        const { searchString, isActive, userRoles} = values;
        const dataBody: FilterRequest = {
          searchString: searchString || null,
          isActive: isActive !== undefined ? isActive : null,
          userRoles: userRoles ? [userRoles] : null,
          page,
          size,
          sort,
        };
        const response: FilterResponse = await filterUsersService(dataBody);
        setUsers(response.data.content);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.pageable.pageNumber);
      } catch (error) {
        message.error('Lỗi khi lấy danh sách người dùng.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleToggleActive = useCallback((userId: number, checked: boolean) => {
    setModalState({
      ...modalState,
      activeOpen: true,
      activeChecked: checked,
      userId,
    });
  }, [modalState]);

  const handleModalActiveOk = async () => {
    if (modalState.userId === null) return;
    setModalLoading(true);
    try {
      const response = await disableUserService({ id: modalState.userId, isActive: modalState.activeChecked });
      if (response.code === 200) {
        message.success(modalState.activeChecked ? 'Kích hoạt người dùng thành công!' : 'Vô hiệu hóa người dùng thành công!');
        setUsers(users.map(user => (user.id === modalState.userId ? { ...user, isActive: modalState.activeChecked } : user)));
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái người dùng.');
    } finally {
      setModalLoading(false);
      setModalState({ ...modalState, activeOpen: false, userId: null });
    }
  };

  const handleModalActiveCancel = () => {
    setModalState({ ...modalState, activeOpen: false, userId: null });
  };

  const handleDeleteOrRestore = useCallback((userId: number, isDelete: boolean) => {
    setModalState({
      ...modalState,
      deleteOpen: true,
      isDelete,
      userId,
    });
  }, [modalState]);

  const handleModalDeleteOk = async () => {
    if (modalState.userId === null) return;
    setModalLoading(true);
    try {
      const response = await deleteUserService({
        id: modalState.userId,
        isDelete: modalState.isDelete,
        isActive: false,
      });
      if (response.code === 200) {
        message.success(modalState.isDelete ? 'Xóa người dùng thành công!' : 'Khôi phục người dùng thành công!');
        setUsers(
          users.map(user =>
            user.id === modalState.userId
              ? { ...user, isDelete: modalState.isDelete, isActive: modalState.isDelete ? false : user.isActive }
              : user
          )
        );
      }
    } catch (error) {
      message.error(modalState.isDelete ? 'Lỗi khi xóa người dùng.' : 'Lỗi khi khôi phục người dùng.');
    } finally {
      setModalLoading(false);
      setModalState({ ...modalState, deleteOpen: false, userId: null });
    }
  };

  const handleModalDeleteCancel = () => {
    setModalState({ ...modalState, deleteOpen: false, userId: null });
  };

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    const { field, order } = sorter;
    const newSortField = field || null;
    const newSortOrder = order as SortOrder;
    setSortField(newSortField);
    setSortOrder(newSortOrder);
    setCurrentPage(pagination.current - 1);
    setPageSize(pagination.pageSize);
    fetchUsers(
      form.getFieldsValue(),
      pagination.current - 1,
      pagination.pageSize,
      newSortField && newSortOrder ? `${newSortField},${newSortOrder === 'ascend' ? 'asc' : 'desc'}` : null
    );
  };

  const columns = [
    {
      title: 'Họ và tên',
      key: 'name',
      width: 150,
      render: (record: User) => `${record.firstName} ${record.lastName}`,
      // ellipsis: true,
      // sorter: true,
      // sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
      // sortOrder: sortField === 'name' ? sortOrder : undefined,
    },
    // {
    //   title: 'Email',
    //   dataIndex: 'email',
    //   key: 'email',
    //   width: 200,
    //   sorter: true,
    //   sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
    //   sortOrder: sortField === 'email' ? sortOrder : undefined,
    // },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    // {
    //   title: 'Ngày sinh',
    //   dataIndex: 'dob',
    //   key: 'dob',
    //   width: 150,
    //   render: (dob: string) => (dob ? moment(dob).format('DD/MM/YYYY') : 'Chưa xác định'),
    //   sorter: true,
    //   sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
    //   sortOrder: sortField === 'dob' ? sortOrder : undefined,
    // },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => role || 'Chưa xác định',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (dob: string) => (dob ? moment(dob).format('DD/MM/YYYY') : 'Chưa xác định'),
      sorter: true,
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
      sortOrder: sortField === 'createdAt' ? sortOrder : undefined,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: User) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.id, checked)}
          disabled={record.isDelete}
          aria-label={`Bật/tắt trạng thái cho người dùng ${record.firstName} ${record.lastName}`}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: User) => (
        <div className="action-buttons">
          {record.isDelete ? (
            <Button size="small" onClick={() => handleDeleteOrRestore(record.id, false)}>
              Khôi phục
            </Button>
          ) : (
            <Button
              danger
              size="small"
              onClick={() => handleDeleteOrRestore(record.id, true)}
            >
              Xóa
            </Button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="member-management">
      <h2>Quản Lý Thành Viên</h2>
      <Form
        form={form}
        layout="inline"
        onFinish={(values) =>
          fetchUsers(
            values,
            0,
            pageSize,
            sortField && sortOrder ? `${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}` : null
          )
        }
        style={{ marginBottom: 16 }}
        className="search-form"
      >
        <Form.Item name="searchString" label="Tìm kiếm">
          <Input placeholder="Nhập email, tên hoặc số điện thoại" />
        </Form.Item>
        <Form.Item name="userRoles" label="Vai trò">
          <Select placeholder="Chọn vai trò" allowClear>
            <Option value="MANAGER">Quản lý</Option>
            <Option value="CONSULTANT">Nhân viên</Option>
            <Option value="STUDENT">Học Sinh</Option>
            <Option value="TEACHER">Giáo viên</Option>
          </Select>
        </Form.Item>
        <Form.Item name="isActive" label="Trạng thái">
          <Select placeholder="Chọn trạng thái" allowClear>
            <Option value={true}>Kích hoạt</Option>
            <Option value={false}>Vô hiệu hóa</Option>
          </Select>
        </Form.Item>
        <Form.Item name="dateRange" label="Ngày tạo">
          <RangePicker format="DD/MM/YYYY" />
        </Form.Item>
        <div className="form-actions">
          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={() => setCurrentPage(0)}>
              Tìm kiếm
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={() => { form.resetFields(); setSortField(null); setSortOrder(undefined); fetchUsers({}, 0, pageSize, null); }}>
              Xóa bộ lọc
            </Button>
          </Form.Item>
        </div>
      </Form>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{
          current: currentPage + 1,
          pageSize: pageSize,
          total: totalPages * pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['2', '3','10', '20', '50'],
        }}
        onChange={handleTableChange}
      />
      <Modal
        title={modalState.activeChecked ? 'Xác nhận kích hoạt người dùng' : 'Xác nhận vô hiệu hóa người dùng'}
        open={modalState.activeOpen}
        onOk={handleModalActiveOk}
        onCancel={handleModalActiveCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={modalLoading}
      >
        <p>
          {modalState.activeChecked
            ? 'Bạn có chắc chắn muốn kích hoạt người dùng này?'
            : 'Bạn có chắc chắn muốn vô hiệu hóa người dùng này?'}
        </p>
      </Modal>
      <Modal
        title={modalState.isDelete ? 'Xác nhận xóa người dùng' : 'Xác nhận khôi phục người dùng'}
        open={modalState.deleteOpen}
        onOk={handleModalDeleteOk}
        onCancel={handleModalDeleteCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        okType={modalState.isDelete ? 'danger' : 'primary'}
        confirmLoading={modalLoading}
      >
        <p>
          {modalState.isDelete
            ? 'Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.'
            : 'Bạn có chắc chắn muốn khôi phục người dùng này?'}
        </p>
      </Modal>
    </div>
  );
};

export default MemberManagement;