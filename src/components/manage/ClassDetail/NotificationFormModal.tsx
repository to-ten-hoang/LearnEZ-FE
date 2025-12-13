import { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Input, Select, Switch, DatePicker, Upload, Button, Space, Tag, Typography } from 'antd';
import { UploadOutlined} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { Class, ClassNotification, CreateClassNotificationRequest, UpdateClassNotificationRequest, NotificationTypeNumber } from '../../../types/class';
import { createClassNotificationService, updateClassNotificationService, uploadFileToCloudService } from '../../../services/classManagementService';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

interface Props {
  open: boolean;
  classData: Class;
  initialData?: ClassNotification | null;
  onClose: (changed: boolean) => void;
}

const TYPE_OPTIONS: { label: string; value: NotificationTypeNumber }[] = [
  { label: 'Thông báo', value: 1 },
  { label: 'Bài tập (có hạn nộp)', value: 2 },
];

const formatToApi = (d: Dayjs | null) => (d ? d.format('YYYY-MM-DD HH:mm:ss') : null);

const NotificationFormModal = ({ open, classData, initialData, onClose }: Props) => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  const isEdit = !!initialData;

  const existingAttachmentUrls = useMemo(() => {
    // Backend có thể trả object hoặc string -> chuyển về string[]
    if (!initialData?.attachDocumentClasses) return [];
    try {
      return initialData.attachDocumentClasses.map((a: any) => a?.url ?? a).filter(Boolean);
    } catch {
      return [];
    }
  }, [initialData]);

  useEffect(() => {
    if (open) {
      if (isEdit && initialData) {
        // Không suy luận type number từ chuỗi backend -> để user chọn lại (đã set mặc định 1)
        form.setFieldsValue({
          description: initialData.description,
          isPin: initialData.isPin,
          typeNotification: 1 as NotificationTypeNumber,
          dateRange:
            initialData.fromDate && initialData.toDate
              ? [dayjs(initialData.fromDate), dayjs(initialData.toDate)]
              : undefined,
        });
        setAttachments(existingAttachmentUrls);
      } else {
        form.resetFields();
        setAttachments([]);
      }
    }
  }, [open, isEdit, initialData, existingAttachmentUrls, form]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFileToCloudService(file);
      setAttachments((prev) => [...prev, url]);
    } finally {
      setUploading(false);
    }
  };

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      await handleUpload(file as File);
      onSuccess?.({}, file);
    } catch (e) {
      onError?.(e);
    }
  };

  const onOk = async () => {
    const values = await form.validateFields();
    const type: NotificationTypeNumber = values.typeNotification;
    const range: [Dayjs, Dayjs] | undefined = values.dateRange;

    const payloadBase = {
      classId: classData.id,
      description: values.description,
      isPin: values.isPin ?? false,
      typeNotification: type,
      fromDate: type === 2 ? formatToApi(range?.[0] ?? null) : null,
      toDate: type === 2 ? formatToApi(range?.[1] ?? null) : null,
      urlAttachment: attachments,
    };

    try {
      if (isEdit && initialData) {
        const req: UpdateClassNotificationRequest = {
          ...payloadBase,
          classNotificationId: initialData.id,
        };
        await updateClassNotificationService(req);
      } else {
        const req: CreateClassNotificationRequest = payloadBase;
        await createClassNotificationService(req);
      }
      onClose(true);
    } catch {
      // message đã hiển thị trong service
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Chỉnh sửa thông báo' : 'Tạo thông báo'}
      onOk={onOk}
      onCancel={() => onClose(false)}
      okText={isEdit ? 'Cập nhật' : 'Tạo mới'}
      destroyOnClose
      width={720}
    >
      <Form form={form} layout="vertical" initialValues={{ isPin: false, typeNotification: 1 }}>
        <Form.Item
          label="Nội dung"
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung thông báo' }]}
        >
          <TextArea rows={4} placeholder="Nhập nội dung thông báo..." />
        </Form.Item>

        <Form.Item label="Loại thông báo" name="typeNotification" rules={[{ required: true }]}>
          <Select options={TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const t = getFieldValue('typeNotification') as NotificationTypeNumber;
            return t === 2 ? (
              <Form.Item
                label="Thời gian (từ - đến)"
                name="dateRange"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
              >
                <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>

        <Form.Item label="Ghim thông báo" name="isPin" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="Tài liệu đính kèm">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload customRequest={customRequest} showUploadList={false} disabled={uploading}>
              <Button icon={<UploadOutlined />} loading={uploading}>
                Tải tệp lên
              </Button>
            </Upload>
            {attachments.length > 0 ? (
              <Space wrap>
                {attachments.map((url) => (
                  <Tag key={url} closable onClose={() => setAttachments((prev) => prev.filter((u) => u !== url))}>
                    <a href={url} target="_blank" rel="noreferrer">{url}</a>
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">Chưa có tài liệu đính kèm</Text>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NotificationFormModal;