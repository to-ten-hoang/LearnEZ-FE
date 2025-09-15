// pages/Cart/Cart.tsx
import React, { useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Empty,
  List,
  Image,
  Modal,
  Divider,
} from "antd";
import {
  DeleteOutlined,
  CreditCardOutlined,
  ClearOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../../store/cartStore";
import {
  removeFromCartService,
  clearCartService,
} from "../../../services/cartService";
import type { CartItem } from "../../../types/cart";
import "./Cart.css";

const { Title, Text } = Typography;

const CartPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    items,
    itemCount,
    totalAmount,
    isLoading,
    removeItem,
    clearCart,
    refreshCart,
  } = useCartStore();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // const formatRelativeTime = (dateString: string | null) => {
  //   if (!dateString) return 'Không xác định';

  //   const now = new Date();
  //   const date = new Date(dateString);
  //   const diffMs = now.getTime() - date.getTime();
  //   const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  //   const diffDays = Math.floor(diffHours / 24);

  //   if (diffDays > 0) return `${diffDays} ngày trước`;
  //   if (diffHours > 0) return `${diffHours} giờ trước`;
  //   return 'Vừa xong';
  // };

  // ✅ EVENT HANDLERS
  const handleRemoveItem = async (cartItemId: number, courseName: string) => {
    Modal.confirm({
      title: "Xác nhận xóa khóa học",
      content: `Bạn có chắc muốn xóa "${courseName}" khỏi giỏ hàng?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await removeFromCartService(cartItemId);

          // Optimistic update
          removeItem(cartItemId);

          // Refresh để sync với server
          setTimeout(() => refreshCart(), 500);
        } catch (error) {
          console.error("Remove from cart failed:", error);
        }
      },
    });
  };

  const handleBuyFromCart = async (cartItemId: number, courseName: string) => {
    try {
      const { purchaseFromCartService } = await import(
        "../../../services/orderService"
      );
      // const addOrder  = await import('../../store/orderStore');
      const orderResponse = await purchaseFromCartService(cartItemId);

      if (orderResponse.code === 200) {
        // ✅ Cập nhật order store
        const { default: useOrderStore } = await import(
          "../../../store/orderStore"
        );
        useOrderStore.getState().addOrder(orderResponse.data);

        // ✅ Xóa item khỏi cart sau khi tạo order thành công
        removeItem(cartItemId);

        // ✅ Show success và navigate đến orders page
        Modal.success({
          title: "Tạo đơn hàng thành công!",
          content: `Đơn hàng cho "${courseName}" đã được tạo. Chuyển đến trang đơn hàng để thanh toán.`,
          onOk: () => {
            navigate("/dashboard/orders");
          },
        });

        // ✅ Auto navigate sau 2s nếu user không click OK
        setTimeout(() => {
          navigate("/dashboard/orders");
        }, 2000);
      }
    } catch (error) {
      console.error("Purchase from cart failed:", error);
      // Error message đã được handle trong service
    }
  };

  const handleClearCart = () => {
    if (itemCount === 0) return;

    Modal.confirm({
      title: "Xóa tất cả khóa học",
      content: `Bạn có chắc muốn xóa tất cả ${itemCount} khóa học trong giỏ hàng?`,
      okText: "Xóa tất cả",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          const cartItemIds = items.map((item) => item.id);

          // Clear local state first
          clearCart();

          // Then call API
          await clearCartService(cartItemIds);
        } catch (error) {
          console.error("Clear cart failed:", error);
          // Refresh nếu có lỗi
          refreshCart();
        }
      },
    });
  };

  const handleContinueShopping = () => {
    navigate("/courses");
  };

  const handleCheckoutAll = () => {
    if (itemCount === 0) return;

    Modal.info({
      title: "Tính năng đang phát triển",
      content:
        "Tính năng thanh toán tất cả sẽ được cập nhật sớm. Hiện tại bạn có thể mua từng khóa học một.",
    });
  };

  // ✅ RENDER CART ITEM
  const renderCartItem = (item: CartItem) => (
    <List.Item
      className="cart-item"
      actions={[
        <Button
          key="buy"
          type="primary"
          icon={<CreditCardOutlined />}
          onClick={() => handleBuyFromCart(item.id, item.course.title)}
        >
          Mua ngay
        </Button>,
        <Button
          key="remove"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(item.id, item.course.title)}
        >
          Xóa
        </Button>,
      ]}
    >
      <List.Item.Meta
        avatar={
          <Image
            src={
              item.course.thumbnailUrl ||
              "https://symbols.vn/wp-content/uploads/2023/10/Share-hinh-anh-meo-ngu-ngon-ba-dao-nhat.jpg"
            }
            alt={item.course.title}
            width={80}
            height={80}
            style={{ borderRadius: 8, objectFit: "cover" }}
            preview={false}
            fallback="/assets/default-course.jpg"
          />
        }
        title={
          <div className="item-title">
            <Title level={4} ellipsis={{ tooltip: item.course.title }}>
              {item.course.title}
            </Title>
            <Text type="secondary">Tác giả: {item.course.authorName}</Text>
          </div>
        }
        description={
          <div className="item-description">
            {/* <Text ellipsis={{ tooltip: item.course.description }}>
              {item.course.description}
            </Text> */}
            <div className="item-meta">
              <Text type="secondary">
                Chủ đề: {item.course.categoryName || "Chưa phân loại"}
              </Text>
              {/* <Text type="secondary">
                Thêm vào giỏ: {formatRelativeTime(item.createdAt)}
              </Text> */}
            </div>
          </div>
        }
      />
      <div className="item-price">
        <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
          {formatPrice(item.course.price)}
        </Title>
      </div>
    </List.Item>
  );

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className="cart-page">
        <Card className="cart-loading">
          <div className="loading-content">
            <span className="loading-spinner" />
            <Title level={4}>Đang tải giỏ hàng...</Title>
          </div>
        </Card>
      </div>
    );
  }

  // ✅ EMPTY STATE
  if (itemCount === 0) {
    return (
      <div className="cart-page">
        <h2>Giỏ hàng trống</h2>
        <Card className="empty-cart">
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{ height: 100 }}
            description={
              <div>
                <Title level={4}>Giỏ hàng trống</Title>
                <Text type="secondary">
                  Bạn chưa có khóa học nào trong giỏ hàng. Hãy khám phá các khóa
                  học tuyệt vời!
                </Text>
              </div>
            }
          >
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={handleContinueShopping}
            >
              Khám phá khóa học
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* ✅ PAGE HEADER - Updated to match MemberManagement style */}
      <div className="cart-header-actions">
        <h2>Giỏ hàng </h2>
        <div className="header-actions">
          <Button
            icon={<ClearOutlined />}
            onClick={handleClearCart}
            disabled={itemCount === 0}
          >
            Xóa tất cả
          </Button>
          <Button onClick={handleContinueShopping}>Tiếp tục mua sắm</Button>
        </div>
      </div>

      {/* ✅ CART CONTENT */}
      <div className="cart-content">
        <Card className="cart-items">
          <List
            dataSource={items}
            renderItem={renderCartItem}
            className="cart-list"
          />
        </Card>

        {/* ✅ CART SUMMARY */}
        <Card className="cart-summary" title="Tổng kết giỏ hàng">
          <div className="summary-content">
            <div className="summary-row">
              <Text>Số khóa học:</Text>
              <Text strong>{itemCount}</Text>
            </div>

            <div className="summary-row">
              <Text>Tạm tính:</Text>
              <Text strong>{formatPrice(totalAmount)}</Text>
            </div>

            <Divider style={{ margin: "12px 0" }} />

            <div className="summary-row total-row">
              <Title level={4} style={{ margin: 0 }}>
                Tổng cộng:
              </Title>
              <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                {formatPrice(totalAmount)}
              </Title>
            </div>

            <div className="summary-actions">
              <Button
                type="primary"
                size="large"
                block
                disabled={itemCount === 0}
                icon={<CreditCardOutlined />}
                onClick={handleCheckoutAll}
              >
                Thanh toán tất cả
              </Button>

              <Text
                type="secondary"
                style={{ textAlign: "center", fontSize: 12, marginTop: 8 }}
              >
                Hoặc mua từng khóa học riêng lẻ
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CartPage;
