"use client"

import type React from "react"
import type { Post } from "../../../types/blog"
import "./BlogDetail.css"

interface BlogDetailProps {
  post: Post
  onClose: () => void
}

const BlogDetail: React.FC<BlogDetailProps> = ({ post, onClose }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="blog-detail-overlay" onClick={onClose}>
      <div className="blog-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="blog-detail-header">
          <h1 className="blog-detail-title">{post.title}</h1>
          <button className="blog-detail-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="blog-detail-meta">
          <span className="meta-item">
            <strong>Chuyên mục:</strong> {post.category}
          </span>
          <span className="meta-item">
            <strong>Ngày đăng:</strong> {formatDate(post.createdAt)}
          </span>
          {post.updatedAt && (
            <span className="meta-item">
              <strong>Cập nhật:</strong> {formatDate(post.updatedAt)}
            </span>
          )}
        </div>

        {post.themeUrl && (
          <div className="blog-detail-image">
            <img src={post.themeUrl || "/placeholder.svg"} alt={post.title} />
          </div>
        )}

        <div className="blog-detail-body">
          <div className="blog-content-html" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <div className="blog-detail-footer">
          <button className="close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default BlogDetail
