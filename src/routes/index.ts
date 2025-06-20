import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home/Home';
import MainLayout from '../layouts/MainLayout/MainLayout';
import Courses from '../pages/Courses/Course';
import Blog from '../pages/Blog/Blog';
import Test from '../pages/Test/Test';
import VideoCourses from '../pages/VideoCourses/VideoCourses'; // Placeholder
import OfflineClasses from '../pages/OfflineClasses/OfflineClasses'; // Placeholder
import ClassManagement from '../pages/ClassManagement/ClassManagement'; // Placeholder
import Dashboard from '../pages/Dashboard/Dashboard';
import Profile from '../pages/Profile/Profile';

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
        path: '/dashboard/:tab?', 
        element: React.createElement(Dashboard), 
        children: [
          { path: 'profile', element: React.createElement(Profile) },
          { path: 'video-courses', element: React.createElement(VideoCourses) },
          { path: 'offline-classes', element: React.createElement(OfflineClasses) },
          { path: 'class-management', element: React.createElement(ClassManagement) },
        ]
      },
    ],
  },
]);

export default router;