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
    </nav>
  )
}

export default Navbar