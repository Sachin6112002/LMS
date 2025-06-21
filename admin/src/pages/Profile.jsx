import React, { useEffect, useState } from 'react';
import { backendUrl } from '../context/AppContext';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${backendUrl}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setForm({ name: data.profile.name, email: data.profile.email, password: '' });
      } else {
        setError(data.message || 'Failed to fetch profile');
      }
    } catch {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${backendUrl}/api/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Profile updated!');
        setEdit(false);
        fetchProfile();
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-8 bg-green-50 min-h-screen max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-900">My Profile</h1>
      {success && <div className="text-green-600 mb-4">{success}</div>}
      {!edit ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-2"><span className="font-semibold">Name:</span> {profile.name}</div>
          <div className="mb-2"><span className="font-semibold">Email:</span> {profile.email}</div>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setEdit(true)}>Edit Profile</button>
          <button
            className="mt-4 ml-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={() => window.location.href = '/forgot-password'}
          >
            Forgot/Reset Password via OTP
          </button>
        </div>
      ) : (
        <form className="bg-white rounded-lg shadow p-6" onSubmit={handleSave}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full" required type="email" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Password (leave blank to keep unchanged)</label>
            <input name="password" value={form.password} onChange={handleChange} className="border rounded px-3 py-2 w-full" type="password" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEdit(false)}>Cancel</button>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default Profile;
