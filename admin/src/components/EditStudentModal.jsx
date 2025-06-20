import React, { useState } from 'react';

const EditStudentModal = ({ student, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: student.name || '',
    email: student.email || '',
    active: student.active || false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative" onSubmit={handleSubmit}>
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={onClose} type="button">&times;</button>
        <h2 className="text-xl font-bold mb-4">Edit Student Info</h2>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full" required type="email" />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input type="checkbox" name="active" checked={form.active} onChange={handleChange} id="active" />
          <label htmlFor="active">Active</label>
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
};

export default EditStudentModal;
