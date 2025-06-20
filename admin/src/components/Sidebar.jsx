import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <div className="min-h-screen bg-green-50 border-r border-green-200 pt-8 px-2 w-64">
      <ul className="space-y-2">
        <NavLink to={'/dashboard'} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-900 font-semibold' : 'hover:bg-green-50 text-green-700'}`}>
          <img className="w-5 h-5" src={assets.home_icon} alt='' />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to={'/manage-purchases'} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-900 font-semibold' : 'hover:bg-green-50 text-green-700'}`}>
          <span className="w-5 h-5">💳</span>
          <span>Manage Purchases</span>
        </NavLink>
        {/* Add more links as needed */}
      </ul>
    </div>
  )
}

export default Sidebar