// layouts/MainLayout/MainLayout.tsx - Updated with Cart Integration & Mobile Menu
import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, Button, Layout, Drawer } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import useAuthStore from '../../store/authStore';
import logo from '../../assets/logo.svg';
import LoginModal from '../../components/common/Auth/LoginModal/LoginModal';
import RegisterModal from '../../components/common/Auth/RegisterModal/RegisterModal';
import Notification from '../../components/common/Notification/Notification';
import UserMenu from '../../components/common/UserMenu/UserMenu';
import CartBadge from '../../components/common/CartBadge/CartBadge';
import './MainLayout.css';

const { Header } = Layout;

const MainLayout = () => {
    const { isAuthenticated, user } = useAuthStore();
    const [isLoginVisible, setIsLoginVisible] = useState(false);
    const [isRegisterVisible, setIsRegisterVisible] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const showLogin = () => {
        setIsLoginVisible(true);
        setIsMobileMenuOpen(false);
    };

    const handleCloseLogin = () => {
        setIsLoginVisible(false);
    };

    const showRegister = () => {
        setIsRegisterVisible(true);
        setIsMobileMenuOpen(false);
    };

    const handleCloseRegister = () => {
        setIsRegisterVisible(false);
    };

    const handleMenuClick = () => {
        setIsMobileMenuOpen(false);
    };

    const menuItems = [
        { key: 'home', label: <Link to="/" onClick={handleMenuClick}>Trang chủ</Link> },
        { key: 'courses', label: <Link to="/courses" onClick={handleMenuClick}>Khóa học</Link> },
        { key: 'blog', label: <Link to="/blog" onClick={handleMenuClick}>Blog</Link> },
        // { key: 'test', label: <Link to="/test" onClick={handleMenuClick}>Kiểm tra</Link> },
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

                    {/* Desktop Menu */}
                    <div className={`menu-container ${isMobile ? 'hidden-mobile' : ''}`}>
                        <Menu
                            mode="horizontal"
                            items={menuItems}
                            className="main-menu"
                            theme="light"
                        />

                        <div className="auth-buttons">
                            {isAuthenticated ? (
                                <>
                                    {/* ✅ CART BADGE - Chỉ hiển thị cho student */}
                                    {user?.role === 'student' && (
                                        <div className="header-cart">
                                            <CartBadge showText={false} size="middle" />
                                        </div>
                                    )}

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

                    {/* Mobile Header Actions */}
                    {isMobile && (
                        <div className="mobile-header-actions">
                            {isAuthenticated && (
                                <>
                                    {user?.role === 'student' && (
                                        <CartBadge showText={false} size="small" />
                                    )}
                                    <Notification />
                                    <UserMenu />
                                </>
                            )}
                            <Button
                                type="text"
                                icon={<MenuOutlined />}
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="mobile-menu-btn"
                            />
                        </div>
                    )}
                </div>
            </Header>

            {/* Mobile Menu Drawer */}
            <Drawer
                title="Menu"
                placement="right"
                onClose={() => setIsMobileMenuOpen(false)}
                open={isMobileMenuOpen}
                className="mobile-menu-drawer"
                width={280}
                closeIcon={<CloseOutlined />}
            >
                <Menu
                    mode="vertical"
                    items={menuItems}
                    className="mobile-drawer-menu"
                />
                {!isAuthenticated && (
                    <div className="mobile-auth-buttons">
                        <Button type="primary" block onClick={showLogin}>
                            Đăng nhập
                        </Button>
                        <Button block onClick={showRegister} style={{ marginTop: 8 }}>
                            Đăng ký
                        </Button>
                    </div>
                )}
            </Drawer>

            <main className="main-content">
                <Outlet />
                <LoginModal visible={isLoginVisible} onClose={handleCloseLogin} />
                <RegisterModal visible={isRegisterVisible} onClose={handleCloseRegister} />
            </main>
        </Layout>
    );
};

export default MainLayout;
