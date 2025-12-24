// src/components/student/Course/CourseDetailDrawer/CourseDetailDrawer.tsx
import { Drawer, Typography, Tag, Divider, Button } from 'antd';
import {
    UserOutlined,
    ShoppingCartOutlined,
    CreditCardOutlined,
    CheckCircleOutlined,
    BookOutlined,
} from '@ant-design/icons';
import type { Course } from '../../../../types/course';
import './CourseDetailDrawer.css';

const { Title, Text, Paragraph } = Typography;

interface CourseDetailDrawerProps {
    course: Course | null;
    visible: boolean;
    onClose: () => void;
    onAddToCart: () => void;
    onBuyNow: () => void;
    onGoToCourse: () => void;
    isInCart: boolean;
    addToCartLoading: boolean;
    buyNowLoading: boolean;
}

const CourseDetailDrawer: React.FC<CourseDetailDrawerProps> = ({
    course,
    visible,
    onClose,
    onAddToCart,
    onBuyNow,
    onGoToCourse,
    isInCart,
    addToCartLoading,
    buyNowLoading,
}) => {
    if (!course) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const isBought = course.isBought;

    return (
        <Drawer
            title="Chi tiết khóa học"
            placement="right"
            onClose={onClose}
            open={visible}
            width={420}
            className="course-detail-drawer"
        >
            <div className="drawer-content">
                {/* Thumbnail */}
                <div className="drawer-thumbnail">
                    <img
                        src={course.thumbnailUrl || 'https://placehold.co/400x200/e8e8e8/666?text=Course'}
                        alt={course.title}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/e8e8e8/666?text=Course';
                        }}
                    />
                    <Tag color="blue" className="category-tag">
                        {course.categoryName || 'Chung'}
                    </Tag>
                    {isBought && (
                        <Tag color="#52c41a" className="bought-tag">
                            <CheckCircleOutlined /> Đã sở hữu
                        </Tag>
                    )}
                </div>

                {/* Title */}
                <Title level={4} className="course-title">
                    {course.title}
                </Title>

                {/* Author */}
                <div className="course-author">
                    <UserOutlined /> <Text>{course.authorName || 'Chưa rõ tác giả'}</Text>
                </div>

                {/* Price */}
                <div className="course-price">
                    <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
                        {formatPrice(course.price)}
                    </Title>
                </div>

                <Divider />

                {/* Description */}
                <div className="course-description">
                    <Title level={5}>Mô tả khóa học</Title>
                    <Paragraph>
                        {course.description || 'Chưa có mô tả cho khóa học này.'}
                    </Paragraph>
                </div>

                <Divider />

                {/* Actions */}
                <div className="drawer-actions">
                    {isBought ? (
                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<BookOutlined />}
                            onClick={() => {
                                onGoToCourse();
                                onClose();
                            }}
                        >
                            Vào học ngay
                        </Button>
                    ) : course.statusOrder === 'PENDING' ? (
                        // ✅ Has pending order - show continue payment button (uses window.location for simplicity)
                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<CreditCardOutlined />}
                            onClick={() => {
                                window.location.href = '/dashboard/orders';
                            }}
                            style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                        >
                            Tiếp tục thanh toán
                        </Button>
                    ) : (
                        <>
                            <Button
                                type="primary"
                                size="large"
                                block
                                icon={<CreditCardOutlined />}
                                onClick={onBuyNow}
                                loading={buyNowLoading}
                                style={{ marginBottom: 12 }}
                            >
                                Mua ngay
                            </Button>
                            <Button
                                size="large"
                                block
                                icon={isInCart ? <CheckCircleOutlined /> : <ShoppingCartOutlined />}
                                onClick={onAddToCart}
                                disabled={isInCart}
                                loading={addToCartLoading}
                            >
                                {isInCart ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Drawer>
    );
};

export default CourseDetailDrawer;
