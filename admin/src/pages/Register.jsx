import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', imageUrl: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/add', form);
      if (res.data.success) {
        navigate('/login');
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError('Admin with this email already exists.');
      } else {
        setError(err.response?.data?.message || 'Server error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-md border border-green-200" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-green-900">Admin Registration</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="border px-3 py-2 rounded w-full" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="border px-3 py-2 rounded w-full" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required className="border px-3 py-2 rounded w-full" />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Image URL (optional)</label>
          <input type="text" name="imageUrl" value={form.imageUrl} onChange={handleChange} className="border px-3 py-2 rounded w-full" placeholder="https://..." />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
