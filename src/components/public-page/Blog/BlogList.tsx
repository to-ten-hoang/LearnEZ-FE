"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { Post, Category } from "../../../types/blog"
import { getAllPostsPublic, getCategoriesPublic } from "../../../services/publicBlogService"
import BlogCard from "./BlogCard"
import "./BlogList.css"

interface BlogListProps {
  onSelectPost: (post: Post) => void
}

const BlogList: React.FC<BlogListProps> = ({ onSelectPost }) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(6)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [currentPage, selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesPublic()
      if (response.code === 200) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error)
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const categoryPost = selectedCategory ? [selectedCategory] : []
      const response = await getAllPostsPublic({
        fromDate: null,
        toDate: null,
        title: null,
        categoryPost,
        page: currentPage,
        size: pageSize,
        sort: null,
      })

      if (response.code === 200) {
        // Lọc chỉ hiển thị bài viết đã active
        const activePosts = response.data.content.filter((post) => post.isActive && !post.isDelete)
        setPosts(activePosts)
        setTotalPages(response.data.totalPages)
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài viết:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryFilter = (categoryName: string | null) => {
    setSelectedCategory(categoryName)
    setCurrentPage(0)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="blog-list-container">
      {/* Category Filter */}
      <div className="category-filter-section">
        <h3 className="filter-title">Chọn chuyên mục</h3>
        <div className="category-filter">
          <button
            className={`category-btn ${!selectedCategory ? "active" : ""}`}
            onClick={() => handleCategoryFilter(null)}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.name ? "active" : ""}`}
              onClick={() => handleCategoryFilter(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="blog-list-content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="blog-cards-grid">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} onSelect={() => onSelectPost(post)} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Không có bài viết nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && posts.length > 0 && totalPages > 1 && (
        <div className="pagination-container">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            ← Trước
          </button>
          <span className="pagination-info">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  )
}

export default BlogList
