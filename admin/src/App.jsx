import React from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Login from './pages/Login';
import ManageUsers from "./pages/ManageUsers";
import ManageCourses from "./pages/ManageCourses";
import Settings from "./pages/Settings";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md mt-8 mx-4">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Welcome, Admin!</h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        This is your Learning Management System admin dashboard. Here you can manage users, courses, and platform settings. Use the buttons below to get started.
      </p>
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <button
          onClick={() => navigate('/manage-users')}
          className="flex flex-col items-center px-8 py-6 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all w-56"
        >
          <span className="mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 010 7.75" /></svg>
          </span>
          <span className="font-semibold">Manage Users</span>
        </button>
        <button
          onClick={() => navigate('/manage-courses')}
          className="flex flex-col items-center px-8 py-6 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-all w-56"
        >
          <span className="mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7v-6m0 0l-9-5m9 5l9-5" /></svg>
          </span>
          <span className="font-semibold">Manage Courses</span>
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="flex flex-col items-center px-8 py-6 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 transition-all w-56"
        >
          <span className="mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </span>
          <span className="font-semibold">Settings</span>
        </button>
      </div>
      <footer className="text-gray-400 text-sm mt-8">&copy; {new Date().getFullYear()} LMS Admin Panel. All rights reserved.</footer>
    </section>
  );
};

const App = () => {
  return (
    <div className='bg-[#F8F9FD] min-h-screen flex flex-col'>
      <ToastContainer />
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center">
        <Routes>
          <Route path='/' element={<HeroSection />} />
          <Route path='/manage-users' element={<ManageUsers />} />
          <Route path='/manage-courses' element={<ManageCourses />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}

export default App