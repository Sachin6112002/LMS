import React, { useState } from 'react';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUsers, FaCog } from 'react-icons/fa';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import StudentManager from './pages/StudentManager';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ManagePurchases from './pages/ManagePurchases';
import ManageUsers from './pages/ManageUsers';
import ManageCourses from './pages/ManageCourses';
import Profile from './pages/Profile';
import { isAdminAuthenticated } from './context/AppContext';

const HeroSection = () => {
  const navigate = useNavigate();
  const actionButtons = [
    {
      title: 'Student Manager',
      color: 'bg-green-600 hover:bg-green-700',
      path: '/students',
      icon: <FaUsers size={24} className="mb-1 text-green-500" />,
    },
    {
      title: 'Settings',
      color: 'bg-green-500 hover:bg-green-600',
      path: '/settings',
      icon: <FaCog size={24} className="mb-1 text-green-700" />,
    },
    {
      title: 'Manage Purchases',
      color: 'bg-cyan-600 hover:bg-cyan-700',
      path: '/manage-purchases',
      icon: <span className="mb-1">💳</span>,
    },
    {
      title: 'Manage Users',
      color: 'bg-blue-600 hover:bg-blue-700',
      path: '/manage-users',
      icon: <span className="mb-1">👥</span>,
    },
    {
      title: 'Manage Courses',
      color: 'bg-purple-600 hover:bg-purple-700',
      path: '/manage-courses',
      icon: <span className="mb-1">📚</span>,
    },
    {
      title: 'Profile',
      color: 'bg-gray-600 hover:bg-gray-700',
      path: '/profile',
      icon: <span className="mb-1">👤</span>,
    },
  ];

  return (
    <section className="max-w-5xl w-full px-4 py-12 mx-auto bg-green-50 rounded-lg shadow mt-10 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-green-900">Welcome, Admin!</h1>
      <p className="text-green-700 mt-2 mb-8">
        Use the dashboard below to manage users, courses, and system settings.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 place-items-center">
        {actionButtons.map((btn, index) => (
          <button
            key={index}
            onClick={() => navigate(btn.path)}
            className={`w-full px-4 py-5 text-white rounded-md shadow-md ${btn.color} transition duration-200 text-center flex flex-col items-center`}
          >
            {btn.icon}
            <span className="font-medium mt-1">{btn.title}</span>
          </button>
        ))}
      </div>

      <p className="text-gray-400 text-sm mt-10">
        &copy; {new Date().getFullYear()} eSiksha Admin Panel. All rights reserved.
      </p>
    </section>
  );
};

// PrivateRoute wrapper for admin-only pages
const PrivateRoute = ({ children }) => {
  return isAdminAuthenticated() ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <ToastContainer />
      <Navbar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><HeroSection /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><HeroSection /></PrivateRoute>} />
            <Route path="/students" element={<PrivateRoute><StudentManager /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/manage-purchases" element={<PrivateRoute><ManagePurchases /></PrivateRoute>} />
            <Route path="/manage-users" element={<PrivateRoute><ManageUsers /></PrivateRoute>} />
            <Route path="/manage-courses" element={<PrivateRoute><ManageCourses /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            {/* Add more admin-only routes here */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;
