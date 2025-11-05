// components/common/CartBadge/CartBadge.tsx
import React, { useEffect, useState } from 'react';
import { Badge, Tooltip } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import useCartStore from '../../../store/cartStore';
import CartDrawer from '../../student/Cart/CartDrawer';
import './CartBadge.css';

interface CartBadgeProps {
    size?: 'small' | 'middle' | 'large';
    showText?: boolean;
    className?: string;
}
const CartBadge: React.FC<CartBadgeProps> = ({
    size = 'middle',
    showText = false,
    className = '',
}) => {
    // ✅ CART STATE
    const { itemCount, refreshCart } = useCartStore();
    useEffect(() => {
        refreshCart();
    }, []);

    // ✅ DRAWER STATE
    const [drawerVisible, setDrawerVisible] = useState(false);

    // ✅ EVENT HANDLERS
    const handleCartClick = () => {
        setDrawerVisible(true);
    };

    const handleDrawerClose = () => {
        setDrawerVisible(false);
    };

    // ✅ GET CONTAINER CLASS
    const getContainerClass = () => {
        const baseClass = 'cart-badge-container';
        const sizeClass = size !== 'middle' ? `size-${size}` : '';
        return [baseClass, sizeClass, className].filter(Boolean).join(' ');
    };

    return (
        <>
            <div className={getContainerClass()}>
                <Badge count={itemCount} showZero={false} overflowCount={99} className="cart-badge">
                    <Tooltip title={`Giỏ hàng (${itemCount} khóa học)`} placement="bottom">
                        <div
                            className="cart-button"
                            onClick={handleCartClick}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleCartClick();
                                }
                            }}
                        >
                            <ShoppingCartOutlined className="cart-icon" />
                            {showText && (
                                <span className="cart-text">
                                    Giỏ hàng
                                    {itemCount > 0 && (
                                        <span className="cart-count">({itemCount})</span>
                                    )}
                                </span>
                            )}
                        </div>
                    </Tooltip>
                </Badge>
            </div>

            {/* ✅ CART DRAWER */}
            <CartDrawer visible={drawerVisible} onClose={handleDrawerClose} />
        </>
    );
};

export default CartBadge;
