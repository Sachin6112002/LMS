import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, backendUrl } from '../context/AppContext';
import { assets } from '../assets/assets';
import { FaUserGraduate, FaChalkboardTeacher, FaCogs } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${backendUrl}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setStats(data.dashboardData);
      } catch (err) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>Failed to load dashboard data.</div>;

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-100 min-h-screen">
      <div className="flex flex-col items-center justify-center w-full min-h-[30vh] bg-gradient-to-b from-cyan-100/80 to-white px-7 md:px-0 text-center rounded-3xl shadow-2xl mb-10 border border-cyan-200">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 max-w-3xl mx-auto mb-6 mt-10 md:mt-20 drop-shadow-lg">
          Welcome to the <span className="text-cyan-500">LMS Admin Panel</span>
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8 font-medium">
          Manage users, courses, and platform settings from a single dashboard.
          <br />
          Use the quick links below to navigate between admin features.
        </p>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-4">
          <button
            onClick={() => navigate('/students')}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-10 py-6 rounded-xl shadow-xl hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition flex flex-col items-center gap-2 text-lg border-2 border-blue-200"
          >
            <FaUserGraduate className="w-10 h-10 mb-2" />
            Student Manager
          </button>
          <button
            onClick={() => navigate('/educators')}
            className="bg-gradient-to-r from-purple-500 to-indigo-700 text-white font-bold px-10 py-6 rounded-xl shadow-xl hover:scale-105 hover:from-purple-600 hover:to-indigo-800 transition flex flex-col items-center gap-2 text-lg border-2 border-purple-200"
          >
            <FaChalkboardTeacher className="w-10 h-10 mb-2" />
            Educator Manager
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold px-10 py-6 rounded-xl shadow-xl hover:scale-105 hover:from-gray-600 hover:to-gray-800 transition flex flex-col items-center gap-2 text-lg border-2 border-gray-200"
          >
            <FaCogs className="w-10 h-10 mb-2" />
            Settings
          </button>
        </div>
      </div>
      {/* Dashboard stats and latest enrollments */}
      <h1 className="text-2xl font-bold mb-6 text-blue-800 mt-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue-400 flex flex-col items-center">
          <div className="text-4xl font-extrabold text-blue-700 mb-2">{stats.totalUsers}</div>
          <div className="text-gray-600 font-semibold">Total Users</div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-purple-400 flex flex-col items-center">
          <div className="text-4xl font-extrabold text-purple-700 mb-2">{stats.totalCourses}</div>
          <div className="text-gray-600 font-semibold">Total Courses</div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-green-400 flex flex-col items-center">
          <div className="text-4xl font-extrabold text-green-700 mb-2">₹{stats.totalEarnings}</div>
          <div className="text-gray-600 font-semibold">Total Earnings</div>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-blue-700">Latest Enrollments</h2>
      <div className="overflow-x-auto rounded-xl shadow-lg">
        <table className="min-w-full bg-white rounded-xl">
          <thead className="bg-cyan-100">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Student Name</th>
              <th className="px-4 py-3 text-left">Course Title</th>
              <th className="px-4 py-3 text-left">Enrollment Date</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.enrolledStudentsData.map((item, idx) => (
              <tr key={idx} className="hover:bg-cyan-50 transition">
                <td className="px-4 py-3 font-bold text-blue-700">{idx + 1}</td>
                <td className="px-4 py-3">{item.student.name}</td>
                <td className="px-4 py-3">{item.courseTitle}</td>
                <td className="px-4 py-3">{item.enrollmentDate}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
