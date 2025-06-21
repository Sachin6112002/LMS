import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const AdminVerifyOtp = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await axios.post('/api/admin/verify-otp', { email, otp, newPassword });
      setMessage(data.message || 'Password changed!');
    } catch (err) {
      setMessage('Failed to verify OTP or change password.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Admin Verify OTP</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="border p-2 w-full mb-3"
          placeholder="Admin email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          className="border p-2 w-full mb-3"
          placeholder="Enter OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          required
        />
        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify & Change Password'}
        </button>
      </form>
      {message && <div className="mt-4 text-center text-sm text-gray-700">{message}</div>}
    </div>
  );
};

export default AdminVerifyOtp;
