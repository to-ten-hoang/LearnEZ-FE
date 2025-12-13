// components/Dashboard/Navigation/Navigation.tsx - Updated with Orders and Collapsible Sidebar
import { Menu, Button, Tooltip } from 'antd';
import {
    UserOutlined,
    VideoCameraOutlined,
    TeamOutlined,
    BarChartOutlined,
    BookOutlined,
    SolutionOutlined,
    FileTextOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import useAuthStore from 'store/authStore';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

interface NavigationProps {
    collapsed: boolean;
    onToggle: () => void;
    isMobile: boolean;
}

const Navigation = ({ collapsed, onToggle, isMobile }: NavigationProps) => {
    const { user } = useAuthStore();
    const location = useLocation();
    const [selectedKey, setSelectedKey] = useState(location.pathname.split('/')[2] || 'profile');

    // Update selectedKey when location changes
    useEffect(() => {
        const key = location.pathname.split('/')[2] || 'profile';
        setSelectedKey(key);
    }, [location.pathname]);

    // ✅ UPDATED: Student items với Cart và Orders
    const studentItems = [
        { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
        {
            key: 'video-courses',
            icon: <VideoCameraOutlined />,
            label: 'Khóa học online',
        },
        {
            key: 'offline-classes',
            icon: <TeamOutlined />,
            label: 'Lớp học offline',
        },
        { key: 'cart', icon: <ShoppingCartOutlined />, label: 'Giỏ hàng' },
        { key: 'orders', icon: <ShoppingOutlined />, label: 'Lịch sử đơn hàng' },
        // {
        //     key: 'member-management',
        //     icon: <SolutionOutlined />,
        //     label: 'Quản lý thành viên',
        // },
    ];

    const teacherItems = [
        { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
        {
            key: 'class-management',
            icon: <TeamOutlined />,
            label: 'Quản lý lớp học',
        },
        { key: 'question-bank', icon: <BookOutlined />, label: 'Ngân hàng đề' },
    ];

    const managerItems = [
        { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
        { key: 'statistics', icon: <BarChartOutlined />, label: 'Xem thống kê' },
        {
            key: 'member-management',
            icon: <SolutionOutlined />,
            label: 'Quản lý thành viên',
        },
        {
            key: 'course-management',
            icon: <BookOutlined />,
            label: 'Quản lý khóa học',
        },
        {
            key: 'blog-approval',
            icon: <FileTextOutlined />,
            label: 'Duyệt blog',
        },
        {
            key: 'question-bank',
            icon: <BookOutlined />,
            label: 'Ngân hàng đề',
        },
        { key: 'business', icon: <DollarOutlined />, label: 'Kinh doanh' },
        {
            key: 'class-management',
            icon: <TeamOutlined />,
            label: 'Quản lý lớp học',
        },
    ];

    const consultantItems = [
        { key: 'profile', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
        { key: 'write-blog', icon: <FileTextOutlined />, label: 'Viết blog' },
        {
            key: 'course-management',
            icon: <BookOutlined />,
            label: 'Quản lý khóa học',
        },
        {
            key: 'class-management',
            icon: <TeamOutlined />,
            label: 'Quản lý lớp học',
        },
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

    const getRoleLabel = () => {
        switch (user?.role) {
            case 'teacher':
                return 'Giáo viên';
            case 'manager':
                return 'Quản lý';
            case 'consultant':
                return 'Tư vấn viên';
            default:
                return 'Học sinh';
        }
    };

    const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

    return (
        <div className={`profile-sidebar ${collapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
            {/* Toggle button - top right */}
            <div className="toggle-row">
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={onToggle}
                    className="toggle-btn"
                />
            </div>

            {/* Avatar centered + Name below */}
            <div className="avatar-section">
                <img
                    src="https://mcdn.coolmate.me/image/March2023/meme-meo-cute-hai-huoc-1297_521.jpg"
                    alt=""
                    className="avatar-img"
                />
                {!collapsed && (
                    <div className="user-info">
                        <span className="user-role">{getRoleLabel()}</span>
                        <span className="user-name">{userName}</span>
                    </div>
                )}
            </div>


            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                onSelect={({ key }) => setSelectedKey(key)}
                inlineCollapsed={collapsed && !isMobile}
                items={items.map((item) => ({
                    key: item.key,
                    icon: collapsed && !isMobile ? (
                        <Tooltip title={item.label} placement="right">
                            <Link to={`/dashboard/${item.key}`} className="collapsed-icon-link">
                                {item.icon}
                            </Link>
                        </Tooltip>
                    ) : (
                        item.icon
                    ),
                    label: collapsed && !isMobile ? null : (
                        <Link to={`/dashboard/${item.key}`}>{item.label}</Link>
                    ),
                }))}
            />
        </div>
    );
};

export default Navigation;
