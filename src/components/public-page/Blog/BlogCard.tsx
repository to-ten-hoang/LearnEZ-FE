"use client"

import type React from "react"
import type { Post } from "../../../types/blog"
import "./BlogCard.css"

interface BlogCardProps {
  post: Post
  onSelect: () => void
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onSelect }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent || ""
  }

  const excerpt = stripHtml(post.content).substring(0, 100) + "..."

  return (
    <div className="blog-card" onClick={onSelect}>
      {post.themeUrl && (
        <div className="blog-card-image">
          <img src={post.themeUrl || "/placeholder.svg"} alt={post.title} />
          <div className="blog-card-category-badge">{post.category}</div>
        </div>
      )}
      <div className="blog-card-content">
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-excerpt">{excerpt}</p>
        <div className="blog-card-footer">
          <span className="blog-card-date">{formatDate(post.createdAt)}</span>
          <button className="blog-card-read-more">Đọc thêm →</button>
        </div>
      </div>
    </div>
  )
}

export default BlogCard
