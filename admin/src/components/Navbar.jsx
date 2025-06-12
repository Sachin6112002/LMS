import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-200 py-4 bg-cyan-50">
      <img onClick={() => navigate('/')} src={logo} alt="eSiksha Logo" className="w-28 lg:w-32 cursor-pointer" />
      <button
        onClick={() => {
          localStorage.removeItem('adminToken');
          navigate('/login', { replace: true });
        }}
        className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold shadow ml-4"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;