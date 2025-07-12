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
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${backendUrl}/api/admin/manage-courses`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        let data;
        try {
          data = await res.json();
        } catch (jsonErr) {
          setError('Failed to parse response.');
          setCourses([]);
          return;
        }
        console.log('Fetched courses:', data); // DEBUG LOG
        if (!res.ok) {
          setError(data.message || `Error: ${res.status} ${res.statusText}`);
          setCourses([]);
        } else if (Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          setError('No courses found or invalid response.');
          setCourses([]);
        }
      } catch (err) {
        setError(err.message || 'Unknown error occurred.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [backendUrl, aToken]);

  const togglePublish = async (courseId, status) => {
    try {
      const newStatus = status === 'published' ? 'draft' : 'published';
      const res = await fetch(`${backendUrl}/api/admin/courses/${courseId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCourses(prev =>
          prev.map(c => (c._id === courseId ? { ...c, status: newStatus } : c))
        );
      }
    } catch (error) {
      alert('Failed to toggle publish state');
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
    const headers = ['Title', 'Price', 'Published'];
    const rows = courses.map((c) => [
      c.title || 'N/A',
      c.price || 'Free',
      c.status === 'published' ? 'Yes' : 'No',
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
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold mb-2">Error loading courses</h2>
        <div>{error}</div>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-200 rounded">Reload</button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-green-50 min-h-screen">
      <div className="flex flex-col items-center mb-6">
        <span className="mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7v-6m0 0l-9-5m9 5l9-5" />
          </svg>
        </span>
        <h2 className="text-2xl font-bold text-gray-800">Manage Courses</h2>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold shadow flex items-center gap-2"
        >
          Back to Dashboard
        </button>
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
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Published</th>
              <th className="px-4 py-2">Educator</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses
                .filter(course => {
                  const title = (typeof course.title === 'string' && course.title.trim().length > 0)
                    ? course.title
                    : '';
                  return title.toLowerCase().includes(search.toLowerCase());
                })
                .map((course, idx) => (
                  <tr key={course._id}>
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{course.title || 'Unknown Course'}</td>
                    <td className="px-4 py-2">
                      {course.discount && course.discount > 0 && course.price
                        ? `₹${Math.round(course.price * (1 - course.discount / 100))} (₹${course.price}, ${course.discount}% off)`
                        : (course.price ? `₹${course.price}` : 'Free')
                      }
                    </td>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <button
                        onClick={() => togglePublish(course._id, course.status)}
                        className={`px-2 py-1 rounded text-white text-xs flex items-center gap-1 ${
                          course.status === 'published' ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        title={course.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {course.status === 'published' ? <FaTimes /> : <FaCheck />}
                        {course.status === 'published' ? 'Unpublish' : 'Publish'}
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
                      {(course.createdBy && typeof course.createdBy.name === 'string' && course.createdBy.name.trim().length > 0)
                        ? course.createdBy.name.trim()
                        : (course.createdBy && typeof course.createdBy.email === 'string' && course.createdBy.email.trim().length > 0)
                          ? course.createdBy.email.trim()
                          : ''
                      }
                    </td>
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
      </div>
    </div>
  );
};

export default ManageCourses;
