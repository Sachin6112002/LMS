import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { UserButton, useUser } from '@clerk/clerk-react';
import AdminLoginModal from './AdminLoginModal';

const Navbar = ({ bgColor }) => {
  const { user } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  // Dummy login handler (replace with real logic)
  const handleAdminLogin = async (email, password) => {
    // TODO: Implement real admin login logic
    setShowLogin(false);
    // You can use context or redirect after successful login
  };

  return (
    <div className={`flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3 ${bgColor}`}>
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-28 lg:w-32" />
      </Link>
      <div className="flex items-center gap-5 text-gray-500 relative">
        {user && <p>Hi! {user.fullName}</p>}
        <UserButton />
        <button onClick={() => setShowLogin(true)} className="text-blue-500 hover:underline">
          Admin Login
        </button>
        <AdminLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={handleAdminLogin} />
      </div>
    </div>
  );
};

export default Navbar;