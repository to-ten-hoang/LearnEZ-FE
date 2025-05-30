import { Outlet, Link } from 'react-router-dom';
// import './MainLayout.css';

const MainLayout = () => {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Trang chủ</Link>
          <Link to="/courses">Khóa học</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/login">Đăng nhập</Link>
          <Link to="/register">Đăng ký</Link>
          <Link to="/test">Test Toeic</Link>
        </nav>
      </header>
      <main>
        <Outlet /> {/* Nội dung của các trang con */}
      </main>
    </div>
  );
};

export default MainLayout;