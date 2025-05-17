import React, { useContext } from 'react'
import {assets} from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'

const Navbar = () => {
  const {navigate , isEducator , setIsEducator, userData} = useContext(AppContext)
    const isCourseListPage = location.pathname.includes('/course-list')
    const {openSignIn} = useClerk()
    const {user} = useUser()

  // Handler for Become Educator
  const becomeEducator = async () => {
    try {
      // Call backend endpoint to update role
      const token = await user.getToken();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/educator/update-role`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setIsEducator(true);
        window.location.reload(); // Optionally reload to update UI
      } else {
        alert(data.message || 'Failed to become educator');
      }
    } catch (error) {
      alert('Failed to become educator');
    }
  };

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-teal-800 text-white py-4 ${isCourseListPage ?     'bg-white' : 'bg-gradient-to-r from-indigo-200 to-purple-950' }`}> 
    <img onClick={()=> navigate('/')} src={assets.logo} alt="Logo" className='w-20 lg:w-32 cursor-pointer ' />
    <div className='hidden md:flex items-center gap-5 text-gray-500'>
        <div className='flex items-center gap-5'>
            { user && <>
              <button onClick={isEducator ? ()=>{navigate('/educator')} : becomeEducator} className='text-white'>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
              {userData?.publicMetadata?.role === 'admin' && (
                <button onClick={()=>{navigate('/admin')}} className='text-white'>Admin Dashboard</button>
              )}
              <Link to = '/my-enrollments' className='text-white'>My Enrollments</Link>
            </>}
              
        </div>

       { user ? <UserButton/> :
        <button onClick={()=> openSignIn()} className='bg-indigo-600 text-white px-5 py-2 rounded-full  border-b border-b-purple-600'>Create Account</button>}
        
        </div>
        {/* for phone screen */}
        <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>

          <div className='text-black flex sm:gap-2 
          text-sm gap-4' >
          <button onClick={becomeEducator}>Become Educator</button>
          <Link to = '/my-enrollments'>My Enrollments</Link>
          </div>
         { user ? <UserButton/> : <button onClick={() => openSignIn()} className='mix-blend-color-burn w-8'><img src= {assets.user_icon} alt=""  /></button>}
        </div>

        </div>
  )
}

export default Navbar