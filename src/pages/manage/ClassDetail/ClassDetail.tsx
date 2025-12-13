<<<<<<< HEAD
=======
// src/pages/manage/ClassDetail/ClassDetail.tsx
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Spin, message, Tabs, Breadcrumb, Typography, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { Class } from '../../../types/class';
import { getClassByIdService } from '../../../services/classManagementService';
<<<<<<< HEAD
// import './ClassDetail.css';

// Import các component tab
import ClassInfoTab from '../../../components/manage/ClassDetail/ClassInfoTab';
import StudentListTab from '../../../components/manage/ClassDetail/StudentListTab';
import ScheduleTab from '../../../components/manage/ClassDetail/ScheduleTab';
import NotificationTab from '../../../components/manage/ClassDetail/NotificationTab';
import AttendanceTab from '../../../components/manage/ClassDetail/AttendanceTab';
=======
import './ClassDetail.css';

// Import các component tab vừa tạo
import ClassInfoTab from '../../../components/manage/ClassDetail/ClassInfoTab';
import StudentListTab from '../../../components/manage/ClassDetail/StudentListTab';
import ScheduleTab from '../../../components/manage/ClassDetail/ScheduleTab';
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665

const { TabPane } = Tabs;
const { Title } = Typography;

const ClassDetail = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [classData, setClassData] = useState<Class | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (classId) {
            const fetchClassDetails = async () => {
                setLoading(true);
                try {
                    const response = await getClassByIdService(Number(classId));
                    setClassData(response.data);
                } catch (error) {
                    message.error('Không thể tải dữ liệu lớp học.');
                } finally {
                    setLoading(false);
                }
            };
            fetchClassDetails();
        }
    }, [classId]);

    if (loading) {
        return <Spin size="large" className="full-page-spinner" />;
    }

    if (!classData) {
        return <div className="class-detail-container">Không tìm thấy thông tin lớp học.</div>;
    }

    return (
        <div className="class-detail-container">
            <div className="page-header-container">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/class-management">Quản lý lớp học</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>{classData.name}</Breadcrumb.Item>
                </Breadcrumb>

                <Space wrap align="center" className="page-title-container">
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/dashboard/class-management')}
                    />
                    <Title level={2} style={{ marginBottom: 0 }}>
                        {classData.name}
                    </Title>
                </Space>
            </div>

            <Tabs defaultActiveKey="1" type="card">
                <TabPane tab="Thông tin chung" key="1">
                    <ClassInfoTab classData={classData} />
                </TabPane>
                <TabPane tab="Danh sách Học viên" key="2">
                    <StudentListTab classData={classData} />
                </TabPane>
                <TabPane tab="Lịch học" key="3">
                    <ScheduleTab classData={classData} />
                </TabPane>
                <TabPane tab="Thông báo" key="4">
<<<<<<< HEAD
                    <NotificationTab classData={classData} />
                </TabPane>
                <TabPane tab="Điểm danh" key="5">
                    <AttendanceTab classData={classData} />
=======
                    <div>Chức năng đang phát triển.</div>
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
                </TabPane>
            </Tabs>
        </div>
    );
};

<<<<<<< HEAD
export default ClassDetail;
=======
export default ClassDetail;
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
