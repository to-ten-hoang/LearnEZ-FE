// pages/manage/QuestionBank/QuestionBank.tsx
import { Tabs } from 'antd';
import { BookOutlined, QuestionCircleOutlined, DashboardOutlined, FileTextOutlined, FormOutlined } from '@ant-design/icons';
import RangeTopicTab from './components/RangeTopicTab';
import ScoreScaleTab from './components/ScoreScaleTab';
import QuestionBankTab from './components/QuestionBankTab';
import QuestionsTab from './components/QuestionsTab';
import QuizTab from './components/QuizTab';
import './QuestionBank.css';

const { TabPane } = Tabs;

const QuestionBank = () => {
    return (
        <div className="question-bank">
            <h2>Ngân Hàng Đề</h2>

            <Tabs defaultActiveKey="question-bank" className="question-bank-tabs">
                <TabPane
                    tab={
                        <span>
                            <FileTextOutlined />
                            Ngân hàng đề
                        </span>
                    }
                    key="question-bank"
                >
                    <QuestionBankTab />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <QuestionCircleOutlined />
                            Câu hỏi
                        </span>
                    }
                    key="questions"
                >
                    <QuestionsTab />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <FormOutlined />
                            Bài kiểm tra
                        </span>
                    }
                    key="quiz"
                >
                    <QuizTab />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <BookOutlined />
                            Chủ đề câu hỏi
                        </span>
                    }
                    key="range-topic"
                >
                    <RangeTopicTab />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <DashboardOutlined />
                            Mức độ câu hỏi
                        </span>
                    }
                    key="score-scale"
                >
                    <ScoreScaleTab />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default QuestionBank;
