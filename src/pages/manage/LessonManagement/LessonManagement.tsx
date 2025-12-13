import { useCallback, useEffect, useState } from 'react';
import { Table, Button, Form, Input, Switch, Modal, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getLessonsService,
  updateLessonStatusService,
  getLessonByIdService,
} from '../../../services/lessonService';
import type { Lesson } from '../../../types/lesson';
import LessonFormModal from '../../../components/manage/LessonManagement/LessonFormModal';
import LessonDetailDrawer from '../../../components/manage/LessonManagement/LessonDetailDrawer';
import type { SortOrder } from 'antd/es/table/interface';

const LessonManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const numericCourseId = Number(courseId);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    lessonId: number | null;
    type: 'active' | 'delete' | null;
    targetValue: boolean;
  }>({ open: false, lessonId: null, type: null, targetValue: false });

  // Build body & params đúng theo service đã định nghĩa
  const fetchLessons = useCallback(
    async (
      pageIndex: number = page,
      pageSize: number = size,
      sort?: string | null
    ) => {
      if (!numericCourseId) return;
      setLoading(true);
      try {
        const values = form.getFieldsValue();

        // Body tuân thủ LessonQueryRequest
        const body = {
          id: numericCourseId,                // courseId
          title: values.searchString || null, // map searchString vào title (nếu muốn lọc theo tiêu đề)
          categories: [],
          fromDate: null,
          toDate: null,
          // Nếu backend thực sự hỗ trợ isActive/isDelete ở body thì THÊM VÀO:
          // isActive: values.isActive ?? null,
          // isDelete: values.isDelete ?? null,
        };

        // Params (page, size, sort, mode)
                const params = {
                  page: pageIndex,
                  size: pageSize,
                  sort: sort || undefined,
                  mode: 'public' as 'public' | 'own' | 'all', // hoặc 'own' / 'all' tuỳ role người dùng
                };

        const response = await getLessonsService(body, params);
        setLessons(response.data.content);
        setTotalElements(response.data.totalElements);
        setPage(response.data.pageable.pageNumber);
        setSize(response.data.pageable.pageSize);
      } catch (e) {
        // Error đã được handle ở service (message)
      } finally {
        setLoading(false);
      }
    },
    [numericCourseId, page, size, form]
  );

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const openCreateModal = () => {
    setEditingLesson(null);
    setFormModalOpen(true);
  };

  const openEditModal = async (lesson: Lesson) => {
    try {
      const res = await getLessonByIdService(lesson.id);
      if (res.code === 200) {
        setEditingLesson(res.data);
        setFormModalOpen(true);
      }
    } catch {}
  };

  const openDetailDrawer = async (lesson: Lesson) => {
    try {
      const res = await getLessonByIdService(lesson.id);
      if (res.code === 200) {
        setSelectedLesson(res.data);
        setDetailDrawerOpen(true);
      }
    } catch {}
  };

  const triggerStatusChange = (lesson: Lesson, type: 'active' | 'delete', targetValue: boolean) => {
    setStatusModal({
      open: true,
      lessonId: lesson.id,
      type,
      targetValue,
    });
  };

  const confirmStatusChange = async () => {
    if (!statusModal.lessonId || !statusModal.type) return;
    try {
      const payload =
        statusModal.type === 'active'
          ? { id: statusModal.lessonId, isActive: statusModal.targetValue }
          : {
              id: statusModal.lessonId,
              isDelete: statusModal.targetValue,
              ...(statusModal.targetValue ? { isActive: false } : {}),
            };
      const res = await updateLessonStatusService(payload);
      if (res.code === 200) {
        setLessons((prev) =>
          prev.map((l) =>
            l.id === statusModal.lessonId
              ? {
                  ...l,
                  ...(statusModal.type === 'active'
                    ? { isActive: statusModal.targetValue }
                    : {
                        isDeleted: statusModal.targetValue,
                        isActive: statusModal.targetValue ? false : l.isActive,
                      }),
                }
              : l
          )
        );
      }
    } catch {}
    finally {
      setStatusModal({ open: false, lessonId: null, type: null, targetValue: false });
    }
  };

  const cancelStatusChange = () => {
    setStatusModal({ open: false, lessonId: null, type: null, targetValue: false });
  };

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    const { field, order } = sorter;
    const newSortField = field || null;
    const newSortOrder = order as SortOrder;
    setSortField(newSortField);
    setSortOrder(newSortOrder);
    const sort = newSortField && newSortOrder
      ? `${newSortField},${newSortOrder === 'ascend' ? 'asc' : 'desc'}`
      : null;
    fetchLessons(pagination.current - 1, pagination.pageSize, sort);
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      sortOrder: sortField === 'title' ? sortOrder : undefined,
      ellipsis: true,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'orderIndex',
      key: 'orderIndex',
      width: 90,
      sorter: true,
      sortOrder: sortField === 'orderIndex' ? sortOrder : undefined,
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      width: 110,
      render: (d: number | null) => (d ? `${Math.floor(d / 60)}m ${Math.round(d % 60)}s` : '—'),
      sorter: true,
      sortOrder: sortField === 'duration' ? sortOrder : undefined,
    },
    {
      title: 'Preview',
      dataIndex: 'isPreviewAble',
      key: 'isPreviewAble',
      width: 90,
      render: (val: boolean) => (val ? 'Có' : 'Không'),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 90,
      render: (val: boolean, record: Lesson) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={val}
            disabled={record.isDeleted}
            onChange={(checked) => triggerStatusChange(record, 'active', checked)}
          />
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      width: 100,
      render: (val: boolean) => (val ? 'Đã xóa' : 'Hoạt động'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 220,
      render: (_: any, record: Lesson) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Button size="small" onClick={() => openDetailDrawer(record)}>
            Chi tiết
          </Button>
          <Button size="small" type="primary" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          {record.isDeleted ? (
            <Button size="small" onClick={() => triggerStatusChange(record, 'delete', false)}>
              Khôi phục
            </Button>
          ) : (
            <Button
              size="small"
              danger
              onClick={() => triggerStatusChange(record, 'delete', true)}
            >
              Xóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="lesson-management">
      <h2>Quản Lý Bài Học (Course ID: {courseId})</h2>
      <Form
        form={form}
        layout="inline"
        onFinish={() => {
          setPage(0);
          fetchLessons(
            0,
            size,
            sortField && sortOrder
              ? `${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`
              : null
          );
        }}
        style={{ marginBottom: 16, background: '#fff', padding: 16, borderRadius: 8 }}
      >
        <Form.Item name="searchString" label="Tìm kiếm">
          <Input placeholder="Tiêu đề bài học" allowClear />
        </Form.Item>
        {/* Nếu backend hỗ trợ isActive / isDelete ở body thì giữ; nếu không hãy bỏ khỏi form */}
        {/* <Form.Item name="isActive" label="Active">
          <Switch />
        </Form.Item>
        <Form.Item name="isDelete" label="Deleted">
          <Switch />
        </Form.Item> */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Lọc
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            onClick={() => {
              form.resetFields();
              setSortField(null);
              setSortOrder(undefined);
              fetchLessons(0, size, null);
            }}
          >
            Xóa bộ lọc
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={openCreateModal}>
            Tạo bài học
          </Button>
        </Form.Item>
        <Form.Item>
          <Button onClick={() => navigate(-1)}>Quay lại khóa học</Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={lessons}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page + 1,
          pageSize: size,
          total: totalElements,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài học`,
        }}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => openDetailDrawer(record),
          style: { cursor: 'pointer' },
        })}
        rowClassName={(record) => (record.isDeleted ? 'deleted-row' : '')}
      />

      <LessonFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        courseId={numericCourseId}
        editingLesson={editingLesson}
        onSuccess={() =>
          fetchLessons(
            page,
            size,
            sortField && sortOrder
              ? `${sortField},${sortOrder === 'ascend' ? 'asc' : 'desc'}`
              : null
          )
        }
      />

      <LessonDetailDrawer
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        lesson={selectedLesson}
      />

      <Modal
        open={statusModal.open}
        onOk={confirmStatusChange}
        onCancel={cancelStatusChange}
        okText="Xác nhận"
        cancelText="Hủy"
        title={
          statusModal.type === 'active'
            ? statusModal.targetValue
              ? 'Xác nhận kích hoạt bài học'
              : 'Xác nhận hủy kích hoạt bài học'
            : statusModal.targetValue
            ? 'Xác nhận xóa bài học'
            : 'Xác nhận khôi phục bài học'
        }
      >
        <p>
          {statusModal.type === 'active'
            ? statusModal.targetValue
              ? 'Bạn có chắc muốn kích hoạt bài học này?'
              : 'Bạn có chắc muốn hủy kích hoạt bài học này?'
            : statusModal.targetValue
            ? 'Bạn có chắc muốn xóa bài học này?'
            : 'Bạn có chắc muốn khôi phục bài học này?'}
        </p>
      </Modal>
    </div>
  );
};

export default LessonManagement;