import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
  const { backendUrl, aToken } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/admin/users`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
          // Find current user by token (assuming token is userId or you have userId in context)
          // For demo, use the first user as current user
          const currentUser = data.users[0];
          setIsAdmin(
            currentUser && currentUser.publicMetadata?.role === 'admin'
          );
        }
      } catch (err) {
        setUsers([]);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [backendUrl, aToken]);

  if (loading) return <div>Loading...</div>;
  if (isAdmin === false)
    return (
      <div className="p-8 text-red-600 font-semibold">
        Unauthorized: Admin access only.
      </div>
    );

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
      <div className="overflow-x-auto bg-white rounded-lg shadow p-8 w-full max-w-2xl">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, idx) => (
                <tr key={user._id}>
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    {user.publicMetadata?.role || 'student'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-2 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
