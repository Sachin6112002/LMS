import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const AdminForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');
    try {
      const res = await axios.post(`${backendUrl}/api/admin/send-otp`, { email });
      if (res.data.success) {
        setMessage('OTP sent! Check your email. Redirecting to verification page...');
        setMessageType('success');
        setTimeout(() => {
          navigate('/admin-verify-otp', { 
            state: { email: email },
            replace: true 
          });
        }, 2000);
      } else {
        setMessage(res.data.message || 'Failed to send OTP.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while sending OTP.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Admin Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
        {message && (
          <p className={`mt-4 p-2 rounded ${
            messageType === 'success' 
              ? 'text-green-700 bg-green-100' 
              : 'text-red-700 bg-red-100'
          }`}>
            {message}
          </p>
        )}
        <div className="mt-4">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
