import React, { useEffect, useState, useContext } from 'react';
import { AppContext, isAdminAuthenticated } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ManagePurchases = () => {
  const { backendUrl, aToken } = useContext(AppContext);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/admin/purchases`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.purchases)) {
          setPurchases(data.purchases);
        } else {
          setPurchases([]);
        }
      } catch (err) {
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [backendUrl, aToken]);

  const filteredPurchases = purchases.filter(p => {
    const user = p.userId?.name || p.userId?.email || '';
    const course = (typeof p.courseName === 'string' && p.courseName.trim().length > 0)
      ? p.courseName
      : (p.courseId?.title || p.courseId?.courseTitle || '');
    const matchesSearch =
      user.toLowerCase().includes(search.toLowerCase()) ||
      course.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-2 sm:p-4 md:p-8 bg-green-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2 w-full sm:w-auto"
        >
          Back to Dashboard
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-green-900">Manage Purchases</h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by user or course..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border rounded w-full max-w-md"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded w-full max-w-xs"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full bg-white rounded-xl text-xs sm:text-sm">
            <thead className="bg-cyan-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 text-left">User</th>
                <th className="px-2 sm:px-4 py-2 text-left">Email</th>
                <th className="px-2 sm:px-4 py-2 text-left">Course</th>
                <th className="px-2 sm:px-4 py-2 text-left">Amount</th>
                <th className="px-2 sm:px-4 py-2 text-left">Status</th>
                <th className="px-2 sm:px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">No purchases found.</td>
                </tr>
              ) : (
                filteredPurchases.map((p, idx) => (
                  <tr key={p._id || idx} className="border-t hover:bg-cyan-50 transition">
                    <td className="px-2 sm:px-4 py-2">{p.userId?.name || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-2">{p.userId?.email || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-2">{
                      (typeof p.courseName === 'string' && p.courseName.trim().length > 0)
                        ? p.courseName
                        : (p.courseId?.title || p.courseId?.courseTitle || 'Unknown Course')
                    }</td>
                    <td className="px-2 sm:px-4 py-2">${p.amount?.toFixed(2) || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-2 capitalize">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span>
                    </td>
                    <td className="px-2 sm:px-4 py-2">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagePurchases;
