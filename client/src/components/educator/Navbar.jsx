import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const Navbar = ({ bgColor }) => {
  const { userData, logout } = useContext(AppContext)

  return (
    <div className={`flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3 ${bgColor}`}>
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-28 lg:w-32" />
      </Link>
      <div className="flex items-center gap-5 text-gray-500 relative">
        <p>Hi! {userData?.fullName}</p>
        <button onClick={logout} className="text-gray-500 hover:text-gray-700">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;