import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, backendUrl } from '../context/AppContext';
import { assets } from '../assets/assets';

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
    <div className="p-8">
      <div className="flex flex-col items-center justify-center w-full min-h-[30vh] bg-gradient-to-b from-cyan-100/70 px-7 md:px-0 text-center rounded-xl mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 max-w-3xl mx-auto mb-6 mt-10 md:mt-20">
          Welcome to the LMS Admin Panel
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Manage users, courses, and platform settings from a single dashboard.
          <br />
          Use the quick links below to navigate between admin features.
        </p>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-4">
          <button
            onClick={() => navigate('/students')}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-10 py-6 rounded-xl shadow-xl hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition flex flex-col items-center gap-2 text-lg border-2 border-blue-200"
          >
            <img src={assets.list_icon} alt="Students" className="w-10 h-10 mb-2" />
            Student Manager
          </button>
          <button
            onClick={() => navigate('/educators')}
            className="bg-gradient-to-r from-purple-500 to-indigo-700 text-white font-bold px-10 py-6 rounded-xl shadow-xl hover:scale-105 hover:from-purple-600 hover:to-indigo-800 transition flex flex-col items-center gap-2 text-lg border-2 border-purple-200"
          >
            <img src={assets.add_icon} alt="Educators" className="w-10 h-10 mb-2" />
            Educator Manager
          </button>
          <button
            onClick={() => navigate('/add-feature')}
            className="bg-gradient-to-r from-green-500 to-green-700 text-white font-bold px-10 py-6 rounded-xl shadow-xl hover:scale-105 hover:from-green-600 hover:to-green-800 transition flex flex-col items-center gap-2 text-lg border-2 border-green-200"
          >
            <img src={assets.add_icon} alt="Add" className="w-10 h-10 mb-2" />
            Add Feature
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold px-10 py-6 rounded-xl shadow-xl hover:scale-105 hover:from-gray-600 hover:to-gray-800 transition flex flex-col items-center gap-2 text-lg border-2 border-gray-200"
          >
            <img src={assets.tick_icon} alt="Settings" className="w-10 h-10 mb-2" />
            Settings
          </button>
        </div>
      </div>
      {/* Dashboard stats and latest enrollments */}
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <div className="text-3xl font-bold">{stats.totalUsers}</div>
          <div className="text-gray-600">Total Users</div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <div className="text-3xl font-bold">{stats.totalCourses}</div>
          <div className="text-gray-600">Total Courses</div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <div className="text-3xl font-bold">{stats.totalEarnings}</div>
          <div className="text-gray-600">Total Earnings</div>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Latest Enrollments</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Student Name</th>
              <th className="px-4 py-2">Course Title</th>
              <th className="px-4 py-2">Enrollment Date</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.enrolledStudentsData.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{item.student.name}</td>
                <td className="px-4 py-2">{item.courseTitle}</td>
                <td className="px-4 py-2">{item.enrollmentDate}</td>
                <td className="px-4 py-2">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
