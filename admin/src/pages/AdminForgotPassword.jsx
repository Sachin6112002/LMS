import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await axios.post('/api/admin/send-otp', { email });
      setMessage(data.message || 'OTP sent! Check your email.');
      // Redirect to verify-otp after short delay, passing email
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 1200);
    } catch (err) {
      setMessage('Failed to send OTP.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Admin Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="border p-2 w-full mb-4"
          placeholder="Enter your admin email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
      {message && <div className="mt-4 text-center text-sm text-gray-700">{message}</div>}
    </div>
  );
};

export default AdminForgotPassword;
