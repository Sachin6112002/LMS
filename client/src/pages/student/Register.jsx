import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import fileUploadIcon from '../../assets/file_upload_icon.svg';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { register } = useContext(AppContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!image) {
      setError('Profile image is required.');
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('image', image);
      await register(formData, true); // true = isFormData
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md border border-green-200" encType="multipart/form-data">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-900">Student Registration</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-green-900">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border border-green-200 px-3 py-2 rounded text-green-900 placeholder-green-600" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-green-900">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-green-200 px-3 py-2 rounded text-green-900 placeholder-green-600" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-green-900">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full border border-green-200 px-3 py-2 rounded text-green-900 placeholder-green-600" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-green-900">Profile Image</label>
          <label className="flex items-center gap-2 cursor-pointer bg-green-50 border border-green-200 px-3 py-2 rounded hover:bg-green-100 transition">
            <img src={fileUploadIcon} alt="Upload" className="w-5 h-5" />
            <span className="text-green-700 font-medium">Upload Image</span>
            <input type="file" name="image" accept="image/*" onChange={handleImageChange} required className="hidden" />
            {image && <span className="ml-2 text-xs text-green-700">{image.name}</span>}
          </label>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600 transition">
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <button type="button" className="text-green-700 underline" onClick={() => navigate('/login')}>Login</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
