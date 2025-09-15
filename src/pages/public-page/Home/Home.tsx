import React from 'react';
import { Button, Card, Col, Row, Typography, Space, Carousel } from 'antd';
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
} from '@ant-design/icons';

const { Title, Paragraph, Text, Link } = Typography;

const features = [
  {
    icon: <ReadOutlined style={{ fontSize: 36, color: '#1890ff' }} />,
    title: 'Lộ trình học thông minh',
    description: 'Tối ưu hóa thời gian học, cá nhân hóa theo trình độ.',
  },
  {
    icon: <AudioOutlined style={{ fontSize: 36, color: '#1890ff' }} />,
    title: 'Luyện nghe chuẩn đề thi',
    description: 'Luyện tập Part 1–4 với giọng đọc chuẩn TOEIC.',
  },
  {
    icon: <FileDoneOutlined style={{ fontSize: 36, color: '#1890ff' }} />,
    title: 'Thư viện đề thi thử',
    description: 'Thi thử TOEIC trực tuyến, chấm điểm tự động.',
  },
  {
    icon: <LineChartOutlined style={{ fontSize: 36, color: '#1890ff' }} />,
    title: 'Thống kê tiến độ',
    description: 'Phân tích điểm mạnh/yếu, gợi ý cải thiện.',
  },
];

const sampleCourses = [
  {
    id: 1,
    title: 'TOEIC Cơ bản – Dành cho người mất gốc',
    description: 'Khóa học giúp xây nền tảng vững chắc.',
    image: 'https://toigingiuvedep.vn/wp-content/uploads/2022/03/hinh-nen-hoa-hoc-nhieu-hinh-ve-de-thuong.jpg',
    author: 'Nguyễn Văn A',
    category: 'TOEIC Foundation',
  },
  {
    id: 2,
    title: 'TOEIC 700+ – Tăng tốc điểm số',
    description: 'Rèn luyện chuyên sâu Part 5–7, cải thiện tốc độ.',
    image: 'https://toigingiuvedep.vn/wp-content/uploads/2022/03/hinh-nen-hoa-hoc-nhieu-hinh-ve-de-thuong.jpg',
    author: 'Trần Thị B',
    category: 'TOEIC Intensive',
  },
  {
    id: 3,
    title: 'Luyện nghe TOEIC Part 1–4',
    description: 'Tập trung nâng kỹ năng nghe hiểu thực tế.',
    image: 'https://toigingiuvedep.vn/wp-content/uploads/2022/03/hinh-nen-hoa-hoc-nhieu-hinh-ve-de-thuong.jpg',
    author: 'Lê Văn C',
    category: 'TOEIC Listening',
  },
  {
    id: 4,
    title: 'Luyện nghe TOEIC Part 1',
    description: 'Tập trung nâng kỹ năng nghe hiểu thực tế.',
    image: 'https://toigingiuvedep.vn/wp-content/uploads/2022/03/hinh-nen-hoa-hoc-nhieu-hinh-ve-de-thuong.jpg',
    author: 'Lê Văn C',
    category: 'TOEIC Listening',
  },
  {
    id: 5,
    title: 'Luyện nghe TOEIC Part 3',
    description: 'Tập trung nâng kỹ năng nghe hiểu thực tế.',
    image: 'https://toigingiuvedep.vn/wp-content/uploads/2022/03/hinh-nen-hoa-hoc-nhieu-hinh-ve-de-thuong.jpg',
    author: 'Lê Văn C',
    category: 'TOEIC Listening',
  },
  {
    id: 6,
    title: 'Luyện nghe TOEIC Part 3',
    description: 'Tập trung nâng kỹ năng nghe hiểu thực tế.',
    image: 'https://toigingiuvedep.vn/wp-content/uploads/2022/03/hinh-nen-hoa-hoc-nhieu-hinh-ve-de-thuong.jpg',
    author: 'Lê Văn C',
    category: 'TOEIC Listening',
  },
];

