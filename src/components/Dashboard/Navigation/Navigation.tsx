import { Menu } from 'antd';
import { UserOutlined, VideoCameraOutlined, TeamOutlined, BarChartOutlined, BookOutlined, SolutionOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons';
import useAuthStore from 'store/authStore';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState(location.pathname.split('/')[2] || 'profile');

  const studentItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
    { key: 'video-courses', icon: <VideoCameraOutlined />, label: 'Khóa học video' },
    { key: 'offline-classes', icon: <TeamOutlined />, label: 'Lớp học offline' },
  ];

  const teacherItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
    { key: 'class-management', icon: <TeamOutlined />, label: 'Quản lý lớp học' },
    { key: 'question-bank', icon: <BookOutlined />, label: 'Ngân hàng đề' },
  ];

  const managerItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
    { key: 'statistics', icon: <BarChartOutlined />, label: 'Xem thống kê' },
    { key: 'member-management', icon: <SolutionOutlined />, label: 'Quản lý thành viên' },
    { key: 'course-management', icon: <BookOutlined />, label: 'Quản lý khóa học' },
    { key: 'blog-approval', icon: <FileTextOutlined />, label: 'Duyệt blog' },
    { key: 'question-bank', icon: <BookOutlined />, label: 'Ngân hàng đề' },
    { key: 'business', icon: <DollarOutlined />, label: 'Kinh doanh' },
  ];

  const consultantItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
    { key: 'write-blog', icon: <FileTextOutlined />, label: 'Viết blog' },
    { key: 'course-management', icon: <BookOutlined />, label: 'Quản lý khóa học' },
    { key: 'business', icon: <DollarOutlined />, label: 'Kinh doanh' },
  ];

  const items = (() => {
    switch (user?.role) {
      case 'manager':
        return managerItems;
      case 'consultant':
        return consultantItems;
      case 'teacher':
        return teacherItems;
      default:
        return studentItems;
    }
  })();

  return (
    <div className="profile-sidebar">
      <div className="avatar-section">
        <img src="https://mcdn.coolmate.me/image/March2023/meme-meo-cute-hai-huoc-1297_521.jpg" alt="" className="avatar-img" />
        <h3>
          {user?.role === 'teacher' ? 'Giáo viên' : 
           user?.role === 'manager' ? 'Quản lý' : 
           user?.role === 'consultant' ? 'Tư vấn viên' : 'Học sinh'}: 
          {` ${user?.firstName} ${user?.lastName}` || 'Userr'}
        </h3>
      </div>
      <Menu
        selectedKeys={[selectedKey]}
        onSelect={({ key }) => setSelectedKey(key)}
        items={items.map(item => ({
          key: item.key,
          icon: item.icon,
          label: <Link to={`/dashboard/${item.key}`}>{item.label}</Link>,
        }))}
      />
    </div>
  );
};

export default Navigation;