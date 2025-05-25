import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AppContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
    } catch (err) {
      setError('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Student Login</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="mt-4 text-center">
          <span>Don't have an account? </span>
          <button type="button" className="text-blue-600 underline" onClick={() => navigate('/register')}>Register</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
