import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl, isAdminAuthenticated } from '../context/AppContext';

const Login = () => {
  const navigate = useNavigate();
  const [adminExists, setAdminExists] = useState(undefined); // undefined = loading
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if admin exists on mount
  useEffect(() => {
    // If already logged in, go to dashboard
    if (isAdminAuthenticated()) {
      navigate('/dashboard', { replace: true });
      return;
    }
    const checkAdminExists = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/check-admin-exists`);
        setAdminExists(data.exists);
      } catch {
        setAdminExists(true);
      }
    };
    checkAdminExists();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (data.success) {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => {
          window.location.reload(); // force re-check from backend
        }, 1200);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // Admin already exists, force reload to show login
        window.location.reload();
        return;
      }
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
          setForm({ name: '', email: '', password: '' });
          setSuccess('');
          navigate('/dashboard', { replace: true });
        }, 800);
      } else {
        setError(data.message || 'Login failed.');
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
        <img src="/vite.svg" alt="LMS Logo" className="h-14 w-14 mb-4" />
        {adminExists === undefined ? (
          <div>Loading...</div>
        ) : !adminExists ? (
          <>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Admin Registration</h2>
            <p className="text-gray-600 mb-6 text-center">Register as the first admin user.</p>
            <form className="w-full flex flex-col gap-4" onSubmit={handleRegister} autoComplete="on">
              <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} className="border rounded px-3 py-2 w-full" required autoFocus />
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Admin Login</h2>
            <p className="text-gray-600 mb-6 text-center">Login to your admin account.</p>
            <form className="w-full flex flex-col gap-4" onSubmit={handleLogin} autoComplete="on">
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full" required autoFocus />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </>
        )}
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-600 mt-4">{success}</p>}
      </div>
    </div>
  );
};

export default Login;