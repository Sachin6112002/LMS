import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';

const MyCourses = () => {

  const { backendUrl, isEducator, currency, getToken } = useContext(AppContext)

  const [courses, setCourses] = useState(null)

  const fetchEducatorCourses = async () => {

    try {

      const token = await getToken()

      const { data } = await axios.get(backendUrl + '/api/educator/courses', { headers: { Authorization: `Bearer ${token}` } })

      data.success && setCourses(data.courses)

    } catch (error) {
      toast.error(error.message)
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
    if (isEducator) {
      fetchEducatorCourses()
    }
  }, [isEducator])

  return courses ? (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-green-50">
      <div className='w-full'>
        <h2 className="pb-4 text-lg font-medium text-green-900">My Courses</h2>
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
              {courses.map((course) => (
                <tr key={course._id} className="border-b border-green-200">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    {course.courseThumbnail ? (
                      <img src={course.courseThumbnail} alt="Course Image" className="w-16" />
                    ) : (
                      <span className="w-16 h-10 flex items-center justify-center bg-yellow-100 text-yellow-800 rounded">No Image</span>
                    )}
                    <span className="truncate hidden md:block">{course.courseTitle}</span>
                  </td>
                  <td className="px-4 py-3">{currency} {Math.floor(course.enrolledStudents.length * (course.coursePrice - course.discount * course.coursePrice / 100))}</td>
                  <td className="px-4 py-3">{course.enrolledStudents.length}</td>
                  <td className="px-4 py-3">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{course.status === 'published' ? 'Published' : 'Draft'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : <Loading />
};

export default MyCourses;