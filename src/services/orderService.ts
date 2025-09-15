// services/orderService.ts
import { message } from "antd";
import {
  createOrderByCourse,
  createOrderByCartItem,
  getOrders,
  deleteOrder,
} from "../api/orderApi";
import type { OrderResponse, CreateOrderResponse } from "../types/order";

/**
 * ✅ SERVICE: TẠO ĐƠN HÀNG TRỰC TIẾP TỪ KHÓA HỌC
 *
 * Xử lý logic:
 * - Validate course có thể mua không
 * - Call API create order
 * - Show success message với order info
 * - Handle errors appropriately
 */
export const createOrderByCourseService = async (
  courseId: number
): Promise<CreateOrderResponse> => {
  try {
    const response = await createOrderByCourse(courseId);

    if (response.code === 200) {
      message.success(
        "Đã tạo đơn hàng thành công! Vui lòng tiến hành thanh toán."
      );
      return response;
    }

    throw new Error(response.message || "Tạo đơn hàng thất bại.");
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Lỗi khi tạo đơn hàng.";

    message.error(errorMessage);
    throw error;
  }
};

/**
 * ✅ SERVICE: TẠO ĐƠN HÀNG TỪ CART ITEM
 *
 * @param cartItemId - ID của cart item
 */
export const createOrderByCartItemService = async (
  cartItemId: number
): Promise<CreateOrderResponse> => {
  try {
    const response = await createOrderByCartItem(cartItemId);

    if (response.code === 200) {
      message.success(
        "Đã tạo đơn hàng từ giỏ hàng thành công! Vui lòng tiến hành thanh toán."
      );
      return response;
    }

    throw new Error(response.message || "Tạo đơn hàng từ giỏ hàng thất bại.");
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Lỗi khi tạo đơn hàng từ giỏ hàng.";

    message.error(errorMessage);
    throw error;
  }
};

/**
 * ✅ SERVICE: LẤY DANH SÁCH ĐƠN HÀNG
 *
 * Xử lý logic:
 * - Call API để lấy orders
 * - Không show message (silent operation)
 * - Handle empty list gracefully
 */
export const getOrdersService = async (): Promise<OrderResponse> => {
  try {
    const response = await getOrders();

    if (response.code === 200) {
      console.log("Fetched orders:", response.data);
      return response;
    }

    throw new Error(response.message || "Lấy danh sách đơn hàng thất bại.");
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Lỗi khi lấy danh sách đơn hàng.";

    message.error(errorMessage);
    throw error;
  }
};

/**
 * ✅ SERVICE: XÓA/HỦY ĐƠN HÀNG
 *
 * @param orderId - ID của đơn hàng cần xóa
 */
export const deleteOrderService = async (orderId: number): Promise<void> => {
  try {
    const response = await deleteOrder(orderId);

    if (response.code === 200) {
      message.success("Đã hủy đơn hàng thành công!");
      return;
    }

    throw new Error(response.message || "Hủy đơn hàng thất bại.");
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Lỗi khi hủy đơn hàng.";

    message.error(errorMessage);
    throw error;
  }
};

/**
 * ✅ HELPER SERVICE: Mua trực tiếp với loading message
 */
export const purchaseDirectlyService = async (
  courseId: number
): Promise<CreateOrderResponse> => {
  try {
    message.loading({ content: "Đang tạo đơn hàng...", key: "purchase" });
    const response = await createOrderByCourseService(courseId);
    message.destroy("purchase");
    return response;
  } catch (error: any) {
    message.destroy("purchase");
    throw error;
  }
};

/**
 * ✅ HELPER SERVICE: Mua từ giỏ hàng với loading message
 */
export const purchaseFromCartService = async (
  cartItemId: number
): Promise<CreateOrderResponse> => {
  try {
    message.loading({ content: "Đang tạo đơn hàng...", key: "purchase-cart" });
    const response = await createOrderByCartItemService(cartItemId);
    message.destroy("purchase-cart");
    return response;
  } catch (error: any) {
    message.destroy("purchase-cart");
    throw error;
  }
};
