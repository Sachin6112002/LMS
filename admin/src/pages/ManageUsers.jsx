import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const ManageUsers = () => {
  const { backendUrl, aToken } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/admin/users`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
      } catch (err) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [backendUrl, aToken]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 p-8">
      <div className="flex flex-col items-center mb-6">
        <span className="mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 010 7.75"
            />
          </svg>
        </span>
        <h2 className="text-2xl font-bold text-gray-800">Manage Users</h2>
      </div>
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-2xl">
        <p className="text-gray-600 text-center">
          User management features coming soon.
        </p>
      </div>
    </div>
  );
};

export default ManageUsers;
