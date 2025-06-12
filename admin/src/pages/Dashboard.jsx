import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, backendUrl } from '../context/AppContext';
import { assets } from '../assets/assets';
import { FaUserGraduate, FaChalkboardTeacher, FaCogs } from 'react-icons/fa';
import personTickIcon from '../assets/person_tick_icon.svg';
import myCourseIcon from '../assets/my_course_icon.svg';
import addIcon from '../assets/add_icon.svg';
import { FaUsers } from 'react-icons/fa';

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
    <div className="p-4 md:p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Admin Dashboard</h1>
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => navigate('/manage-users')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow flex items-center gap-2"
        >
          <img src={personTickIcon} alt="Users" className="w-5 h-5" />
          Manage Users
        </button>
        <button
          onClick={() => navigate('/manage-courses')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow flex items-center gap-2"
        >
          <img src={myCourseIcon} alt="Courses" className="w-5 h-5" />
          Manage Courses
        </button>
        <button
          onClick={() => navigate('/manage-purchases')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow flex items-center gap-2"
        >
          <img src={addIcon} alt="Purchases" className="w-5 h-5" />
          Manage Purchases
        </button>
        <button
          onClick={() => navigate('/students')}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold shadow flex items-center gap-2"
        >
          <FaUsers className="w-5 h-5" />
          Student Manager
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow flex items-center gap-2"
        >
          <FaUsers className="w-5 h-5" />
          Settings
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-100 flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-700 mb-1">{stats.totalUsers}</div>
          <div className="text-gray-600">Total Users</div>
        </div>
        <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-100 flex flex-col items-center">
          <div className="text-3xl font-bold text-purple-700 mb-1">{stats.totalCourses}</div>
          <div className="text-gray-600">Total Courses</div>
        </div>
        <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-100 flex flex-col items-center">
          <div className="text-3xl font-bold text-green-700 mb-1">₹{stats.totalEarnings}</div>
          <div className="text-gray-600">Total Earnings</div>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-3 text-blue-700">Latest Enrollments</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full bg-white rounded-xl text-sm">
          <thead className="bg-cyan-50">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Student Name</th>
              <th className="px-4 py-2 text-left">Course Title</th>
              <th className="px-4 py-2 text-left">Enrollment Date</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.enrolledStudentsData.map((item, idx) => (
              <tr key={idx} className="hover:bg-cyan-50 transition">
                <td className="px-4 py-2 font-bold text-blue-700">{idx + 1}</td>
                <td className="px-4 py-2">{item.student.name}</td>
                <td className="px-4 py-2">{item.courseTitle}</td>
                <td className="px-4 py-2">{item.enrollmentDate}</td>
                <td className="px-4 py-2">
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
