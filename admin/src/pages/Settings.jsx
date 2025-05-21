import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Settings = () => {
  const { backendUrl, aToken } = useContext(AppContext);
  const [siteName, setSiteName] = useState('Learning Management System');
  const [adminEmail, setAdminEmail] = useState('admin@example.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [theme, setTheme] = useState('light');
  const [message, setMessage] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/admin/purchases`, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.purchases)) setPurchases(data.purchases);
      } catch (err) {
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [backendUrl, aToken]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aToken}`,
        },
        body: JSON.stringify({ settings: { siteName, adminEmail, maintenanceMode, theme } }),
      });
      const data = await res.json();
      if (data.success) setMessage('Settings updated successfully!');
      else setMessage('Failed to update settings.');
    } catch {
      setMessage('Failed to update settings.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 p-8">
      <div className="flex flex-col items-center mb-6">
        <span className="mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <h2 className="text-2xl font-bold text-gray-800">Purchases & Platform Settings</h2>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow p-8 w-full max-w-2xl mb-8">
        <h3 className="text-lg font-semibold mb-4">Recent Purchases</h3>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Course</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              purchases.map((purchase, idx) => (
                <tr key={purchase._id}>
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{purchase.userId?.name || 'Unknown'}</td>
                  <td className="px-4 py-2">{purchase.courseId?.courseTitle || 'Unknown'}</td>
                  <td className="px-4 py-2">{purchase.amount}</td>
                  <td className="px-4 py-2">{purchase.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                  No purchases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-2xl">
        <div className="mb-4">
          <label className="block mb-1 font-medium">Site Name</label>
          <input value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Admin Email</label>
          <input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mb-4 flex items-center gap-4">
          <label className="font-medium">Maintenance Mode</label>
          <button onClick={() => setMaintenanceMode(m => !m)} className={`px-4 py-2 rounded-lg ${maintenanceMode ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{maintenanceMode ? 'Disable' : 'Enable'}</button>
        </div>
        <div className="mb-4 flex items-center gap-4">
          <label className="font-medium">Theme</label>
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className={`px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-white'}`}>{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</button>
        </div>
        <button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded">Save Settings</button>
        {message && <div className="mt-4 text-green-600">{message}</div>}
      </div>
    </div>
  );
};

export default Settings;
