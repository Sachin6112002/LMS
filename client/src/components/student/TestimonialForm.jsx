import React, { useState } from 'react';

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

const TestimonialForm = ({ onSubmit }) => {
  const [form, setForm] = useState(initialState);

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
      setForm({ ...form, profilePhoto: URL.createObjectURL(e.target.files[0]) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-green-200 rounded p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Share Your Experience</h2>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name" className="border px-3 py-2 rounded" required />
      <input name="course" value={form.course} onChange={handleChange} placeholder="Course Enrolled" className="border px-3 py-2 rounded" required />
      <input name="institution" value={form.institution} onChange={handleChange} placeholder="Institution or Batch/Year" className="border px-3 py-2 rounded" />
      <input type="file" accept="image/*" onChange={handlePhoto} className="border px-3 py-2 rounded" />
      <input name="badge" value={form.badge} onChange={handleChange} placeholder="Badge (optional)" className="border px-3 py-2 rounded" />
      <textarea name="feedback.experience" value={form.feedback.experience} onChange={handleChange} placeholder="Your experience with the course" className="border px-3 py-2 rounded" required />
      <textarea name="feedback.teaching" value={form.feedback.teaching} onChange={handleChange} placeholder="Feedback on teaching quality" className="border px-3 py-2 rounded" />
      <textarea name="feedback.outcome" value={form.feedback.outcome} onChange={handleChange} placeholder="Learning outcomes" className="border px-3 py-2 rounded" />
      <textarea name="feedback.goal" value={form.feedback.goal} onChange={handleChange} placeholder="How the course helped you achieve your goals" className="border px-3 py-2 rounded" />
      <div className="flex gap-2">
        <input name="rating.overall" type="number" min="0" max="5" value={form.rating.overall} onChange={handleChange} placeholder="Overall Rating (0-5)" className="border px-3 py-2 rounded w-1/2" required />
        <input name="rating.content" type="number" min="0" max="5" value={form.rating.content} onChange={handleChange} placeholder="Content" className="border px-3 py-2 rounded w-1/2" />
      </div>
      <div className="flex gap-2">
        <input name="rating.instructor" type="number" min="0" max="5" value={form.rating.instructor} onChange={handleChange} placeholder="Instructor" className="border px-3 py-2 rounded w-1/2" />
        <input name="rating.ux" type="number" min="0" max="5" value={form.rating.ux} onChange={handleChange} placeholder="User Experience (UI/UX)" className="border px-3 py-2 rounded w-1/2" />
      </div>
      <input name="date" type="date" value={form.date} onChange={handleChange} className="border px-3 py-2 rounded" required />
      <label className="flex items-center gap-2">
        <input name="permission" type="checkbox" checked={form.permission} onChange={handleChange} />
        I give permission to publish my testimonial
      </label>
      <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded mt-4">Submit</button>
    </form>
  );
};

export default TestimonialForm;