const testimonials = [
  {
    name: 'Nguyễn Văn A',
    feedback:
      'Sau 2 tháng học ở đây, mình tăng từ 550 lên 735 TOEIC. Hệ thống học rất khoa học!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Trần Thị B',
    feedback:
      'Khóa học rõ ràng, dễ hiểu, có thống kê quá trình học rất hữu ích!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Nguyễn Văn A',
    feedback:
      'Sau 2 tháng học ở đây, mình tăng từ 550 lên 735 TOEIC. Hệ thống học rất khoa học!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Trần Thị B',
    feedback:
      'Khóa học rõ ràng, dễ hiểu, có thống kê quá trình học rất hữu ích!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="Home">
      <div
        className="home-banner"
        style={{
          textAlign: 'center',
          padding: '80px 16px',
          marginTop: 24,
          marginLeft: 24,
          marginRight: 24,
          backgroundImage: "url('https://iigacademy.edu.vn/wp-content/uploads/2021/10/Banner-002-1536x864.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          borderRadius: 12,
          position: 'relative',
          overflow: 'hidden',
          minHeight:350
        }}
      >
      <div
        style={{
          marginTop: 25,
          position: 'relative',
          zIndex: 2,
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <Title style={{ color: 'white' }}>Chinh phục TOEIC một cách dễ dàng</Title>
        <Paragraph style={{ color: 'white', fontSize: 18 }}>
          Lộ trình học toàn diện – luyện đề – chấm điểm tự động – phân tích điểm mạnh/yếu.
        </Paragraph>
        <Button type="primary" size="large">
          Bắt đầu học miễn phí
        </Button>
      </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1,
          }}
        ></div>
      </div>

      <Row gutter={[16, 16]} justify="center" style={{ margin: 36 }}>
        {features.map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card bordered={false} style={{ textAlign: 'center', minHeight:200 }} hoverable>
              {item.icon}
              <Title level={4} style={{ marginTop: 16 }}>{item.title}</Title>
              <Paragraph>{item.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>


      <div
        style={{
        marginTop: 60,
        marginBottom: 60,
        padding: '0 36px',
        }}
      >
        <Row gutter={[32, 32]} align="middle" justify="center">
        {/* AMH */}
          <Col xs={24} md={10} style={{ textAlign: 'center' }}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/6009/6009864.png"
              alt="About us"
              style={{ maxWidth: '100%', borderRadius: 12 }}
            />
            <div
              style={{
                marginTop: 16,
                backgroundColor: '#f9f9f9',
                borderRadius: 12,
                padding: '8px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              
            </div>
          </Col>

        {/* ND */}
          <Col xs={24} md={14}>
            <Title style={{fontSize: 30, marginBottom:30}} level={3}>Về LearnEZ</Title>
              <Paragraph style={{fontSize: 18}}>
                Chúng tôi là một nhóm gồm các giảng viên, lập trình viên và chuyên gia giáo dục, luôn nỗ lực tạo ra nền tảng học TOEIC chất lượng cao.
              </Paragraph>
              <Paragraph style={{fontSize:18, marginBottom:30}}>
                Với đội ngũ nhiều kinh nghiệm và nội dung được cập nhật liên tục, chúng tôi cam kết mang đến cho bạn một trải nghiệm học tập hiệu quả, khoa học và cá nhân hóa.
              </Paragraph>

            <Space direction="vertical" size="middle">
              <Space>
                <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" style={{ width: 30 }} />
                <Text strong style={{fontSize:18}}>Bài giảng và bài tập chất lượng</Text>
              </Space>
              <Space>
                <img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" style={{ width: 30 }} />
                <Text strong style={{fontSize: 18}}>Đội ngũ hỗ trợ nhiệt tình</Text>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>


      
      <div className="hot-course" style={{ marginBottom: 48, marginLeft: 36, marginRight: 36 }}>
        
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>Các khóa học nổi bật</Title>
          </Col>
          <Col>
            <Button type="link" onClick={() => navigate('/courses')}>
                Xem tất cả
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {sampleCourses.map((course) => (
          <Col key={course.id} xs={24} sm={12} md={8}>
            <Card
              hoverable
              onClick={() => navigate(`/courses/${course.id}`)}
              style={{ cursor: 'pointer' }}
              cover={<img className="img_kh_hot" style={{paddingTop:20, paddingLeft:20, paddingRight: 20}} alt={course.title} src={course.image} />}
              >
              <h3>{course.title}</h3>
              <p style={{ marginTop: 10 }}><strong>Tác giả:</strong> {course.author}</p>
              <p><strong>Chuyên mục:</strong> {course.category}</p>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" onClick={() => navigate(`/courses/${course.id}`)}>Xem chi tiết</Button>
              </div>
            </Card>
          </Col>
          ))}
        </Row>
      </div>

      
      <div style={{ marginBottom: 48, marginLeft: 34, marginRight: 19 }}>
        <Title level={2}>Học viên nói gì?</Title>
        <Carousel autoplay dots={true} slidesToShow={4}>
          {testimonials.map((item, index) => (
            <div key={index}>
              <Card hoverable bordered style={{ 
                textAlign: 'center', 
                height: '100%',
                marginRight: 15,
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <img
                  src={item.avatar}
                  alt={item.name}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                </div>
                <Paragraph strong style={{ marginBottom: 12 }}>{item.name}</Paragraph>
                <Paragraph style={{ fontSize: 14, color: '#555' }}>"{item.feedback}"</Paragraph>
              </Card>
            </div>
          ))}
        </Carousel>
      </div>

      
      <div style={{ textAlign: 'center', background: '#f0f2f5', padding: '40px 16px' }}>
        <Title level={3}>Sẵn sàng nâng điểm TOEIC của bạn chưa?</Title>
        <Button type="primary" size="large">Kết nối ngay!</Button>
      </div>

      
      <div style={{ marginTop: 48, padding: '40px 86px', background: '#001529', color: 'white' }}>
        <Row gutter={[32, 16]} justify="space-between">
          <Col xs={24} sm={12} md={10}>
            <Title level={4} style={{ color: 'white' }}>LearnEZ</Title>
            <Paragraph style={{color: 'white'}}>Chuyên trang luyện thi TOEIC trực tuyến – cập nhật theo định dạng mới nhất.</Paragraph>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Title level={5} style={{ color: 'white' }}>Liên hệ</Title>
            <Paragraph style={{color: 'white'}}><MailOutlined /> support@toeicweb.vn</Paragraph>
            <Paragraph style={{color: 'white'}}><PhoneOutlined /> 0123 456 789</Paragraph>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Title level={5} style={{ color: 'white' }}>Kết nối với chúng tôi</Title>
            <Space>
              <Link href="https://facebook.com" target="_blank"><FacebookFilled style={{ fontSize: 24, color: 'white' }} /></Link>
              <Link href="https://youtube.com" target="_blank"><YoutubeFilled style={{ fontSize: 24, color: 'white' }} /></Link>
            </Space>
          </Col>
        </Row>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ color: 'white' }}>© {new Date().getFullYear()} TOEIC Learning Platform. Được phát triển bởi Nhóm Phát Triển EdTech.</Text>
        </div>
      </div>
    </div>
  );
};

export default Home;