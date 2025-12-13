import React from 'react';
import { Button, Card, Col, Row, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    AudioOutlined,
    FileDoneOutlined,
    LineChartOutlined,
    ReadOutlined,
    FacebookFilled,
    YoutubeFilled,
    MailOutlined,
    PhoneOutlined,
    CheckCircleFilled,
    TeamOutlined,
} from '@ant-design/icons';
import './Home.css';

const { Title, Paragraph, Text, Link } = Typography;

const features = [
    {
        icon: <ReadOutlined />,
        iconClass: 'icon-blue',
        title: 'Lộ trình học thông minh',
        description: 'Tối ưu hóa thời gian học, cá nhân hóa theo trình độ.',
    },
    {
        icon: <AudioOutlined />,
        iconClass: 'icon-purple',
        title: 'Luyện nghe chuẩn đề thi',
        description: 'Luyện tập Part 1–4 với giọng đọc chuẩn TOEIC.',
    },
    {
        icon: <FileDoneOutlined />,
        iconClass: 'icon-green',
        title: 'Thư viện đề thi thử',
        description: 'Thi thử TOEIC trực tuyến, chấm điểm tự động.',
    },
    {
        icon: <LineChartOutlined />,
        iconClass: 'icon-orange',
        title: 'Thống kê tiến độ',
        description: 'Phân tích điểm mạnh/yếu, gợi ý cải thiện.',
    },
];

const sampleCourses = [
    {
        id: 1,
        title: 'TOEIC Cơ bản – Dành cho người mất gốc',
        description: 'Khóa học giúp xây nền tảng vững chắc.',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
        author: 'Nguyễn Văn A',
        category: 'TOEIC Foundation',
    },
    {
        id: 2,
        title: 'TOEIC 700+ – Tăng tốc điểm số',
        description: 'Rèn luyện chuyên sâu Part 5–7, cải thiện tốc độ.',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop',
        author: 'Trần Thị B',
        category: 'TOEIC Intensive',
    },
    {
        id: 3,
        title: 'Luyện nghe TOEIC Part 1–4',
        description: 'Tập trung nâng kỹ năng nghe hiểu thực tế.',
        image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=250&fit=crop',
        author: 'Lê Văn C',
        category: 'TOEIC Listening',
    },
    {
        id: 4,
        title: 'Chiến thuật Reading Part 5-7',
        description: 'Nắm vững từ vựng và ngữ pháp trọng tâm.',
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop',
        author: 'Phạm Văn D',
        category: 'TOEIC Reading',
    },
    {
        id: 5,
        title: 'TOEIC 900+ Master Class',
        description: 'Luyện đề nâng cao, chiến thuật làm bài chuyên nghiệp.',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
        author: 'Hoàng Thị E',
        category: 'TOEIC Advanced',
    },
    {
        id: 6,
        title: 'Vocabulary Power TOEIC',
        description: '3000+ từ vựng thiết yếu theo chủ đề.',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop',
        author: 'Ngô Văn F',
        category: 'TOEIC Vocabulary',
    },
];

