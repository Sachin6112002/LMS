import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUsers, FaBookOpen } from 'react-icons/fa';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentManager from './pages/StudentManager';
import EducatorManager from './pages/EducatorManager';

const HeroSection = () => {
  const navigate = useNavigate();

  const actionButtons = [
    {
      title: 'Student Manager',
      color: 'bg-purple-600 hover:bg-purple-700',
      path: '/students',
      icon: <FaUsers size={24} className="mb-1" />,
    },
    {
      title: 'Educator Manager',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      path: '/educators',
      icon: <FaBookOpen size={24} className="mb-1" />,
    },
  ];

  return (
    <section className="max-w-5xl w-full px-4 py-12 mx-auto bg-white rounded-lg shadow mt-10 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome, Admin!</h1>
      <p className="text-gray-600 mt-2 mb-8">
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
        &copy; {new Date().getFullYear()} LMS Admin Panel. All rights reserved.
      </p>
    </section>
  );
};

const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <ToastContainer />
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/dashboard" element={<HeroSection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/students" element={<StudentManager />} />
          <Route path="/educators" element={<EducatorManager />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
