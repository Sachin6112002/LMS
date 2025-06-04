import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../context/AppContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/admin/check-admin-exists`);
        if (data.exists) {
          navigate('/login', { replace: true });
        }
      } catch {}
    };
    checkAdminExists();
    if (isAdminAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await axios.post('/api/admin/register', form);
      if (data.success) {
        setSuccess('Registration successful! You are now the admin.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FD]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col items-center">
        <div className="w-full flex justify-end mb-2">
          <a href="/login" className="text-blue-600 underline text-sm">Go to Login</a>
        </div>
        <img src="/vite.svg" alt="LMS Logo" className="h-14 w-14 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Admin Registration</h2>
        <p className="text-gray-600 mb-6 text-center">Register as the first admin user.</p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-center">
          Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-600 mt-4">{success}</p>}
      </div>
    </div>
  );
};

export default Register;
