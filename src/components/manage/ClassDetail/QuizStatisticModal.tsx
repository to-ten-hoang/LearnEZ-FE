import { useState, useEffect } from 'react';
import { Modal, Slider, Spin, Empty } from 'antd';
import type { SharedQuiz, QuizStatistic } from '../../../types/classQuiz';
import { getQuizStatisticDetail } from '../../../api/classQuizApi';

interface Props {
    open: boolean;
    quiz: SharedQuiz | null;
    classId: number;
    onClose: () => void;
}

const QuizStatisticModal = ({ open, quiz, classId, onClose }: Props) => {
    const [loading, setLoading] = useState(false);
    const [statistic, setStatistic] = useState<QuizStatistic | null>(null);
    const [scoreThreshold, setScoreThreshold] = useState(5);

    const fetchStatistic = async () => {
        if (!quiz) return;

        setLoading(true);
        try {
            const response = await getQuizStatisticDetail(
                quiz.quiz.id!,
                classId,
                scoreThreshold,
                {}
            );
            setStatistic(response.data);
        } catch (error) {
            console.error('Error fetching statistic:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && quiz) {
            fetchStatistic();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, quiz, scoreThreshold]);

    const handleClose = () => {
        setStatistic(null);
        setScoreThreshold(5);
        onClose();
    };

    // Calculate percentage for donut visualization
    const passPercent = statistic
        ? Math.round((statistic.overScore / (statistic.total || 1)) * 100)
        : 0;
    const failPercent = 100 - passPercent;

    return (
        <Modal
            title={`Thống kê: ${quiz?.quiz.title || ''}`}
            open={open}
            onCancel={handleClose}
            footer={null}
            width={500}
        >
            <Spin spinning={loading}>
                {statistic && statistic.total > 0 ? (
                    <div className="statistic-modal-content">
                        {/* Simple Donut Chart using CSS */}
                        <div className="statistic-chart-container">
                            <div
                                style={{
                                    width: 180,
                                    height: 180,
                                    borderRadius: '50%',
                                    background: `conic-gradient(
                                        #52c41a 0deg ${passPercent * 3.6}deg,
                                        #ff4d4f ${passPercent * 3.6}deg 360deg
                                    )`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    position: 'relative',
                                }}
                            >
                                <div
                                    style={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        background: '#fff',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <div style={{ fontSize: 28, fontWeight: 600 }}>
                                        {statistic.total}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#888' }}>Bài nộp</div>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="statistic-legend">
                            <div className="legend-item">
                                <div className="legend-dot pass"></div>
                                <span>
                                    Đạt: {statistic.overScore} ({passPercent}%)
                                </span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-dot fail"></div>
                                <span>
                                    Không đạt: {statistic.underScore} ({failPercent}%)
                                </span>
                            </div>
                        </div>

                        {/* Score Threshold Slider */}
                        <div className="score-threshold-container">
                            <div style={{ marginBottom: 8, fontWeight: 500 }}>
                                Ngưỡng điểm đạt: {scoreThreshold}/10
                            </div>
                            <Slider
                                min={0}
                                max={10}
                                value={scoreThreshold}
                                onChange={setScoreThreshold}
                                marks={{
                                    0: '0',
                                    5: '5',
                                    10: '10',
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <Empty description="Chưa có bài nộp nào" />
                )}
            </Spin>
        </Modal>
    );
};

export default QuizStatisticModal;
