import { useState, useEffect, useRef } from 'react';
import {
    List,
    Button,
    Card,
    Switch,
    Form,
    Input,
    InputNumber,
    Checkbox,
    Upload,
    message,
    Divider
} from 'antd';
import {
    UploadOutlined,
    PlusOutlined,
    EyeOutlined,
    ReloadOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import {
    createLessonService,
    updateLessonInfoService,
    updateLessonStatusService
} from '../../../services/lessonService';
import { uploadImageService } from '../../../services/courseManagementService';
import type {
    Lesson,
    LessonCreateRequest,
    LessonUpdateInfoRequest
} from '../../../types/lesson';
import './LessonManagementTab.css';

interface LessonManagementTabProps {
    courseId: number;
    lessons: Lesson[];
    onChanged: () => void;
}

const EMPTY_FORM_VALUES = {
    title: '',
    content: '',
    videoUrl: '',
    duration: 0,
    orderIndex: 0,
    isPreviewAble: false,
    documentUrls: [] as string[]
};

const LessonManagementTab = ({ courseId, lessons, onChanged }: LessonManagementTabProps) => {
    const [form] = Form.useForm();
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [videoUploading, setVideoUploading] = useState(false);
    const [docUploading, setDocUploading] = useState(false);
    const [docUrls, setDocUrls] = useState<string[]>([]);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [autoDuration, setAutoDuration] = useState<number | null>(null);
    const [forceVideoReloadKey, setForceVideoReloadKey] = useState<number>(0);
    const isEditMode = !!selectedLesson;

    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (selectedLesson) {
            form.setFieldsValue({
                title: selectedLesson.title,
                content: selectedLesson.content,
                videoUrl: selectedLesson.videoUrl,
                duration: selectedLesson.duration,
                orderIndex: selectedLesson.orderIndex,
                isPreviewAble: selectedLesson.isPreviewAble
            });
            setVideoUrl(selectedLesson.videoUrl);
            setDocUrls(selectedLesson.documentUrls || []);
            setAutoDuration(null);
        } else {
            form.resetFields();
            form.setFieldsValue({ ...EMPTY_FORM_VALUES, orderIndex: lessons.length });
            setVideoUrl('');
            setDocUrls([]);
            setAutoDuration(null);
        }
    }, [selectedLesson, form, lessons.length]);

    const handleSelectLesson = (lesson: Lesson) => {
        setSelectedLesson(lesson);
    };

    const handleCreateMode = () => {
        setSelectedLesson(null);
    };

    const handleUploadVideo = async ({ file }: any) => {
        if (!file) return;
        const isVideo = file.type.startsWith('video/');
        if (!isVideo) {
            message.error('File không phải video!');
            return;
        }
        const isLt500M = file.size / 1024 / 1024 < 500; // tùy chỉnh giới hạn
        if (!isLt500M) {
            message.error('Kích thước video quá lớn (>500MB).');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            setVideoUploading(true);
            const res = await uploadImageService(formData); // dùng chung endpoint upload
            if (res.code === 200) {
                setVideoUrl(res.data);
                form.setFieldsValue({ videoUrl: res.data });
                message.success('Upload video thành công');
                setForceVideoReloadKey((k) => k + 1);
                setAutoDuration(null);
            }
        } catch (err) {
            console.error(err);
            message.error('Upload video thất bại');
        } finally {
            setVideoUploading(false);
        }
    };

    const handleUploadDocument = async ({ file }: any) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            setDocUploading(true);
            const res = await uploadImageService(formData);
            if (res.code === 200) {
                setDocUrls((prev) => [...prev, res.data]);
                message.success('Upload tài liệu thành công');
            }
        } catch (err) {
            console.error(err);
            message.error('Upload tài liệu thất bại');
        } finally {
            setDocUploading(false);
        }
    };

    const removeDoc = (url: string) => {
        setDocUrls((prev) => prev.filter((u) => u !== url));
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

            if (isEditMode && selectedLesson) {
                const updateReq: LessonUpdateInfoRequest = {
                    id: selectedLesson.id,
                    title: values.title,
                    content: values.content,
                    videoUrl: videoUrl,
                    duration: finalDuration,
                    orderIndex: values.orderIndex,
                    isPreviewAble: values.isPreviewAble,
                    courseId,
                    isActive: selectedLesson.isActive,
                    isDelete: selectedLesson.isDeleted,
                    documentUrls: docUrls
                };
                const res = await updateLessonInfoService(updateReq);
                if (res.code === 200) {
                    message.success('Cập nhật bài học thành công');
                    onChanged();
                    // Reload form with updated duration if auto
                    if (autoDuration !== null) {
                        form.setFieldsValue({ duration: finalDuration });
                    }
                }
            } else {
                const createReq: LessonCreateRequest = {
                    title: values.title,
                    content: values.content,
                    videoUrl: videoUrl,
                    duration: finalDuration,
                    orderIndex: values.orderIndex,
                    isPreviewAble: values.isPreviewAble,
                    courseId,
                    isActive: false,
                    isDelete: false,
                    documentUrls: docUrls
                };
                const res = await createLessonService(createReq);
                if (res.code === 200) {
                    message.success('Tạo bài học thành công');
                    onChanged();
                    setSelectedLesson(null);
                    form.resetFields();
                    setVideoUrl('');
                    setDocUrls([]);
                    setAutoDuration(null);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (lesson: Lesson) => {
        try {
            const res = await updateLessonStatusService({
                id: lesson.id,
                isActive: !lesson.isActive
            });
            if (res.code === 200) {
                onChanged();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleDelete = async (lesson: Lesson) => {
        try {
            const res = await updateLessonStatusService({
                id: lesson.id,
                isDelete: !lesson.isDeleted,
                ...(!lesson.isDeleted ? { isActive: false } : {})
            });
            if (res.code === 200) {
                onChanged();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const moveUp = async (lesson: Lesson) => {
        const idx = lesson.orderIndex;
        if (idx === 0) return;
        const prev = lessons.find((l) => l.orderIndex === idx - 1);
        if (!prev) return;
        try {
            await updateLessonInfoService({
                id: lesson.id,
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                duration: lesson.duration,
                orderIndex: idx - 1,
                isPreviewAble: lesson.isPreviewAble,
                courseId: courseId,
                isActive: lesson.isActive,
                isDelete: lesson.isDeleted,
                documentUrls: lesson.documentUrls || []
            });
            await updateLessonInfoService({
                id: prev.id,
                title: prev.title,
                content: prev.content,
                videoUrl: prev.videoUrl,
                duration: prev.duration,
                orderIndex: idx,
                isPreviewAble: prev.isPreviewAble,
                courseId: courseId,
                isActive: prev.isActive,
                isDelete: prev.isDeleted,
                documentUrls: prev.documentUrls || []
            });
            onChanged();
        } catch (err) {
            console.error(err);
        }
    };

    const moveDown = async (lesson: Lesson) => {
        const maxIndex = Math.max(...lessons.map((l) => l.orderIndex));
        const idx = lesson.orderIndex;
        if (idx === maxIndex) return;
        const next = lessons.find((l) => l.orderIndex === idx + 1);
        if (!next) return;
        try {
            await updateLessonInfoService({
                id: lesson.id,
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                duration: lesson.duration,
                orderIndex: idx + 1,
                isPreviewAble: lesson.isPreviewAble,
                courseId: courseId,
                isActive: lesson.isActive,
                isDelete: lesson.isDeleted,
                documentUrls: lesson.documentUrls || []
            });
            await updateLessonInfoService({
                id: next.id,
                title: next.title,
                content: next.content,
                videoUrl: next.videoUrl,
                duration: next.duration,
                orderIndex: idx,
                isPreviewAble: next.isPreviewAble,
                courseId: courseId,
                isActive: next.isActive,
                isDelete: next.isDeleted,
                documentUrls: next.documentUrls || []
            });
            onChanged();
        } catch (err) {
            console.error(err);
        }
    };

    // Khi video metadata loaded -> lấy duration nếu form chưa có hoặc muốn override
    const handleVideoLoaded = () => {
        if (videoRef.current) {
            const d = videoRef.current.duration;
            if (!isNaN(d) && d > 0) {
                setAutoDuration(d);
                // Nếu người dùng chưa nhập duration hoặc duration đang = 0 -> set luôn
                const currentDuration = form.getFieldValue('duration');
                if (!currentDuration || currentDuration === 0) {
                    form.setFieldsValue({ duration: Number(d.toFixed(1)) });
                }
            }
        }
    };

    const handlePreviewVideoFromUrl = () => {
        const inputUrl = form.getFieldValue('videoUrl');
        if (!inputUrl) {
            message.warning('Nhập URL video trước!');
            return;
        }
        setVideoUrl(inputUrl);
        setForceVideoReloadKey((k) => k + 1);
        setAutoDuration(null);
    };

    return (
        <div className="lesson-management-container">
            {/* FORM */}
            <Card
                title={isEditMode ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
                className="lesson-form-card"
                extra={
                    isEditMode && (
                        <Button size="small" onClick={handleCreateMode}>
                            <PlusOutlined /> Tạo mới
                        </Button>
                    )
                }
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Nhập tiêu đề!' }]}
                    >
                        <Input placeholder="VD: Giới thiệu React" />
                    </Form.Item>
                    <Form.Item name="content" label="Nội dung">
                        <Input.TextArea rows={4} placeholder="Mô tả nội dung" />
                    </Form.Item>
                    {/* <Form.Item
            name="duration"
            label={
              <span>
                Thời lượng (giây){' '}
                {autoDuration !== null && (
                  <Tooltip title="Lấy từ metadata video">
                    <span style={{ color: '#52c41a' }}>
                      (auto = {Number(autoDuration.toFixed(1))})
                    </span>
                  </Tooltip>
                )}
              </span>
            }
            rules={[{ required: true, type: 'number', min: 0 }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item> */}
                    <Form.Item
                        name="orderIndex"
                        label="Thứ tự"
                        rules={[{ required: true, type: 'number', min: 0 }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="isPreviewAble" valuePropName="checked">
                        <Checkbox>Cho phép xem thử</Checkbox>
                    </Form.Item>

                    <Form.Item
                        name="videoUrl"
                        label="Video URL"
                        rules={[{ required: true, message: 'Cần có video!' }]}
                    >
                        <Input
                            placeholder="Nhập thủ công hoặc dùng nút upload phía dưới"
                            onChange={(_e) => {
                                // không update videoUrl ngay, chờ preview
                            }}
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                        <Upload
                            customRequest={handleUploadVideo}
                            showUploadList={false}
                            accept="video/*"
                        >
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
                            icon={<ReloadOutlined />}
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
                            <Divider style={{ margin: '12px 0' }} />
                            <div style={{ marginBottom: 12, fontWeight: 500 }}>Video Preview:</div>
                            <video
                                key={forceVideoReloadKey}
                                ref={videoRef}
                                src={videoUrl}
                                style={{
                                    width: '100%',
                                    maxHeight: 320,
                                    background: '#000',
                                    borderRadius: 8,
                                    outline: 'none'
                                }}
                                controls
                                onLoadedMetadata={handleVideoLoaded}
                                onError={() => {
                                    message.error('Không load được video. Kiểm tra URL!');
                                }}
                            >
                                Trình duyệt của bạn không hỗ trợ thẻ video.
                            </video>
                            <div style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
                                {autoDuration !== null
                                    ? `Thời lượng tự đo: ${Number(autoDuration.toFixed(1))}s`
                                    : 'Chưa đọc metadata hoặc chưa có video.'}
                            </div>
                        </>
                    )}

                    <Form.Item label="Tài liệu đính kèm">
                        <Upload
                            customRequest={handleUploadDocument}
                            showUploadList={false}
                            multiple
                        >
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
                                        padding: '4px 8px',
                                        marginBottom: 4,
                                        borderRadius: 4
                                    }}
                                >
                                    <span style={{ maxWidth: '70%', wordBreak: 'break-all' }}>{url}</span>
                                    <Button danger size="small" onClick={() => removeDoc(url)}>
                                        Xóa
                                    </Button>
                                </div>
                            ))}
                            {!docUrls.length && <div style={{ color: '#888' }}>Chưa có tài liệu</div>}
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={saving} icon={<PlayCircleOutlined />}>
                            {isEditMode ? 'Lưu cập nhật' : 'Tạo bài học'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {/* SIDEBAR LIST */}
            <Card title={`Danh sách bài học (${lessons.length})`} className="lesson-list-card">
                <List
                    dataSource={[...lessons].sort((a, b) => a.orderIndex - b.orderIndex)}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                cursor: 'pointer',
                                background: selectedLesson?.id === item.id ? '#e6f7ff' : '#fff',
                                border: '1px solid #f0f0f0',
                                marginBottom: 8,
                                borderRadius: 4,
                                padding: 12,
                                flexDirection: 'column',
                                alignItems: 'stretch'
                            }}
                            onClick={() => handleSelectLesson(item)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>
                                    #{item.orderIndex} - {item.title}
                                </strong>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <Button size="small" onClick={(e) => { e.stopPropagation(); moveUp(item); }}>
                                        ↑
                                    </Button>
                                    <Button size="small" onClick={(e) => { e.stopPropagation(); moveDown(item); }}>
                                        ↓
                                    </Button>
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                {item.isActive ? 'Active' : 'Inactive'} | {item.isDeleted ? 'Deleted' : 'OK'}
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                                <Switch
                                    checked={item.isActive}
                                    size="small"
                                    onChange={() => toggleActive(item)}
                                    disabled={item.isDeleted}
                                />
                                <Button
                                    size="small"
                                    danger={!item.isDeleted}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDelete(item);
                                    }}
                                >
                                    {item.isDeleted ? 'Khôi phục' : 'Xóa'}
                                </Button>
                            </div>
                        </List.Item>
                    )}
                />
                <Button
                    type="dashed"
                    block
                    style={{ marginTop: 8 }}
                    onClick={handleCreateMode}
                >
                    <PlusOutlined /> Thêm bài học mới
                </Button>
            </Card>
        </div>
    );
};

export default LessonManagementTab;