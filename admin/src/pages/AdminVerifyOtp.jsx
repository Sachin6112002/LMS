import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminVerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    // Get email from navigation state if available
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    // Validate form
    if (!email || !otp || !newPassword || !confirmPassword) {
      setMessage('All fields are required');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/admin/verify-otp`, { 
        email, 
        otp, 
        newPassword 
      });
      if (res.data.success) {
        setMessage('Password changed successfully! Redirecting to login...');
        setMessageType('success');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        setMessage(res.data.message || 'Failed to reset password.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while verifying OTP.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP & Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!location.state?.email} // Disable if email came from previous page
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength="6"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              placeholder="Enter new password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
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
        
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/admin-forgot-password')}
            className="text-blue-600 hover:text-blue-800 text-sm mr-4"
          >
            Resend OTP
          </button>
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

export default AdminVerifyOtp;
