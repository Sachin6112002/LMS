import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl, isAdminAuthenticated } from '../context/AppContext';
import logo from '../assets/logo.png'; // Adjust the path as necessary

const Login = () => {
  const navigate = useNavigate();
  const [adminExists, setAdminExists] = useState(undefined); // undefined = loading
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper to check admin existence
  const checkAdminExists = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/check-admin-exists`);
      setAdminExists(data.exists);
    } catch {
      setAdminExists(true);
    }
  };

  // On mount: if already logged in, go to dashboard. Otherwise, check if admin exists.
  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/dashboard', { replace: true });
      return;
    }
    checkAdminExists();
  }, [navigate]);

  useEffect(() => {
    setError('');
    setSuccess('');
  }, [adminExists]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Registration logic: only allowed if NO admin exists
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
        setSuccess('Registration successful! Redirecting to dashboard...');
        // Immediately log in the new admin
        const loginRes = await axios.post(`${backendUrl}/api/admin/login`, {
          email: form.email,
          password: form.password,
        });
        if (loginRes.data.success && loginRes.data.token) {
          localStorage.setItem('adminToken', loginRes.data.token);
          setTimeout(() => {
            setForm({ name: '', email: '', password: '' });
            setSuccess('');
            navigate('/dashboard', { replace: true });
            checkAdminExists(); // force re-check after registration/login
          }, 800);
        } else {
          setError('Registration succeeded but automatic login failed. Please log in manually.');
          checkAdminExists();
        }
      } else {
        setError(data.message || 'Registration failed.');
        checkAdminExists();
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setAdminExists(true); // Show login form immediately
        setError('Admin already exists. Please log in.');
        return;
      }
      setError(err.response?.data?.message || err.message);
      checkAdminExists();
    } finally {
      setLoading(false);
    }
  };

  // Login logic: only allowed if admin exists
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
        <img src={logo} alt="eSiksha Logo" className="h-14 w-14 mb-4" />
        {adminExists === undefined ? (
          <div>Loading...</div>
        ) : !adminExists ? (
          // Registration form (only if NO admin exists)
          <>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Admin Registration</h2>
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
          // Login form (only if admin exists)
          <>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Admin Login</h2>
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