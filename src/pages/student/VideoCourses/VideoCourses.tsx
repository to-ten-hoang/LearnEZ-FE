<<<<<<< HEAD
// pages/student/VideoCourses/VideoCourses.tsx
import { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Spin, Empty, Button, Typography, List, Tag, Tooltip, message } from 'antd';
import {
    PlayCircleOutlined,
    ArrowLeftOutlined,
    FileTextOutlined,
    DownloadOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { getOrdersService } from '../../../services/orderService';
import { getLessonsService } from '../../../services/lessonService';
import type { Order } from '../../../types/order';
import type { Course } from '../../../types/course';
import './VideoCourses.css';

const { Title, Text, Paragraph } = Typography;

type ViewMode = 'my-courses' | 'course-player';

// Attachment document type
interface AttachDocumentLesson {
    id: number;
    linkUrl: string;
    isActive: boolean;
}

// Lesson type for this page
interface LessonWithAttachments {
    id: number;
    title: string;
    content: string;
    videoUrl: string;
    duration: number;
    orderIndex: number;
    isPreviewAble: boolean;
    courseId: number | string | null;
    isBought?: boolean;
    isDeleted?: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string | null;
    attachDocumentLessons?: AttachDocumentLesson[];
    documentUrls?: string[];
}

// Purchased course from orders - Omit lessons to override with our type
interface PurchasedCourse extends Omit<Course, 'lessons'> {
    purchasedAt: string;
    orderId: number;
    lessons?: LessonWithAttachments[] | null;
}

const VideoCourses = () => {
    // ========== STATE ==========
    const [viewMode, setViewMode] = useState<ViewMode>('my-courses');
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<PurchasedCourse[]>([]);

    // Course Player state
    const [selectedCourse, setSelectedCourse] = useState<PurchasedCourse | null>(null);
    const [currentLesson, setCurrentLesson] = useState<LessonWithAttachments | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [lessonsLoading, setLessonsLoading] = useState(false);

    // ========== FETCH PURCHASED COURSES FROM ORDERS ==========
    const fetchPurchasedCourses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getOrdersService();

            if (response.code === 200 && response.data.content) {
                // Filter only completed orders and extract unique courses
                const completedOrders = response.data.content.filter(
                    (order: Order) => order.status === 'Completed'
                );

                // Extract unique courses (avoid duplicates)
                const courseMap = new Map<number, PurchasedCourse>();
                completedOrders.forEach((order: Order) => {
                    const course = order.detail?.course;
                    if (course && !courseMap.has(course.id)) {
                        courseMap.set(course.id, {
                            ...course,
                            purchasedAt: order.createdAt,
                            orderId: order.id,
                        });
                    }
                });

                setCourses(Array.from(courseMap.values()));
            }
        } catch (error) {
            console.error('Error fetching purchased courses:', error);
            message.error('Không thể tải danh sách khóa học');
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== EFFECTS ==========
    useEffect(() => {
        fetchPurchasedCourses();
    }, [fetchPurchasedCourses]);

    // ========== HANDLERS ==========
    const handleOpenCourse = async (course: PurchasedCourse) => {
        setSelectedCourse(course);
        setViewMode('course-player');
        setCurrentLesson(null);

        // Fetch lessons for this course
        try {
            setLessonsLoading(true);
            const response = await getLessonsService(
                { id: course.id },
                { page: 0, size: 100, sort: 'orderIndex,asc', mode: 'public' }
            );

            if (response.code === 200 && response.data.content) {
                const sortedLessons = response.data.content.sort((a, b) => a.orderIndex - b.orderIndex);
                // Update selected course with lessons
                setSelectedCourse(prev => prev ? {
                    ...prev,
                    lessons: sortedLessons as LessonWithAttachments[]
                } : null);
                // Auto-select first lesson
                if (sortedLessons.length > 0) {
                    setCurrentLesson(sortedLessons[0] as LessonWithAttachments);
                }
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
            message.error('Không thể tải danh sách bài học');
        } finally {
            setLessonsLoading(false);
        }
    };

    const handleBackToList = () => {
        setViewMode('my-courses');
        setSelectedCourse(null);
        setCurrentLesson(null);
    };

    const handleSelectLesson = (lesson: LessonWithAttachments) => {
        setCurrentLesson(lesson);
        // Auto close sidebar on mobile after selecting
        if (window.innerWidth <= 768) {
            setSidebarCollapsed(true);
        }
    };

    // Format duration properly - handle both seconds and minutes
    const formatDuration = (seconds: number): string => {
        if (!seconds || seconds <= 0) return '0:00';
        const totalSeconds = Math.round(seconds);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        if (mins < 60) {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        const hours = Math.floor(mins / 60);
        const remainMins = mins % 60;
        return `${hours}:${remainMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Check if URL is a YouTube video
    const isYouTubeUrl = (url: string): boolean => {
        if (!url) return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeEmbedUrl = (url: string): string => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*$/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
        return url;
    };

    // Get sorted lessons
    const getSortedLessons = (course: PurchasedCourse): LessonWithAttachments[] => {
        if (!course.lessons) return [];
        return [...course.lessons].sort((a, b) => a.orderIndex - b.orderIndex);
    };

    // ========== RENDER MY COURSES GRID ==========
    const renderMyCourses = () => (
        <div className="my-courses-container">
            <div className="my-courses-header">
                <h2>Khóa học của tôi</h2>
                <p className="subtitle">{courses.length} khóa học đã mua</p>
            </div>

            {loading ? (
                <div className="loading-container">
                    <Spin size="large" tip="Đang tải khóa học..." />
                </div>
            ) : courses.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Bạn chưa mua khóa học nào"
                >
                    <Button type="primary" href="/courses">
                        Khám phá khóa học
                    </Button>
                </Empty>
            ) : (
                <Row gutter={[20, 20]}>
                    {courses.map((course) => (
                        <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                className="course-card-item"
                                cover={
                                    <div className="course-thumbnail">
                                        <img
                                            alt={course.title}
                                            src={course.thumbnailUrl || 'https://via.placeholder.com/300x180?text=No+Image'}
                                        />
                                        <div className="play-overlay">
                                            <PlayCircleOutlined />
                                        </div>
                                        <Tag color="green" className="purchased-tag">
                                            <CheckCircleOutlined /> Đã mua
                                        </Tag>
                                    </div>
                                }
                                hoverable
                                onClick={() => handleOpenCourse(course)}
                            >
                                <Card.Meta
                                    title={<Tooltip title={course.title}>{course.title}</Tooltip>}
                                    description={
                                        <div className="course-meta">
                                            <span className="author">
                                                <UserOutlined /> {course.authorName || 'Giảng viên'}
                                            </span>
                                        </div>
                                    }
                                />
                                <Button type="primary" block className="start-learning-btn">
                                    <PlayCircleOutlined /> Vào học
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );

    // ========== RENDER COURSE PLAYER ==========
    const renderCoursePlayer = () => {
        if (!selectedCourse) return null;

        const sortedLessons = getSortedLessons(selectedCourse);

        return (
            <div className="course-player-container">
                {/* Header - Back link on top, title below */}
                <div className="player-header">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBackToList}
                        type="link"
                        className="back-link"
                    >
                        Khóa học của tôi
                    </Button>
                    <div className="header-row">
                        <Title level={3} className="course-title">
                            {selectedCourse.title}
                        </Title>
                        <Button
                            type="text"
                            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="toggle-sidebar-btn"
                        />
                    </div>
                </div>

                <div className="player-content">
                    {/* Main Video Area */}
                    <div className={`video-section ${sidebarCollapsed ? 'full-width' : ''}`}>
                        <div className="video-wrapper">
                            {currentLesson?.videoUrl ? (
                                isYouTubeUrl(currentLesson.videoUrl) ? (
                                    <iframe
                                        src={getYouTubeEmbedUrl(currentLesson.videoUrl)}
                                        title={currentLesson.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video
                                        key={currentLesson.id}
                                        src={currentLesson.videoUrl}
                                        controls
                                        autoPlay
                                        className="video-player"
                                    >
                                        Trình duyệt của bạn không hỗ trợ video.
                                    </video>
                                )
                            ) : (
                                <div className="no-video">
                                    <PlayCircleOutlined />
                                    <Text>Chọn bài học để xem video</Text>
                                </div>
                            )}
                        </div>

                        {/* Lesson Info */}
                        {currentLesson && (
                            <div className="lesson-info">
                                <Title level={4}>{currentLesson.title}</Title>
                                <div className="lesson-meta">
                                    <Tag icon={<ClockCircleOutlined />} color="blue">
                                        {formatDuration(currentLesson.duration)}
                                    </Tag>
                                    <Tag color="default">Bài {currentLesson.orderIndex + 1}</Tag>
                                    {currentLesson.isPreviewAble && (
                                        <Tag color="orange">Xem trước miễn phí</Tag>
                                    )}
                                </div>

                                {currentLesson.content && (
                                    <div className="lesson-content">
                                        <Title level={5}>Nội dung bài học</Title>
                                        <Paragraph>{currentLesson.content}</Paragraph>
                                    </div>
                                )}

                                {/* Attachments */}
                                {currentLesson.attachDocumentLessons && currentLesson.attachDocumentLessons.length > 0 && (
                                    <div className="lesson-attachments">
                                        <Title level={5}>
                                            <FileTextOutlined /> Tài liệu đính kèm
                                        </Title>
                                        <List
                                            size="small"
                                            dataSource={currentLesson.attachDocumentLessons.filter(d => d.isActive)}
                                            renderItem={(doc, index) => (
                                                <List.Item>
                                                    <a href={doc.linkUrl} target="_blank" rel="noopener noreferrer">
                                                        <FileTextOutlined /> Tài liệu {index + 1}
                                                        <Button
                                                            type="link"
                                                            icon={<DownloadOutlined />}
                                                            size="small"
                                                        >
                                                            Tải xuống
                                                        </Button>
                                                    </a>
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Lesson Sidebar */}
                    <div className={`lesson-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                        <div className="sidebar-header">
                            <Title level={5}>Nội dung khóa học</Title>
                            <Tag color="blue">{sortedLessons.length} bài học</Tag>
                        </div>

                        {lessonsLoading ? (
                            <div className="sidebar-loading">
                                <Spin tip="Đang tải..." />
                            </div>
                        ) : sortedLessons.length === 0 ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Chưa có bài học"
                            />
                        ) : (
                            <div className="lesson-list">
                                {sortedLessons.map((lesson, index) => (
                                    <div
                                        key={lesson.id}
                                        className={`lesson-item ${currentLesson?.id === lesson.id ? 'active' : ''}`}
                                        onClick={() => handleSelectLesson(lesson)}
                                    >
                                        <div className="lesson-number">
                                            {currentLesson?.id === lesson.id ? (
                                                <PlayCircleOutlined className="playing-icon" />
                                            ) : (
                                                <span>{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="lesson-details">
                                            <div className="lesson-title">{lesson.title}</div>
                                            <div className="lesson-duration">
                                                <ClockCircleOutlined /> {formatDuration(lesson.duration)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile sidebar overlay */}
                {!sidebarCollapsed && (
                    <div
                        className="sidebar-overlay"
                        onClick={() => setSidebarCollapsed(true)}
                    />
                )}
            </div>
        );
    };

    // ========== MAIN RENDER ==========
    return (
        <div className="video-courses-page">
            {viewMode === 'my-courses' ? renderMyCourses() : renderCoursePlayer()}
=======
import { useEffect, useState } from 'react';
import { Card, Row, Col } from 'antd';
import { BookOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import './VideoCourses.css';

interface Course {
    id: number;
    title: string;
    imageUrl: string;
    lessonCount: number;
    totalDuration: string;
    enrolledStudents: number;
}

const VideoCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        // Mock data với ảnh - thay bằng API call sau
        const mockCourses: Course[] = [
            {
                id: 1,
                title: 'Khóa học Lập trình JavaScript',
                imageUrl:
                    'https://kynguyenlamdep.com/wp-content/uploads/2022/08/meme-meo-loading.jpg',
                lessonCount: 15,
                totalDuration: '20h',
                enrolledStudents: 120,
            },
            {
                id: 2,
                title: 'Khóa học React cơ bản',
                imageUrl: 'https://phunugioi.com/wp-content/uploads/2022/04/Anh-meme-meo-1.jpg',
                lessonCount: 10,
                totalDuration: '12h',
                enrolledStudents: 85,
            },
            {
                id: 3,
                title: 'Khóa học Python cho người mới',
                imageUrl:
                    'https://th.bing.com/th/id/OIP.F6KuP9D1eDV365VwIWr76AHaFt?w=800&h=617&rs=1&pid=ImgDetMain&cb=idpwebpc2',
                lessonCount: 20,
                totalDuration: '25h',
                enrolledStudents: 200,
            },
            {
                id: 4,
                title: 'Khóa học Python cho người mới Khóa học Python cho người mới Khóa học Python cho người mới',
                imageUrl:
                    'https://kynguyenlamdep.com/wp-content/uploads/2022/08/meme-meo-loading.jpg',
                lessonCount: 20,
                totalDuration: '25h',
                enrolledStudents: 200,
            },
            {
                id: 5,
                title: 'Khóa học Python cho người mới',
                imageUrl:
                    'https://kynguyenlamdep.com/wp-content/uploads/2022/08/meme-meo-loading.jpg',
                lessonCount: 20,
                totalDuration: '25h',
                enrolledStudents: 200,
            },
            // {
            //   id: 6,
            //   title: 'Khóa học Python cho người mới',
            //   imageUrl: 'https://kynguyenlamdep.com/wp-content/uploads/2022/08/meme-meo-loading.jpg',
            //   lessonCount: 20,
            //   totalDuration: '25h',
            //   enrolledStudents: 200
            // },
            // {
            //   id: 7,
            //   title: 'Khóa học Python cho người mới',
            //   imageUrl: 'https://kynguyenlamdep.com/wp-content/uploads/2022/08/meme-meo-loading.jpg',
            //   lessonCount: 20,
            //   totalDuration: '25h',
            //   enrolledStudents: 200
            // },
            // {
            //   id: 8,
            //   title: 'Khóa học Python cho người mới',
            //   imageUrl: 'https://kynguyenlamdep.com/wp-content/uploads/2022/08/meme-meo-loading.jpg',
            //   lessonCount: 20,
            //   totalDuration: '25h',
            //   enrolledStudents: 200
            // },
        ];
        setCourses(mockCourses);
    }, []);

    return (
        <div className="video-courses">
            <h2>Khóa học online của tôi </h2>
            <Row gutter={[16, 16]}>
                {courses.map((course) => (
                    <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            cover={<img alt={course.title} src={course.imageUrl} />}
                            bordered={false}
                            className="course-card"
                        >
                            <Card.Meta title={course.title} />
                            <div className="course-info">
                                <span>
                                    <BookOutlined /> {course.lessonCount}
                                </span>
                                <span>
                                    <ClockCircleOutlined /> {course.totalDuration}
                                </span>
                                <span>
                                    <UserOutlined /> {course.enrolledStudents}
                                </span>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
        </div>
    );
};

export default VideoCourses;