const testimonials = [
    {
        name: 'Nguyễn Minh Anh',
        role: 'Sinh viên ĐH Bách Khoa',
        feedback:
            'Sau 2 tháng học ở đây, mình tăng từ 550 lên 735 TOEIC. Hệ thống học rất khoa học và dễ theo dõi tiến độ!',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    },
    {
        name: 'Trần Đức Huy',
        role: 'Nhân viên văn phòng',
        feedback: 'Khóa học rõ ràng, dễ hiểu. Đặc biệt phần luyện nghe giúp mình tự tin hơn rất nhiều khi thi thật.',
        avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    },
    {
        name: 'Lê Thị Hương',
        role: 'Giáo viên Tiếng Anh',
        feedback: 'Platform này có nội dung cập nhật theo đề thi mới nhất. Tôi thường giới thiệu cho học sinh của mình.',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
        name: 'Phạm Quang Vinh',
        role: 'Kỹ sư IT',
        feedback: 'Từ 400 điểm lên 650 trong 3 tháng! Phần thống kê giúp mình biết đâu là điểm yếu cần cải thiện.',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
];

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="Home">
            {/* Hero Banner */}
            <div
                className="home-banner"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&h=900&fit=crop')",
                }}
            >
                <div className="home-banner-content">
                    <Title>Chinh phục TOEIC một cách dễ dàng</Title>
                    <Paragraph>
                        Lộ trình học toàn diện – luyện đề chuẩn format – chấm điểm tự động – phân tích
                        điểm mạnh/yếu chi tiết.
                    </Paragraph>
                    <Button type="primary" size="large" onClick={() => navigate('/courses')}>
                        Bắt đầu học ngay
                    </Button>
                </div>
                <div className="home-banner-overlay"></div>
            </div>

            {/* Features Section */}
            <Row gutter={[24, 24]} justify="center" className="home-features">
                {features.map((item, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card bordered={false} hoverable>
                            <div className={`feature-icon ${item.iconClass}`}>
                                {item.icon}
                            </div>
                            <Title level={4}>{item.title}</Title>
                            <Paragraph>{item.description}</Paragraph>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* About Section */}
            <div className="home-about">
                <Row gutter={[48, 32]} align="middle" justify="center">
                    <Col xs={24} md={10} style={{ textAlign: 'center' }}>
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=400&fit=crop"
                            alt="About LearnEZ"
                        />
                    </Col>

                    <Col xs={24} md={14}>
                        <Title level={3}>Về LearnEZ</Title>
                        <Paragraph>
                            Chúng tôi là một nhóm gồm các giảng viên, lập trình viên và chuyên gia
                            giáo dục, luôn nỗ lực tạo ra nền tảng học TOEIC chất lượng cao nhất.
                        </Paragraph>
                        <Paragraph>
                            Với đội ngũ nhiều kinh nghiệm và nội dung được cập nhật liên tục theo
                            định dạng đề thi mới nhất, chúng tôi cam kết mang đến trải nghiệm học
                            tập hiệu quả, khoa học và cá nhân hóa.
                        </Paragraph>

                        <div style={{ marginTop: 24 }}>
                            <div className="about-feature">
                                <CheckCircleFilled style={{ fontSize: 24, color: '#52c41a' }} />
                                <Text strong>Bài giảng và bài tập chất lượng cao</Text>
                            </div>
                            <div className="about-feature">
                                <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                <Text strong>Đội ngũ hỗ trợ nhiệt tình 24/7</Text>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Hot Courses Section */}
            <div className="home-hot-course">
                <div className="section-header">
                    <Title level={2}>Các khóa học nổi bật</Title>
                    <Button type="link" onClick={() => navigate('/courses')} style={{ fontSize: 16 }}>
                        Xem tất cả →
                    </Button>
                </div>

                <Row gutter={[24, 24]}>
                    {sampleCourses.map((course) => (
                        <Col key={course.id} xs={24} sm={12} md={8} lg={8}>
                            <Card
                                hoverable
                                onClick={() => navigate('/courses')}
                                cover={
                                    <img
                                        className="img_kh_hot"
                                        alt={course.title}
                                        src={course.image}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x250/e8e8e8/666?text=Course';
                                        }}
                                    />
                                }
                            >
                                <span className="course-category">{course.category}</span>
                                <h3 className="course-title">{course.title}</h3>
                                <p className="course-meta">
                                    <strong>Tác giả:</strong> {course.author}
                                </p>
                                <div className="course-actions">
                                    <Button type="primary">Xem chi tiết</Button>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Testimonials Section */}
            <div className="home-testimonials">
                <Title level={2}>Học viên nói gì về LearnEZ?</Title>
                <Row gutter={[24, 24]}>
                    {testimonials.map((item, index) => (
                        <Col xs={24} sm={12} md={6} key={index}>
                            <div className="testimonial-card">
                                <img
                                    src={item.avatar}
                                    alt={item.name}
                                    className="testimonial-avatar"
                                />
                                <div className="testimonial-name">{item.name}</div>
                                <div className="testimonial-role">{item.role}</div>
                                <div className="testimonial-quote">{item.feedback}</div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* CTA Section */}
            <div className="home-cta">
                <Title level={3}>Sẵn sàng nâng điểm TOEIC của bạn chưa?</Title>
                <p className="cta-subtitle">Tham gia cùng hàng nghìn học viên đã đạt được mục tiêu của mình</p>
                <Button type="primary" size="large" onClick={() => navigate('/register')}>
                    Đăng ký miễn phí ngay!
                </Button>
            </div>

            {/* Footer */}
            <div className="home-footer">
                <Row gutter={[32, 24]} justify="space-between">
                    <Col xs={24} sm={12} md={10}>
                        <Title level={4}>LearnEZ</Title>
                        <Paragraph>
                            Nền tảng luyện thi TOEIC trực tuyến hàng đầu – cập nhật theo định dạng
                            đề thi mới nhất của ETS.
                        </Paragraph>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Title level={5}>Liên hệ</Title>
                        <div className="footer-contact">
                            <MailOutlined /> support@learnez.vn
                        </div>
                        <div className="footer-contact">
                            <PhoneOutlined /> 0123 456 789
                        </div>
                    </Col>
                    <Col xs={24} sm={24} md={6}>
                        <Title level={5}>Kết nối với chúng tôi</Title>
                        <div className="footer-social">
                            <Link href="https://facebook.com" target="_blank">
                                <FacebookFilled />
                            </Link>
                            <Link href="https://youtube.com" target="_blank">
                                <YoutubeFilled />
                            </Link>
                        </div>
                    </Col>
                </Row>
                <div className="footer-bottom">
                    <Text>
                        © {new Date().getFullYear()} LearnEZ. Được phát triển bởi Nhóm Phát Triển
                        EdTech.
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default Home;
