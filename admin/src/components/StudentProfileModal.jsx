import React from 'react';

const StudentProfileModal = ({ student, onClose, onEdit, onDeactivate, onResetPassword, onDelete }) => {
  if (!student) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-2">Student Profile</h2>
        <div className="mb-4">
          <div><span className="font-semibold">Name:</span> {student.name}</div>
          <div><span className="font-semibold">Email:</span> {student.email}</div>
          <div><span className="font-semibold">Status:</span> {student.active ? 'Active' : 'Inactive'}</div>
          <div><span className="font-semibold">Enrolled Courses:</span> {student.enrolledCourses?.length || 0}</div>
        </div>
        <div className="flex flex-col gap-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onEdit}>Edit Info</button>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded" onClick={onDeactivate}>{student.active ? 'Deactivate' : 'Activate'} Account</button>
          <button className="bg-purple-500 text-white px-4 py-2 rounded" onClick={onResetPassword}>Reset Password</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={onDelete}>Delete Student</button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
