import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  // State for form inputs
  const [profile, setProfile] = useState({
    name: '',
    email: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);

  // Fetch admin profile and settings
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // Fetch profile
        const profileRes = await axios.get('/api/admin/profile');
        if (profileRes.data && profileRes.data.profile) {
          setProfile({
            name: profileRes.data.profile.name || '',
            email: profileRes.data.profile.email || '',
          });
        }
        // Fetch preferences
        const prefRes = await axios.get('/api/admin/preferences');
        if (prefRes.data) {
          setNotificationsEnabled(!!prefRes.data.notificationsEnabled);
          setTheme(prefRes.data.theme || 'light');
        }
        // Fetch activity log
        const activityRes = await axios.get('/api/admin/activity');
        if (activityRes.data && Array.isArray(activityRes.data.activity)) {
          setActivity(activityRes.data.activity);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // Handlers for profile change
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handlers for password fields
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Form submit handlers (stub functions)
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    alert(`Profile updated:\nName: ${profile.name}\nEmail: ${profile.email}`);
    // Here you’d call API to update profile
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    // Call API to change password
  };

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      {loading ? (
        <div className="text-center py-10 text-blue-600 font-semibold">Loading settings...</div>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Admin Settings</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Settings */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Profile</h3>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium" htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                >
                  Save Profile
                </button>
              </form>
            </section>
            {/* Password Change */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-blue-700">Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium" htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium" htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium" htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full border px-3 py-2 rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                >
                  Change Password
                </button>
              </form>
            </section>
          </div>
          {/* Preferences & Actions */}
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            {/* Preferences */}
            <section className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow p-6 flex flex-col justify-between">
              <h3 className="text-lg font-bold mb-6 text-blue-700 flex items-center gap-2">
                <span className="inline-block w-2 h-6 bg-blue-500 rounded-full mr-2"></span>Preferences
              </h3>
              <div className="mb-6 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={handleNotificationToggle}
                  className="form-checkbox h-5 w-5 text-blue-600 accent-blue-500 focus:ring-2 focus:ring-blue-400"
                  id="notifications"
                />
                <label htmlFor="notifications" className="ml-2 text-gray-700 font-medium">Enable Notifications</label>
              </div>
              <div className="mb-6">
                <label htmlFor="theme" className="block mb-2 font-medium text-gray-700">Theme</label>
                <select
                  id="theme"
                  value={theme}
                  onChange={handleThemeChange}
                  className="w-full border border-blue-200 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400 bg-blue-50"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="mb-6 flex items-center gap-3">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-purple-600 accent-purple-500" id="emailNotify" />
                <label htmlFor="emailNotify" className="ml-2 text-gray-700 font-medium">Receive Email Notifications</label>
              </div>
              <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold shadow hover:from-blue-700 hover:to-blue-500 transition">Preview Dark Mode</button>
            </section>
            {/* Account & Security */}
            <section className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow p-6 flex flex-col justify-between">
              <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
                <span className="inline-block w-2 h-6 bg-gray-500 rounded-full mr-2"></span>Account & Security
              </h3>
              <div className="flex gap-4 mb-6">
                <button className="flex-1 py-2 bg-yellow-400 text-white rounded-lg font-semibold shadow hover:bg-yellow-500 transition">Deactivate Account</button>
                <button className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition">Delete Account</button>
              </div>
              <div className="mb-6">
                <button className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Log out from all devices</button>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 shadow-inner">
                <h4 className="font-semibold mb-2 text-gray-700">Recent Activity</h4>
                <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
                  {activity.length > 0 ? (
                    activity.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))
                  ) : (
                    <li>No recent activity.</li>
                  )}
                </ul>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;
