import { Button, message, Table, Input, Select, DatePicker, Form, Switch, Modal } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import { getAllPostsService, updatePostStatusService, getCategoriesService } from '../../services/blogService';
import moment from 'moment';
import './BlogApproval.css';
import type { AllPostsRequest, Post, Category } from '../../types/blog';
import type { SortOrder } from 'antd/es/table/interface'; // Nhập kiểu SortOrder từ Ant Design

const { Option } = Select;
const { RangePicker } = DatePicker;

const BlogApproval = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined); // Sử dụng kiểu SortOrder
  const [modalLoading, setModalLoading] = useState(false);
  const [modalState, setModalState] = useState({
    activeOpen: false,
    activeChecked: false,
    deleteOpen: false,
    isDelete: false,
    postId: null as number | null,
  });

  // Lấy danh sách danh mục
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategoriesService();
      if (response.code === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      message.error('Lỗi khi lấy danh sách danh mục.');
    }
  }, []);

  // Lấy danh sách bài đăng
  const fetchPosts = useCallback(
    async (values: any = {}, page: number = 0, size: number = 10, sort: string | null = null) => {
      setLoading(true);
      try {
        const { title, dateRange, categoryPost } = values;
        const dataBody: AllPostsRequest = {
          fromDate: dateRange?.[0] ? (dateRange[0]).format('YYYY-MM-DD') : null,
          toDate: dateRange?.[1] ? (dateRange[1]).format('YYYY-MM-DD') : null,
          title: title || null,
          categoryPost: categoryPost ? [categoryPost] : [],
          page,
          size,
          sort,
        };
        const response = await getAllPostsService(dataBody);
        setPosts(response.data.content);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.pageable.pageNumber);
        // setPageSize(response.data.pageable.pageSize);
        setPageSize(5);
      } catch (error) {
        message.error('Lỗi khi lấy danh sách bài đăng.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Tải dữ liệu ban đầu
  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [fetchCategories, fetchPosts]);

  const handleToggleActive = useCallback((postId: number, checked: boolean) => {
    setModalState({
      ...modalState,
      activeOpen: true,
      activeChecked: checked,
      postId,
    });
  }, [modalState]);

  const handleModalActiveOk = async () => {
    if (modalState.postId === null) return;
    setModalLoading(true);
    try {
      const response = await updatePostStatusService({ id: modalState.postId, isActive: modalState.activeChecked });
      if (response.code === 200) {
        message.success(modalState.activeChecked ? 'Duyệt bài đăng thành công!' : 'Hủy duyệt bài đăng thành công!');
        setPosts(posts.map(post => (post.id === modalState.postId ? { ...post, isActive: modalState.activeChecked } : post)));
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái bài đăng.');
    } finally {
      setModalLoading(false);
      setModalState({ ...modalState, activeOpen: false, postId: null });
    }
  };

  const handleModalActiveCancel = () => {
    setModalState({ ...modalState, activeOpen: false, postId: null });
  };

  const handleDeleteOrRestore = useCallback((postId: number, isDelete: boolean) => {
    setModalState({
      ...modalState,
      deleteOpen: true,
      isDelete,
      postId,
    });
  }, [modalState]);

  const handleModalDeleteOk = async () => {
    if (modalState.postId === null) return;
    setModalLoading(true);
    try {
      const response = await updatePostStatusService({
        id: modalState.postId,
        isDelete: modalState.isDelete,
        isActive: modalState.isDelete ? false : undefined,
      });
      if (response.code === 200) {
        message.success(modalState.isDelete ? 'Xóa bài đăng thành công!' : 'Khôi phục bài đăng thành công!');
        setPosts(
          posts.map(post =>
            post.id === modalState.postId
              ? { ...post, isDelete: modalState.isDelete, isActive: modalState.isDelete ? false : post.isActive }
              : post
          )
        );
      }
    } catch (error) {
      message.error(modalState.isDelete ? 'Lỗi khi xóa bài đăng.' : 'Lỗi khi khôi phục bài đăng.');
    } finally {
      setModalLoading(false);
      setModalState({ ...modalState, deleteOpen: false, postId: null });
    }
  };

  const handleModalDeleteCancel = () => {
    setModalState({ ...modalState, deleteOpen: false, postId: null });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page - 1);
    setPageSize(pageSize);
    fetchPosts(
      form.getFieldsValue(),
      page - 1,
      pageSize,
      sortField && sortOrder ? `${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}` : null
    );
  };

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    const { field, order } = sorter;
    const newSortField = field || null;
    const newSortOrder = order as SortOrder; // Ép kiểu trực tiếp thành SortOrder
    setSortField(newSortField);
    setSortOrder(newSortOrder);
    setCurrentPage(0);
    fetchPosts(
      form.getFieldsValue(),
      0,
      pagination.pageSize,
      newSortField && newSortOrder ? `${newSortField},${newSortOrder === 'ascend' ? 'asc' : 'desc'}` : null
    );
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
      sorter: true,
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
      sortOrder: sortField === 'title' ? sortOrder : undefined,
    },
    {
      title: 'Chuyên mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => category || 'Chưa xác định',
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      width: 150,
      render: (author: any) => author?.name || 'Chưa xác định',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (createdAt: string) => moment(createdAt).format('DD/MM/YYYY HH:mm'),
      sorter: true,
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
      sortOrder: sortField === 'createdAt' ? sortOrder : undefined,
    },
    {
      title: 'Cập nhật gần nhất',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (updatedAt: string | null) =>
        updatedAt ? moment(updatedAt).format('DD/MM/YYYY HH:mm') : 'Chưa cập nhật',
      sorter: true,
      sortDirections: ['ascend', 'descend'] as ('ascend' | 'descend')[],
      sortOrder: sortField === 'updatedAt' ? sortOrder : undefined,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: Post) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record.id, checked)}
          disabled={record.isDelete}
          aria-label={`Bật/tắt trạng thái cho bài đăng ${record.title}`}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: Post) => (
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

  return (
    <div className="blog-approval">
      <h2>Duyệt Bài Đăng</h2>
      <Form
        form={form}
        layout="inline"
        onFinish={(values) =>
          fetchPosts(
            values,
            0,
            pageSize,
            sortField && sortOrder ? `${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}` : null
          )
        }
        style={{ marginBottom: 16 }}
        className="search-form"
      >
        <Form.Item name="title" label="Tiêu đề">
          <Input placeholder="Nhập tiêu đề bài viết" />
        </Form.Item>
        <Form.Item name="categoryPost" label="Chuyên mục">
          <Select placeholder="Chọn chuyên mục" allowClear>
            {categories.map(category => (
              <Option key={category.id} value={category.name}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="dateRange" label="Khoảng thời gian">
          <RangePicker format="DD/MM/YYYY" />
        </Form.Item>
        <div className="form-actions">
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tìm kiếm
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={() => { form.resetFields(); setSortField(null); setSortOrder(undefined); fetchPosts({}, 0, pageSize, null); }}>
              Xóa bộ lọc
            </Button>
          </Form.Item>
        </div>
      </Form>
      <Table
        columns={columns}
        dataSource={posts}
        loading={loading}
        pagination={{
          current: currentPage + 1,
          pageSize: pageSize,
          total: totalPages * pageSize,
          onChange: handlePageChange,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
        onChange={handleTableChange}
      />
      <Modal
        title={modalState.activeChecked ? 'Xác nhận duyệt bài đăng' : 'Xác nhận hủy duyệt bài đăng'}
        open={modalState.activeOpen}
        onOk={handleModalActiveOk}
        onCancel={handleModalActiveCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={modalLoading}
      >
        <p>
          {modalState.activeChecked
            ? 'Bạn có chắc chắn muốn duyệt bài đăng này?'
            : 'Bạn có chắc chắn muốn hủy duyệt bài đăng này?'}
        </p>
      </Modal>
      <Modal
        title={modalState.isDelete ? 'Xác nhận xóa bài đăng' : 'Xác nhận khôi phục bài đăng'}
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
            ? 'Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.'
            : 'Bạn có chắc chắn muốn khôi phục bài đăng này?'}
        </p>
      </Modal>
    </div>
  );
};

export default BlogApproval;