import { useState } from 'react';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Dropdown, type MenuProps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import './UserMenu.css';
import useCartStore from 'store/cartStore';

const UserMenu = () => {
    const { logout } = useAuthStore();
    const { clearCart } = useCartStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const items: MenuProps['items'] = [
        {
            key: 'dashboard',
            icon: <UserOutlined />,
            label: <Link to="/dashboard/profile">Dashboard</Link>,
        },
        // {
        //     key: 'courses',
        //     icon: <BookOutlined />,
        //     label: <Link to={`/${user?.role}/dashboard`}>Khóa học của tôi</Link>,
        // },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: () => {
                logout();
                navigate('/');
                clearCart();
            },
        },
    ];

    return (
        <Dropdown
            menu={{ items }}
            trigger={['hover']}
            open={isOpen}
            onOpenChange={(open) => setIsOpen(open)}
        >
            <UserOutlined className="user-icon" />
        </Dropdown>
    );
};

export default UserMenu;
