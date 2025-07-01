import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('/api/admin/manage-courses');
        if (res.data.success) {
          setCourses(res.data.courses);
        } else {
          setError('Failed to fetch courses');
        }
      } catch (err) {
        setError('Error fetching courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="p-8 text-green-700">Loading courses...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-green-900">Manage Courses</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-green-200 rounded-lg shadow">
          <thead>
            <tr className="bg-green-100">
              <th className="py-2 px-4 border-b">Course Name</th>
              <th className="py-2 px-4 border-b">Educator</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Discount</th>
              <th className="py-2 px-4 border-b">Discounted Price</th>
              <th className="py-2 px-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id} className="hover:bg-green-50">
                <td className="py-2 px-4 border-b font-medium text-green-900">{course.courseName}</td>
                <td className="py-2 px-4 border-b">{course.educatorName}</td>
                <td className="py-2 px-4 border-b">₹{course.price}</td>
                <td className="py-2 px-4 border-b">{course.discount ? `${course.discount}%` : '-'}</td>
                <td className="py-2 px-4 border-b font-semibold text-green-700">₹{course.discountedPrice}</td>
                <td className="py-2 px-4 border-b">{course.status || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminManageCourses;
