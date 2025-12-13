import React from 'react';
import { Input, List, Spin } from 'antd';
import { SearchOutlined, CalendarOutlined, RightOutlined } from '@ant-design/icons';
import moment from 'moment';
import type { Post, Category } from '../../../../types/blog';

const { Search } = Input;

interface BlogSidebarProps {
    categories: Category[];
    recentPosts: Post[];
    selectedCategory: string | null;
    loadingRecent: boolean;
    onSearch: (value: string) => void;
    onCategorySelect: (categoryName: string | null) => void;
    onPostClick: (post: Post) => void;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({ 
    categories, 
    recentPosts, 
    selectedCategory, 
    loadingRecent,
    onSearch, 
    onCategorySelect,
    onPostClick
}) => {
    return (
        <div className="blog-sidebar-container">
            {/* Widget 1: Tìm kiếm */}
            <div className="sidebar-widget search-widget">
                <h3 className="widget-title">Tìm kiếm</h3>
                <Search 
                    placeholder="Nhập từ khóa..." 
                    onSearch={onSearch} 
                    enterButton={<SearchOutlined />}
                    size="large"
                    allowClear
                />
            </div>

            {/* Widget 2: Danh mục */}
            <div className="sidebar-widget category-widget">
                <h3 className="widget-title">Danh mục</h3>
                <ul className="category-list">
                    <li 
                        className={`category-item ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => onCategorySelect(null)}
                    >
                        <RightOutlined className="cat-icon" /> Tất cả
                    </li>
                    {categories.map(cat => (
                        <li 
                            key={cat.id}
                            className={`category-item ${selectedCategory === cat.name ? 'active' : ''}`}
                            onClick={() => onCategorySelect(cat.name)}
                        >
                            <RightOutlined className="cat-icon" /> {cat.name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Widget 3: Bài viết mới nhất */}
            <div className="sidebar-widget recent-posts-widget">
                <h3 className="widget-title">Bài viết mới nhất</h3>
                {loadingRecent ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={recentPosts}
                        split={false}
                        renderItem={(item) => (
                            <List.Item 
                                className="recent-post-item" 
                                onClick={() => onPostClick(item)}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div className="recent-post-thumb">
                                            <img 
                                                src={item.themeUrl || 'https://placehold.co/100?text=No+Img'} 
                                                alt={item.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/100?text=Error'}
                                            />
                                        </div>
                                    }
                                    title={<span className="recent-post-title" title={item.title}>{item.title}</span>}
                                    description={
                                        <span className="recent-post-date">
                                            <CalendarOutlined style={{ marginRight: 4 }} />
                                            {moment(item.createdAt).format('DD/MM/YYYY')}
                                        </span>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default BlogSidebar;