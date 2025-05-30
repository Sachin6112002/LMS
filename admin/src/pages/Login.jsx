import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../context/AppContext';

const Login = () => {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`${backendUrl}/api/admin/check-admin-exists`)
      .then(res => res.json())
      .then(data => {
        setShowRegister(!data.exists);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!form.name || !form.email || !form.password || !form.imageUrl) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        imageUrl: form.imageUrl,
      });
      if (data.success) {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => {
          setShowRegister(false);
          setForm({ email: '', password: '', name: '', imageUrl: '' });
        }, 1500);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!form.email || !form.password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
        email: form.email,
        password: form.password,
      });
      if (data.success && data.token) {
        setSuccess('Login successful! Redirecting...');
        localStorage.setItem('adminToken', data.token);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FD]">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col items-center">
          <img src="/vite.svg" alt="LMS Logo" className="h-14 w-14 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Admin Registration</h2>
          <p className="text-gray-600 mb-6 text-center">Register as the first admin user.</p>
          <form className="w-full flex flex-col gap-4" onSubmit={handleRegister}>
            <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
            <input name="imageUrl" type="text" placeholder="Profile Image URL" value={form.imageUrl} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all" disabled={loading}>
              {loading ? 'Registering...' : 'Register as Admin'}
            </button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {success && <p className="text-green-600 mt-4">{success}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FD]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col items-center">
        <img src="/vite.svg" alt="LMS Logo" className="h-14 w-14 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Admin Login</h2>
        <p className="text-gray-600 mb-6 text-center">Sign in as an admin to access the dashboard.</p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in as Admin'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-600 mt-4">{success}</p>}
      </div>
    </div>
  );
};

export default Login;