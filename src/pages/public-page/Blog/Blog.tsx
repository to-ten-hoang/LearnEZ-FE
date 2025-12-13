<<<<<<< HEAD
import React, { useEffect, useState, useCallback } from 'react';
import { Pagination, Spin, Empty, message } from 'antd';
import { getPublicPostsService, getCategoriesService } from '../../../services/blogService';
import BlogCard from './components/BlogCard';
import BlogDetail from './components/BlogDetail';
import BlogSidebar from './components/BlogSidebar';
import './Blog.css';

import type { Post, Category, AllPostsRequest } from '../../../types/blog';

const Blog: React.FC = () => {
    // --- State cho Main Content ---
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(6);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // --- State cho Sidebar ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [loadingRecent, setLoadingRecent] = useState<boolean>(false);

    // --- State Filter ---
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchText, setSearchText] = useState<string>('');

    // 1. Lấy danh mục
    const fetchCategories = async () => {
        try {
            const res = await getCategoriesService();
            if (res.code === 200) setCategories(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh mục:", error);
        }
    };

    // 2. Lấy 3 bài mới nhất cho Sidebar (sort=createdAt,desc)
    const fetchRecentPosts = async () => {
        setLoadingRecent(true);
        try {
            const res = await getPublicPostsService({
                page: 0,
                size: 3,
                title: null,
                categoryPost: [],
                fromDate: null,
                toDate: null,
                sort: 'createdAt,desc'
            });

            if (res.code === 200) {
                // Lấy 3 bài viết mới nhất
                setRecentPosts(res.data.content.slice(0, 3));
            }
        } catch (error) {
            console.error("Lỗi lấy bài viết mới:", error);
        } finally {
            setLoadingRecent(false);
        }
    };

    // 3. Lấy danh sách chính (Có phân trang, Search, Filter)
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const payload: AllPostsRequest = {
                page: currentPage,
                size: pageSize,
                title: searchText || null,
                categoryPost: selectedCategory ? [selectedCategory] : [],
                fromDate: null,
                toDate: null,
                sort: 'createdAt,desc'
            };

            const res = await getPublicPostsService(payload);
            if (res.code === 200) {
                setPosts(res.data.content);
                setTotalElements(res.data.totalElements);
            }
        } catch (error) {
            message.error('Không thể tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchText, selectedCategory]);

    // Initial Load
    useEffect(() => {
        fetchCategories();
        fetchRecentPosts();
    }, []);

    // Reload khi filter thay đổi
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // --- Handlers ---
    const handleCategorySelect = (catName: string | null) => {
        setSelectedCategory(catName);
        setSearchText('');
        setCurrentPage(0);
        setSelectedPost(null);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(0);
        setSelectedPost(null);
    };

    const handleViewDetail = (post: Post) => {
        setSelectedPost(post);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToList = () => {
        setSelectedPost(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="blog-public-container">
            <div className="blog-layout-wrapper">

                {/* --- CỘT TRÁI: Main Content (List hoặc Detail) --- */}
                <div className="blog-main-content">
                    {selectedPost ? (
                        <BlogDetail
                            post={selectedPost}
                            onBack={handleBackToList}
                        />
                    ) : (
                        <>
                            {loading ? (
                                <div className="loading-container"><Spin size="large" tip="Đang tải dữ liệu..." /></div>
                            ) : posts.length > 0 ? (
                                <>
                                    <div className="blog-grid">
                                        {posts.map(post => (
                                            <BlogCard
                                                key={post.id}
                                                post={post}
                                                onClick={handleViewDetail}
                                            />
                                        ))}
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: 40 }}>
                                        <Pagination
                                            current={currentPage + 1}
                                            pageSize={pageSize}
                                            total={totalElements}
                                            onChange={(page, size) => {
                                                setCurrentPage(page - 1);
                                                setPageSize(size);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            showSizeChanger={false}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="empty-container">
                                    <Empty description="Không tìm thấy bài viết nào phù hợp" />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* --- CỘT PHẢI: Sidebar (Sticky) --- */}
                <div className="blog-sidebar-wrapper">
                    <BlogSidebar
                        categories={categories}
                        recentPosts={recentPosts}
                        selectedCategory={selectedCategory}
                        loadingRecent={loadingRecent}
                        onSearch={handleSearch}
                        onCategorySelect={handleCategorySelect}
                        onPostClick={handleViewDetail}
                    />
                </div>

            </div>
        </div>
    );
};

export default Blog;
=======
const Blog = () => {
    return <div>Blog</div>;
};

export default Blog;
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
