import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Profile = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', photo: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('jwtToken');
      const res = await fetch(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
        setForm({ name: data.user.name, email: data.user.email, photo: data.user.photo || '', password: '' });
      } else {
        setError(data.message || 'Failed to fetch profile');
        // Fallback to userData from context if available
        if (userData) {
          setProfile(userData);
          setForm({ name: userData.name, email: userData.email, photo: userData.imageUrl || '', password: '' });
        }
      }
    } catch {
      setError('Failed to fetch profile');
      // Fallback to userData from context if available
      if (userData) {
        setProfile(userData);
        setForm({ name: userData.name, email: userData.email, photo: userData.imageUrl || '', password: '' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files && files[0]) {
      setForm((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('jwtToken');
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      if (form.photo && form.photo instanceof File) {
        formData.append('photo', form.photo);
      }
      if (form.password) {
        formData.append('password', form.password);
      }
      const res = await fetch(`${backendUrl}/api/user/update`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Profile updated successfully!');
        setEdit(false);
        setForm({ ...form, password: '' });
        fetchProfile(); // Refresh profile from server
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (error && !profile && userData) {
    // If fetch failed but userData exists, use it
    setProfile(userData);
  }

  if (loading) return <div className="p-8">Loading...</div>;

  if (error && !profile) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-8 bg-green-50 min-h-screen max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-900">My Profile</h1>
      {success && <div className="text-green-600 mb-4">{success}</div>}
      {!edit ? (
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <img src={profile?.photo || profile?.imageUrl || '/default-avatar.png'} alt="Profile" className="w-24 h-24 rounded-full mb-4 object-cover border" />
          <div className="mb-2"><span className="font-semibold">Name:</span> {profile?.name}</div>
          <div className="mb-2"><span className="font-semibold">Email:</span> {profile?.email}</div>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setEdit(true)}>Edit Profile</button>
          <button className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded" onClick={() => navigate('/forgot-password')}>Forgot Password</button>
        </div>
      ) : (
        <form className="bg-white rounded-lg shadow p-6" onSubmit={handleSave}>
          <div className="mb-4 flex flex-col items-center">
            <img src={form.photo && form.photo instanceof File ? URL.createObjectURL(form.photo) : (form.photo || profile?.imageUrl || '/default-avatar.png')} alt="Profile" className="w-24 h-24 rounded-full mb-2 object-cover border" />
            <input type="file" name="photo" accept="image/*" onChange={handleChange} className="mt-2" />
          </div>
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
