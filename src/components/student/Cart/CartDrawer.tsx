// components/Cart/CartDrawer/CartDrawer.tsx
import React from 'react';
import { Drawer, List, Button, Empty, Typography, Modal, Spin, Image } from 'antd';
import { DeleteOutlined, CreditCardOutlined, ClearOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../../store/cartStore';
import { removeFromCartService } from '../../../services/cartService';
import type { CartItem } from '../../../types/cart';
import './CartDrawer.css';

const { Title, Text } = Typography;

interface CartDrawerProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * ✅ CART DRAWER COMPONENT
 * 
 * Drawer hiển thị nhanh giỏ hàng từ header
 * Cho phép xem, xóa items và navigate đến full cart page
 */
const CartDrawer: React.FC<CartDrawerProps> = ({ visible, onClose }) => {
  const navigate = useNavigate();
  
  // ✅ CART STATE
  const { 
    items, 
    itemCount, 
    totalAmount, 
    isLoading,
    removeItem,
    clearCart,
    refreshCart
  } = useCartStore();

  // ✅ FORMAT PRICE HELPER
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // ✅ EVENT HANDLERS
  const handleRemoveItem = async (cartItemId: number, courseName: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa "${courseName}" khỏi giỏ hàng?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await removeFromCartService(cartItemId);
          
          // ✅ Optimistic update - xóa khỏi store ngay
          removeItem(cartItemId);
          
          // ✅ Refresh sau 500ms để sync với server
          setTimeout(() => {
            refreshCart();
          }, 500);
          
        } catch (error) {
          console.error('Remove from cart failed:', error);
          // Error message đã được handle trong service
        }
      }
    });
  };

  const handleBuyFromCart = async (cartItemId: number) => {
    try {
      // TODO: Implement purchase from cart
      console.log('Buy from cart:', cartItemId);
      
      // Close drawer after purchase
      onClose();
      
    } catch (error) {
      console.error('Purchase from cart failed:', error);
    }
  };

  const handleClearCart = () => {
    if (itemCount === 0) return;
    
    Modal.confirm({
      title: 'Xóa tất cả khóa học',
      content: `Bạn có chắc muốn xóa tất cả ${itemCount} khóa học trong giỏ hàng?`,
      okText: 'Xóa tất cả',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          // Clear local state first
          clearCart();
          
          // Then call API to clear server
          const cartItemIds = items.map(item => item.id);
          const { clearCartService } = await import('../../../services/cartService');
          await clearCartService(cartItemIds);
          
        } catch (error) {
          console.error('Clear cart failed:', error);
          // Refresh để sync với server nếu có lỗi
          refreshCart();
        }
      }
    });
  };

  const handleViewFullCart = () => {
    navigate('/dashboard/cart');
    onClose();
  };

  // ✅ RENDER CART ITEM
  const renderCartItem = (item: CartItem) => (
    <List.Item
      key={item.id}
      className="cart-item"
      actions={[
        <Button
          key="buy"
          type="primary"
          size="small"
          icon={<CreditCardOutlined />}
          onClick={() => handleBuyFromCart(item.id)}
        >
          Mua ngay
        </Button>,
        <Button
          key="remove"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(item.id, item.course.title)}
        />
      ]}
    >
      <List.Item.Meta
        avatar={
          <Image
            src={item.course.thumbnailUrl || '/assets/default-course.jpg'}
            alt={item.course.title}
            width={60}
            height={60}
            style={{ borderRadius: 4, objectFit: 'cover' }}
            preview={false}
            fallback="/assets/default-course.jpg"
          />
        }
        title={
          <div className="cart-item-title">
            <Text strong ellipsis={{ tooltip: item.course.title }}>
              {item.course.title}
            </Text>
          </div>
        }
        description={
          <div className="cart-item-description">
            <Text type="secondary" style={{ fontSize: 12 }}>
              {item.course.authorName}
            </Text>
            <br />
            <Text strong style={{ color: '#1890ff', fontSize: 14 }}>
              {formatPrice(item.course.price)}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <Drawer
      title={
        <div className="cart-drawer-header">
          <Title level={4} style={{ margin: 0 }}>
            Giỏ hàng ({itemCount})
          </Title>
          {itemCount > 0 && (
            <Button
              type="text"
              danger
              size="small"
              icon={<ClearOutlined />}
              onClick={handleClearCart}
            >
              Xóa tất cả
            </Button>
          )}
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      className="cart-drawer"
      footer={
        itemCount > 0 ? (
          <div className="cart-footer">
            <div className="cart-total">
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                Tổng: {formatPrice(totalAmount)}
              </Title>
            </div>
            
            <div className="cart-actions">
              <Button 
                size="large"
                onClick={handleViewFullCart}
                style={{ marginBottom: 8 }}
                block
              >
                Xem giỏ hàng đầy đủ
              </Button>
              
              <Button 
                type="primary" 
                size="large"
                disabled={itemCount === 0}
                block
              >
                Thanh toán tất cả ({itemCount} khóa học)
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      <div className="cart-content">
        {isLoading ? (
          <div className="cart-loading">
            <Spin size="large" />
            <Text style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
              Đang tải giỏ hàng...
            </Text>
          </div>
        ) : itemCount === 0 ? (
          <Empty 
            description="Giỏ hàng trống" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 60 }}
          >
            <Button type="primary" onClick={onClose}>
              Khám phá khóa học
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={items}
            renderItem={renderCartItem}
            split={false}
            className="cart-list"
          />
        )}
      </div>
    </Drawer>
  );
};

export default CartDrawer;