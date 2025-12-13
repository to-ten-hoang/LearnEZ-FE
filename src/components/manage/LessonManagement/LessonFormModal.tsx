import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Upload,
  Button,
  Divider,
  message,
} from 'antd';
import { UploadOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import type { Lesson } from '../../../types/lesson';
import type {
  LessonCreateRequest,
  LessonUpdateInfoRequest,
} from '../../../types/lesson';
import {
  createLessonService,
  updateLessonInfoService,
} from '../../../services/lessonService';
import { uploadImageService } from '../../../services/courseManagementService';

interface Props {
  open: boolean;
  onClose: () => void;
  courseId: number;
  editingLesson?: Lesson | null;
  onSuccess?: () => void;
}

const LessonFormModal: React.FC<Props> = ({
  open,
  onClose,
  courseId,
  editingLesson = null,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [docUrls, setDocUrls] = useState<string[]>([]);
  const [autoDuration, setAutoDuration] = useState<number | null>(null);
  const [forceVideoReloadKey, setForceVideoReloadKey] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (editingLesson) {
      form.setFieldsValue({
        title: editingLesson.title,
        content: editingLesson.content,
        videoUrl: editingLesson.videoUrl,
        duration: editingLesson.duration ?? 0,
        orderIndex: editingLesson.orderIndex ?? 0,
        isPreviewAble: editingLesson.isPreviewAble ?? false,
      });
      setVideoUrl(editingLesson.videoUrl || '');
      setDocUrls(editingLesson.documentUrls || []);
      setAutoDuration(null);
    } else {
      form.resetFields();
      form.setFieldsValue({
        title: '',
        content: '',
        videoUrl: '',
        duration: 0,
        orderIndex: 0,
        isPreviewAble: false,
      });
      setVideoUrl('');
      setDocUrls([]);
      setAutoDuration(null);
    }
  }, [editingLesson, form, open]);

  const handleUploadVideo = async (options: UploadRequestOption) => {
    const { file } = options;
    if (!file) return;
    const f: File = file as File;
    if (!f.type.startsWith('video/')) {
      message.error('Vui lòng chọn file video.');
      return;
    }
    const maxMB = 500;
    if (f.size / 1024 / 1024 > maxMB) {
      message.error(`Kích thước video phải nhỏ hơn ${maxMB}MB.`);
      return;
    }
    const formData = new FormData();
    formData.append('file', f);
    try {
      setVideoUploading(true);
      const res = await uploadImageService(formData);
      if (res.code === 200) {
        setVideoUrl(res.data);
        form.setFieldsValue({ videoUrl: res.data });
        setForceVideoReloadKey((k) => k + 1);
        message.success('Upload video thành công');
      } else {
        message.error(res.message || 'Upload video thất bại');
      }
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi upload video');
    } finally {
      setVideoUploading(false);
    }
  };

  const handleUploadDocument = async (options: UploadRequestOption) => {
    const { file } = options;
    if (!file) return;
    const f: File = file as File;
    const formData = new FormData();
    formData.append('file', f);
    try {
      setDocUploading(true);
      const res = await uploadImageService(formData);
      if (res.code === 200) {
        setDocUrls((prev) => [...prev, res.data]);
        message.success('Upload tài liệu thành công');
      } else {
        message.error(res.message || 'Upload tài liệu thất bại');
      }
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi upload tài liệu');
    } finally {
      setDocUploading(false);
    }
  };

  const removeDoc = (url: string) => {
    setDocUrls((prev) => prev.filter((u) => u !== url));
  };

  const handlePreviewVideoFromUrl = () => {
    const inputUrl = form.getFieldValue('videoUrl');
    if (!inputUrl) {
      message.warning('Nhập URL video trước khi xem trước');
      return;
    }
    setVideoUrl(inputUrl);
    setForceVideoReloadKey((k) => k + 1);
    setAutoDuration(null);
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      if (!isNaN(d) && d > 0) {
        setAutoDuration(d);
        const currentDuration = form.getFieldValue('duration');
        if (!currentDuration || currentDuration === 0) {
          form.setFieldsValue({ duration: Number(d.toFixed(1)) });
        }
      }
    }
  };

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      const finalDuration =
        values.duration && values.duration > 0
          ? values.duration
          : autoDuration !== null
          ? Number(autoDuration.toFixed(1))
          : 0;

      if (editingLesson) {
        const payload: LessonUpdateInfoRequest = {
          id: editingLesson.id,
          title: values.title,
          content: values.content || '',
          videoUrl: videoUrl,
          duration: finalDuration,
          orderIndex: values.orderIndex,
          isPreviewAble: values.isPreviewAble ?? false,
          courseId,
          isActive: editingLesson.isActive,
          isDelete: editingLesson.isDeleted,
          documentUrls: docUrls,
        };
        const res = await updateLessonInfoService(payload);
        if (res.code === 200) {
          message.success('Cập nhật bài học thành công');
          onSuccess?.();
          onClose();
        }
      } else {
        const payload: LessonCreateRequest = {
          title: values.title,
          content: values.content || '',
          videoUrl: videoUrl,
          duration: finalDuration,
          orderIndex: values.orderIndex,
          isPreviewAble: values.isPreviewAble ?? false,
          courseId,
          isActive: false,
          isDelete: false,
          documentUrls: docUrls,
        };
        const res = await createLessonService(payload);
        if (res.code === 200) {
          message.success('Tạo bài học thành công');
          onSuccess?.();
          onClose();
        }
      }
    } catch (err) {
      // message đã được xử lý trong service, nhưng vẫn đảm bảo thông báo nếu cần
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editingLesson ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
      open={open}
      onCancel={() => {
        form.resetFields();
        setVideoUrl('');
        setDocUrls([]);
        onClose();
      }}
      footer={null}
      width={720}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          title: '',
          content: '',
          videoUrl: '',
          duration: 0,
          orderIndex: editingLesson?.orderIndex ?? 0,
          isPreviewAble: false,
        }}
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài học' }]}
        >
          <Input placeholder="VD: Giới thiệu React" />
        </Form.Item>

        <Form.Item name="content" label="Nội dung">
          <Input.TextArea rows={4} placeholder="Mô tả nội dung (tuỳ chọn)" />
        </Form.Item>

        <Form.Item
          name="duration"
          label={`Thời lượng (giây) ${autoDuration ? `(auto = ${Number(autoDuration.toFixed(1))}s)` : ''}`}
          rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="orderIndex"
          label="Thứ tự"
          rules={[{ required: true, message: 'Vui lòng nhập thứ tự (orderIndex)' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="isPreviewAble" valuePropName="checked">
          <Checkbox>Cho phép xem thử</Checkbox>
        </Form.Item>

        <Form.Item
          name="videoUrl"
          label="Video URL"
          rules={[{ required: true, message: 'Cần có video (URL hoặc upload).' }]}
        >
          <Input placeholder="Nhập URL video hoặc upload phía dưới" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Upload customRequest={handleUploadVideo} showUploadList={false} accept="video/*">
            <Button icon={<UploadOutlined />} loading={videoUploading}>
              Upload video
            </Button>
          </Upload>

          <Button
            icon={<EyeOutlined />}
            onClick={handlePreviewVideoFromUrl}
            disabled={!form.getFieldValue('videoUrl')}
          >
            Xem trước URL
          </Button>

          <Button
            onClick={() => {
              setForceVideoReloadKey((k) => k + 1);
              setAutoDuration(null);
            }}
            disabled={!videoUrl}
          >
            Reload video
          </Button>
        </div>

        {videoUrl && (
          <>
            <Divider />
            <div style={{ marginBottom: 8, fontWeight: 500 }}>Xem trước video</div>
            <video
              key={forceVideoReloadKey}
              ref={videoRef}
              src={videoUrl}
              controls
              style={{ width: '100%', maxHeight: 360, borderRadius: 6, background: '#000' }}
              onLoadedMetadata={handleVideoLoaded}
              onError={() => message.error('Không thể load video, kiểm tra URL')}
            />
          </>
        )}

        <Form.Item label="Tài liệu đính kèm">
          <Upload customRequest={handleUploadDocument} showUploadList={false} multiple>
            <Button icon={<UploadOutlined />} loading={docUploading}>
              Upload tài liệu
            </Button>
          </Upload>
          <div style={{ marginTop: 8 }}>
            {docUrls.map((url) => (
              <div
                key={url}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #eee',
                  padding: '6px 8px',
                  marginBottom: 6,
                  borderRadius: 6,
                }}
              >
                <a href={url} target="_blank" rel="noreferrer" style={{ maxWidth: '80%' }}>
                  {url}
                </a>
                <Button danger size="small" onClick={() => removeDoc(url)}>
                  Xóa
                </Button>
              </div>
            ))}
            {!docUrls.length && <div style={{ color: '#888' }}>Chưa có tài liệu</div>}
          </div>
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginTop: 12 }}>
          <Button
            style={{ marginRight: 8 }}
            onClick={() => {
              form.resetFields();
              setVideoUrl('');
              setDocUrls([]);
              onClose();
            }}
          >
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {editingLesson ? 'Lưu cập nhật' : 'Tạo bài học'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LessonFormModal;