import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home/Home';
import MainLayout from '../layouts/MainLayout/MainLayout';
import Courses from '../pages/Courses/Course';
import Blog from '../pages/Blog/Blog';
import Test from '../pages/Test/Test';
import VideoCourses from '../pages/VideoCourses/VideoCourses';
import OfflineClasses from '../pages/OfflineClasses/OfflineClasses';
import ClassManagement from '../pages/ClassManagement/ClassManagement';
import Dashboard from '../pages/Dashboard/Dashboard';
import Profile from '../pages/Profile/Profile';
import QuestionBank from '../pages/QuestionBank/QuestionBank';
import Statistics from '../pages/Statistics/Statistics';
import MemberManagement from '../pages/MemberManagement/MemberManagement';
import CourseManagement from '../pages/CourseManagement/CourseManagement';
import BlogApproval from '../pages/BlogApproval/BlogApproval';
import Business from '../pages/Business/Business';
import WriteBlog from '../pages/WriteBlog/WriteBlog';
import ProtectedRoute from '../components/common/ProtectedRoute/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: React.createElement(MainLayout),
    children: [
      { path: '/', element: React.createElement(Home) },
      { path: '/courses', element: React.createElement(Courses) },
      { path: '/blog', element: React.createElement(Blog) },
      { path: '/test', element: React.createElement(Test) },
      {
        path: '/dashboard',
        element: React.createElement(Dashboard),
        children: [
          {
            path: 'profile',
            element: React.createElement(ProtectedRoute, { allowedTab: 'profile' }),
            children: [{ path: '', element: React.createElement(Profile) }],
          },
          {
            path: 'video-courses',
            element: React.createElement(ProtectedRoute, { allowedTab: 'video-courses' }),
            children: [{ path: '', element: React.createElement(VideoCourses) }],
          },
          {
            path: 'offline-classes',
            element: React.createElement(ProtectedRoute, { allowedTab: 'offline-classes' }),
            children: [{ path: '', element: React.createElement(OfflineClasses) }],
          },
          {
            path: 'class-management',
            element: React.createElement(ProtectedRoute, { allowedTab: 'class-management' }),
            children: [{ path: '', element: React.createElement(ClassManagement) }],
          },
          {
            path: 'question-bank',
            element: React.createElement(ProtectedRoute, { allowedTab: 'question-bank' }),
            children: [{ path: '', element: React.createElement(QuestionBank) }],
          },
          {
            path: 'statistics',
            element: React.createElement(ProtectedRoute, { allowedTab: 'statistics' }),
            children: [{ path: '', element: React.createElement(Statistics) }],
          },
          {
            path: 'member-management',
            element: React.createElement(ProtectedRoute, { allowedTab: 'member-management' }),
            children: [{ path: '', element: React.createElement(MemberManagement) }],
          },
          {
            path: 'course-management',
            element: React.createElement(ProtectedRoute, { allowedTab: 'course-management' }),
            children: [{ path: '', element: React.createElement(CourseManagement) }],
          },
          {
            path: 'blog-approval',
            element: React.createElement(ProtectedRoute, { allowedTab: 'blog-approval' }),
            children: [{ path: '', element: React.createElement(BlogApproval) }],
          },
          {
            path: 'business',
            element: React.createElement(ProtectedRoute, { allowedTab: 'business' }),
            children: [{ path: '', element: React.createElement(Business) }],
          },
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