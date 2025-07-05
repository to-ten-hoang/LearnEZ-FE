import { Button, message, Table, Input, Select, DatePicker, Form, Switch, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { getAllPostsService, updatePostStatusService } from '../../services/blogService';
import moment from 'moment';
import './BlogApproval.css';
import { categories } from '../../constants/categories';
import type { AllPostsRequest, Post } from '../../types/blog';

const { Option } = Select;
const { RangePicker } = DatePicker;

const BlogApproval = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // State cho Modal xác nhận duyệt/hủy duyệt
  const [modalOpenActive, setModalOpenActive] = useState(false);
  const [modalCheckedActive, setModalCheckedActive] = useState<boolean>(false);
  const [modalPostId, setModalPostId] = useState<number | null>(null);

  // State cho Modal xác nhận xóa/khôi phục
  const [modalOpenDelete, setModalOpenDelete] = useState(false);
  const [modalIsDelete, setModalIsDelete] = useState<boolean>(false);

  const fetchPosts = async (values: any = {}, page: number = 0, size: number = 10) => {
    setLoading(true);
    try {
      const { title, dateRange, categoryPost } = values;
      // console.log('daterange', dateRange);
      
      const dataBody: AllPostsRequest = {
        fromDate: dateRange?.[0] ? (dateRange[0]).format('YYYY-MM-DD') : null,
        toDate: dateRange?.[1] ? (dateRange[1]).format('YYYY-MM-DD') : null,
        title: title || null,
        categoryPost: categoryPost ? [categoryPost] : [],
        page,
        size,
      };
      const response = await getAllPostsService(dataBody);
      setPosts(response.data.content);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.pageable.pageNumber);
      setPageSize(response.data.pageable.pageSize);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách bài đăng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Khi đổi trạng thái Switch, mở Modal xác nhận
  const handleToggleActive = (postId: number, checked: boolean) => {
    setModalOpenActive(true);
    setModalCheckedActive(checked);
    setModalPostId(postId);
  };

  // Khi xác nhận duyệt/hủy duyệt trên Modal
  const handleModalActiveOk = async () => {
    if (modalPostId === null) return;
    try {
      const response = await updatePostStatusService({ id: modalPostId, isActive: modalCheckedActive });
      if (response.code === 200) {
        message.success(modalCheckedActive ? 'Duyệt bài đăng thành công!' : 'Hủy duyệt bài đăng thành công!');
        setPosts(posts.map(post => (post.id === modalPostId ? { ...post, isActive: modalCheckedActive } : post)));
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái bài đăng.');
    } finally {
      setModalOpenActive(false);
      setModalPostId(null);
    }
  };

  const handleModalActiveCancel = () => {
    setModalOpenActive(false);
    setModalPostId(null);
  };

  // Khi nhấn nút Xóa hoặc Khôi phục, mở Modal xác nhận
  const handleDeleteOrRestore = (postId: number, isDelete: boolean) => {
    setModalOpenDelete(true);
    setModalIsDelete(isDelete);
    setModalPostId(postId);
  };

  // Khi xác nhận xóa/khôi phục trên Modal
  const handleModalDeleteOk = async () => {
    if (modalPostId === null) return;
    try {
      const response = await updatePostStatusService({
        id: modalPostId,
        isDelete: modalIsDelete,
        isActive: modalIsDelete ? false : undefined, // Khi xóa, đặt isActive = false
      });
      if (response.code === 200) {
        message.success(modalIsDelete ? 'Xóa bài đăng thành công!' : 'Khôi phục bài đăng thành công!');
        setPosts(
          posts.map(post =>
            post.id === modalPostId
              ? { ...post, isDelete: modalIsDelete, isActive: modalIsDelete ? false : post.isActive }
              : post
          )
        );
      }
    } catch (error) {
      message.error(modalIsDelete ? 'Lỗi khi xóa bài đăng.' : 'Lỗi khi khôi phục bài đăng.');
    } finally {
      setModalOpenDelete(false);
      setModalPostId(null);
    }
  };

  const handleModalDeleteCancel = () => {
    setModalOpenDelete(false);
    setModalPostId(null);
  };

  // Xử lý chuyển trang
  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page - 1); // Ant Design Table dùng page bắt đầu từ 1, API dùng từ 0
    setPageSize(pageSize);
    fetchPosts(form.getFieldsValue(), page - 1, pageSize);
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Chuyên mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
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
    },
    {
      title: 'Cập nhật gần nhất',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150,
      render: (updatedAt: string | null) =>
        updatedAt ? moment(updatedAt).format('DD/MM/YYYY HH:mm') : 'Chưa cập nhật',
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
        onFinish={(values) => fetchPosts(values, 0, pageSize)}
        style={{ marginBottom: 16 }}
        className="search-form"
      >
        <Form.Item name="title" label="Tiêu đề">
          <Input placeholder="Nhập tiêu đề bài viết" />
        </Form.Item>
        <Form.Item name="categoryPost" label="Chuyên mục">
          <Select placeholder="Chọn chuyên mục" allowClear>
            {categories.map(category => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="dateRange" label="Khoảng thời gian">
          <RangePicker format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Tìm kiếm
          </Button>
        </Form.Item>
      </Form>
      <Table
        columns={columns}
        dataSource={posts}
        loading={loading}
        pagination={{
          current: currentPage + 1, // Ant Design dùng page bắt đầu từ 1
          pageSize: pageSize,
          total: totalPages * pageSize,
          onChange: handlePageChange,
          showSizeChanger: true,
          pageSizeOptions: ['5','10', '20', '50'],
        }}
      />
      <Modal
        title={modalCheckedActive ? 'Xác nhận duyệt bài đăng' : 'Xác nhận hủy duyệt bài đăng'}
        open={modalOpenActive}
        onOk={handleModalActiveOk}
        onCancel={handleModalActiveCancel}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>
          {modalCheckedActive
            ? 'Bạn có chắc chắn muốn duyệt bài đăng này?'
            : 'Bạn có chắc chắn muốn hủy duyệt bài đăng này?'}
        </p>
      </Modal>
      <Modal
        title={modalIsDelete ? 'Xác nhận xóa bài đăng' : 'Xác nhận khôi phục bài đăng'}
        open={modalOpenDelete}
        onOk={handleModalDeleteOk}
        onCancel={handleModalDeleteCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        okType={modalIsDelete ? 'danger' : 'primary'}
      >
        <p>
          {modalIsDelete
            ? 'Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.'
            : 'Bạn có chắc chắn muốn khôi phục bài đăng này?'}
        </p>
      </Modal>
    </div>
  );
};

export default BlogApproval;