import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Spin, message, Tabs, Breadcrumb, Typography, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { Class } from '../../../types/class';
import { getClassDetailById } from '../../../api/classApi';
import './StudentClassDetail.css';

// Import tab components
import StudentClassInfoTab from '../../../components/student/ClassDetail/StudentClassInfoTab';
import StudentMembersTab from '../../../components/student/ClassDetail/StudentMembersTab';
import StudentScheduleTab from '../../../components/student/ClassDetail/StudentScheduleTab';
import StudentNotificationTab from '../../../components/student/ClassDetail/StudentNotificationTab';
import StudentQuizTab from '../../../components/student/ClassDetail/StudentQuizTab';

const { Title } = Typography;

const StudentClassDetail = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [classData, setClassData] = useState<Class | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (classId) {
            const fetchClassDetails = async () => {
                setLoading(true);
                try {
                    const response = await getClassDetailById(Number(classId));
                    setClassData(response.data);
                } catch (error) {
                    message.error('Không thể tải dữ liệu lớp học.');
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchClassDetails();
        }
    }, [classId]);

    if (loading) {
        return (
            <div className="student-class-detail">
                <Spin size="large" className="full-page-spinner" />
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="student-class-detail">
                <div className="tab-empty">Không tìm thấy thông tin lớp học.</div>
            </div>
        );
    }

    const tabItems = [
        {
            key: '1',
            label: 'Thông tin lớp',
            children: <StudentClassInfoTab classData={classData} />,
        },
        {
            key: '2',
            label: 'Thành viên',
            children: <StudentMembersTab classId={Number(classId)} />,
        },
        {
            key: '3',
            label: 'Lịch học',
            children: <StudentScheduleTab classId={Number(classId)} />,
        },
        {
            key: '4',
            label: 'Thông báo & Bài tập',
            children: <StudentNotificationTab classData={classData} />,
        },
        {
            key: '5',
            label: 'Bài kiểm tra',
            children: <StudentQuizTab classId={Number(classId)} />,
        },
    ];

    return (
        <div className="student-class-detail">
            <div className="page-header-container">
                <Breadcrumb
                    items={[
                        {
                            title: <Link to="/dashboard/offline-classes">Lớp học của tôi</Link>,
                        },
                        {
                            title: classData.name,
                        },
                    ]}
                />

                <Space wrap align="center" className="page-title-container">
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/dashboard/offline-classes')}
                    />
                    <Title level={2} style={{ marginBottom: 0 }}>
                        {classData.name}
                    </Title>
                </Space>
            </div>

            <div className="class-detail-tabs">
                <Tabs defaultActiveKey="1" type="card" items={tabItems} />
            </div>
        </div>
    );
};

export default StudentClassDetail;
