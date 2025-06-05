import React, { useEffect, useState } from 'react';
import { backendUrl, isAdminAuthenticated } from '../context/AppContext';

const Settings = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '' });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${backendUrl}/api/admin/admins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setAdmins(data.admins);
        else setError(data.message || 'Failed to fetch admins');
      } catch (err) {
        setError('Failed to fetch admins');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${backendUrl}/api/admin/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Admin added successfully!');
        setShowAdd(false);
        setAddForm({ name: '', email: '', password: '' });
        // Refresh admin list
        const res2 = await fetch(`${backendUrl}/api/admin/admins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data2 = await res2.json();
        if (data2.success) setAdmins(data2.admins);
      } else {
        setError(data.message || 'Failed to add admin');
      }
    } catch (err) {
      setError('Failed to add admin');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${backendUrl}/api/admin/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Admin deleted successfully!');
        setAdmins(admins.filter((a) => a._id !== id));
      } else {
        setError(data.message || 'Failed to delete admin');
      }
    } catch (err) {
      setError('Failed to delete admin');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Settings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Admin Accounts</h2>
          <button
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => setShowAdd((v) => !v)}
          >
            {showAdd ? 'Cancel' : 'Add Admin'}
          </button>
          {showAdd && (
            <form className="mb-6 bg-gray-50 p-4 rounded shadow flex flex-col gap-3" onSubmit={handleAddAdmin}>
              <input
                type="text"
                placeholder="Name"
                className="border rounded px-3 py-2"
                value={addForm.name}
                onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="border rounded px-3 py-2"
                value={addForm.email}
                onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="border rounded px-3 py-2"
                value={addForm.password}
                onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                required
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                disabled={addLoading}
              >
                {addLoading ? 'Adding...' : 'Add Admin'}
              </button>
            </form>
          )}
          <ul className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {admins.map((admin) => (
              <li key={admin._id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="font-medium text-gray-800">{admin.name} ({admin.email})</span>
                <span className="text-xs text-gray-500">{admin._id}</span>
                {admins.length > 1 && (
                  <button
                    className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    onClick={() => handleDeleteAdmin(admin._id)}
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {success && <div className="text-green-600 mt-4">{success}</div>}
    </div>
  );
};

export default Settings;
