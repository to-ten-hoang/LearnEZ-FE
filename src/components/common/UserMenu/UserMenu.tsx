import { useState } from 'react';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Dropdown, type MenuProps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import './UserMenu.css';
import useCartStore from 'store/cartStore';

const UserMenu = () => {
<<<<<<< HEAD
    const { logout } = useAuthStore();
=======
    const { user, logout } = useAuthStore();
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
    const { clearCart } = useCartStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const items: MenuProps['items'] = [
        {
            key: 'dashboard',
            icon: <UserOutlined />,
<<<<<<< HEAD
            label: <Link to="/dashboard/profile">Dashboard</Link>,
        },
        // {
        //     key: 'courses',
        //     icon: <BookOutlined />,
        //     label: <Link to={`/${user?.role}/dashboard`}>Khóa học của tôi</Link>,
        // },
=======
            label: <Link to="/dashboard/profile">Thông tin cá nhân</Link>,
        },
        {
            key: 'courses',
            icon: <BookOutlined />,
            label: <Link to={`/${user?.role}/dashboard`}>Khóa học của tôi</Link>,
        },
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
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
