import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/common/Home/Home';
import Login from '../pages/common/Login/Login';
import Register from '../pages/common/Register/Register';
import StudentDashboard from '../pages/student/DashBoard/StudentDashboard';
import TeacherDashboard from '../pages/teacher/DashBoard/TeacherDashboard';
import MainLayout from '../layouts/MainLayout/MainLayout';
import Courses from '../pages/common/Courses/Course';
import Blog from '../pages/common/Blog/Blog';
import Test from '../pages/common/Test/Test';

const router = createBrowserRouter([
  {
    path: '/',
    element: React.createElement(MainLayout),
    children: [
      { path: '/', element: React.createElement(Home) },
      { path: '/login', element: React.createElement(Login) },
      { path: '/register', element: React.createElement(Register) },
      { path: '/courses', element: React.createElement(Courses) },
      { path: '/blog', element: React.createElement(Blog) },
      { path: '/test', element: React.createElement(Test) },
      { path: '/student/dashboard', element: React.createElement(StudentDashboard) },
      { path: '/teacher/dashboard', element: React.createElement(TeacherDashboard) },
    ],
  },
]);

export default router;