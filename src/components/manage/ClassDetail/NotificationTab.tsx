import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  DatePicker,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  Switch,
  Tooltip,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  EyeOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type {
  Class,
  ClassNotification,
  GetClassNotificationsRequest,
} from '../../../types/class';
import {
  getClassNotificationsService,
  toggleActiveOrDeleteClassNotificationService,
} from '../../../services/classManagementService';
import NotificationFormModal from './NotificationFormModal';
import './NotificationTab.css';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Link: TextLink } = Typography;

interface Props {
  classData: Class;
}

const getFileName = (url: string) => {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.split('/').pop() || 'Tệp');
  } catch {
    return url.split('/').pop() || 'Tệp';
  }
};

const NotificationTab = ({ classData }: Props) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ClassNotification[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [searchString, setSearchString] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClassNotification | null>(null);

  const fetchList = async (page = 1, size = 20) => {
    setLoading(true);
    try {
      const req: GetClassNotificationsRequest = {
        classId: classData.id,
        searchString: searchString?.trim() || undefined,
        fromDate: dateRange?.[0] ? dateRange[0].format('YYYY-MM-DD HH:mm:ss') : null,
        toDate: dateRange?.[1] ? dateRange[1].format('YYYY-MM-DD HH:mm:ss') : null,
        page: page - 1,
        size,
      };
      const res = await getClassNotificationsService(req);
      const data = res.data;
      const sorted = [...(data.content || [])].sort((a, b) => {
        if (a.isPin !== b.isPin) return a.isPin ? -1 : 1;
        return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
      });
      setItems(sorted);
      setPagination({
        current: (data.pageable?.pageNumber ?? 0) + 1,
        pageSize: data.pageable?.pageSize ?? size,
        total: data.totalElements ?? sorted.length,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1, pagination.pageSize || 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classData.id, searchString, dateRange?.[0]?.valueOf(), dateRange?.[1]?.valueOf()]);

  const columns: ColumnsType<ClassNotification> = useMemo(
    () => [
      {
        title: 'Nội dung',
        dataIndex: 'description',
        key: 'description',
        width: 200,          // đặt width rõ ràng
        fixed: 'left',       // tránh bị co về 0
        ellipsis: { showTitle: false },
        render: (text: string, record) => (
          <div className="desc-cell" title={text}>
            {record.isPin ? <StarFilled className="pinned-star" /> : null}
            <TextLink
              className="desc-link"
              onClick={() => {
                setEditing(record);
                setModalOpen(true);
              }}
            >
              {text}
            </TextLink>
          </div>
        ),
      },
      {
        title: 'Loại',
        dataIndex: 'typeNotification',
        key: 'typeNotification',
        width: 120,
        render: (v: string) => <Tag color={v === 'Exercise' ? 'blue' : 'default'}>{v}</Tag>,
      },
      {
        title: 'Thời gian',
        key: 'time',
        width: 260,
        render: (_, r) =>
          r.fromDate && r.toDate ? (
            <span>
              {dayjs(r.fromDate).format('YYYY-MM-DD HH:mm')} - {dayjs(r.toDate).format('YYYY-MM-DD HH:mm')}
            </span>
          ) : (
            <span>-</span>
          ),
      },
      {
        title: 'Tệp đính kèm',
        key: 'attachments',
        width: 300,
        render: (_, r) => {
          const urls = Array.isArray(r.attachDocumentClasses)
            ? r.attachDocumentClasses.map((a: any) => a?.url ?? a).filter(Boolean)
            : [];
          return urls.length ? (
            <Space wrap size={[8, 8]}>
              {urls.map((u: string) => (
                <span key={u} className="file-chip" title={u}>
                  <a href={u} target="_blank" rel="noreferrer" className="file-open">
                    <EyeOutlined /> {getFileName(u)}
                  </a>
                  <a href={u} download className="file-download" title="Tải xuống">
                    <DownloadOutlined />
                  </a>
                </span>
              ))}
            </Space>
          ) : (
            <span>-</span>
          );
        },
        responsive: ['sm'],
      },
      {
        title: 'Tạo bởi',
        key: 'createdBy',
        width: 160,
        render: (_, r) => {
          const u = r.createdBy;
          const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ');
          return name || '-';
        },
        responsive: ['lg'],
      },
      {
        title: 'Tạo lúc',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 170,
        render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
        sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
        responsive: ['lg'],
      },
      {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 120,
        fixed: 'right',
        render: (_: any, record) => (
          <Switch
            checked={record.isActive}
            onChange={(checked) => {
              Modal.confirm({
                title: checked ? 'Hiện thông báo?' : 'Ẩn thông báo?',
                onOk: async () => {
                  try {
                    await toggleActiveOrDeleteClassNotificationService({
                      classId: classData.id,
                      classNotificationId: record.id,
                      isActive: checked,
                      isDelete: false,
                    });
                    fetchList(pagination.current || 1, pagination.pageSize || 20);
                  } catch {}
                },
              });
            }}
          />
        ),
      },
      {
        title: 'Thao tác',
        key: 'action',
        width: 96,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(record);
                  setModalOpen(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                  Modal.confirm({
                    title: 'Xóa thông báo?',
                    okButtonProps: { danger: true },
                    onOk: async () => {
                      try {
                        await toggleActiveOrDeleteClassNotificationService({
                          classId: classData.id,
                          classNotificationId: record.id,
                          isActive: record.isActive,
                          isDelete: true,
                        });
                        fetchList(pagination.current || 1, pagination.pageSize || 20);
                      } catch {}
                    },
                  })
                }
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classData.id, pagination.current, pagination.pageSize]
  );

  const handleTableChange = (p: TablePaginationConfig) => {
    fetchList(p.current || 1, p.pageSize || 20);
  };

  return (
    <div className="notification-tab">
      <div className="notification-toolbar">
        <Space wrap>
          <Search
            allowClear
            placeholder="Tìm theo nội dung..."
            onSearch={(v) => setSearchString(v)}
            onChange={(e) => !e.target.value && setSearchString('')}
            style={{ width: 280 }}
          />
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            onChange={(vals) => setDateRange(vals as any)}
            allowClear
          />
        </Space>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Tạo thông báo
        </Button>
      </div>

      <Table<ClassNotification>
        rowKey="id"
        size="middle"
        loading={loading}
        columns={columns}
        dataSource={items}
        pagination={pagination}
        onChange={handleTableChange}
        // Bảng tự rộng theo tổng độ rộng cột; chỉ cuộn ngang bên trong bảng
        scroll={{ x: 'max-content' }}
        sticky
        tableLayout="fixed"
      />

      <NotificationFormModal
        open={modalOpen}
        classData={classData}
        initialData={editing || undefined}
        onClose={(changed) => {
          setModalOpen(false);
          setEditing(null);
          if (changed) fetchList(pagination.current || 1, pagination.pageSize || 20);
        }}
      />
    </div>
  );
};

export default NotificationTab;