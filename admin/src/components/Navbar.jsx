import React from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
      <div className="flex items-center">
        <img onClick={() => navigate('/')} src="/vite.svg" alt="LMS Logo" className="h-10 w-10 mr-3 cursor-pointer" />
        <span className="text-2xl font-bold text-gray-800">LMS Admin</span>
      </div>
      <button
        onClick={() => {
          localStorage.removeItem('adminToken');
          navigate('/login', { replace: true });
        }}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow ml-4"
      >
        Logout
      </button>
    </nav>
  )
}

export default Navbar