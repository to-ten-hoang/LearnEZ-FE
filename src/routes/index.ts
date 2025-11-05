// routes/index.ts - Updated with Cart & Orders & Payment Callback
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/public-page/Home/Home';
import MainLayout from '../layouts/MainLayout/MainLayout';
import Courses from '../pages/public-page/Courses/Course';
import Blog from '../pages/public-page/Blog/Blog';
import Test from '../pages/public-page/Test/Test';
import VideoCourses from '../pages/student/VideoCourses/VideoCourses';
import OfflineClasses from '../pages/teacher/OfflineClasses/OfflineClasses';
import ClassManagement from '../pages/manage/ClassManagement/ClassManagement';
import Dashboard from '../pages/common/Dashboard/Dashboard';
import Profile from '../pages/common/Profile/Profile';
import QuestionBank from '../pages/manage/QuestionBank/QuestionBank';
import Statistics from '../pages/manage/Statistics/Statistics';
import MemberManagement from '../pages/manage/MemberManagement/MemberManagement';
import CourseManagement from '../pages/manage/CourseManagement/CourseManagement';
import BlogApproval from '../pages/manage/BlogApproval/BlogApproval';
import Business from '../pages/manage/Business/Business';
import WriteBlog from '../pages/manage/WriteBlog/WriteBlog';
import Cart from '../pages/student/Cart/Cart';
import Orders from '../pages/student/Orders/Orders';
import OrderStatus from '../pages/student/OrderStatus/OrderStatus';
import ProtectedRoute from '../components/common/ProtectedRoute/ProtectedRoute';
import ClassDetail from 'pages/manage/ClassDetail/ClassDetail';

const router = createBrowserRouter([
    {
        path: '/',
        element: React.createElement(MainLayout),
        children: [
            // ✅ PUBLIC ROUTES
            { path: '/', element: React.createElement(Home) },
            { path: '/courses', element: React.createElement(Courses) },
            { path: '/blog', element: React.createElement(Blog) },
            { path: '/test', element: React.createElement(Test) },
            { path: '/order-status', element: React.createElement(OrderStatus) },

            // ✅ DASHBOARD ROUTES
            {
                path: '/dashboard',
                element: React.createElement(Dashboard),
                children: [
                    // Profile (tất cả roles)
                    {
                        path: 'profile',
                        element: React.createElement(ProtectedRoute, { allowedTab: 'profile' }),
                        children: [{ path: '', element: React.createElement(Profile) }],
                    },

                    // ===== STUDENT ROUTES =====
                    {
                        path: 'video-courses',
                        element: React.createElement(ProtectedRoute, {
                            allowedTab: 'video-courses',
                        }),
                        children: [{ path: '', element: React.createElement(VideoCourses) }],
                    },
                    {
                        path: 'offline-classes',
                        element: React.createElement(ProtectedRoute, {
                            allowedTab: 'offline-classes',
                        }),
                        children: [{ path: '', element: React.createElement(OfflineClasses) }],
                    },
                    {
                        path: 'cart',
                        element: React.createElement(ProtectedRoute, { allowedTab: 'cart' }),
                        children: [{ path: '', element: React.createElement(Cart) }],
                    },
                    {
                        path: 'orders',
                        element: React.createElement(ProtectedRoute, { allowedTab: 'orders' }),
                        children: [{ path: '', element: React.createElement(Orders) }],
                    },
                    // ===== TEACHER ROUTES =====
                    {
                        path: 'class-management',
                        element: React.createElement(ProtectedRoute, {
                            allowedTab: 'class-management',
                        }),
                        children: [
                            { path: '', element: React.createElement(ClassManagement) },
                            { path: ':classId', element: React.createElement(ClassDetail) },
                        ],
                    },
                    {
                        path: 'question-bank',
                        element: React.createElement(ProtectedRoute, {
                            allowedTab: 'question-bank',
                        }),
                        children: [{ path: '', element: React.createElement(QuestionBank) }],
                    },

                    // ===== MANAGER ROUTES =====
                    {
                        path: 'statistics',
                        element: React.createElement(ProtectedRoute, { allowedTab: 'statistics' }),
                        children: [{ path: '', element: React.createElement(Statistics) }],
                    },
                    {
                        path: 'member-management',
                        element: React.createElement(ProtectedRoute, {
                            allowedTab: 'member-management',
                        }),
                        children: [{ path: '', element: React.createElement(MemberManagement) }],
                    },
                    {
                        path: 'course-management',
                        element: React.createElement(ProtectedRoute, {
                            allowedTab: 'course-management',
                        }),
                        children: [{ path: '', element: React.createElement(CourseManagement) }],
                    },
                    {
                        path: 'blog-approval',
                        element: React.createElement(ProtectedRoute, {
                            allowedTab: 'blog-approval',
                        }),
                        children: [{ path: '', element: React.createElement(BlogApproval) }],
                    },
                    {
                        path: 'business',
                        element: React.createElement(ProtectedRoute, { allowedTab: 'business' }),
                        children: [{ path: '', element: React.createElement(Business) }],
                    },

                    // ===== CONSULTANT ROUTES =====
                    {
                        path: 'write-blog',
                        element: React.createElement(ProtectedRoute, { allowedTab: 'write-blog' }),
                        children: [{ path: '', element: React.createElement(WriteBlog) }],
                    },
                ],
            },
        ],
    },
]);

export default router;
