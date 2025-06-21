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
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md border border-green-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-900">Student Login</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-green-900">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-green-200 px-3 py-2 rounded text-green-900 placeholder-green-600" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-green-900">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full border border-green-200 px-3 py-2 rounded text-green-900 placeholder-green-600" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600 transition">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="my-4 text-center">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-green-400 py-2 rounded hover:bg-green-50 transition"
            onClick={() => window.location.href = `${process.env.REACT_APP_BACKEND_URL || ''}/api/auth/google`}
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
        <div className="mt-4 text-center">
          <span>Don't have an account? </span>
          <button type="button" className="text-green-700 underline" onClick={() => navigate('/register')}>Register</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
