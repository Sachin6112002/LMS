import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-green-200 py-4 bg-green-50">
      <img onClick={() => navigate('/')} src={logo} alt="eSiksha Logo" className="w-28 lg:w-32 cursor-pointer" />
      <button
        onClick={() => {
          localStorage.removeItem('adminToken');
          navigate('/login', { replace: true });
        }}
        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-semibold shadow ml-4 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;