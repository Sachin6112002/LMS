import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialState = {
  name: '',
  course: '',
  institution: '',
  profilePhoto: '',
  badge: '',
  feedback: {
    experience: '',
    teaching: '',
    outcome: '',
    goal: ''
  },
  rating: {
    overall: 0,
    content: 0,
    instructor: 0,
    ux: 0
  },
  date: '',
  permission: false
};

// Use deployed backend URL for production, fallback to localhost for development
const backendUrl = process.env.REACT_APP_BACKEND_URL 

const TestimonialForm = () => {
  const [form, setForm] = useState(initialState);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('feedback.')) {
      setForm({ ...form, feedback: { ...form.feedback, [name.split('.')[1]]: value } });
    } else if (name.startsWith('rating.')) {
      setForm({ ...form, rating: { ...form.rating, [name.split('.')[1]]: Number(value) } });
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handlePhoto = (e) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, profilePhoto: e.target.files[0] });
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/testimonials`);
      setTestimonials(res.data.testimonials || []);
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload;
      if (form.profilePhoto && form.profilePhoto instanceof File) {
        payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (key === 'feedback' || key === 'rating') {
            payload.append(key, JSON.stringify(value));
          } else if (key === 'profilePhoto') {
            payload.append('profilePhoto', value);
          } else {
            payload.append(key, value);
          }
        });
      } else {
        payload = { ...form };
      }
      const config = form.profilePhoto && form.profilePhoto instanceof File ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      await axios.post(`${backendUrl}/api/testimonials`, payload, config);
      toast.success('Feedback submitted!');
      setForm(initialState);
      fetchTestimonials();
    } catch (err) {
      toast.error('Submission failed');
    }
    setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white border border-green-200 rounded p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-green-900">Share Your Experience</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name" className="border border-green-200 px-3 py-2 rounded mb-2 w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" required />
      <input name="course" value={form.course} onChange={handleChange} placeholder="Course Enrolled" className="border border-green-200 px-3 py-2 rounded mb-2 w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" required />
      <input name="institution" value={form.institution} onChange={handleChange} placeholder="Institution or Batch/Year" className="border border-green-200 px-3 py-2 rounded mb-2 w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" />
      <input type="file" accept="image/*" onChange={handlePhoto} className="border border-green-200 px-3 py-2 rounded mb-2 w-full bg-green-50 text-green-900" />
      <input name="badge" value={form.badge} onChange={handleChange} placeholder="Badge (optional)" className="border border-green-200 px-3 py-2 rounded mb-2 w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" />
      <textarea name="feedback.experience" value={form.feedback.experience} onChange={handleChange} placeholder="Your experience with the course" className="border border-green-200 px-3 py-2 rounded mb-2 w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" required />
      <textarea name="feedback.teaching" value={form.feedback.teaching} onChange={handleChange} placeholder="Feedback on teaching quality" className="border border-green-200 px-3 py-2 rounded mb-2 w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" />
      <textarea name="feedback.outcome" value={form.feedback.outcome} onChange={handleChange} placeholder="Learning outcomes" className="border border-green-200 px-3 py-2 rounded mb-2 w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" />
      <textarea name="feedback.goal" value={form.feedback.goal} onChange={handleChange} placeholder="How the course helped you achieve your goals" className="border border-green-200 px-3 py-2 rounded mb-2 w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" />
      <div className="flex gap-2 mb-1">
        <div className="w-1/2">
          <label htmlFor="rating.overall" className="block text-green-700 text-sm mb-1">Overall Rating (0-5)</label>
          <input name="rating.overall" id="rating.overall" type="number" min="0" max="5" value={form.rating.overall} onChange={handleChange} placeholder="Overall Rating" className="border border-green-200 px-3 py-2 rounded w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" required />
        </div>
        <div className="w-1/2">
          <label htmlFor="rating.content" className="block text-green-700 text-sm mb-1">Content Quality (0-5)</label>
          <input name="rating.content" id="rating.content" type="number" min="0" max="5" value={form.rating.content} onChange={handleChange} placeholder="Content" className="border border-green-200 px-3 py-2 rounded w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" />
        </div>
      </div>
      <div className="flex gap-2 mb-1">
        <div className="w-1/2">
          <label htmlFor="rating.instructor" className="block text-green-700 text-sm mb-1">Instructor Rating (0-5)</label>
          <input name="rating.instructor" id="rating.instructor" type="number" min="0" max="5" value={form.rating.instructor} onChange={handleChange} placeholder="Instructor" className="border border-green-200 px-3 py-2 rounded w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" />
        </div>
        <div className="w-1/2">
          <label htmlFor="rating.ux" className="block text-green-700 text-sm mb-1">User Experience (UI/UX) (0-5)</label>
          <input name="rating.ux" id="rating.ux" type="number" min="0" max="5" value={form.rating.ux} onChange={handleChange} placeholder="User Experience (UI/UX)" className="border border-green-200 px-3 py-2 rounded w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" />
        </div>
      </div>
      <input name="date" type="date" value={form.date} onChange={handleChange} className="border border-green-200 px-3 py-2 rounded mb-2 w-full text-green-900 placeholder-green-600 focus:ring-2 focus:ring-green-400 outline-none" required />
      <label className="flex items-center gap-2 text-green-900">
        <input name="permission" type="checkbox" checked={form.permission} onChange={handleChange} className="text-green-600" />
        I give permission to publish my testimonial
      </label>
      <button type="submit" className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
    </form>
      <div className="max-w-xl mx-auto mt-8">
        <h3 className="text-xl font-bold mb-4 text-green-900">Recent Testimonials</h3>
        {testimonials.length === 0 ? (
          <p className="text-green-700">No testimonials yet.</p>
        ) : (
          testimonials.map((t) => (
            <div key={t._id || t.name + t.date} className="border border-green-100 rounded p-4 mb-3 bg-green-50">
              <div className="flex items-center gap-3 mb-2">
                {t.profilePhoto && typeof t.profilePhoto === 'string' && (
                  <img src={t.profilePhoto} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-green-200" />
                )}
                <div>
                  <span className="font-semibold text-green-900">{t.name}</span>
                  <span className="ml-2 text-green-700 text-sm">{t.course}</span>
                  {t.badge && <span className="ml-2 bg-green-200 text-green-800 px-2 py-1 rounded text-xs">{t.badge}</span>}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Experience:</span> {t.feedback?.experience}<br />
                <span className="font-semibold">Teaching:</span> {t.feedback?.teaching}<br />
                <span className="font-semibold">Outcome:</span> {t.feedback?.outcome}<br />
                <span className="font-semibold">Goal:</span> {t.feedback?.goal}
              </div>
              <div className="flex gap-4 mb-2">
                <span className="text-green-800 text-sm">Overall: {t.rating?.overall}</span>
                <span className="text-green-800 text-sm">Content: {t.rating?.content}</span>
                <span className="text-green-800 text-sm">Instructor: {t.rating?.instructor}</span>
                <span className="text-green-800 text-sm">UI/UX: {t.rating?.ux}</span>
              </div>
              <div className="text-green-700 text-xs">{t.date}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default TestimonialForm;


