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
        imageUrl: 'https://kynguyenlamdep.com/wp-content/uploads/2022/08/meme-meo-loading.jpg', 
        lessonCount: 15, 
        totalDuration: '20h', 
        enrolledStudents: 120 
      },
      { 
        id: 2, 
        title: 'Khóa học React cơ bản', 
        imageUrl: 'https://phunugioi.com/wp-content/uploads/2022/04/Anh-meme-meo-1.jpg', 
        lessonCount: 10, 
        totalDuration: '12h', 
        enrolledStudents: 85 
      },
      { 
        id: 3, 
        title: 'Khóa học Python cho người mới', 
        imageUrl: 'https://th.bing.com/th/id/OIP.F6KuP9D1eDV365VwIWr76AHaFt?w=800&h=617&rs=1&pid=ImgDetMain&cb=idpwebpc2', 
        lessonCount: 20, 
        totalDuration: '25h', 
        enrolledStudents: 200 
      },
      { 
        id: 4, 
        title: 'Khóa học Python cho người mới Khóa học Python cho người mới Khóa học Python cho người mới', 
        imageUrl: 'https://kynguyenlamdep.com/wp-content/uploads/2022/08/meme-meo-loading.jpg', 
        lessonCount: 20, 
        totalDuration: '25h', 
        enrolledStudents: 200 
      },
      { 
        id: 5, 
        title: 'Khóa học Python cho người mới', 
        imageUrl: 'https://kynguyenlamdep.com/wp-content/uploads/2022/08/meme-meo-loading.jpg', 
        lessonCount: 20, 
        totalDuration: '25h', 
        enrolledStudents: 200 
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
      <h2>Khóa học Video</h2>
      <Row gutter={[16, 16]}>
        {courses.map(course => (
          <Col key={course.id} xs={24} sm={12} md={8} lg={6} >
            <Card 
              cover={<img alt={course.title} src={course.imageUrl} />}
              bordered={false} 
              className="course-card"
            >
              <Card.Meta title={course.title} />
              <div className="course-info">
                <span><BookOutlined /> {course.lessonCount}</span>
                <span><ClockCircleOutlined /> {course.totalDuration}</span>
                <span><UserOutlined /> {course.enrolledStudents}</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default VideoCourses;