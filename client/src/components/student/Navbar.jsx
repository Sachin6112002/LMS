import React from 'react';
import { useNavigate } from 'react-router-dom';
import {assets} from '../../assets/assets'

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-teal-800 text-white py-4 bg-gradient-to-r from-indigo-200 to-purple-950">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/') }>
        <img src={assets.logo} alt="LMS Logo" className="h-10 w-10 mr-3" />
        <span className="text-2xl font-bold text-gray-800">LMS</span>
      </div>
    </div>
  );
};

export default Navbar;