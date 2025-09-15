// src/components/public-page/CourseCard/CourseCard.tsx
import { useState } from "react";
import { Button, Card, message, Modal, Tag, Typography } from "antd";
import {
  ShoppingCartOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import type { Course } from "../../../../types/course";
import useAuthStore from "../../../../store/authStore";
import useCartStore from "../../../../store/cartStore";
import { addToCartService } from "../../../../services/cartService";
import { purchaseDirectlyService } from "../../../../services/orderService";
import useOrderStore from "../../../../store/orderStore";
import { useNavigate } from "react-router-dom";
import "./CourseCard.css";

const { Title } = Typography;

interface CourseCardProps {
  course: Course;
  onLoginRequest: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onLoginRequest }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { isItemInCart } = useCartStore();
  const { addOrder } = useOrderStore();

  // Thêm state cho loading
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const isStudent = isAuthenticated && user?.role === "student";
  const itemInCart = isItemInCart(course.id);
  const isBought = course.isBought;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!isStudent) {
      onLoginRequest();
      return;
    }
    setAddToCartLoading(true); // Bắt đầu loading
    try {
      const response = await addToCartService(course.id);
      if (response.code === 200) {
        message.success(`Đã thêm "${course.title}" vào giỏ hàng!`);
        useCartStore.getState().refreshCart();
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setAddToCartLoading(false); // Kết thúc loading
    }
  };

  const handleBuyNow = async () => {
    if (!isStudent) {
      onLoginRequest();
      return;
    }
    setBuyNowLoading(true); // Bắt đầu loading
    try {
      const response = await purchaseDirectlyService(course.id);
      if (response.code === 200) {
        addOrder(response.data);
        Modal.success({
          title: "Tạo đơn hàng thành công!",
          content: `Đơn hàng cho "${course.title}" đã được tạo. Chuyển đến trang đơn hàng để thanh toán.`,
          onOk: () => navigate("/dashboard/orders"),
        });
      }
    } catch (error) {
      console.error("Purchase directly failed:", error);
    } finally {
      setBuyNowLoading(false); // Kết thúc loading
    }
  };

  const handleGoToCourse = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <Card
      hoverable
      className="course-card"
      cover={
        <div className="course-card-cover">
          <img
            alt={course.title}
            src={
              course.thumbnailUrl ||
              "https://www.1min30.com/wp-content/uploads/2018/12/Symbole-Pornhub.jpg"
            }
            className="course-card-thumbnail"
          />
          <Tag color="blue" className="course-card-category-overlay">
            {course.categoryName || "Chung"}
          </Tag>
          {isBought && (
            <Tag color="#52c41a" className="course-card-bought-overlay">
              Đã sở hữu
            </Tag>
          )}
        </div>
      }
    >
      <div className="course-card-content">
        <Title
          level={5}
          className="course-card-title"
          ellipsis={{ rows: 2, tooltip: course.title }}
        >
          {course.title}
        </Title>
        <div className="course-card-footer">
          <Title level={4} className="course-card-price">
            {formatPrice(course.price)}
          </Title>
          <div className="course-card-actions">
            {isBought ? (
              <Button
                type="primary"
                icon={<BookOutlined />}
                onClick={handleGoToCourse}
              >
                Đến khóa học
              </Button>
            ) : (
              <>
                <Button
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  disabled={itemInCart || addToCartLoading}
                  loading={addToCartLoading} // Thêm loading prop
                >
                  {itemInCart ? (
                    <>
                      <CheckCircleOutlined /> Đã thêm
                    </>
                  ) : (
                    "Thêm vào giỏ"
                  )}
                </Button>
                <Button
                  type="primary"
                  icon={<CreditCardOutlined />}
                  onClick={handleBuyNow}
                  loading={buyNowLoading} // Thêm loading prop
                >
                  Mua ngay
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;
