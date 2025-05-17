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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Courses</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
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
            {courses.map((course, idx) => (
              <tr key={course._id}>
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{course.courseTitle}</td>
                <td className="px-4 py-2">{course.courseDescription}</td>
                <td className="px-4 py-2">{course.coursePrice}</td>
                <td className="px-4 py-2">{course.isPublished ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourses;
