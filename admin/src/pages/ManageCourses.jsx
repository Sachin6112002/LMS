import React, { useEffect, useState, useContext } from 'react';
import { AppContext, isAdminAuthenticated } from '../context/AppContext';
import { FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ManageCourses = () => {
  const { backendUrl, aToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/admin/courses`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        const data = await res.json();
        if (Array.isArray(data.courses)) setCourses(data.courses);
      } catch (err) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [backendUrl, aToken]);

  const togglePublish = async (courseId, isPublished) => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/courses/${courseId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aToken}`,
        },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      const updated = await res.json();
      setCourses(prev =>
        prev.map(c => (c._id === courseId ? { ...c, isPublished: updated.isPublished } : c))
      );
    } catch (error) {
      console.error('Failed to toggle publish state', error);
    }
  };

  // Delete a course
  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {      const res = await fetch(`${backendUrl}/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aToken}`,
        },
      });
      if (res.ok) {
        setCourses(prev => prev.filter(c => c._id !== courseId));
      } else {
        alert('Failed to delete course.');
      }
    } catch (error) {
      alert('Error deleting course.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Description', 'Price', 'Published'];
    const rows = courses.map((c) => [
      c.courseTitle,
      c.courseDescription,
      c.coursePrice,
      c.isPublished ? 'Yes' : 'No',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'courses.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

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

      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md"
      />

      <button onClick={exportToCSV} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
        Export CSV
      </button>

      <div className="overflow-x-auto bg-white rounded-lg shadow p-8 w-full max-w-5xl">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Published</th>
              <th className="px-4 py-2">Educator</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses
                .filter(course =>
                  course.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
                  course.courseDescription.toLowerCase().includes(search.toLowerCase())
                )
                .map((course, idx) => (
                  <tr key={course._id}>
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{course.courseTitle}</td>
                    <td className="px-4 py-2">{course.courseDescription.replace(/<[^>]+>/g, '')}</td>
                    <td className="px-4 py-2">{course.coursePrice}</td>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <button
                        onClick={() => togglePublish(course._id, course.isPublished)}
                        className={`px-2 py-1 rounded text-white text-xs flex items-center gap-1 ${
                          course.isPublished ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        title={course.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {course.isPublished ? <FaTimes /> : <FaCheck />}
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => deleteCourse(course._id)}
                        className="ml-2 px-2 py-1 rounded text-white text-xs bg-gray-700 hover:bg-gray-900 flex items-center gap-1"
                        title="Delete Course"
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      {course.educator && typeof course.educator === 'object'
                        ? course.educator.name || 'N/A'
                        : 'N/A'}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-2 text-center text-gray-500">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourses;
