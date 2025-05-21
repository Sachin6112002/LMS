import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const ManageCourses = () => {
  const { backendUrl, aToken } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/admin/courses`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setCourses(data);
      } catch (err) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [backendUrl, aToken]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 p-8">
      <div className="flex flex-col items-center mb-6">
        <span className="mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7v-6m0 0l-9-5m9 5l9-5" />
          </svg>
        </span>
        <h2 className="text-2xl font-bold text-gray-800">Manage Courses</h2>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow p-8 w-full max-w-2xl">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Published</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course, idx) => (
                <tr key={course._id}>
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{course.courseTitle}</td>
                  <td className="px-4 py-2">{course.courseDescription}</td>
                  <td className="px-4 py-2">{course.coursePrice}</td>
                  <td className="px-4 py-2">{course.isPublished ? 'Yes' : 'No'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {courses.length === 0 && (
          <div className="mt-4 text-center">
            <p className="text-gray-600">Course management features coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourses;
