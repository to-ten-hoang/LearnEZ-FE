// src/components/public-page/CourseList/CourseList.tsx
import { Col, Row, Spin, Empty } from 'antd';
import type { Course } from '../../../../types/course';
import CourseCard from '../CourseCard/CourseCard';

interface CourseListProps {
  courses: Course[];
  loading: boolean;
  onLoginRequest: () => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, loading, onLoginRequest }) => {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (courses.length === 0) {
    return <Empty description="Không tìm thấy khóa học nào phù hợp" />;
  }

  return (
    <Row gutter={[24, 24]}>
      {courses.map(course => (
        <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
          <CourseCard course={course} onLoginRequest={onLoginRequest} />
        </Col>
      ))}
    </Row>
  );
};

export default CourseList;