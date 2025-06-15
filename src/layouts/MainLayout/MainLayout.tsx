import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, Button, Layout } from 'antd';
import useAuthStore from '../../store/authStore';
import logo from '../../assets/logo.svg';
import LoginModal from '../../components/common/Auth/LoginModal/LoginModal';
import RegisterModal from '../../components/common/Auth/RegisterModal/RegisterModal';
import Notification from '../../components/common/Notification/Notification';
import UserMenu from '../../components/common/UserMenu/UserMenu';
import './MainLayout.css';

const { Header } = Layout;

const MainLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);

  const showLogin = () => {
    setIsLoginVisible(true);
  };

  const handleCloseLogin = () => {
    setIsLoginVisible(false);
  };

  const showRegister = () => {
    setIsRegisterVisible(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterVisible(false);
  };

  const menuItems = [
    { key: 'home', label: <Link to="/">Trang chủ</Link> },
    { key: 'courses', label: <Link to="/courses">Khóa học</Link> },
    { key: 'blog', label: <Link to="/blog">Blog</Link> },
    { key: 'test', label: <Link to="/test">Kiểm tra</Link> },
  ];

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-container">
          <div className="logo">
            <Link to="/" className="logo-link">
              <img src={logo} alt="Logo" className="logo-img" />
            </Link>
          </div>
          <div className="menu-container">
            <Menu
              mode="horizontal"
              items={menuItems}
              className="main-menu"
              theme="light"
            />
            <div className="auth-buttons">
              {isAuthenticated ? (
                <>
                  <Notification />
                  <UserMenu />
                </>
              ) : (
                <>
                  <Button type="link" onClick={showLogin}>
                    Đăng nhập
                  </Button>
                  <Button type="primary" onClick={showRegister}>
                    Đăng ký
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Header>
      <main>
        <Outlet />
        <LoginModal visible={isLoginVisible} onClose={handleCloseLogin} />
        <RegisterModal visible={isRegisterVisible} onClose={handleCloseRegister} />
      </main>
    </Layout>
  );
};

export default MainLayout;