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

  console.log('Navbar userData:', userData);

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 h-20 md:px-14 lg:px-36 border-b border-green-200 py-4 ${isCoursesListPage ? 'bg-white' : 'bg-green-100'}`}>
      <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className="w-28 lg:w-32 cursor-pointer" />
      <div className="md:flex hidden items-center gap-5 text-green-800">
        <div className="flex items-center gap-5">
          {
            userData && <>
              <button onClick={becomeEducator} className="hover:underline text-green-600">{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
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
        {(!userData || userData?.publicMetadata?.role !== 'student') && (
          <a
            href="https://lms-admin-blond.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-500 text-white px-5 py-2 rounded-full ml-2 font-semibold hover:bg-red-600 transition"
          >
            Admin Panel
          </a>
        )}
      </div>
      {/* For Phone Screens */}
      <div className='md:hidden flex items-center gap-2 sm:gap-5 text-green-800'>
        <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
          <button onClick={becomeEducator} className="hover:underline text-green-600">{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
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
        {(!userData || userData?.publicMetadata?.role !== 'student') && (
          <a
            href="https://lms-admin-blond.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-semibold shadow ml-4 transition-colors"
          >
            Admin Panel
          </a>
        )}
      </div>
      {/* DEBUG PANEL: Remove in production */}
      <div style={{position:'fixed',bottom:0,right:0,background:'#fff',color:'#222',zIndex:9999,padding:'8px',border:'1px solid #ccc',fontSize:'12px'}}>
        <strong>userData:</strong>
        <pre style={{maxWidth:'300px',maxHeight:'200px',overflow:'auto'}}>{JSON.stringify(userData,null,2)}</pre>
      </div>
    </div>
  );
};

export default Navbar;