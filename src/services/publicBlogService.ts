import api from "../lib/axios"
import type { AllPostsRequest, AllPostsResponse, CategoryResponse } from "../types/blog"

export const getAllPostsPublic = async (data: AllPostsRequest): Promise<AllPostsResponse> => {
  try {
    const response = await api.post("/api/v1/post/all-posts", data, {
      params: {
        page: data.page || 0,
        size: data.size || 10,
        sort: data.sort || undefined,
      },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách bài đăng.")
  }
}

export const getCategoriesPublic = async (): Promise<CategoryResponse> => {
  try {
    const response = await api.get("/api/v1/category/post")
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách danh mục.")
  }
}
