import React from 'react';
import { ArrowLeftOutlined, CalendarOutlined, FolderOpenOutlined, UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import type { Post } from '../../../../types/blog';

interface BlogDetailProps {
    post: Post;
    onBack: () => void;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ post, onBack }) => {
    return (
        <div className="blog-detail-wrapper">
            <div className="back-btn" onClick={onBack}>
                <ArrowLeftOutlined /> Quay lại danh sách
            </div>

            <div className="detail-header">
                <div style={{ marginBottom: 15 }}>
                    <span className="blog-category-tag" style={{ fontSize: '0.9rem' }}>
                        <FolderOpenOutlined style={{ marginRight: 6 }} /> 
                        {post.category || 'TIN TỨC'}
                    </span>
                </div>
                
                <h1 className="detail-title">{post.title}</h1>
                
                <div className="detail-meta-row">
                    <span><CalendarOutlined /> {moment(post.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                    <span><UserOutlined /> Tác giả: {post.author?.name || 'Quản trị viên'}</span>
                </div>
            </div>

            {post.themeUrl && (
                <img 
                    src={post.themeUrl} 
                    alt={post.title} 
                    className="detail-image"
                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                />
            )}

            {/* Render HTML Richtext */}
            <div 
                className="blog-content-html"
                dangerouslySetInnerHTML={{ __html: post.content }} 
            />
        </div>
    );
};

export default BlogDetail;