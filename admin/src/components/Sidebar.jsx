import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <div className="min-h-screen bg-white border-r border-gray-200 pt-8 px-2">
      <ul className="space-y-2">
        <NavLink to={'/dashboard'} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-cyan-100 text-blue-700 font-semibold' : 'hover:bg-cyan-50 text-gray-700'}`}>
          <img className="w-5 h-5" src={assets.home_icon} alt='' />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to={'/manage-purchases'} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-cyan-100 text-blue-700 font-semibold' : 'hover:bg-cyan-50 text-gray-700'}`}>
          <span className="w-5 h-5">💳</span>
          <span>Manage Purchases</span>
        </NavLink>
      </ul>
    </div>
  )
}

export default Sidebar