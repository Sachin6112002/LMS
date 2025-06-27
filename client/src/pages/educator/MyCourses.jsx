import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const MyCourses = () => {

  const { backendUrl, isEducator, currency, getToken, userData } = useContext(AppContext)

  const [courses, setCourses] = useState(null)

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();
      console.log('MyCourses: Token received:', !!token);
      console.log('MyCourses: userData available:', !!userData);
      console.log('MyCourses: isEducator value:', isEducator);
      
      // Try to get educator-specific courses first
      try {
        const { data } = await axios.get(backendUrl + '/api/educator/courses', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (data.success) {
          console.log('MyCourses: Got educator courses directly:', data.courses.length);
          setCourses(data.courses);
          return;
        }
      } catch (educatorError) {
        console.log('MyCourses: Educator endpoint not available, falling back to filtering');
      }
      
      // Fallback: Use general courses endpoint and filter
      const { data } = await axios.get(backendUrl + '/api/courses', { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        console.log('MyCourses: Total courses received:', data.courses.length);
        // If backend returns all courses, filter by educatorId if needed
        const educatorId = (typeof isEducator === 'object' && isEducator._id) ? isEducator._id : 
                          (userData && userData._id) ? userData._id : null;
        console.log('MyCourses: Educator ID determined as:', educatorId);
        
        if (educatorId) {
          const myCourses = data.courses.filter(c => c.educator && (c.educator._id === educatorId || c.educator === educatorId));
          console.log('MyCourses: Filtered courses count:', myCourses.length);
          setCourses(myCourses);
        } else {
          console.log('MyCourses: No educator ID found, showing all courses');
          setCourses(data.courses);
        }
      } else {
        console.error('MyCourses: API error:', data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error('MyCourses: Fetch error:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  }

  // Helper: check if course thumbnail is missing and show a warning toast
  useEffect(() => {
    if (courses && courses.length > 0) {
      const missingThumb = courses.find(c => !c.courseThumbnail || c.courseThumbnail === '');
      if (missingThumb) {
        toast.warn(`Some courses are missing a thumbnail. Please ensure you upload a thumbnail when creating a course.`);
      }
    }
  }, [courses]);

  useEffect(() => {
    console.log('MyCourses useEffect: isEducator:', isEducator, 'userData:', !!userData);
    if (isEducator) {
      fetchEducatorCourses()
    }
  }, [isEducator])

  // Show loading while waiting for courses to load
  if (!courses) {
    return (
      <div className="h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-green-700">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-green-50">
      <div className='w-full'>
        <h2 className="pb-4 text-lg font-medium text-green-900">My Courses ({courses.length})</h2>
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-green-700">No courses found. Create your first course to get started!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-green-200">
            <table className="md:table-auto table-fixed w-full overflow-hidden">
              <thead className="text-green-900 border-b border-green-200 text-sm text-left">
                <tr className='overflow-scroll'>
                  <th className="px-4 py-3 font-semibold truncate">All Courses</th>
                  <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                  <th className="px-4 py-3 font-semibold truncate">Students</th>
                  <th className="px-4 py-3 font-semibold truncate">Published On</th>
                  <th className="px-4 py-3 font-semibold truncate">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-green-700">
                {courses.map((course) => {
                  // Defensive check for course properties
                  if (!course || !course._id) {
                    console.warn('MyCourses: Invalid course data found:', course);
                    return null;
                  }
                  
                  return (
                    <tr key={course._id} className="border-b border-green-200">
                      <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                        {course.courseThumbnail ? (
                          <img src={course.courseThumbnail} alt="Course Image" className="w-16" />
                        ) : (
                          <span className="w-16 h-10 flex items-center justify-center bg-yellow-100 text-yellow-800 rounded">No Image</span>
                        )}
                        <span className="truncate hidden md:block">{course.courseTitle || 'Untitled Course'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {currency} {Math.floor((course.enrolledStudents?.length || 0) * ((course.coursePrice || 0) - (course.discount || 0) * (course.coursePrice || 0) / 100))}
                      </td>
                      <td className="px-4 py-3">{course.enrolledStudents?.length || 0}</td>
                      <td className="px-4 py-3">
                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {course.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;