import React, { useContext } from 'react'
import {assets} from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'

const Navbar = () => {
  const {navigate , isEducator , setIsEducator} = useContext(AppContext)
    const isCourseListPage = location.pathname.includes('/course-list')
    const {openSignIn} = useClerk()
    const {user} = useUser()

  return (
    <div className= {`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-teal-800 text-white py-4 ${isCourseListPage ?     'bg-white' : 'bg-gradient-to-r from-indigo-200 to-purple-950' }`}> 
    <img onClick={()=> navigate('/')} src={assets.logo} alt="Logo" className='w-20 lg:w-32 cursor-pointer ' />
    <div className='hidden md:flex items-center gap-5 text-gray-500'>
        <div className='flex items-center gap-5 
        '>
            { user && <>
              <button onClick={()=>{navigate('/educator')}} className='text-white'>{isEducator ? 'Educator Dashboard' : 'Become Educator'}</button>
              <button onClick={()=>{navigate('/admin')}} className='text-white'>Admin Dashboard</button>
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
          <button >Become Educator</button>
          <Link to = '/my-enrollments'>My Enrollments</Link>
          </div>
         { user ? <UserButton/> : <button onClick={() => openSignIn()} className='mix-blend-color-burn w-8'><img src= {assets.user_icon} alt=""  /></button>}
        </div>

        </div>
  )
}

export default Navbar