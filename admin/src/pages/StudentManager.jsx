import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../context/AppContext';
import StudentProfileModal from '../components/StudentProfileModal';
import EditStudentModal from '../components/EditStudentModal';

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get(`${backendUrl}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setStudents(data.students);
      else setError(data.message || 'Failed to fetch students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // --- Student Actions ---
  const handleEdit = (student) => setEditStudent(student);
  const handleEditSave = async (form) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.patch(`${backendUrl}/api/admin/students/${editStudent._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditStudent(null);
      fetchStudents();
    } catch (err) {
      alert('Failed to update student');
    }
  };
  const handleDeactivate = async (student) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.patch(`${backendUrl}/api/admin/students/${student._id}/status`, { active: !student.active }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStudents();
    } catch {
      alert('Failed to update status');
    }
  };
  const handleResetPassword = async (student) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.post(`${backendUrl}/api/admin/students/${student._id}/reset-password`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Password reset link sent!');
    } catch {
      alert('Failed to reset password');
    }
  };
  const handleDelete = async (student) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${backendUrl}/api/admin/students/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedStudent(null);
      fetchStudents();
    } catch {
      alert('Failed to delete student');
    }
  };

  // --- Search, Filter, Export ---
  const filteredStudents = students.filter(s =>
    (s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCourse || s.enrolledCourses?.some(c => c.title?.toLowerCase().includes(filterCourse.toLowerCase())))
  );

  const handleExport = () => {
    setExporting(true);
    const csvRows = [
      ['Name', 'Email', 'Status', 'Enrolled Courses'],
      ...filteredStudents.map(s => [
        s.name,
        s.email,
        s.active ? 'Active' : 'Inactive',
        (s.enrolledCourses || []).map(c => c.title).join('; ')
      ])
    ];
    const csvContent = csvRows.map(r => r.map(x => '"' + (x || '') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    setExporting(false);
  };

  // --- UI ---
  return (
    <div className="p-2 sm:p-4 md:p-8 bg-green-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-green-900">Student Manager</h1>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
        <input
          className="border px-3 py-2 rounded w-full sm:w-64"
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <input
          className="border px-3 py-2 rounded w-full sm:w-64"
          placeholder="Filter by course title"
          value={filterCourse}
          onChange={e => setFilterCourse(e.target.value)}
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Enrolled Courses</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-green-50 cursor-pointer">
                  <td className="p-2 border" onClick={() => setSelectedStudent(student)}>{student.name}</td>
                  <td className="p-2 border" onClick={() => setSelectedStudent(student)}>{student.email}</td>
                  <td className="p-2 border" onClick={() => setSelectedStudent(student)}>{student.enrolledCourses?.length || 0}</td>
                  <td className="p-2 border" onClick={() => setSelectedStudent(student)}>{student.active ? 'Active' : 'Inactive'}</td>
                  <td className="p-2 border flex flex-col gap-1">
                    <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs" onClick={e => { e.stopPropagation(); setSelectedStudent(student); }}>View</button>
                    <button className="bg-green-500 text-white px-2 py-1 rounded text-xs" onClick={e => { e.stopPropagation(); handleEdit(student); }}>Edit</button>
                    <button className="bg-yellow-500 text-white px-2 py-1 rounded text-xs" onClick={e => { e.stopPropagation(); handleDeactivate(student); }}>{student.active ? 'Deactivate' : 'Activate'}</button>
                    <button className="bg-purple-500 text-white px-2 py-1 rounded text-xs" onClick={e => { e.stopPropagation(); handleResetPassword(student); }}>Reset Password</button>
                    <button className="bg-red-500 text-white px-2 py-1 rounded text-xs" onClick={e => { e.stopPropagation(); handleDelete(student); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onEdit={() => { setEditStudent(selectedStudent); setSelectedStudent(null); }}
          onDeactivate={() => { handleDeactivate(selectedStudent); setSelectedStudent(null); }}
          onResetPassword={() => { handleResetPassword(selectedStudent); setSelectedStudent(null); }}
          onDelete={() => { handleDelete(selectedStudent); setSelectedStudent(null); }}
        />
      )}
      {editStudent && (
        <EditStudentModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default StudentManager;
