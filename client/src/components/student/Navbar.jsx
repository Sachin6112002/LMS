import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {

  const location = useLocation();

  const isCoursesListPage = location.pathname.includes('/course-list');

  const { backendUrl, isEducator, setIsEducator, navigate, getToken, userData, logout, becomeEducator } = useContext(AppContext)

  const handleBecomeEducator = async () => {
    try {
      if (isEducator) {
        navigate('/educator')
        return;
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        'Are you sure you want to become an educator? This will allow you to create and manage courses.'
      );
      
      if (!confirmed) return;

      const success = await becomeEducator();
      if (success) {
        // Optionally navigate to educator dashboard
        setTimeout(() => {
          const goToDashboard = window.confirm(
            'You are now an educator! Would you like to go to the educator dashboard?'
          );
          if (goToDashboard) {
            navigate('/educator');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error in handleBecomeEducator:', error);
    }
  }

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 h-20 md:px-14 lg:px-36 border-b border-green-200 py-4 ${isCoursesListPage ? 'bg-white' : 'bg-green-100'}`}>
      <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className="w-28 lg:w-32 cursor-pointer" />
      <div className="md:flex hidden items-center gap-5 text-green-800">
        <div className="flex items-center gap-5">
          {
            userData && <>
              <button onClick={handleBecomeEducator} className="hover:underline text-green-600">{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
              | <Link to='/my-enrollments' className="hover:underline text-green-600">My Enrollments</Link>
            </>
          }
        </div>
        {userData
          ? <button onClick={logout} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full">
            Logout
          </button>
          : <button onClick={() => navigate('/login')} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full">
            Create Account
          </button>}
        {userData && (
          <Link
            to="/profile"
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full transition ml-2"
            style={{ textDecoration: 'none' }}
          >
            Profile
          </Link>
        )}
        {userData && (
          <a
            href={import.meta.env.VITE_ADMIN_URL || "https://lms-admin-theta-two.vercel.app"}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full ml-2 font-semibold transition"
          >
            Admin Panel
          </a>
        )}
      </div>
      {/* For Phone Screens */}
      <div className='md:hidden flex items-center gap-2 sm:gap-5 text-green-800'>
        <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
          <button onClick={handleBecomeEducator} className="hover:underline text-green-600">{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
          | {
            userData && <Link to='/my-enrollments' className="hover:underline text-green-600">My Enrollments</Link>
          }
        </div>
        {userData
          ? <button onClick={logout} title="Logout" aria-label="Logout">
            <img src={assets.user_icon} alt="Logout" />
          </button>
          : <button onClick={() => navigate('/login')} title="Login" aria-label="Login">
            <img src={assets.user_icon} alt="Login" />
          </button>}
        {userData && (
          <Link
            to="/profile"
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full transition ml-2"
            style={{ textDecoration: 'none' }}
          >
            Profile
          </Link>
        )}
        {userData && (
          <a
            href={import.meta.env.VITE_ADMIN_URL || "https://lms-admin-theta-two.vercel.app"}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full ml-2 font-semibold transition"
          >
            Admin Panel
          </a>
        )}
      </div>
    </div>
  );
};

export default Navbar;
