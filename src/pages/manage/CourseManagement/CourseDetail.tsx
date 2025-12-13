// Trang chi tiết khóa học (Tab Thông tin + Tab Quản lý Bài học)
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Spin, message, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useEffect, useState, useCallback } from 'react';
import {
    getCourseByIdService,
    getCategoriesService,
    getTeachersService
} from '../../../services/courseManagementService';
import { getLessonsService } from '../../../services/lessonService';
import type { Course, Category } from '../../../types/course';
import type { Lesson, LessonQueryRequest } from '../../../types/lesson';
import CourseInfoTab from 'components/manage/CourseManagement/CourseInfoTab';
import LessonManagementTab from 'components/manage/CourseManagement/LessonManagementTab';

const CourseDetail = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const isCreateMode = courseId === 'new';

    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState<Course | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [lessonLoading, setLessonLoading] = useState(false);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await getCategoriesService();
            if (res.code === 200) setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchTeachers = useCallback(async () => {
        try {
            const teacherList = await getTeachersService();
            setTeachers(teacherList);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchCourse = useCallback(async () => {
        if (isCreateMode) return;
        if (!courseId) return;
        try {
            setLoading(true);
            const res = await getCourseByIdService(Number(courseId));
            if (res.code === 200) {
                setCourse(res.data);
            }
        } catch (err) {
            message.error('Không tìm thấy khóa học.');
            navigate('/dashboard/course-management');
        } finally {
            setLoading(false);
        }
    }, [courseId, isCreateMode, navigate]);

    const fetchLessons = useCallback(async () => {
        if (!courseId || isCreateMode) return;
        setLessonLoading(true);
        try {
            const body: LessonQueryRequest = {
                id: Number(courseId),
                title: null,
                categories: [],
                fromDate: null,
                toDate: null
            };
            const res = await getLessonsService(body, {
                page: 0,
                size: 100,
                sort: 'orderIndex,asc',
                mode: 'public'
            });
            if (res.code === 200) {
                setLessons(res.data.content);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLessonLoading(false);
        }
    }, [courseId, isCreateMode]);

    useEffect(() => {
        fetchCategories();
        fetchTeachers();
    }, [fetchCategories, fetchTeachers]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    useEffect(() => {
        fetchLessons();
    }, [fetchLessons]);

    const handleCourseSaved = async () => {
        await fetchCourse();
    };

    const handleLessonChanged = async () => {
        await fetchLessons();
    };

    const handleBackToList = () => {
        navigate('/dashboard/course-management');
    };

    return (
        <div style={{ padding: 16 }}>
            {/* Breadcrumb-style back link */}
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToList}
                type="link"
                style={{ padding: 0, marginBottom: 8 }}
            >
                Danh sách khóa học
            </Button>

            {/* Page title */}
            <h2 style={{ margin: '0 0 16px 0' }}>
                {isCreateMode
                    ? 'Tạo khóa học mới'
                    : course
                        ? `Quản lý khóa học: ${course.title}`
                        : 'Đang tải...'}
            </h2>

            <Tabs
                defaultActiveKey="info"
                items={[
                    {
                        key: 'info',
                        label: 'Thông tin khóa học',
                        children: loading && !isCreateMode ? (
                            <Spin />
                        ) : (
                            <CourseInfoTab
                                isCreateMode={isCreateMode}
                                course={course}
                                categories={categories}
                                teachers={teachers}
                                onSaved={handleCourseSaved}
                                onCreated={(createdCourseId) => {
                                    navigate(`/dashboard/course-management/${createdCourseId}`);
                                }}
                            />
                        )
                    },
                    {
                        key: 'lessons',
                        label: 'Quản lý bài học',
                        children: isCreateMode ? (
                            <div>Vui lòng tạo khóa học trước khi quản lý bài học.</div>
                        ) : lessonLoading && !lessons.length ? (
                            <Spin />
                        ) : (
                            <LessonManagementTab
                                courseId={Number(courseId)}
                                lessons={lessons}
                                onChanged={handleLessonChanged}
                            />
                        )
                    }
                ]}
            />
        </div>
    );
};

export default CourseDetail;