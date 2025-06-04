import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const EducatorManager = () => {
  const [educators, setEducators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleChangeLoading, setRoleChangeLoading] = useState('');
  const [roleChangeError, setRoleChangeError] = useState('');
  const [roleChangeSuccess, setRoleChangeSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEducators = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/educators`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) setEducators(data.educators);
        else setError(data.message || 'Failed to fetch educators');
      } catch (err) {
        if (
          err.response?.data?.message === 'Invalid token' ||
          err.response?.data?.message === 'No token provided' ||
          err.response?.data?.message === 'Not authorized as admin'
        ) {
          setError('Session expired or unauthorized. Please log in again.');
          localStorage.removeItem('adminToken');
          setTimeout(() => navigate('/login'), 1500);
        } else {
          setError(err.response?.data?.message || 'Failed to fetch educators');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEducators();
  }, [navigate]);

  const handleRoleChange = async (id, newRole) => {
    setRoleChangeLoading(id);
    setRoleChangeError('');
    setRoleChangeSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.patch(
        `${backendUrl}/api/admin/change-role/${id}`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success) {
        setRoleChangeSuccess('Role updated successfully!');
        setEducators((prev) =>
          prev.map((e) =>
            e._id === id
              ? { ...e, publicMetadata: { ...e.publicMetadata, role: newRole } }
              : e
          )
        );
      } else {
        setRoleChangeError(data.message || 'Failed to update role');
      }
    } catch (err) {
      setRoleChangeError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setRoleChangeLoading('');
      setTimeout(() => setRoleChangeSuccess(''), 2000);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Educator Data</h2>
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
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {educators.map((educator) => (
              <tr key={educator._id}>
                <td className="p-2 border">{educator.name}</td>
                <td className="p-2 border">{educator.email}</td>
                <td className="p-2 border">{educator.courses?.length || 0}</td>
                <td className="p-2 border">
                  {educator.publicMetadata?.role || 'educator'}
                </td>
                <td className="p-2 border">
                  <select
                    value={educator.publicMetadata?.role || 'educator'}
                    onChange={(e) =>
                      handleRoleChange(educator._id, e.target.value)
                    }
                    disabled={roleChangeLoading === educator._id}
                    className="border rounded px-2 py-1"
                  >
                    <option value="educator">Educator</option>
                    <option value="admin">Admin</option>
                  </select>
                  {roleChangeLoading === educator._id && (
                    <span className="ml-2 text-xs text-gray-400">Updating...</span>
                  )}
                  {roleChangeError && (
                    <span className="ml-2 text-xs text-red-500">
                      {roleChangeError}
                    </span>
                  )}
                  {roleChangeSuccess && (
                    <span className="ml-2 text-xs text-green-500">
                      {roleChangeSuccess}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EducatorManager;
