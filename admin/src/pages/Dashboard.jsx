import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Dashboard = () => {
  const { backendUrl, aToken } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${aToken}` },
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
  }, [backendUrl, aToken]);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>Failed to load dashboard data.</div>;

  return (
    <div className="p-8">
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
