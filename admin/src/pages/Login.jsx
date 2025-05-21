import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if an admin already exists
    fetch('/api/admin/check-admin-exists')
      .then(res => res.json())
      .then(data => {
        if (!data.exists) {
          // If no admin exists, redirect to registration page
          navigate('/register', { replace: true });
        }
      });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FD]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col items-center">
        <img src="/vite.svg" alt="LMS Logo" className="h-14 w-14 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Admin Login</h2>
        <p className="text-gray-600 mb-6 text-center">Sign in as an admin to access the dashboard.</p>
        {/* Clerk login button placeholder */}
        <div className="w-full flex flex-col items-center gap-4">
          {/* Replace with <SignIn /> from Clerk if Clerk is set up */}
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all" onClick={() => window.location.href = '/api/admin/login'}>
            Sign in as Admin
          </button>
          <p className="text-gray-500 text-sm text-center">If you are the first user, <a href="/register" className="text-blue-600 underline">register as admin</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;