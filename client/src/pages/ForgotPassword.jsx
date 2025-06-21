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
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
        <p className="mb-4">Please contact the administrator to reset your password.</p>
      </div>
    </div>
  );
};

export default ForgotPassword;
