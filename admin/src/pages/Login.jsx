import React from 'react';

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FD]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col items-center">
        <img src="/vite.svg" alt="LMS Logo" className="h-14 w-14 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Admin Login</h2>
        <p className="text-gray-600 mb-6 text-center">Sign in as an admin to access the dashboard.</p>
        {/* Clerk login button placeholder */}
        <div className="w-full flex flex-col items-center">
          {/* Replace with <SignIn /> from Clerk if Clerk is set up */}
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all">Sign in with Clerk</button>
        </div>
      </div>
    </div>
  );
};

export default Login;