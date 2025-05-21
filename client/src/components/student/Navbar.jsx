import React from 'react'
import {assets} from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-teal-800 text-white py-4 bg-gradient-to-r from-indigo-200 to-purple-950">
      <div className="flex items-center gap-4">
        <img src={assets.logo} alt="Logo" className='w-20 lg:w-32 cursor-pointer' onClick={() => navigate('/dashboard')} />
        <span className="text-2xl font-bold text-gray-800">LMS Admin Panel</span>
      </div>
    </div>
  )
}

export default Navbar