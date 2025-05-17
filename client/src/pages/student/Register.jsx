import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FirstAdminGuard from './FirstAdminGuard';
import { AppContext } from '../../context/AppContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { reloadUserData } = useContext(AppContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await axios.post('/api/user/register', form);
      if (data.success) {
        setSuccess('Registration successful! You are now the admin.');
        await reloadUserData(); // <-- reload userData after registration
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FirstAdminGuard>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Registration</h2>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          {success && <div className="mb-4 text-green-600">{success}</div>}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Profile Image URL</label>
            <input type="text" name="imageUrl" value={form.imageUrl} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
            {loading ? 'Registering...' : 'Register as Admin'}
          </button>
        </form>
      </div>
    </FirstAdminGuard>
  );
};

export default Register;
