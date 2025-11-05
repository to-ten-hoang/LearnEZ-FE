// src/pages/public-page/Courses/Course.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card, Input, Select, Pagination, message } from 'antd';
import type { AllCoursesRequest, Course, Category } from '../../../types/course';
import { getCategoriesService } from '../../../services/courseManagementService';
import LoginModal from '../../../components/common/Auth/LoginModal/LoginModal'; // Import modal login
import './Course.css';
import CourseList from 'components/student/Course/CourseList/CourseList';
import { getCourseRoleStudentService } from 'services/courseStudentService';
import useAuthStore from 'store/authStore';

// const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const CoursesPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalElements, setTotalElements] = useState(0);
    const [filters, setFilters] = useState({
        title: '',
        categories: [] as string[],
        page: 0,
        size: 8,
        sort: 'createdAt,desc',
    });
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const { isAuthenticated } = useAuthStore();

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const requestBody: AllCoursesRequest = {
                title: filters.title || null,
                categories: filters.categories,
                page: filters.page,
                size: filters.size,
                sort: filters.sort,
                fromDate: null,
                toDate: null,
            };
            const response = await getCourseRoleStudentService(requestBody);
            if (response.code === 200) {
                setCourses(response.data.content);
                setTotalElements(response.data.totalElements);
            }
        } catch (error) {
            message.error('Không thể tải danh sách khóa học.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses, isAuthenticated]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesService();
                if (response.code === 200) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, [isAuthenticated]);

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
    };

    const handlePaginationChange = (page: number, pageSize: number) => {
        setFilters((prev) => ({ ...prev, page: page - 1, size: pageSize }));
    };

    const handleLoginRequest = () => {
        setIsLoginModalVisible(true);
    };

    return (
        <div className="courses-page-container">
            {/* <Title level={2} className="page-title">Khám phá các khóa học</Title> */}
            <Card className="filters-card">
                <div className="filters-wrapper">
                    <Search
                        placeholder="Tìm kiếm khóa học..."
                        onSearch={(value) => handleFilterChange('title', value)}
                        enterButton
                        allowClear
                        className="filter-search"
                    />
                    <div className="filters-right">
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Chọn danh mục"
                            onChange={(value) => handleFilterChange('categories', value)}
                            className="filter-select"
                        >
                            {categories.map((cat) => (
                                <Option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </Option>
                            ))}
                        </Select>
                        <Select
                            defaultValue="createdAt,desc"
                            onChange={(value) => handleFilterChange('sort', value)}
                            className="filter-sort"
                        >
                            <Option value="createdAt,desc">Mới nhất</Option>
                            <Option value="price,asc">Giá: Thấp đến cao</Option>
                            <Option value="price,desc">Giá: Cao đến thấp</Option>
                        </Select>
                    </div>
                </div>
            </Card>

            <div className="courses-list-section">
                <CourseList
                    courses={courses}
                    loading={loading}
                    onLoginRequest={handleLoginRequest}
                />
            </div>

            <div className="pagination-container">
                <Pagination
                    className="custom-pagination"
                    current={filters.page + 1}
                    pageSize={filters.size}
                    total={totalElements}
                    onChange={handlePaginationChange}
                    showSizeChanger
                    pageSizeOptions={['8', '12', '16', '20']}
                />
            </div>

            <LoginModal
                visible={isLoginModalVisible}
                onClose={() => setIsLoginModalVisible(false)}
            />
        </div>
    );
};

export default CoursesPage;
