import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../context/AppContext';

const EducatorManager = () => {
  const [educators, setEducators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEducators = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const { data } = await axios.get(`${backendUrl}/api/admin/educators`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) setEducators(data.educators);
        else setError(data.message || 'Failed to fetch educators');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch educators');
      } finally {
        setLoading(false);
      }
    };
    fetchEducators();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Educator Manager</h2>
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
              <th className="p-2 border">Courses</th>
            </tr>
          </thead>
          <tbody>
            {educators.map((educator) => (
              <tr key={educator._id}>
                <td className="p-2 border">{educator.name}</td>
                <td className="p-2 border">{educator.email}</td>
                <td className="p-2 border">{educator.courses?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EducatorManager;
