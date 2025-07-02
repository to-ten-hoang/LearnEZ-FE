import { Button, message, Table, Input, Select, DatePicker, Form, Switch, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { getAllPostsService, updatePostStatusService } from '../../services/blogService';
import moment from 'moment';
import './BlogApproval.css';
import { categories } from '../../constants/categories';
import type { AllPostsRequest } from 'types/blog';

const { Option } = Select;
const { RangePicker } = DatePicker;

type Post = {
  id: number;
  title: string;
  content: string;
  themeUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  isActive: boolean;
  isDelete: boolean;
  isOwn: boolean | null;
  category: string;
  author: any | null;
};

const BlogApproval = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  // State cho Modal xác nhận duyệt/hủy duyệt
  const [modalOpen, setModalOpen] = useState(false);
  const [modalChecked, setModalChecked] = useState<boolean>(false);
  const [modalPostId, setModalPostId] = useState<number | null>(null);

  const fetchPosts = async (values: any = {}) => {
    setLoading(true);
    try {
      const { title, dateRange, categoryPost } = values;
      const dataBody: AllPostsRequest = {
        fromDate: dateRange?.[0] ? moment(dateRange[0]).toISOString() : null,
        toDate: dateRange?.[1] ? moment(dateRange[1]).toISOString() : null,
        title: title || null,
        categoryPost: categoryPost ? [categoryPost] : [],
      };
      const response = await getAllPostsService(dataBody);
      setPosts(response.data.content);
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
    setModalOpen(true);
    setModalChecked(checked);
    setModalPostId(postId);
  };

  // Khi xác nhận trên Modal
  const handleModalOk = async () => {
    if (modalPostId === null) return;
    try {
      const response = await updatePostStatusService({ id: modalPostId, isActive: modalChecked });
      if (response.code === 200) {
        message.success(modalChecked ? 'Duyệt bài đăng thành công!' : 'Hủy duyệt bài đăng thành công!');
        setPosts(posts.map(post => (post.id === modalPostId ? { ...post, isActive: modalChecked } : post)));
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái bài đăng.');
    } finally {
      setModalOpen(false);
      setModalPostId(null);
    }
  };

  // Khi hủy Modal
  const handleModalCancel = () => {
    setModalOpen(false);
    setModalPostId(null);
  };

  const handleDelete = async (postId: number) => {
    try {
      const response = await updatePostStatusService({
        id: postId,
        isDelete: true,
        isActive: false,
      });
      if (response.code === 200) {
        message.success('Xóa bài đăng thành công!');
        setPosts(posts.map(post => (post.id === postId ? { ...post, isDelete: true, isActive: false } : post)));
      }
    } catch (error) {
      message.error('Lỗi khi xóa bài đăng.');
    }
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
            <span className="status-deleted">Đã xóa</span>
          ) : (
            <Button
              danger
              size="small"
              onClick={() => handleDelete(record.id)}
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
      <h2 >Duyệt Bài Đăng</h2>
      <Form
        form={form}
        layout="inline"
        onFinish={fetchPosts}
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
      />
      <Modal
        title={modalChecked ? 'Xác nhận duyệt bài đăng' : 'Xác nhận hủy duyệt bài đăng'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>
          {modalChecked
            ? 'Bạn có chắc chắn muốn duyệt bài đăng này?'
            : 'Bạn có chắc chắn muốn hủy duyệt bài đăng này?'}
        </p>
      </Modal>
    </div>
  );
};

export default BlogApproval;