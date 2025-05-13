import React from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'
import Home from './pages/student/Home'
import CoursesList from './pages/student/CoursesList'
import CourseDetails from './pages/student/CourseDetails'
import MyEnrollments from './pages/student/MyEnrollments'
import Player from './pages/student/Player'
import Loading from './components/student/Loading'
import Educator from './pages/educator/Educator'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import Navbar from './components/student/Navbar'
import Admin from './pages/admin/Admin';
import AdminDashboard from './pages/admin/AdminDahboard';
import AdminSettings from './pages/admin/AdminSettings';
import ManageCourses from './pages/admin/ManageCourses';
import ManageUsers from './pages/admin/ManageUsers';

const App = () => {
  const isEducatorRoute = useMatch('/educator/*')
  const isAdminRoute = useMatch('/admin/*')
  return (
    <div className='text-default min-h-screen bg-white'>
      {!isAdminRoute && !isEducatorRoute && <Navbar/>}
      
    <Routes>
    <Route path = '/' element = {<Home/>}/>
    <Route path = '/course-list' element = {<CoursesList/>}/>
    <Route path = '/course-list/:input' element = {<CoursesList/>}/>
    <Route path = '/course/:id' element = {<CourseDetails />}/>
    <Route path = '/my-enrollments' element = {<MyEnrollments />}/>
    <Route path = '/player/:courseId' element = {<Player />}/>
    <Route path = '/loading/:path' element = {<Loading/>}/>
      <Route path = '/educator' element= {<Educator/>}>
      <Route path='/educator' element={<Dashboard/>}/>
      <Route path='add-course' element={<AddCourse/>}/>
      <Route path='my-courses' element={<MyCourses/>}/>
      <Route path='student-enrolled' element={<StudentsEnrolled/>}/>
      </Route>
      <Route path='/admin' element={<Admin/>}>
      <Route path='dashboard' element={<AdminDashboard/>}/>
      <Route path='settings' element={<AdminSettings/>}/>
      <Route path='manage-courses' element={<ManageCourses/>}/>
      <Route path='manage-users' element={<ManageUsers/>}/>
      </Route>
    </Routes>
    

    </div>
  )
}

export default App