import React from 'react';
import { ClockCircleOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import moment from 'moment';
import type { Post } from '../../../../types/blog';

interface BlogCardProps {
    post: Post;
    onClick: (post: Post) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
    // Helper để lấy text thuần từ HTML cho phần excerpt
    const getExcerpt = (htmlContent: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = htmlContent;
        return tmp.textContent || tmp.innerText || '';
    };

    return (
        <div className="blog-card" onClick={() => onClick(post)}>
            <div className="blog-card-image">
                <img 
                    src={post.themeUrl || 'https://placehold.co/600x400?text=No+Image'} 
                    alt={post.title} 
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Error';
                    }}
                />
            </div>
            <div className="blog-card-content">
                <div className="blog-meta">
                    <span className="blog-category-tag">{post.category || 'TIN TỨC'}</span>
                    <span><ClockCircleOutlined /> {moment(post.createdAt).format('DD/MM/YYYY')}</span>
                </div>
                <h3 className="blog-title" title={post.title}>{post.title}</h3>
                <p className="blog-excerpt">
                    {getExcerpt(post.content).substring(0, 90)}...
                </p>
                <div className="blog-card-footer">
                    <span><UserOutlined /> {post.author?.name || 'Admin'}</span>
                    <span className="read-more-text">Xem chi tiết <ArrowRightOutlined /></span>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;