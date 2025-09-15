// // components/common/PurchaseButtons/PurchaseButtons.tsx
// import React from 'react';
// import { Button, Space, message } from 'antd';
// import { ShoppingCartOutlined, CreditCardOutlined, CheckOutlined } from '@ant-design/icons';
// import useCartStore from '../../../store/cartStore';
// import type { Course } from '../../../types/course';
// import './PurchaseButtons.css';

// /**
//  * ✅ PURCHASE BUTTONS COMPONENT
//  * 
//  * Component để hiển thị buttons "Thêm giỏ hàng" và "Mua ngay"
//  */

// interface PurchaseButtonsProps {
//   course: Course;                          // Khóa học cần mua
//   size?: 'small' | 'middle' | 'large';     // Kích thước buttons
//   layout?: 'horizontal' | 'vertical';      // Cách sắp xếp buttons
//   showAddToCart?: boolean;                 // Hiển thị button "Thêm giỏ hàng"
//   showBuyNow?: boolean;                    // Hiển thị button "Mua ngay"
//   disabled?: boolean;                      // Disable tất cả buttons
//   className?: string;                      // Custom CSS class
//   onAddToCart?: () => void;               // Custom handler cho add to cart
//   onBuyNow?: () => void;                  // Custom handler cho buy now
// }

// const PurchaseButtons: React.FC<PurchaseButtonsProps> = ({
//   course,
//   size = 'middle',
//   layout = 'horizontal',
//   showAddToCart = true,
//   showBuyNow = true,
//   disabled = false,
//   className = '',
//   onAddToCart,
//   onBuyNow
// }) => {
  
//   // ✅ ZUSTAND STATE SUBSCRIPTIONS
//   const items = useCartStore(state => state.items);
//   const isLoading = useCartStore(state => state.isLoading);
//   const addItem = useCartStore(state => state.addItem);
  
//   // ✅ COMPUTED VALUES
//   const isInCart = items.some(item => item.course.id === course.id);
  
//   // ✅ VALIDATION LOGIC
//   const canPurchase = (() => {
//     if (!course.isActive) return { valid: false, reason: 'Khóa học không khả dụng' };
//     if (course.isDelete) return { valid: false, reason: 'Khóa học không tồn tại' };
//     if (course.isBought) return { valid: false, reason: 'Bạn đã sở hữu khóa học này' };
//     if (course.price < 0) return { valid: false, reason: 'Giá khóa học không hợp lệ' };
//     return { valid: true };
//   })();

//   // ✅ ADD TO CART HANDLER
//   const handleAddToCart = async () => {
//     // Validation check
//     if (!canPurchase.valid) {
//       message.warning(canPurchase.reason);
//       return;
//     }
    
//     // Check if already in cart
//     if (isInCart) {
//       message.info('Khóa học đã có trong giỏ hàng!');
//       return;
//     }
    
//     // Custom handler hoặc default logic
//     if (onAddToCart) {
//       onAddToCart();
//       return;
//     }
    
//     // ✅ DEFAULT ADD TO CART LOGIC
//     try {
//       // Import service dynamically
//       const { addToCartService } = await import('../../../services/cartService');
//       await addToCartService(course.id);
      
      // ✅ Optimistic update - thêm vào store ngay lập tức
      // const newCartItem = {
      //   id: Date.now(), // Temporary ID (server sẽ trả về ID thật)
      //   course: course,
      //   createAt: new Date().toISOString()
      // };
      // addItem(newCartItem);
      
//       // ✅ Refresh cart sau 500ms để lấy data thật từ server
//       setTimeout(() => {
//         useCartStore.getState().refreshCart();
//       }, 500);
      
//     } catch (error) {
//       console.error('Add to cart failed:', error);
//       // Error message đã được handle trong service
//     }
//   };

//   // ✅ BUY NOW HANDLER  
//   const handleBuyNow = async () => {
//     // Validation check
//     if (!canPurchase.valid) {
//       message.warning(canPurchase.reason);
//       return;
//     }
    
//     // Custom handler hoặc default logic
//     if (onBuyNow) {
//       onBuyNow();
//       return;
//     }
    
//     // ✅ DEFAULT BUY NOW LOGIC (sẽ implement ở Phase 3)
//     console.log('Buy now course:', course.id);
//     message.info('Tính năng mua ngay sẽ được implement ở Phase 3!');
//   };

//   // ✅ ADD TO CART BUTTON LOGIC
//   const getAddToCartButton = () => {
//     if (!showAddToCart) return null;
    
//     // ✅ Dynamic button content dựa vào course state
//     let buttonText = 'Thêm giỏ hàng';
//     let icon = <ShoppingCartOutlined />;
//     let buttonDisabled = disabled || !canPurchase.valid;
    
//     // ✅ Different states
//     if (course.isBought) {
//       buttonText = 'Đã mua';
//       icon = <CheckOutlined />;
//       buttonDisabled = true;
//     } else if (isInCart) {
//       buttonText = 'Trong giỏ hàng';
//       buttonDisabled = true;
//     }

//     return (
//       <Button
//         type="default"
//         icon={icon}
//         size={size}
//         loading={isLoading}  // Loading từ cart store
//         disabled={buttonDisabled}
//         onClick={handleAddToCart}
//         className="add-to-cart-btn"
//       >
//         {buttonText}
//       </Button>
//     );
//   };

//   // ✅ BUY NOW BUTTON LOGIC
//   const getBuyNowButton = () => {
//     if (!showBuyNow) return null;
    
//     let buttonText = 'Mua ngay';
//     let buttonDisabled = disabled || !canPurchase.valid;
    
//     if (course.isBought) {
//       buttonText = 'Đã sở hữu';
//       buttonDisabled = true;
//     }

//     return (
//       <Button
//         type="primary"
//         icon={<CreditCardOutlined />}
//         size={size}
//         loading={false} // Buy now loading sẽ handle ở PurchaseModal
//         disabled={buttonDisabled}
//         onClick={handleBuyNow}
//         className="buy-now-btn"
//       >
//         {buttonText}
//       </Button>
//     );
//   };

//   // ✅ RENDER LOGIC
//   const buttons = [
//     getAddToCartButton(),
//     getBuyNowButton()
//   ].filter(Boolean); // Remove null buttons

//   if (buttons.length === 0) return null;

//   return (
//     <Space 
//       direction={layout} 
//       size={8}
//       className={`purchase-buttons ${className}`}
//       style={{ width: layout === 'vertical' ? '100%' : 'auto' }}
//     >
//       {buttons}
//     </Space>
//   );
// };

// export default PurchaseButtons;