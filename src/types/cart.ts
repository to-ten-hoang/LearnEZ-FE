import type { Course } from "./course";

export interface CartItem{
  id: number;
  course: Course;
  createdAt: string | null;
}

//get all
export interface CartResponse {
  code: number;
  message: string;
  data: CartItem[]
}

//add
export interface AddToCartRequest {
  id: number;
}
export interface AddToCartResponse{
  code: number;
  message: string;
  data: null;
}

//remove
export interface RemoveFromCartRequest{
  id: number;
}
export interface RemoveFromCartResponse{
  code: number;
  message: string;
  data: null;
}

// ✅ Type cho cart summary (tính toán local)
export interface CartSummary {
  itemCount: number;      // Số lượng items
  totalAmount: number;    // Tổng tiền
  isEmpty: boolean;       // Giỏ hàng có rỗng không
}

// ✅ Type cho cart operations state (UI loading states)
export interface CartOperationState {
  addingToCart: boolean;  // Đang thêm vào giỏ hàng
  removingFromCart: boolean; // Đang xóa khỏi giỏ hàng
  loading: boolean;       // Đang load cart data
  error: string | null;   // Lỗi nếu có
}





