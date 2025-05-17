import React, { useContext } from 'react'
import { AppContext } from './context/AppContext';
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login';
// LMS Admin Pages (to be created)
import Dashboard from './pages/Admin/Dashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageCourses from './pages/Admin/ManageCourses';
import Settings from './pages/Admin/Settings';

const App = () => {
  const { aToken } = useContext(AppContext)

  return aToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/manage-users' element={<ManageUsers />} />
          <Route path='/manage-courses' element={<ManageCourses />} />
          <Route path='/settings' element={<Settings />} />
        </Routes>
      </div>
    </div>
  ) : (
    <Login />
  )
}

export default App