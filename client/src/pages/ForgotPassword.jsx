import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const ForgotPassword = () => {
  const { backendUrl } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${backendUrl}/api/user/send-otp`, { email });
      if (res.data.success) {
        setMessage('OTP sent! Check your email.');
        // Optionally, redirect to verify-otp page
        setTimeout(() => {
          window.location.href = '/verify-otp';
        }, 1500);
      } else {
        setMessage(res.data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setMessage('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        {message && <div className="mb-4 text-center text-green-600">{message}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
