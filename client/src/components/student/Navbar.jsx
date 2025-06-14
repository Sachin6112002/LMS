import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {

  const location = useLocation();

  const isCoursesListPage = location.pathname.includes('/course-list');

  const { backendUrl, isEducator, setIsEducator, navigate, getToken, userData, logout } = useContext(AppContext)

  const becomeEducator = async () => {

    try {

      if (isEducator) {
        navigate('/educator')
        return;
      }

      const token = getToken()
      const { data } = await axios.get(backendUrl + '/api/educator/update-role', { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        toast.success(data.message)
        setIsEducator(true)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCoursesListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
      <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className="w-28 lg:w-32 cursor-pointer" />
      <div className="md:flex hidden items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">
          {
            userData && <>
              <button onClick={becomeEducator}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
              | <Link to='/my-enrollments' >My Enrollments</Link>
            </>
          }
        </div>
        {userData
          ? <button onClick={logout} className="bg-blue-600 text-white px-5 py-2 rounded-full">
            Logout
          </button>
          : <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-5 py-2 rounded-full">
            Create Account
          </button>}
        {/* Only show Admin Panel button if not logged in or not a student */}
        {(!userData || userData?.publicMetadata?.role !== 'student') && (
          <a
            href="https://lms-admin-blond.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white px-5 py-2 rounded-full ml-2 font-semibold hover:bg-red-700 transition"
          >
            Admin Panel
          </a>
        )}
      </div>
      {/* For Phone Screens */}
      <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
        <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
          <button onClick={becomeEducator}>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
          | {
            userData && <Link to='/my-enrollments' >My Enrollments</Link>
          }
        </div>
        {userData
          ? <button onClick={logout}>
            <img src={assets.user_icon} alt="" />
          </button>
          : <button onClick={() => navigate('/login')}>
            <img src={assets.user_icon} alt="" />
          </button>}
        {/* Only show Admin Panel button if not logged in or not a student */}
        {(!userData || userData?.publicMetadata?.role !== 'student') && (
          <a
            href="https://lms-admin-blond.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 transition"
          >
            Admin Panel
          </a>
        )}
      </div>
    </div>
  );
};

export default Navbar;