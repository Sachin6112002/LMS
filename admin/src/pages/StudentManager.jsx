import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../context/AppContext';

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const { data } = await axios.get(`${backendUrl}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) setStudents(data.students);
        else setError(data.message || 'Failed to fetch students');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-green-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-green-900">Student Manager</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Enrolled Courses</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td className="p-2 border">{student.name}</td>
                <td className="p-2 border">{student.email}</td>
                <td className="p-2 border">{student.enrolledCourses?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentManager;
