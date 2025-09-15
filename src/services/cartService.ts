import { message } from "antd";
import { addToCart, clearCart, getCart, removeFromCart } from "../api/cartApi";
import type { AddToCartResponse, CartResponse, RemoveFromCartResponse } from "types/cart";

export const addToCartService = async(courseId: number): Promise<AddToCartResponse> => {
  try {
    const response = await addToCart(courseId);
    if (response.code === 200){
      message.success('Đã thêm khóa học vào giỏ hàng!');
      return response;
    }
    if(response.code === 400 && response.message === 'Cart_item already exists'){
      message.warning('Khóa học đã có trong giỏ hàng của bạn!');
      return response;
    }
    throw new Error(response.message || 'Thêm vào giỏ hàng thất bại.');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message 
      || error.message 
      || 'Lỗi khi thêm vào giỏ hàng.';
    
    message.error(errorMessage);
    throw error;
  }
}

export const getCartService = async(): Promise<CartResponse> => {
  try {
    const response = await getCart();
    if(response.code === 200){
      return response;
    }
    throw new Error (response.message || 'Lấy giỏ hàng thất bại');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi lấy giỏ hàng.';
    message.error(errorMessage);
    throw error;
  }
}

export const removeFromCartService = async (cartItemId: number): Promise<RemoveFromCartResponse> => {
  try {
    const response = await removeFromCart(cartItemId);
    
    if (response.code === 200) {
      message.success('Đã xóa khóa học khỏi giỏ hàng!');
      return response;
    }
    
    throw new Error(response.message || 'Xóa khỏi giỏ hàng thất bại.');
    
  } catch (error: any) {
    const errorMessage = error.response?.data?.message 
      || error.message 
      || 'Lỗi khi xóa khỏi giỏ hàng.';
    
    message.error(errorMessage);
    throw error;
  }
};

export const clearCartService = async (cartItemIds: number[]): Promise<void> => {
  try {
    // Show loading message
    message.loading({ content: 'Đang xóa giỏ hàng...', key: 'clear-cart' });
    
    await clearCart(cartItemIds);
    
    // Destroy loading và show success
    message.destroy('clear-cart');
    message.success('Đã xóa tất cả khóa học khỏi giỏ hàng!');
    
  } catch (error: any) {
    message.destroy('clear-cart');
    message.error('Lỗi khi xóa giỏ hàng.');
    throw error;
  } 
};

export const checkCourseInCart = async (courseId: number): Promise<boolean> => {
  try {
    const cartResponse = await getCartService();
    return cartResponse.data.some(item => item.course.id === courseId);
  } catch (error) {
    // Nếu có lỗi, assume không có trong cart
    console.error('Error checking course in cart:', error);
    return false;
  }
};

// export const validateAddToCart = (course: any): { valid: boolean; reason?: string } => {
//   if (!course.isActive) {
//     return { valid: false, reason: 'Khóa học hiện không khả dụng' };
//   }
  
//   if (course.isDelete) {
//     return { valid: false, reason: 'Khóa học không tồn tại' };
//   }
  
//   if (course.isBought) {
//     return { valid: false, reason: 'Bạn đã sở hữu khóa học này' };
//   }
  
//   if (course.price < 0) {
//     return { valid: false, reason: 'Giá khóa học không hợp lệ' };
//   }
  
//   return { valid: true };
// };

/**
 * ✅ HELPER SERVICE: Tự động xóa item khỏi cart sau khi mua thành công
 */
export const removeItemAfterPurchase = async (courseId: number): Promise<void> => {
  try {
    // ✅ Import cart store
    const { default: useCartStore } = await import('../store/cartStore');
    const { items, removeItem } = useCartStore.getState();
    
    // ✅ Tìm cart item có courseId tương ứng
    const cartItem = items.find(item => item.course.id === courseId);
    
    if (cartItem) {
      // ✅ Xóa khỏi store trước (optimistic update)
      removeItem(cartItem.id);
      
      // ✅ Gọi API để xóa trên server
      await removeFromCartService(cartItem.id);
    }
    
  } catch (error) {
    console.error('Remove item after purchase failed:', error);
    // Không throw error để không ảnh hưởng đến flow chính
  }
};