import React, { useEffect, useState, useContext } from 'react';
import { AppContext, isAdminAuthenticated } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaSort, FaLock, FaTrashAlt } from 'react-icons/fa';

const ManageUsers = () => {
  const { backendUrl, aToken } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

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

          const tokenPayload = aToken
            ? JSON.parse(atob(aToken.split('.')[1]))
            : null;
          const userId = tokenPayload ? tokenPayload.sub : null;
          const currentUser = data.users.find((u) => u._id === userId);
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

  // Function to manually refresh users list
  const refreshUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to refresh users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${aToken}`,
        },
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        alert('Server error: invalid response.');
        return;
      }

      if (data.success) {
        setUsers(users.filter((user) => user._id !== userId));
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        alert('Server error: invalid response.');
        return;
      }
      if (data.success) {
        setUsers(users.map((user) => (user._id === userId ? { ...user, publicMetadata: { ...user.publicMetadata, role: newRole } } : user)));
      } else {
        alert('Failed to update role.');
      }
    } catch (err) {
      alert('Failed to update role.');
    }
  };

  const sortUsers = (field) => {
    const order = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);

    setUsers((prevUsers) =>
      [...prevUsers].sort((a, b) => {
        const valA = (a[field] || '').toLowerCase();
        const valB = (b[field] || '').toLowerCase();
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      })
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Auto-refresh users every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshUsers();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, backendUrl, aToken]);

  if (loading) return <div>Loading...</div>;
  if (isAdmin === false)
    return (
      <div className="p-8 text-red-600 font-semibold">
        Unauthorized: Admin access only.
      </div>
    );

  return (
    <div className="p-2 sm:p-4 md:p-8 bg-green-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-green-900">Manage Users</h1>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2 w-full sm:w-auto"
        >
          Back to Dashboard
        </button>
        <button
          onClick={refreshUsers}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2 w-full sm:w-auto"
        >
          <FaUsers className="h-4 w-4" />
          {loading ? 'Refreshing...' : 'Refresh Users'}
        </button>
        <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg shadow">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-700">Auto-refresh (30s)</span>
        </label>
      </div>
      <div className="flex flex-col items-center mb-6">
        <FaUsers className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mb-2" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Manage Users</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Total Users: {users.length} | Showing: {filteredUsers.length}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 w-full max-w-xl">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border px-3 py-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-gray-200 px-4 rounded"
          onClick={() => setSearch('')}
        >
          Reset
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow p-2 sm:p-6 w-full max-w-4xl">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="px-2 sm:px-4 py-2 cursor-pointer" onClick={() => sortUsers('name')}>
                Name <FaSort className="inline ml-1" />
              </th>
              <th className="px-2 sm:px-4 py-2 cursor-pointer" onClick={() => sortUsers('email')}>
                Email <FaSort className="inline ml-1" />
              </th>
              <th className="px-2 sm:px-4 py-2 cursor-pointer" onClick={() => sortUsers('role')}>
                Role <FaSort className="inline ml-1" />
              </th>
              <th className="px-2 sm:px-4 py-2">Change Role</th>
              <th className="px-2 sm:px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-2 sm:px-4 py-2">{user.name}</td>
                  <td className="px-2 sm:px-4 py-2">{user.email}</td>
                  <td className="px-2 sm:px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                          user.publicMetadata?.role === 'admin'
                            ? 'bg-green-600'
                            : user.publicMetadata?.role === 'educator'
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }`}
                      >
                        {user.publicMetadata?.role || 'student'}
                      </span>
                      {user.publicMetadata?.role === 'educator' && (
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          📚 Can create courses
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-2">
                    {/* Only allow role change for educators, not students or admins */}
                    {user.publicMetadata?.role === 'educator' ? (
                      <select
                        value={user.publicMetadata?.role}
                        onChange={e => handleChangeRole(user._id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="educator">Educator</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : user.publicMetadata?.role === 'admin' ? (
                      <span className="text-gray-500">Admin</span>
                    ) : (
                      <span className="text-gray-500">Student</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-4 py-2 flex gap-2 sm:gap-3">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete User"
                    >
                      <FaTrashAlt />
                    </button>
                    <button
                      onClick={() => {
                        // UI-only lock toggle
                        setUsers(users.map(u => u._id === user._id ? { ...u, locked: !u.locked } : u));
                      }}
                      className={`text-gray-600 hover:text-black ${user.locked ? 'opacity-50' : ''}`}
                      title={user.locked ? 'User is locked (UI only)' : 'Lock User (UI only)'}
                      disabled={user.locked}
                    >
                      <FaLock />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center px-2 sm:px-4 py-2 text-gray-500">
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
