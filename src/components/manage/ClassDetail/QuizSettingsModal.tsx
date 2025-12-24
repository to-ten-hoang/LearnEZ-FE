import { useState, useEffect } from 'react';
import { Modal, DatePicker, message, Form, Switch } from 'antd';
import dayjs from 'dayjs';
import type { SharedQuiz } from '../../../types/classQuiz';
import { updateQuizInClass } from '../../../api/classQuizApi';

interface Props {
    open: boolean;
    quiz: SharedQuiz | null;
    classId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const QuizSettingsModal = ({ open, quiz, classId, onClose, onSuccess }: Props) => {
    const [submitting, setSubmitting] = useState(false);
    const [startAt, setStartAt] = useState<dayjs.Dayjs | null>(null);
    const [endAt, setEndAt] = useState<dayjs.Dayjs | null>(null);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (quiz && open) {
            setStartAt(quiz.startAt ? dayjs(quiz.startAt) : null);
            setEndAt(quiz.endAt ? dayjs(quiz.endAt) : null);
            setIsActive(quiz.isActive);
        }
    }, [quiz, open]);

    const handleSubmit = async () => {
        if (!quiz) return;

        setSubmitting(true);
        try {
            await updateQuizInClass({
                sharedQuizId: quiz.sharedQuizId,
                classId,
                startAt: startAt?.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                endAt: endAt?.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                isActive,
            });
            message.success('Đã cập nhật thông tin quiz');
            onSuccess();
        } catch (error) {
            message.error('Có lỗi xảy ra');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setStartAt(null);
        setEndAt(null);
        setIsActive(true);
        onClose();
    };

    return (
        <Modal
            title={`Chỉnh sửa: ${quiz?.quiz.title || ''}`}
            open={open}
            onCancel={handleClose}
            onOk={handleSubmit}
            confirmLoading={submitting}
            okText="Lưu"
            cancelText="Hủy"
            width={500}
        >
            <Form layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item label="Thời gian bắt đầu">
                    <DatePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        value={startAt}
                        onChange={setStartAt}
                        placeholder="Không giới hạn"
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item label="Thời gian kết thúc">
                    <DatePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        value={endAt}
                        onChange={setEndAt}
                        placeholder="Không giới hạn"
                        style={{ width: '100%' }}
                        disabledDate={(current) =>
                            startAt ? current && current.isBefore(startAt) : false
                        }
                    />
                </Form.Item>

                <Form.Item label="Trạng thái hoạt động">
                    <Switch
                        checked={isActive}
                        onChange={setIsActive}
                        checkedChildren="Đang mở"
                        unCheckedChildren="Tạm dừng"
                    />
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                        {isActive
                            ? 'Học sinh có thể thấy và làm bài kiểm tra này'
                            : 'Học sinh sẽ không thấy bài kiểm tra này'}
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default QuizSettingsModal;
