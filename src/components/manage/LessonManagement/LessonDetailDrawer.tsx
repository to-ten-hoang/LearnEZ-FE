import { Drawer, Descriptions, Tag, Divider } from 'antd';
import type { Lesson } from '../../../types/lesson';

interface LessonDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  lesson: Lesson | null;
}

const formatDuration = (seconds: number | null) => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const LessonDetailDrawer = ({ open, onClose, lesson }: LessonDetailDrawerProps) => {
  return (
    <Drawer
      title={lesson ? `Chi tiết bài học: ${lesson.title}` : 'Chi tiết bài học'}
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
    >
      {lesson && (
        <>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{lesson.id}</Descriptions.Item>
            <Descriptions.Item label="Tiêu đề">{lesson.title}</Descriptions.Item>
            <Descriptions.Item label="Thứ tự">{lesson.orderIndex}</Descriptions.Item>
            <Descriptions.Item label="Thời lượng">{formatDuration(lesson.duration)}</Descriptions.Item>
            <Descriptions.Item label="Preview">
              {lesson.isPreviewAble ? <Tag color="blue">Cho phép</Tag> : <Tag>Không</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Active">
              {lesson.isActive ? <Tag color="green">Active</Tag> : <Tag color="orange">Inactive</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Deleted">
              {lesson.isDeleted ? <Tag color="red">Deleted</Tag> : <Tag color="green">OK</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Video">
              {lesson.videoUrl ? (
                <video
                  src={lesson.videoUrl}
                  controls
                  style={{ width: '100%', borderRadius: 4, background: '#000' }}
                />
              ) : (
                'Không có'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung">
              {lesson.content || '—'}
            </Descriptions.Item>
          </Descriptions>

            <Divider />

          <h4>Tài liệu đính kèm</h4>
          {Array.isArray(lesson.documentUrls) && lesson.documentUrls.length > 0 ? (
            <ul style={{ paddingLeft: 20 }}>
              {lesson.documentUrls.map((d) => (
                <li key={d}>
                  <a href={d} target="_blank" rel="noreferrer">
                    {d}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có tài liệu.</p>
          )}
        </>
      )}
    </Drawer>
  );
};

export default LessonDetailDrawer;