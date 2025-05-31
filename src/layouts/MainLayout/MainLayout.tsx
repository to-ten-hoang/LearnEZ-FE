import { Outlet, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
// import './MainLayout.css';

const MainLayout = () => {

  const {isAuthenticated, user} = useAuthStore();
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Trang chủ</Link>
          <Link to="/courses">Khóa học</Link>
          <Link to="/blog">Blog</Link>
          {isAuthenticated ? (
            <>
              <Link to={`/${user?.role}/dashboard`}>Lớp học của tôi</Link>
              <button onClick={()=> useAuthStore.getState().logout}>
                Đăng xuất
              </button>
            </>
          ) :
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
            </>
          }
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