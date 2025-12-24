import { useState, useEffect, useCallback, useRef } from 'react';
import { Input, Spin, Empty, Tag, Button, Modal, message, Progress, Radio, Space, Statistic, Alert } from 'antd';
import {
    SearchOutlined,
    ClockCircleOutlined,
    QuestionCircleOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    FullscreenOutlined,
    StopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { listQuizzesInClass, submitQuizInClass } from '../../../api/classQuizApi';
import type { SharedQuiz, QuizAnswerSubmit, SubmittedQuiz } from '../../../types/classQuiz';

interface Props {
    classId: number;
}

// Quiz configuration - can be changed later
const QUIZ_CONFIG = {
    allowRetake: false,
    showCorrectAnswers: true,
    showCountdown: true,
    enableAntiCheat: true, // Enable anti-cheating features
};

const StudentQuizTab = ({ classId }: Props) => {
    const [loading, setLoading] = useState(false);
    const [quizzes, setQuizzes] = useState<SharedQuiz[]>([]);
    const [searchString, setSearchString] = useState('');

    // Warning modal before quiz
    const [warningModal, setWarningModal] = useState<{
        open: boolean;
        quiz: SharedQuiz | null;
    }>({
        open: false,
        quiz: null,
    });

    // Take Quiz Modal State
    const [takeQuizModal, setTakeQuizModal] = useState<{
        open: boolean;
        quiz: SharedQuiz | null;
        currentQuestionIndex: number;
        answers: Record<number, number>;
        startTime: string;
        timeRemaining: number;
    }>({
        open: false,
        quiz: null,
        currentQuestionIndex: 0,
        answers: {},
        startTime: '',
        timeRemaining: 0,
    });

    // Result Modal State
    const [resultModal, setResultModal] = useState<{
        open: boolean;
        submittedQuiz: SubmittedQuiz | null;
    }>({
        open: false,
        submittedQuiz: null,
    });

    const [submitting, setSubmitting] = useState(false);
    const cheatSubmitRef = useRef(false); // Prevent multiple submissions

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await listQuizzesInClass(classId, {
                searchString: searchString || undefined,
            });

            if (response.data) {
                setQuizzes(response.data.content);
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId]);

    // Countdown timer
    const isModalOpen = takeQuizModal.open;
    const hasTimeRemaining = takeQuizModal.timeRemaining > 0;
    
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isModalOpen && hasTimeRemaining && QUIZ_CONFIG.showCountdown) {
            interval = setInterval(() => {
                setTakeQuizModal((prev) => {
                    if (prev.timeRemaining <= 1) {
                        // Auto submit when time's up - will be handled by user clicking submit
                        return { ...prev, timeRemaining: 0 };
                    }
                    return { ...prev, timeRemaining: prev.timeRemaining - 1 };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isModalOpen, hasTimeRemaining]);

    const getQuizStatus = (quiz: SharedQuiz) => {
        const now = dayjs();
        const startAt = quiz.startAt ? dayjs(quiz.startAt) : null;
        const endAt = quiz.endAt ? dayjs(quiz.endAt) : null;

        if (startAt && now.isBefore(startAt)) {
            return { status: 'upcoming', label: 'Chưa mở', color: 'orange' };
        }
        if (endAt && now.isAfter(endAt)) {
            return { status: 'expired', label: 'Đã hết hạn', color: 'default' };
        }
        return { status: 'active', label: 'Đang mở', color: 'green' };
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Show warning modal first
    const handleStartQuiz = (quiz: SharedQuiz) => {
        if (QUIZ_CONFIG.enableAntiCheat) {
            setWarningModal({ open: true, quiz });
        } else {
            openTakeQuizModal(quiz);
        }
    };

    // Request fullscreen
    const enterFullscreen = useCallback(async () => {
        try {
            const elem = document.documentElement as HTMLElement & {
                webkitRequestFullscreen?: () => Promise<void>;
                msRequestFullscreen?: () => Promise<void>;
            };
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            }
        } catch (error) {
            console.error('Fullscreen request failed:', error);
            message.error('Không thể vào chế độ toàn màn hình. Vui lòng thử lại.');
        }
    }, []);

    // Confirm warning and start quiz
    const confirmStartQuiz = async () => {
        if (!warningModal.quiz) return;
        
        try {
            await enterFullscreen();
            openTakeQuizModal(warningModal.quiz);
            setWarningModal({ open: false, quiz: null });
        } catch {
            message.error('Vui lòng cho phép chế độ toàn màn hình để làm bài');
        }
    };

    const openTakeQuizModal = (quiz: SharedQuiz) => {
        const now = dayjs();
        const endAt = quiz.endAt ? dayjs(quiz.endAt) : null;
        const timeRemaining = endAt ? endAt.diff(now, 'second') : 3600;
        cheatSubmitRef.current = false;

        setTakeQuizModal({
            open: true,
            quiz,
            currentQuestionIndex: 0,
            answers: {},
            startTime: now.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            timeRemaining: Math.max(0, timeRemaining),
        });
    };

    const handleAnswerSelect = (questionId: number, answerId: number) => {
        setTakeQuizModal((prev) => ({
            ...prev,
            answers: { ...prev.answers, [questionId]: answerId },
        }));
    };

    const handleSubmitQuiz = async () => {
        if (!takeQuizModal.quiz) return;

        const questions = takeQuizModal.quiz.quiz.questions || [];
        if (Object.keys(takeQuizModal.answers).length < questions.length) {
            const unanswered = questions.length - Object.keys(takeQuizModal.answers).length;
            const confirmed = await new Promise<boolean>((resolve) => {
                Modal.confirm({
                    title: 'Xác nhận nộp bài',
                    content: `Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`,
                    okText: 'Nộp bài',
                    cancelText: 'Làm tiếp',
                    onOk: () => resolve(true),
                    onCancel: () => resolve(false),
                });
            });
            if (!confirmed) return;
        }

        setSubmitting(true);
        try {
            const endTime = dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
            const answers: QuizAnswerSubmit[] = Object.entries(takeQuizModal.answers).map(
                ([questionId, answerId]) => ({
                    questionId: Number(questionId),
                    answerId: answerId,
                    startAt: takeQuizModal.startTime,
                    endAt: endTime,
                })
            );

            await submitQuizInClass(takeQuizModal.quiz.quiz.id!, answers);
            message.success('Nộp bài thành công!');
            setTakeQuizModal({
                open: false,
                quiz: null,
                currentQuestionIndex: 0,
                answers: {},
                startTime: '',
                timeRemaining: 0,
            });
            fetchQuizzes();
        } catch (error) {
            message.error('Có lỗi xảy ra khi nộp bài');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // const handleViewResult = async (submittedId: number) => {
    //     try {
    //         const response = await getSubmittedQuizDetail(submittedId);
    //         setResultModal({
    //             open: true,
    //             submittedQuiz: response.data,
    //         });
    //     } catch (error) {
    //         message.error('Không thể tải kết quả');
    //         console.error(error);
    //     }
    // };

    // const getScoreClass = (score: number) => {
    //     if (score >= 8) return 'high';
    //     if (score >= 5) return 'medium';
    //     return 'low';
    // };

    // Force submit on cheating (without user confirmation)
    const forceSubmitQuiz = useCallback(async (reason: string) => {
        // Prevent multiple submissions
        if (cheatSubmitRef.current) return;
        cheatSubmitRef.current = true;

        message.error(`Phát hiện gian lận: ${reason}. Bài làm sẽ được nộp tự động!`);

        // Close modal first to prevent further interactions
        const currentQuiz = takeQuizModal.quiz;
        const currentAnswers = takeQuizModal.answers;
        const currentStartTime = takeQuizModal.startTime;

        // Exit fullscreen immediately
        if (document.fullscreenElement) {
            try {
                document.exitFullscreen();
            } catch (e) {
                console.error('Exit fullscreen error:', e);
            }
        }

        // Close the modal immediately
        setTakeQuizModal({
            open: false,
            quiz: null,
            currentQuestionIndex: 0,
            answers: {},
            startTime: '',
            timeRemaining: 0,
        });

        // Then try to submit the answers
        if (currentQuiz) {
            try {
                const endTime = dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                const answers: QuizAnswerSubmit[] = Object.entries(currentAnswers).map(
                    ([questionId, answerId]) => ({
                        questionId: Number(questionId),
                        answerId: answerId,
                        startAt: currentStartTime,
                        endAt: endTime,
                    })
                );

                await submitQuizInClass(currentQuiz.quiz.id!, answers);
                message.success('Bài làm đã được nộp');
            } catch (error) {
                console.error('Error submitting quiz:', error);
                message.warning('Lỗi khi nộp bài, nhưng bài làm đã bị hủy do gian lận');
            }
        }

        fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [takeQuizModal.quiz, takeQuizModal.answers, takeQuizModal.startTime]);

    // Anti-cheating effect
    useEffect(() => {
        if (!takeQuizModal.open || !QUIZ_CONFIG.enableAntiCheat) return;

        // Block copy
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            message.warning('Không được sao chép nội dung!');
        };

        // Block right click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            message.warning('Không được click chuột phải!');
        };

        // Block text selection
        const handleSelectStart = (e: Event) => {
            e.preventDefault();
        };

        // Block keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block Ctrl+C, Ctrl+V, Ctrl+U, PrintScreen
            if (
                (e.ctrlKey && ['c', 'v', 'u', 'p'].includes(e.key.toLowerCase())) ||
                e.key === 'PrintScreen' ||
                e.key === 'F12'
            ) {
                e.preventDefault();
                message.warning('Phím tắt này không được phép!');
            }
            // Detect Alt+Tab (blur event handles this better)
        };

        // Detect tab switch / window blur
        const handleVisibilityChange = () => {
            if (document.hidden) {
                forceSubmitQuiz('Chuyển tab/cửa sổ');
            }
        };

        // Detect exit fullscreen
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && takeQuizModal.open) {
                forceSubmitQuiz('Thoát khỏi chế độ toàn màn hình');
            }
        };

        // Detect DevTools (approximate - window resize detection)
        const devToolsThreshold = 160;
        const handleResize = () => {
            if (
                window.outerWidth - window.innerWidth > devToolsThreshold ||
                window.outerHeight - window.innerHeight > devToolsThreshold
            ) {
                forceSubmitQuiz('Phát hiện mở DevTools');
            }
        };

        // Add event listeners
        document.addEventListener('copy', handleCopy);
        document.addEventListener('cut', handleCopy);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('resize', handleResize);
        window.addEventListener('blur', () => forceSubmitQuiz('Rời khỏi cửa sổ'));

        // Cleanup
        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('cut', handleCopy);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('resize', handleResize);
        };
    }, [takeQuizModal.open, forceSubmitQuiz]);

    const currentQuestion = takeQuizModal.quiz?.quiz.questions?.[takeQuizModal.currentQuestionIndex];

    return (
        <div className="tab-content">
            <div className="tab-filter-bar">
                <Input
                    placeholder="Tìm kiếm bài kiểm tra..."
                    prefix={<SearchOutlined />}
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                    onPressEnter={() => fetchQuizzes()}
                    style={{ maxWidth: 300 }}
                    allowClear
                />
            </div>

            <Spin spinning={loading}>
                {quizzes.length > 0 ? (
                    <div className="quiz-list">
                        {quizzes.map((quiz) => {
                            const statusInfo = getQuizStatus(quiz);

                            return (
                                <div key={quiz.sharedQuizId} className="quiz-card">
                                    <div className="quiz-card-header">
                                        <h3 className="quiz-title">{quiz.quiz.title}</h3>
                                        <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                                    </div>

                                    {quiz.quiz.description && (
                                        <p style={{ color: '#666', marginBottom: 12 }}>
                                            {quiz.quiz.description}
                                        </p>
                                    )}

                                    <div className="quiz-meta">
                                        <span className="quiz-meta-item">
                                            <QuestionCircleOutlined />
                                            {quiz.quiz.totalQuestions || 0} câu hỏi
                                        </span>
                                        {quiz.startAt && (
                                            <span className="quiz-meta-item">
                                                <ClockCircleOutlined />
                                                Bắt đầu: {dayjs(quiz.startAt).format('DD/MM/YYYY HH:mm')}
                                            </span>
                                        )}
                                        {quiz.endAt && (
                                            <span className="quiz-meta-item">
                                                <ClockCircleOutlined />
                                                Kết thúc: {dayjs(quiz.endAt).format('DD/MM/YYYY HH:mm')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="quiz-card-footer">
                                        <div>
                                            {/* Placeholder for score if already submitted */}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {statusInfo.status === 'active' && (
                                                <Button
                                                    type="primary"
                                                    icon={<PlayCircleOutlined />}
                                                    onClick={() => handleStartQuiz(quiz)}
                                                >
                                                    Làm bài
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <Empty description="Chưa có bài kiểm tra nào" />
                )}
            </Spin>

            {/* Take Quiz Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{takeQuizModal.quiz?.quiz.title}</span>
                        {QUIZ_CONFIG.showCountdown && takeQuizModal.timeRemaining > 0 && (
                            <Tag color={takeQuizModal.timeRemaining < 300 ? 'red' : 'blue'}>
                                <ClockCircleOutlined /> {formatTime(takeQuizModal.timeRemaining)}
                            </Tag>
                        )}
                    </div>
                }
                open={takeQuizModal.open}
                onCancel={() => {
                    Modal.confirm({
                        title: 'Thoát bài làm?',
                        content: 'Bạn sẽ mất toàn bộ tiến trình làm bài. Bạn có chắc chắn?',
                        okText: 'Thoát',
                        cancelText: 'Tiếp tục làm',
                        okButtonProps: { danger: true },
                        onOk: () => {
                            setTakeQuizModal({
                                open: false,
                                quiz: null,
                                currentQuestionIndex: 0,
                                answers: {},
                                startTime: '',
                                timeRemaining: 0,
                            });
                        },
                    });
                }}
                width={800}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            disabled={takeQuizModal.currentQuestionIndex === 0}
                            onClick={() =>
                                setTakeQuizModal((prev) => ({
                                    ...prev,
                                    currentQuestionIndex: prev.currentQuestionIndex - 1,
                                }))
                            }
                        >
                            Câu trước
                        </Button>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {takeQuizModal.currentQuestionIndex <
                            (takeQuizModal.quiz?.quiz.questions?.length || 0) - 1 ? (
                                <Button
                                    type="primary"
                                    onClick={() =>
                                        setTakeQuizModal((prev) => ({
                                            ...prev,
                                            currentQuestionIndex: prev.currentQuestionIndex + 1,
                                        }))
                                    }
                                >
                                    Câu tiếp
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    onClick={handleSubmitQuiz}
                                    loading={submitting}
                                >
                                    Nộp bài
                                </Button>
                            )}
                        </div>
                    </div>
                }
                closable={false}
                maskClosable={false}
            >
                {takeQuizModal.quiz && currentQuestion && (
                    <div>
                        {/* Progress */}
                        <div style={{ marginBottom: 20 }}>
                            <Progress
                                percent={Math.round(
                                    ((takeQuizModal.currentQuestionIndex + 1) /
                                        (takeQuizModal.quiz.quiz.questions?.length || 1)) *
                                        100
                                )}
                                format={() =>
                                    `${takeQuizModal.currentQuestionIndex + 1}/${takeQuizModal.quiz?.quiz.questions?.length}`
                                }
                            />
                        </div>

                        {/* Question Navigation */}
                        <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {takeQuizModal.quiz.quiz.questions?.map((q, idx) => (
                                <Button
                                    key={q.id}
                                    size="small"
                                    type={takeQuizModal.currentQuestionIndex === idx ? 'primary' : 'default'}
                                    style={{
                                        backgroundColor:
                                            takeQuizModal.answers[q.id!]
                                                ? takeQuizModal.currentQuestionIndex === idx
                                                    ? undefined
                                                    : '#e6f7ff'
                                                : undefined,
                                    }}
                                    onClick={() =>
                                        setTakeQuizModal((prev) => ({
                                            ...prev,
                                            currentQuestionIndex: idx,
                                        }))
                                    }
                                >
                                    {idx + 1}
                                </Button>
                            ))}
                        </div>

                        {/* Question Content */}
                        <div style={{ padding: 20, background: '#fafafa', borderRadius: 8 }}>
                            <h4 style={{ marginBottom: 16 }}>
                                Câu {takeQuizModal.currentQuestionIndex + 1}: {currentQuestion.questionContent}
                            </h4>

                            <Radio.Group
                                value={takeQuizModal.answers[currentQuestion.id!]}
                                onChange={(e) => handleAnswerSelect(currentQuestion.id!, e.target.value)}
                            >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {currentQuestion.answers?.map((answer) => (
                                        <Radio
                                            key={answer.id}
                                            value={answer.id}
                                            style={{
                                                display: 'block',
                                                padding: '12px 16px',
                                                background: '#fff',
                                                border: '1px solid #d9d9d9',
                                                borderRadius: 8,
                                                marginBottom: 8,
                                            }}
                                        >
                                            {answer.content}
                                        </Radio>
                                    ))}
                                </Space>
                            </Radio.Group>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Result Modal */}
            <Modal
                title="Kết quả bài làm"
                open={resultModal.open}
                onCancel={() => setResultModal({ open: false, submittedQuiz: null })}
                footer={null}
                width={800}
            >
                {resultModal.submittedQuiz && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Statistic
                                title="Điểm số"
                                value={resultModal.submittedQuiz.score}
                                suffix="/ 10"
                                valueStyle={{
                                    color:
                                        resultModal.submittedQuiz.score >= 8
                                            ? '#52c41a'
                                            : resultModal.submittedQuiz.score >= 5
                                            ? '#faad14'
                                            : '#ff4d4f',
                                    fontSize: 36,
                                }}
                            />
                        </div>

                        {QUIZ_CONFIG.showCorrectAnswers && resultModal.submittedQuiz.quiz?.questions && (
                            <div>
                                <h4>Chi tiết bài làm:</h4>
                                {resultModal.submittedQuiz.quiz.questions.map((question, idx) => {
                                    const correctAnswer = question.answers?.find((a) => a.correct);
                                    return (
                                        <div
                                            key={question.id}
                                            style={{
                                                padding: 16,
                                                marginBottom: 12,
                                                background: '#fafafa',
                                                borderRadius: 8,
                                            }}
                                        >
                                            <p style={{ fontWeight: 500 }}>
                                                Câu {idx + 1}: {question.questionContent}
                                            </p>
                                            <p style={{ color: '#52c41a' }}>
                                                <CheckCircleOutlined /> Đáp án đúng:{' '}
                                                {correctAnswer?.content || 'Không xác định'}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            {/* Warning Modal before starting quiz */}
            <Modal
                title={
                    <span style={{ color: '#faad14' }}>
                        <WarningOutlined /> Lưu ý quan trọng trước khi làm bài
                    </span>
                }
                open={warningModal.open}
                onCancel={() => setWarningModal({ open: false, quiz: null })}
                footer={[
                    <Button key="cancel" onClick={() => setWarningModal({ open: false, quiz: null })}>
                        Hủy
                    </Button>,
                    <Button key="start" type="primary" icon={<FullscreenOutlined />} onClick={confirmStartQuiz}>
                        Đã hiểu, bắt đầu làm bài
                    </Button>,
                ]}
                width={600}
            >
                <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Chế độ chống gian lận đang được bật"
                    description="Bài kiểm tra sẽ chạy ở chế độ toàn màn hình. Mọi hành vi gian lận sẽ bị phát hiện và bài làm sẽ được nộp tự động."
                />
                
                <div style={{ marginBottom: 16 }}>
                    <h4 style={{ marginBottom: 8 }}>🚫 Các hành vi bị cấm:</h4>
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                        <li><StopOutlined style={{ color: '#ff4d4f' }} /> Chuyển tab hoặc cửa sổ khác</li>
                        <li><StopOutlined style={{ color: '#ff4d4f' }} /> Thoát khỏi chế độ toàn màn hình (ESC)</li>
                        <li><StopOutlined style={{ color: '#ff4d4f' }} /> Mở Developer Tools (F12)</li>
                        <li><StopOutlined style={{ color: '#ff4d4f' }} /> Sao chép nội dung (Ctrl+C)</li>
                        <li><StopOutlined style={{ color: '#ff4d4f' }} /> Click chuột phải</li>
                    </ul>
                </div>

                <Alert
                    type="error"
                    showIcon
                    icon={<StopOutlined />}
                    message="Cảnh báo: Vi phạm = Nộp bài tự động"
                    description="Nếu phát hiện bất kỳ hành vi gian lận nào ở trên, bài làm của bạn sẽ được nộp ngay lập tức với các câu trả lời đã chọn."
                />
            </Modal>
        </div>
    );
};

export default StudentQuizTab;
