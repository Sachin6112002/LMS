import React, { useEffect, useState, useContext } from 'react';
import { AppContext, isAdminAuthenticated } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const ManagePurchases = () => {
  const { backendUrl, aToken } = useContext(AppContext);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
    const course = p.courseId?.courseTitle || '';
    return (
      user.toLowerCase().includes(search.toLowerCase()) ||
      course.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Purchases</h2>
      <input
        type="text"
        placeholder="Search by user or course..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full max-w-md"
      />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border">User</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Course</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">No purchases found.</td>
                </tr>
              ) : (
                filteredPurchases.map((p, idx) => (
                  <tr key={p._id || idx} className="border-t">
                    <td className="px-4 py-2 border">{p.userId?.name || 'N/A'}</td>
                    <td className="px-4 py-2 border">{p.userId?.email || 'N/A'}</td>
                    <td className="px-4 py-2 border">{p.courseId?.courseTitle || 'N/A'}</td>
                    <td className="px-4 py-2 border">${p.amount?.toFixed(2) || 'N/A'}</td>
                    <td className="px-4 py-2 border capitalize">{p.status}</td>
                    <td className="px-4 py-2 border">{new Date(p.createdAt).toLocaleString()}</td>
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
